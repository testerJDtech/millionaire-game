import { motion } from 'framer-motion';

/**
 * One answer capsule (A, B, C or D).
 *
 * It is told how to look via `state` and never works it out for itself —
 * that decision lives in gameEngine.answerState(). Which is why the
 * projector can't leak the answer: it is only ever handed 'correct' once
 * the host has pressed Reveal.
 *
 * Two layers of motion, kept apart so they can't fight:
 *   • colour, border and glow  → CSS transitions on the classes below
 *   • entrance, pulse, shake   → `motion` from utils/motion.js, passed in
 * On the host panel no motion is passed at all: those are controls, and a
 * control that animates is a control that feels slow.
 *
 * state: 'idle' | 'selected' | 'locked' | 'correct' | 'wrong' | 'removed'
 */
export default function AnswerOption({ letter, text, state, onClick, compact, motion: motionProps }) {
  const isButton = typeof onClick === 'function';
  const className = [
    'answer',
    `answer--${state}`,
    compact ? 'answer--compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="answer__letter">{letter}</span>
      <span className="answer__text">{state === 'removed' ? '' : text}</span>
    </>
  );

  if (!isButton) {
    return (
      <motion.div
        className={className}
        aria-hidden={state === 'removed'}
        {...motionProps}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      className={className}
      onClick={onClick}
      disabled={state === 'removed'}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
