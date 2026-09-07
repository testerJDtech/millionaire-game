import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  isSafetyNet,
  questionCount,
} from '../utils/gameEngine.js';
import {
  answerMotion,
  finalIntro,
  modalPop,
  panelSwap,
  questionCard,
} from '../utils/motion.js';

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

  // The last rung is the top prize, so its reveal is allowed to run long.
  const isFinalQuestion = run.index === total - 1;

  /**
   * A SAFETY NET BEING BANKED (Q4 and Q8)
   *
   * The room gets a beat before the answers turn green. The game state has
   * already moved to `revealed` — the host knows the verdict the instant they
   * press the button — but the board holds on `locked` for a moment longer,
   * so the reveal lands with the sting instead of ahead of it.
   */
  const bankingNet =
    run.phase === 'revealed' &&
    run.outcome === 'correct' &&
    isSafetyNet(run.index, settings);

  /*
   * The hold is worked out during render, not in an effect. An effect runs
   * after the browser has painted, so the answers would flash green for one
   * frame and then go back to gold — which is worse than no hold at all.
   * Recording the deadline in a ref is idempotent per question, so rendering
   * twice can't move it.
   */
  const holdRef = useRef({ index: null, until: 0 });
  if (bankingNet && holdRef.current.index !== run.index) {
    holdRef.current = {
      index: run.index,
      until: Date.now() + settings.safetyNetMoment.revealHoldMs,
    };
  }
  const holding = bankingNet && Date.now() < holdRef.current.until;

  // Nothing else changes when the hold expires, so ask for one more render.
  const [, tick] = useState(0);
  useEffect(() => {
    if (!holding) return undefined;
    const id = setTimeout(
      () => tick((n) => n + 1),
      Math.max(0, holdRef.current.until - Date.now())
    );
    return () => clearTimeout(id);
  }, [holding]);

  // What the *board* is showing, which lags the real phase during that hold.
  const shownPhase = holding ? 'locked' : run.phase;

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
        {/**
         * Question and answers move as one block, keyed on the question
         * number. The old block clears out before the new one fades up
         * (mode="wait"), so the room never sees this question's text sitting
         * above the next question's answers. Inside the new block, A-D then
         * ripple in a tenth of a second apart.
         *
         * The key only changes when the question does — locking in and
         * revealing leave it alone, so the answers keep their identity and
         * their own state animations run on the same elements.
         */}
        <AnimatePresence mode="wait" initial={false}>
          {run.phase === 'presenting' ? (
            /* The £1,000,000 build-up: the value, alone, in the quiet. */
            <motion.div className="finalcard" key="final-intro" {...finalIntro}>
              <p className="finalcard__kicker">The final question</p>
              <p className="finalcard__value">
                {formatMoney(question.value, settings)}
              </p>
              <p className="finalcard__note">For the top prize</p>
            </motion.div>
          ) : (
            <motion.div className="stage__qblock" key={run.index} {...questionCard}>
              <div className="qcard">
                <p className="qcard__text">{question.question}</p>
              </div>

              <div className="answers">
                {LETTERS.map((letter, i) => {
                  const letterState = answerState({
                    letter,
                    selected: run.selected,
                    phase: shownPhase,
                    removed,
                    correctAnswer: question.correctAnswer,
                  });

                  return (
                    <AnswerOption
                      key={letter}
                      letter={letter}
                      text={question.answers[letter]}
                      state={letterState}
                      motion={answerMotion(letterState, i, isFinalQuestion)}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {shownPhase === 'locked' && run.selected && (
            <motion.p className="stage__locked" {...panelSwap}>
              Locked in. Final answer.
            </motion.p>
          )}
        </AnimatePresence>
      </main>

      {/* ── Right: the ladder ── */}
      <aside className="stage__ladder">
        <MoneyLadder
          currentIndex={run.index}
          correctCount={run.correctCount}
          /* The rung they have just guaranteed pulses as it is banked. */
          celebrate={bankingNet ? run.index : null}
        />
      </aside>

      {/* ── Bottom: lifelines ── */}
      <footer className="stage__bottom">
        <Lifelines lifelines={run.lifelines} />
      </footer>

      {/* ── Overlays: only one of these is ever up at a time in practice ── */}
      <AnimatePresence>
        {showTimer && (
          <motion.div className="overlay overlay--timer" {...modalPop}>
            <PhoneTimer phone={phone} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBars && (
          <motion.div className="overlay overlay--bars" {...modalPop}>
            <AudienceResults percents={audience.percents} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
