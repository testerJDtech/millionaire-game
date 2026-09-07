import AnswerOption from './AnswerOption.jsx';
import MoneyLadder from './MoneyLadder.jsx';
import Lifelines from './Lifelines.jsx';
import PhoneTimer from './PhoneTimer.jsx';
import AudienceResults from './AudienceResults.jsx';
import { settings } from '../data/settings.js';
import {
  LETTERS,
  answerState,
  currentWinnings,
  formatMoney,
  questionCount,
} from '../utils/gameEngine.js';

/**
 * The question screen the room sees.
 *
 * This component is deliberately dumb: it renders what state says and takes
 * no decisions. In particular it passes `correctAnswer` to answerState()
 * only alongside the current phase, so nothing turns green until the host
 * has moved the phase to 'revealed'.
 */
export default function GameBoard({ state, question, teamName }) {
  const run = state.run;
  const total = questionCount(settings);

  // 50:50, the phone and the audience bars each belong to the question they
  // were used on, so they disappear when the game moves on.
  const fifty = run.lifelines.fifty;
  const removed = fifty.atIndex === run.index ? fifty.removed : [];

  const phone = run.lifelines.phone;
  const showTimer =
    phone.atIndex === run.index && phone.secondsLeft !== null && !phone.hidden;

  const audience = run.lifelines.audience;
  const showBars = audience.revealed && audience.atIndex === run.index;

  const banked = currentWinnings(run.correctCount, settings);

  return (
    <div className="stage">
      {/* ── Top: who's playing, which question, money in hand ── */}
      <header className="stage__top">
        <div className="stage__team">{teamName}</div>
        <div className="stage__qmeta">
          Question {run.index + 1} of {total}
          <span className="stage__dot" aria-hidden="true" />
          Playing for {formatMoney(question.value, settings)}
        </div>
        <div className="stage__banked">
          <span className="stage__bankedLabel">Banked</span>
          <span className="stage__bankedValue">{formatMoney(banked, settings)}</span>
        </div>
      </header>

      {/* ── Centre: question and answers ── */}
      <main className="stage__main">
        <div className="qcard">
          <p className="qcard__text">{question.question}</p>
        </div>

        <div className="answers">
          {LETTERS.map((letter) => (
            <AnswerOption
              key={letter}
              letter={letter}
              text={question.answers[letter]}
              state={answerState({
                letter,
                selected: run.selected,
                phase: run.phase,
                removed,
                correctAnswer: question.correctAnswer,
              })}
            />
          ))}
        </div>

        {run.phase === 'locked' && (
          <p className="stage__locked">Locked in. Final answer.</p>
        )}
      </main>

      {/* ── Right: the ladder ── */}
      <aside className="stage__ladder">
        <MoneyLadder currentIndex={run.index} correctCount={run.correctCount} />
      </aside>

      {/* ── Bottom: lifelines ── */}
      <footer className="stage__bottom">
        <Lifelines lifelines={run.lifelines} />
      </footer>

      {/* ── Overlays: only one of these is ever up at a time in practice ── */}
      {showTimer && (
        <div className="overlay overlay--timer">
          <PhoneTimer phone={phone} />
        </div>
      )}

      {showBars && (
        <div className="overlay overlay--bars">
          <AudienceResults percents={audience.percents} />
        </div>
      )}
    </div>
  );
}
