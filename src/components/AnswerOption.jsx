/**
 * One answer capsule (A, B, C or D).
 *
 * It is told how to look via `state` and never works it out for itself —
 * that decision lives in gameEngine.answerState(). Which is why the
 * projector can't leak the answer: it is only ever handed 'correct' once
 * the host has pressed Reveal.
 *
 * state: 'idle' | 'selected' | 'locked' | 'correct' | 'wrong' | 'removed'
 */
export default function AnswerOption({ letter, text, state, onClick, compact }) {
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
      <div className={className} aria-hidden={state === 'removed'}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={state === 'removed'}
    >
      {content}
    </button>
  );
}
