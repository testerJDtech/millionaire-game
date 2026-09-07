/**
 * useGameState — the single source of truth for the whole game.
 *
 * HOW IT WORKS
 *   • The HOST window owns the state. Every action makes a new state object,
 *     saves it to localStorage, and broadcasts it to the other window.
 *   • The PLAY window never writes. It loads the saved state, then listens.
 *     One writer means the two screens can't fight each other mid-show.
 *   • Because state is saved after every action, a refresh (or a laptop that
 *     locks itself) loses nothing.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { teams as teamsData } from '../data/questions.js';
import { settings } from '../data/settings.js';
import { createSyncChannel } from '../utils/syncChannel.js';
import {
  createInitialState,
  currentWinnings,
  fiftyFiftyRemovals,
  freshRun,
  isSafetyNet,
  normalisePercents,
  questionCount,
  safetyNetWinnings,
} from '../utils/gameEngine.js';

/* ─────────────────────────── PERSISTENCE ─────────────────────────── */

function loadSavedState() {
  try {
    const raw = localStorage.getItem(settings.storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Ignore anything saved by an older version of the app.
    if (!parsed || parsed.version !== 1) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(settings.storageKey, JSON.stringify(state));
  } catch (error) {
    // Storage can be blocked in private mode. The game keeps working;
    // only refresh-recovery is lost.
  }
}

/* ──────────────────────────── THE HOOK ──────────────────────────── */

/**
 * @param role 'host' | 'play'
 */
export function useGameState(role) {
  const isHost = role === 'host';

  const [state, setState] = useState(
    () => loadSavedState() || createInitialState(teamsData, settings)
  );

  // A ref so callbacks and the sync channel always see the newest state
  // without needing to be recreated on every change.
  const stateRef = useRef(state);
  stateRef.current = state;

  const channelRef = useRef(null);
  const [hadSavedGame] = useState(() => Boolean(loadSavedState()));

  /* ── Applying a change (host only) ───────────────────────────────── */

  const apply = useCallback(
    (producer) => {
      if (!isHost) return; // the projector never writes
      const next = producer(stateRef.current);
      if (!next || next === stateRef.current) return;
      stateRef.current = next;
      setState(next);
      saveState(next);
      if (channelRef.current) channelRef.current.post({ type: 'STATE', state: next });
    },
    [isHost]
  );

  /* ── Wiring up the channel ──────────────────────────────────────── */

  useEffect(() => {
    const channel = createSyncChannel((message) => {
      if (!message || !message.type) return;

      if (message.type === 'STATE' && !isHost) {
        stateRef.current = message.state;
        setState(message.state);
        return;
      }

      // A projector window that has just opened asks for the current state.
      if (message.type === 'REQUEST_STATE' && isHost) {
        channel.post({ type: 'STATE', state: stateRef.current });
      }
    });

    channelRef.current = channel;

    // On open, the projector asks the host to send everything.
    if (!isHost) channel.post({ type: 'REQUEST_STATE' });

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [isHost]);

  /* ── Helpers used by the actions below ──────────────────────────── */

  const teams = teamsData;
  const total = questionCount(settings);

  const currentTeam = useMemo(
    () => (state.run ? teams.find((t) => t.id === state.run.teamId) || null : null),
    [state.run, teams]
  );

  const currentQuestion = useMemo(() => {
    if (!state.run || !currentTeam) return null;
    return currentTeam.questions[state.run.index] || null;
  }, [state.run, currentTeam]);

  /**
   * Attach a sound cue to a state object. `name` is a key in
   * settings.audio.files — that file is where each moment's sound is set.
   */
  const withCue = (draft, name) => ({
    ...draft,
    cue: { name, id: draft.cue.id + 1 },
  });

  /** Shorthand for changing the current run. */
  const patchRun = (draft, changes) => ({ ...draft, run: { ...draft.run, ...changes } });

  /** Finish the pair currently playing and store their result. */
  const finishRun = (draft, winnings, reason) => {
    const run = draft.run;
    return {
      ...draft,
      screen: 'result',
      run: null,
      results: {
        ...draft.results,
        [run.teamId]: { winnings, reason, correctCount: run.correctCount },
      },
      lastResult: {
        teamId: run.teamId,
        winnings,
        reason,
        correctCount: run.correctCount,
      },
    };
  };

  /* ───────────────────────────── ACTIONS ───────────────────────────── */

  const actions = useMemo(() => {
    return {
      /* — Navigation — */

      startGame: () =>
        apply((s) => withCue({ ...s, screen: 'teams' }, 'intro')),

      goToTeams: () => apply((s) => ({ ...s, screen: 'teams', lastResult: null })),

      /**
       * Jump back to wherever the game actually is. The saved game is already
       * restored automatically on load — this is the button for when you've
       * wandered off to the leaderboard and want the live board back.
       */
      resumeGame: () =>
        apply((s) => {
          if (s.run) return { ...s, screen: 'game' };
          if (Object.keys(s.results).length > 0) return { ...s, screen: 'teams' };
          return { ...s, screen: 'teams' };
        }),

      goToLeaderboard: () =>
        apply((s) => withCue({ ...s, screen: 'leaderboard' }, 'leaderboard')),

      renameTeam: (teamId, name) =>
        apply((s) => ({ ...s, teamNames: { ...s.teamNames, [teamId]: name } })),

      /** Put a pair in the chair. Blocked if they already have a result. */
      selectTeam: (teamId) =>
        apply((s) => {
          if (s.results[teamId]) return s;
          return withCue(
            { ...s, screen: 'game', run: freshRun(teamId), lastResult: null },
            'teamTakesSeat'
          );
        }),

      /* — Answering — */

      selectAnswer: (letter) =>
        apply((s) => {
          if (!s.run || s.run.phase !== 'asking') return s;
          if (s.run.lifelines.fifty.atIndex === s.run.index) {
            // Can't pick an answer 50:50 has taken away.
            if (s.run.lifelines.fifty.removed.includes(letter)) return s;
          }
          return patchRun(s, { selected: letter });
        }),

      lockIn: () =>
        apply((s) => {
          if (!s.run || s.run.phase !== 'asking' || !s.run.selected) return s;
          // An answer is in, so the call is over either way: stop and clear
          // the countdown rather than leaving it ticking over the reveal.
          const locked = patchRun(s, {
            phase: 'locked',
            lifelines: {
              ...s.run.lifelines,
              phone: { ...s.run.lifelines.phone, running: false, hidden: true },
            },
          });
          return withCue(locked, 'lockIn');
        }),

      /** Reveal green/red. Does NOT move the game on — that's Next. */
      reveal: () =>
        apply((s) => {
          if (!s.run || s.run.phase !== 'locked') return s;
          const team = teams.find((t) => t.id === s.run.teamId);
          const question = team.questions[s.run.index];
          const isCorrect = s.run.selected === question.correctAnswer;
          const isFinalQuestion = s.run.index === total - 1;

          const withReveal = patchRun(s, {
            phase: 'revealed',
            outcome: isCorrect ? 'correct' : 'wrong',
            correctCount: isCorrect ? s.run.correctCount + 1 : s.run.correctCount,
          });

          // A banked safety net gets its own sting — the moment the room
          // realises the pair cannot leave with nothing.
          let sound = 'wrong';
          if (isCorrect) {
            if (isFinalQuestion) sound = 'win';
            else if (isSafetyNet(s.run.index, settings)) sound = 'safetyNet';
            else sound = 'correct';
          }
          return withCue(withReveal, sound);
        }),

      /**
       * Move on. What this does depends on what just happened:
       *   wrong          → end the pair on their safety-net money
       *   correct on Q10 → end the pair on the top prize
       *   correct        → next question
       */
      next: () =>
        apply((s) => {
          if (!s.run) return s;
          const run = s.run;

          // Only ever moves on from a revealed question. Without this, the
          // "N" shortcut could jump past a question nobody has answered.
          if (run.phase !== 'revealed') return s;

          if (run.outcome === 'wrong') {
            return finishRun(s, safetyNetWinnings(run.correctCount, settings), 'wrong');
          }

          // Right answer on the last question: that's the top prize.
          if (run.index >= total - 1) {
            return finishRun(s, currentWinnings(run.correctCount, settings), 'jackpot');
          }

          const nextIndex = run.index + 1;

          /**
           * THE £1,000,000 QUESTION
           * The last one is introduced rather than just shown. The board goes
           * to a value card, the audio drops to near-silence and bedFinal
           * creeps in; `beginQuestion` (fired automatically by the host
           * window, or by the host pressing Show the question) brings in the
           * question itself. Turn it off with finalQuestion.present.
           */
          const presenting =
            settings.finalQuestion.present && nextIndex === total - 1;

          return withCue(
            patchRun(s, {
              index: nextIndex,
              selected: null,
              phase: presenting ? 'presenting' : 'asking',
              outcome: null,
            }),
            presenting ? 'finalQuestion' : 'questionStart'
          );
        }),

      /** End the £1,000,000 build-up and put the question on screen. */
      beginQuestion: () =>
        apply((s) => {
          if (!s.run || s.run.phase !== 'presenting') return s;
          return withCue(patchRun(s, { phase: 'asking' }), 'questionStart');
        }),

      /** Step back a question — a correction tool, not part of normal play. */
      previous: () =>
        apply((s) => {
          if (!s.run || s.run.index === 0) return s;
          const index = s.run.index - 1;
          return patchRun(s, {
            index,
            selected: null,
            phase: 'asking',
            outcome: null,
            // Un-award anything past this point so the money stays honest.
            correctCount: Math.min(s.run.correctCount, index),
          });
        }),

      /** Skip a bad question. Moves on WITHOUT awarding the prize. */
      skipQuestion: () =>
        apply((s) => {
          if (!s.run || s.run.index >= total - 1) return s;
          return withCue(
            patchRun(s, {
              index: s.run.index + 1,
              selected: null,
              phase: 'asking',
              outcome: null,
            }),
            'questionStart'
          );
        }),

      /* — Lifelines — */

      useFiftyFifty: () =>
        apply((s) => {
          if (!s.run || s.run.lifelines.fifty.used) return s;
          const team = teams.find((t) => t.id === s.run.teamId);
          const question = team.questions[s.run.index];
          const removed = fiftyFiftyRemovals(question);

          return withCue(
            patchRun(s, {
              // Clear a selection that has just been taken off the board.
              selected: removed.includes(s.run.selected) ? null : s.run.selected,
              lifelines: {
                ...s.run.lifelines,
                fifty: { used: true, removed, atIndex: s.run.index },
              },
            }),
            'fiftyFifty'
          );
        }),

      startPhoneTimer: () =>
        apply((s) => {
          if (!s.run) return s;
          const phone = s.run.lifelines.phone;
          if (phone.used && phone.atIndex !== s.run.index) return s;
          // Picking a paused clock back up, rather than placing a fresh call:
          // part-used, not finished, and on this same question.
          const resuming =
            phone.atIndex === s.run.index &&
            !phone.finished &&
            phone.secondsLeft !== null &&
            phone.secondsLeft < settings.phoneTimerSeconds;
          const next = patchRun(s, {
            lifelines: {
              ...s.run.lifelines,
              phone: {
                used: true,
                atIndex: s.run.index,
                running: true,
                finished: false,
                hidden: false,
                secondsLeft:
                  phone.secondsLeft === null || phone.finished
                    ? settings.phoneTimerSeconds
                    : phone.secondsLeft,
              },
            },
          });
          // The ring is for placing the call, not for un-pausing the clock.
          return resuming ? next : withCue(next, 'phoneRing');
        }),

      pausePhoneTimer: () =>
        apply((s) => {
          if (!s.run || !s.run.lifelines.phone.running) return s;
          return patchRun(s, {
            lifelines: {
              ...s.run.lifelines,
              phone: { ...s.run.lifelines.phone, running: false },
            },
          });
        }),

      resetPhoneTimer: () =>
        apply((s) => {
          if (!s.run) return s;
          return patchRun(s, {
            lifelines: {
              ...s.run.lifelines,
              phone: {
                ...s.run.lifelines.phone,
                running: false,
                finished: false,
                hidden: false,
                secondsLeft: settings.phoneTimerSeconds,
              },
            },
          });
        }),

      /**
       * Take the countdown off both screens. The lifeline stays spent — this
       * only clears the display. Fires by itself a beat after "Time up", and
       * on lock-in, so a dead timer never sits over the answers.
       */
      hidePhoneTimer: () =>
        apply((s) => {
          if (!s.run || s.run.lifelines.phone.hidden) return s;
          return patchRun(s, {
            lifelines: {
              ...s.run.lifelines,
              phone: { ...s.run.lifelines.phone, running: false, hidden: true },
            },
          });
        }),

      /** Called once a second by the host window while the timer runs. */
      tickPhoneTimer: () =>
        apply((s) => {
          if (!s.run) return s;
          const phone = s.run.lifelines.phone;
          if (!phone.running) return s;

          const secondsLeft = Math.max(0, (phone.secondsLeft || 0) - 1);
          const next = patchRun(s, {
            lifelines: {
              ...s.run.lifelines,
              phone: {
                ...phone,
                secondsLeft,
                running: secondsLeft > 0,
                finished: secondsLeft === 0,
              },
            },
          });

          if (secondsLeft === 0) return withCue(next, 'phoneTimeUp');
          if (secondsLeft === settings.phoneWarningAtSeconds)
            return withCue(next, 'phoneWarning');
          return next;
        }),

      openAudiencePanel: () =>
        apply((s) => {
          if (!s.run) return s;
          return withCue(
            patchRun(s, {
              lifelines: {
                ...s.run.lifelines,
                audience: { ...s.run.lifelines.audience, open: true, atIndex: s.run.index },
              },
            }),
            'askAudience'
          );
        }),

      closeAudiencePanel: () =>
        apply((s) => {
          if (!s.run) return s;
          return patchRun(s, {
            lifelines: {
              ...s.run.lifelines,
              audience: { ...s.run.lifelines.audience, open: false },
            },
          });
        }),

      setAudiencePercent: (letter, value) =>
        apply((s) => {
          if (!s.run) return s;
          const audience = s.run.lifelines.audience;
          return patchRun(s, {
            lifelines: {
              ...s.run.lifelines,
              audience: { ...audience, percents: { ...audience.percents, [letter]: value } },
            },
          });
        }),

      normaliseAudiencePercents: () =>
        apply((s) => {
          if (!s.run) return s;
          const audience = s.run.lifelines.audience;
          return patchRun(s, {
            lifelines: {
              ...s.run.lifelines,
              audience: { ...audience, percents: normalisePercents(audience.percents) },
            },
          });
        }),

      /** Show the bars on the projector. Uses the host's numbers, nothing invented. */
      revealAudienceResults: () =>
        apply((s) => {
          if (!s.run) return s;
          const audience = s.run.lifelines.audience;
          return withCue(
            patchRun(s, {
              lifelines: {
                ...s.run.lifelines,
                audience: {
                  ...audience,
                  used: true,
                  revealed: true,
                  open: false,
                  atIndex: s.run.index,
                  percents: normalisePercents(audience.percents),
                },
              },
            }),
            'audienceResults'
          );
        }),

      /* — Ending, resetting — */

      /** Walk away: bank what they have already won. */
      endPair: () =>
        apply((s) => {
          if (!s.run) return s;
          return withCue(
            finishRun(s, currentWinnings(s.run.correctCount, settings), 'ended'),
            'walkAway'
          );
        }),

      /** Wipe a pair's result so they can play again from question 1. */
      resetPair: (teamId) =>
        apply((s) => {
          const results = { ...s.results };
          delete results[teamId];
          const clearingCurrent = s.run && s.run.teamId === teamId;
          // The result screen has nothing left to show once the result it was
          // displaying is gone, so always land back on team select from there.
          const leaveResultScreen = clearingCurrent || s.screen === 'result';
          return {
            ...s,
            results,
            run: clearingCurrent ? null : s.run,
            screen: leaveResultScreen ? 'teams' : s.screen,
            lastResult: null,
          };
        }),

      resetGame: () =>
        apply((s) => {
          const fresh = createInitialState(teams, settings);
          // Keep the names that were typed in and the levels that were set
          // for this room; lose everything else.
          return { ...fresh, teamNames: s.teamNames, audio: s.audio };
        }),

      /* — Audio & screen — */

      toggleMute: () =>
        apply((s) => ({ ...s, audio: { ...s.audio, muted: !s.audio.muted } })),

      /** Master, and the two buses under it. All three are 0-1. */
      setVolume: (volume) =>
        apply((s) => ({ ...s, audio: { ...s.audio, volume } })),

      setMusicVolume: (musicVolume) =>
        apply((s) => ({ ...s, audio: { ...s.audio, musicVolume } })),

      setSfxVolume: (sfxVolume) =>
        apply((s) => ({ ...s, audio: { ...s.audio, sfxVolume } })),

      toggleBed: () =>
        apply((s) => ({ ...s, audio: { ...s.audio, bedPaused: !s.audio.bedPaused } })),

      /** Ask the projector window to go fullscreen. */
      requestAudienceFullscreen: () =>
        apply((s) => ({ ...s, fullscreenRequestId: s.fullscreenRequestId + 1 })),
    };
  }, [apply, teams, total]);

  /* ── The phone timer ticks in the host window only ──────────────── */

  const phoneRunning = Boolean(state.run && state.run.lifelines.phone.running);

  useEffect(() => {
    if (!isHost || !phoneRunning) return undefined;
    const id = setInterval(() => actions.tickPhoneTimer(), 1000);
    return () => clearInterval(id);
  }, [isHost, phoneRunning, actions]);

  /* ── …and clears itself a beat after it runs out ─────────────────── */

  const phoneSpent = Boolean(
    state.run && state.run.lifelines.phone.finished && !state.run.lifelines.phone.hidden
  );

  useEffect(() => {
    if (!isHost || !phoneSpent) return undefined;
    const id = setTimeout(
      () => actions.hidePhoneTimer(),
      Math.max(0, settings.phoneTimerHideAfterSeconds) * 1000
    );
    return () => clearTimeout(id);
  }, [isHost, phoneSpent, actions]);

  /* ── The £1,000,000 build-up runs itself ─────────────────────────
   *
   * Held by the host window for the same reason as everything else with a
   * clock: one owner, so the two screens can't disagree about how long the
   * room has been sitting in silence. The host can cut it short from the
   * panel; this is the version where they don't have to.
   */

  const presenting = Boolean(state.run && state.run.phase === 'presenting');

  useEffect(() => {
    if (!isHost || !presenting) return undefined;
    const id = setTimeout(
      () => actions.beginQuestion(),
      Math.max(0, settings.finalQuestion.holdMs)
    );
    return () => clearTimeout(id);
  }, [isHost, presenting, actions]);

  return {
    state,
    actions,
    teams,
    currentTeam,
    currentQuestion,
    hadSavedGame,
  };
}

export default useGameState;
