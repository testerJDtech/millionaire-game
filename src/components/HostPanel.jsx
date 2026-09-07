import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnswerOption from './AnswerOption.jsx';
import MoneyLadder from './MoneyLadder.jsx';
import Lifelines from './Lifelines.jsx';
import PhoneTimer from './PhoneTimer.jsx';
import TeamSelect from './TeamSelect.jsx';
import Leaderboard from './Leaderboard.jsx';
import AudioTestBench from './AudioTestBench.jsx';
import useGameState from '../hooks/useGameState.js';
import { useGameAudio } from '../utils/audio.js';
import { settings } from '../data/settings.js';
import { validateTeams } from '../utils/validation.js';
import {
  LETTERS,
  allTeamsFinished,
  answerState,
  currentWinnings,
  formatMoney,
  percentTotal,
  questionCount,
  safetyNetWinnings,
} from '../utils/gameEngine.js';
import { modalPop, panelSwap } from '../utils/motion.js';

/**
 * THE HOST PANEL (#/host)
 *
 * Everything you need on the night, on one screen, with the answer key
 * always visible. This window owns the game: the projector only mirrors it.
 *
 * Motion is kept to a minimum in here on purpose. This is a control surface:
 * the drama belongs on the projector, and anything that animates between the
 * host and their next keypress is working against them. Only things that
 * appear and disappear get a fade, and never longer than 250ms.
 */
export default function HostPanel() {
  const {
    state,
    actions,
    teams,
    currentTeam,
    currentQuestion,
    hadSavedGame,
  } = useGameState('host');

  // Sound comes out of this window by default — it has definitely been
  // clicked, so the browser will never block playback.
  const [soundOn, setSoundOn] = useState(settings.audio.defaultOutput === 'host');
  // The manager itself, so the sound check can drive it directly.
  const audio = useGameAudio(state, soundOn);

  const [dataIssues] = useState(() => validateTeams(teams, settings));
  const [issuesDismissed, setIssuesDismissed] = useState(false);

  const run = state.run;
  const total = questionCount(settings);
  const everyoneDone = allTeamsFinished(state, teams);

  const teamName =
    currentTeam ? state.teamNames[currentTeam.id] ?? currentTeam.name : '—';

  /** Wrap anything destructive in a confirm dialog. */
  const confirmThen = (message, fn) => () => {
    if (window.confirm(message)) fn();
  };

  /* ─────────────────────── Keyboard shortcuts ─────────────────────── */

  // Built as an object so the list on screen and the actual behaviour can
  // never drift apart.
  const shortcuts = useMemo(
    () => [
      { keys: ['1', 'a'], label: '1 / A', does: 'Select A', run: () => actions.selectAnswer('A') },
      { keys: ['2', 'b'], label: '2 / B', does: 'Select B', run: () => actions.selectAnswer('B') },
      { keys: ['3', 'c'], label: '3 / C', does: 'Select C', run: () => actions.selectAnswer('C') },
      { keys: ['4', 'd'], label: '4 / D', does: 'Select D', run: () => actions.selectAnswer('D') },
      { keys: ['enter'], label: 'Enter', does: 'Lock in', run: () => actions.lockIn() },
      { keys: ['r'], label: 'R', does: 'Reveal result', run: () => actions.reveal() },
      { keys: ['n'], label: 'N', does: 'Next question', run: () => actions.next() },
      { keys: ['f'], label: 'F', does: '50:50', run: () => actions.useFiftyFifty() },
      { keys: ['p'], label: 'P', does: 'Phone timer', run: () => actions.startPhoneTimer() },
      { keys: ['u'], label: 'U', does: 'Ask the audience', run: () => actions.openAudiencePanel() },
      { keys: ['m'], label: 'M', does: 'Mute / unmute', run: () => actions.toggleMute() },
      {
        keys: [],
        label: 'Shift+F',
        does: 'Fullscreen the projector',
        run: () => actions.requestAudienceFullscreen(),
      },
    ],
    [actions]
  );

  useEffect(() => {
    const onKey = (event) => {
      // Never fire a shortcut while a name or percentage is being typed.
      const target = event.target;
      const tag = target && target.tagName ? target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (target && target.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();

      // Shift+F is the only shifted shortcut.
      if (event.shiftKey) {
        if (key === 'f') {
          event.preventDefault();
          actions.requestAudienceFullscreen();
        }
        return;
      }

      const match = shortcuts.find((item) => item.keys.includes(key));
      if (!match) return;
      event.preventDefault();
      match.run();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcuts, actions]);

  /* ───────────────────────────── Panels ───────────────────────────── */

  const audience = run ? run.lifelines.audience : null;
  const audienceTotal = audience ? percentTotal(audience.percents) : 0;

  const banked = run ? currentWinnings(run.correctCount, settings) : 0;
  const ifWrong = run ? safetyNetWinnings(run.correctCount, settings) : 0;

  const nextLabel = (() => {
    if (!run) return 'Next';
    if (run.phase === 'revealed' && run.outcome === 'wrong') return 'End pair';
    if (run.phase === 'revealed' && run.index === total - 1) return 'Finish pair';
    return 'Next question';
  })();

  return (
    <div className="host">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="host__bar">
        <div className="host__brand">
          {settings.showTitle}
          <span className="host__role">Host controls</span>
        </div>

        <div className="host__barRight">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => window.open('#/play', 'millionaire-play')}
          >
            Open projector window
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={actions.requestAudienceFullscreen}
          >
            Fullscreen projector
          </button>
        </div>
      </header>

      {/* ── Data problems found at startup ───────────────────────── */}
      <AnimatePresence>
        {!issuesDismissed && dataIssues.errors.length > 0 && (
          <motion.div className="alert alert--error" {...panelSwap}>
            <strong>Question data needs fixing in src/data/questions.js</strong>
            <ul>
              {dataIssues.errors.slice(0, 12).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
            {dataIssues.errors.length > 12 && (
              <p>…and {dataIssues.errors.length - 12} more.</p>
            )}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setIssuesDismissed(true)}
            >
              Hide and carry on
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!issuesDismissed &&
          dataIssues.errors.length === 0 &&
          dataIssues.warnings.length > 0 && (
            <motion.div className="alert alert--warn" {...panelSwap}>
              {dataIssues.warnings.map((warning, i) => (
                <p key={i}>{warning}</p>
              ))}
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setIssuesDismissed(true)}
              >
                Got it
              </button>
            </motion.div>
          )}
      </AnimatePresence>

      <div className="host__grid">
        {/* ══ LEFT COLUMN ══ */}
        <div className="host__col">
          {/* Session */}
          <section className="panel">
            <h2 className="panel__title">Session</h2>
            <p className="panel__note">
              {hadSavedGame
                ? 'A saved game was found on this laptop and restored. Progress is saved after every action, so a refresh loses nothing.'
                : 'New game. Progress is saved after every action, so a refresh loses nothing.'}
            </p>
            <div className="btnrow">
              {state.screen === 'start' ? (
                <button type="button" className="btn btn--primary" onClick={actions.startGame}>
                  Start game
                </button>
              ) : (
                <button type="button" className="btn" onClick={actions.resumeGame}>
                  Resume game
                </button>
              )}
              <button type="button" className="btn" onClick={actions.goToTeams}>
                Team select
              </button>
              <button
                type="button"
                className="btn"
                onClick={actions.goToLeaderboard}
                disabled={!everyoneDone}
                title={everyoneDone ? '' : 'Available once every pair has finished'}
              >
                Show leaderboard
              </button>
            </div>
            <div className="btnrow">
              <button
                type="button"
                className="btn btn--danger"
                onClick={confirmThen(
                  'Reset the ENTIRE game? All pairs, winnings and the leaderboard will be wiped. Team names are kept.',
                  actions.resetGame
                )}
              >
                Reset entire game
              </button>
            </div>
          </section>

          {/* Teams */}
          <section className="panel">
            <h2 className="panel__title">Pairs</h2>
            <p className="panel__note">Names are editable and show on the projector.</p>
            <TeamSelect
              state={state}
              teams={teams}
              onSelect={actions.selectTeam}
              onRename={actions.renameTeam}
              compact
            />
            <div className="btnrow">
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className="btn btn--small btn--danger"
                  disabled={!state.results[team.id]}
                  onClick={confirmThen(
                    `Reset ${state.teamNames[team.id] || team.name}? Their result will be wiped so they can play again.`,
                    () => actions.resetPair(team.id)
                  )}
                >
                  Reset {state.teamNames[team.id] || team.name}
                </button>
              ))}
            </div>
          </section>

          {/* Audio */}
          <section className="panel">
            <h2 className="panel__title">Sound</h2>
            <div className="btnrow">
              <button
                type="button"
                className={`btn ${soundOn ? 'btn--on' : ''}`}
                onClick={() => setSoundOn((on) => !on)}
              >
                {soundOn ? 'Playing in this window' : 'Silent in this window'}
              </button>
              <button
                type="button"
                className={`btn ${state.audio.muted ? 'btn--on' : ''}`}
                onClick={actions.toggleMute}
              >
                {state.audio.muted ? 'Unmute (M)' : 'Mute (M)'}
              </button>
              <button
                type="button"
                className={`btn ${state.audio.bedPaused ? 'btn--on' : ''}`}
                onClick={actions.toggleBed}
              >
                {state.audio.bedPaused ? 'Resume question bed' : 'Pause question bed'}
              </button>
            </div>
            {/* Master over two buses. Every sound in the show is
                master × its bus × its own level from the manifest. */}
            <label className="slider">
              <span>Master</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.audio.volume}
                onChange={(event) => actions.setVolume(Number(event.target.value))}
              />
              <span className="slider__value">
                {Math.round(state.audio.volume * 100)}%
              </span>
            </label>
            <label className="slider">
              <span>Music &amp; beds</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.audio.musicVolume}
                onChange={(event) =>
                  actions.setMusicVolume(Number(event.target.value))
                }
              />
              <span className="slider__value">
                {Math.round(state.audio.musicVolume * 100)}%
              </span>
            </label>
            <label className="slider">
              <span>Sound effects</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.audio.sfxVolume}
                onChange={(event) => actions.setSfxVolume(Number(event.target.value))}
              />
              <span className="slider__value">
                {Math.round(state.audio.sfxVolume * 100)}%
              </span>
            </label>

            <p className="panel__note">
              Levels are shared with the projector window and remembered
              between sessions, including after a game reset. Sounds are
              optional: with no files in public/audio the game runs exactly the
              same, in silence.
            </p>

            <AudioTestBench audio={audio} soundOn={soundOn} />
          </section>
        </div>

        {/* ══ MIDDLE COLUMN — the live question ══ */}
        <div className="host__col host__col--main">
          {/* Pair just finished — confirm the result and move on.
              Enter-only fades: the panel arrives softly, but nothing waits for
              an exit animation before the host can act on what replaced it. */}
          {!run && state.screen === 'result' && state.lastResult && (
            <motion.section className="panel" {...panelSwap}>
              <h2 className="panel__title">Result recorded</h2>
              <p className="hostq">
                {state.teamNames[state.lastResult.teamId]} finish on{' '}
                <strong>{formatMoney(state.lastResult.winnings, settings)}</strong> —{' '}
                {state.lastResult.correctCount} of {total} correct.
              </p>
              <div className="btnrow btnrow--big">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={everyoneDone ? actions.goToLeaderboard : actions.goToTeams}
                >
                  {everyoneDone ? 'Show the leaderboard' : 'Next pair'}
                </button>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={confirmThen(
                    'Reset this pair and play their questions again from the start?',
                    () => actions.resetPair(state.lastResult.teamId)
                  )}
                >
                  Replay this pair
                </button>
              </div>
            </motion.section>
          )}

          {!run && !(state.screen === 'result' && state.lastResult) && (
            <motion.section className="panel panel--idle" {...panelSwap}>
              <h2 className="panel__title">No pair in the chair</h2>
              <p className="panel__note">
                {everyoneDone
                  ? 'Every pair has played. Show the leaderboard when you are ready.'
                  : 'Pick a pair on the left to start their ten questions.'}
              </p>
              {everyoneDone && <Leaderboard state={state} teams={teams} compact />}
            </motion.section>
          )}

          {run && currentQuestion && (
            <>
              <section className="panel">
                <div className="live">
                  <div className="live__team">{teamName}</div>
                  <div className="live__q">
                    Q{run.index + 1} / {total} · {formatMoney(currentQuestion.value, settings)}
                  </div>
                  <div className="live__phase">{run.phase}</div>
                </div>

                <p className="hostq">{currentQuestion.question}</p>

                {/* The answer key. Host eyes only — this panel is never projected. */}
                <div className="key">
                  Correct answer
                  <strong>
                    {currentQuestion.correctAnswer} ·{' '}
                    {currentQuestion.answers[currentQuestion.correctAnswer]}
                  </strong>
                </div>

                <div className="answers answers--host">
                  {LETTERS.map((letter) => {
                    const removed =
                      run.lifelines.fifty.atIndex === run.index
                        ? run.lifelines.fifty.removed
                        : [];
                    return (
                      <AnswerOption
                        key={letter}
                        letter={letter}
                        text={currentQuestion.answers[letter]}
                        compact
                        state={answerState({
                          letter,
                          selected: run.selected,
                          phase: run.phase,
                          removed,
                          correctAnswer: currentQuestion.correctAnswer,
                        })}
                        onClick={
                          run.phase === 'asking'
                            ? () => actions.selectAnswer(letter)
                            : undefined
                        }
                      />
                    );
                  })}
                </div>

                <div className="money">
                  <span>
                    Banked <strong>{formatMoney(banked, settings)}</strong>
                  </span>
                  <span>
                    If wrong now <strong>{formatMoney(ifWrong, settings)}</strong>
                  </span>
                  <span>
                    If right <strong>{formatMoney(currentQuestion.value, settings)}</strong>
                  </span>
                </div>
              </section>

              {/* Run the question */}
              <section className="panel">
                <h2 className="panel__title">Run the question</h2>

                {/* The £1,000,000 build-up runs itself, but never take the
                    room's timing out of the host's hands. */}
                <AnimatePresence>
                  {run.phase === 'presenting' && (
                    <motion.div className="presenting" {...panelSwap}>
                      <p className="panel__note">
                        Building up to the final question — the board is showing
                        the value, the room is going quiet and the final bed is
                        coming in. The question appears by itself in a moment.
                      </p>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={actions.beginQuestion}
                      >
                        Show the question now
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="btnrow btnrow--big">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={actions.lockIn}
                    disabled={run.phase !== 'asking' || !run.selected}
                  >
                    Lock in (Enter)
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={actions.reveal}
                    disabled={run.phase !== 'locked'}
                  >
                    Reveal result (R)
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={actions.next}
                    disabled={run.phase !== 'revealed'}
                  >
                    {nextLabel} (N)
                  </button>
                </div>

                <AnimatePresence>
                  {run.phase === 'revealed' && (
                    <motion.p
                      className={`verdict verdict--${run.outcome}`}
                      {...panelSwap}
                    >
                      {run.outcome === 'correct'
                        ? `Correct — they now have ${formatMoney(banked, settings)}`
                        : `Wrong — they leave with ${formatMoney(
                            safetyNetWinnings(run.correctCount, settings),
                            settings
                          )}`}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="btnrow">
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={actions.previous}
                    disabled={run.index === 0}
                  >
                    Previous question
                  </button>
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={confirmThen(
                      'Skip this question? The pair moves to the next question WITHOUT winning this prize.',
                      actions.skipQuestion
                    )}
                    disabled={run.index >= total - 1}
                  >
                    Skip question
                  </button>
                  <button
                    type="button"
                    className="btn btn--small btn--danger"
                    onClick={confirmThen(
                      `End this pair now? They bank ${formatMoney(banked, settings)}.`,
                      actions.endPair
                    )}
                  >
                    End pair (walk away)
                  </button>
                </div>
              </section>

              {/* Lifelines */}
              <section className="panel">
                <h2 className="panel__title">Lifelines</h2>
                <Lifelines lifelines={run.lifelines} compact />

                <div className="btnrow">
                  <button
                    type="button"
                    className="btn"
                    onClick={actions.useFiftyFifty}
                    disabled={run.lifelines.fifty.used}
                  >
                    50:50 (F)
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={actions.startPhoneTimer}
                    disabled={
                      run.lifelines.phone.used &&
                      run.lifelines.phone.atIndex !== run.index
                    }
                  >
                    {run.lifelines.phone.running ? 'Timer running' : 'Start phone timer (P)'}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={actions.pausePhoneTimer}
                    disabled={!run.lifelines.phone.running}
                  >
                    Pause timer
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={actions.resetPhoneTimer}
                    disabled={run.lifelines.phone.secondsLeft === null}
                  >
                    Reset timer
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={actions.hidePhoneTimer}
                    disabled={
                      run.lifelines.phone.secondsLeft === null ||
                      run.lifelines.phone.atIndex !== run.index ||
                      run.lifelines.phone.hidden
                    }
                  >
                    Clear timer
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={actions.openAudiencePanel}
                    disabled={run.lifelines.audience.used}
                  >
                    Ask the audience (U)
                  </button>
                </div>

                {/* Mirrors the projector: gone once the call is over. */}
                <AnimatePresence>
                  {run.lifelines.phone.secondsLeft !== null &&
                    run.lifelines.phone.atIndex === run.index &&
                    !run.lifelines.phone.hidden && (
                      <motion.div {...panelSwap}>
                        <PhoneTimer phone={run.lifelines.phone} compact />
                      </motion.div>
                    )}
                </AnimatePresence>

                {/* Ask the audience: host types the real numbers */}
                <AnimatePresence>
                  {audience.open && (
                    <motion.div className="askpanel" {...modalPop}>
                      <p className="panel__note">
                        Type the counts or percentages you collected from the
                        room, then reveal. Nothing is invented.
                      </p>
                      <div className="askpanel__inputs">
                        {LETTERS.map((letter) => (
                          <label key={letter} className="askfield">
                            <span>{letter}</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={audience.percents[letter]}
                              onChange={(event) =>
                                actions.setAudiencePercent(letter, event.target.value)
                              }
                            />
                          </label>
                        ))}
                      </div>
                      <p
                        className={`asktotal ${
                          audienceTotal === 100 ? 'asktotal--ok' : 'asktotal--off'
                        }`}
                      >
                        Total {audienceTotal}%
                        {audienceTotal === 100
                          ? ' — ready'
                          : ' — normalise before revealing'}
                      </p>
                      <div className="btnrow">
                        <button
                          type="button"
                          className="btn"
                          onClick={actions.normaliseAudiencePercents}
                        >
                          Normalise to 100%
                        </button>
                        <button
                          type="button"
                          className="btn btn--primary"
                          onClick={actions.revealAudienceResults}
                        >
                          Reveal to the room
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={actions.closeAudiencePanel}
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </>
          )}
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="host__col host__col--side">
          <section className="panel">
            <h2 className="panel__title">Money ladder</h2>
            <MoneyLadder
              currentIndex={run ? run.index : -1}
              correctCount={run ? run.correctCount : 0}
              compact
            />
            {settings.safetyNets.enabled && (
              <p className="panel__note">
                Safety net at Q{settings.safetyNets.levels.join(', Q')} — marked with a line.
              </p>
            )}
          </section>

          <section className="panel">
            <h2 className="panel__title">Shortcuts</h2>
            <ul className="keys">
              {shortcuts.map((item) => (
                <li key={item.label}>
                  <kbd>{item.label}</kbd>
                  <span>{item.does}</span>
                </li>
              ))}
            </ul>
            <p className="panel__note">
              Shortcuts are ignored while you are typing in a box.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
