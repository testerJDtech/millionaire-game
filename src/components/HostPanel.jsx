import { useEffect, useMemo, useState } from 'react';
import AnswerOption from './AnswerOption.jsx';
import MoneyLadder from './MoneyLadder.jsx';
import Lifelines from './Lifelines.jsx';
import PhoneTimer from './PhoneTimer.jsx';
import TeamSelect from './TeamSelect.jsx';
import Leaderboard from './Leaderboard.jsx';
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

/**
 * THE HOST PANEL (#/host)
 *
 * Everything you need on the night, on one screen, with the answer key
 * always visible. This window owns the game: the projector only mirrors it.
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
  useGameAudio(state, soundOn);

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
      {!issuesDismissed && dataIssues.errors.length > 0 && (
        <div className="alert alert--error">
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
        </div>
      )}

      {!issuesDismissed && dataIssues.errors.length === 0 && dataIssues.warnings.length > 0 && (
        <div className="alert alert--warn">
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
        </div>
      )}

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
            <label className="slider">
              <span>Volume</span>
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
            <p className="panel__note">
              Sounds are optional. With no files in public/audio the game runs
              exactly the same, in silence.
            </p>
          </section>
        </div>

        {/* ══ MIDDLE COLUMN — the live question ══ */}
        <div className="host__col host__col--main">
          {/* Pair just finished — confirm the result and move on. */}
          {!run && state.screen === 'result' && state.lastResult && (
            <section className="panel">
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
            </section>
          )}

          {!run && !(state.screen === 'result' && state.lastResult) && (
            <section className="panel panel--idle">
              <h2 className="panel__title">No pair in the chair</h2>
              <p className="panel__note">
                {everyoneDone
                  ? 'Every pair has played. Show the leaderboard when you are ready.'
                  : 'Pick a pair on the left to start their ten questions.'}
              </p>
              {everyoneDone && <Leaderboard state={state} teams={teams} compact />}
            </section>
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

                {run.phase === 'revealed' && (
                  <p className={`verdict verdict--${run.outcome}`}>
                    {run.outcome === 'correct'
                      ? `Correct — they now have ${formatMoney(banked, settings)}`
                      : `Wrong — they leave with ${formatMoney(
                          safetyNetWinnings(run.correctCount, settings),
                          settings
                        )}`}
                  </p>
                )}

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
                    onClick={actions.openAudiencePanel}
                    disabled={run.lifelines.audience.used}
                  >
                    Ask the audience (U)
                  </button>
                </div>

                {run.lifelines.phone.secondsLeft !== null && (
                  <PhoneTimer phone={run.lifelines.phone} compact />
                )}

                {/* Ask the audience: host types the real numbers */}
                {audience.open && (
                  <div className="askpanel">
                    <p className="panel__note">
                      Type the counts or percentages you collected from the room,
                      then reveal. Nothing is invented.
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
                      {audienceTotal === 100 ? ' — ready' : ' — normalise before revealing'}
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
                  </div>
                )}
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
