import { motion } from 'framer-motion';
import { formatMoney, isSafetyNet } from '../utils/gameEngine.js';
import { settings } from '../data/settings.js';
import { ladderBanked, ladderHighlight } from '../utils/motion.js';

/**
 * The prize ladder, top prize first.
 *
 * Three looks:
 *   • banked   — already won (dimmer gold, ticked)
 *   • current  — the question being played (the strongest thing on screen)
 *   • upcoming — still to come (quiet)
 *
 * Safety-net rungs get a small marker so contestants can see where the
 * guaranteed money sits. Pass `celebrate` (a question index) to pulse the
 * rung that has just been banked.
 */
export default function MoneyLadder({
  currentIndex,
  correctCount,
  compact,
  celebrate = null,
}) {
  const ladder = settings.prizeLadder;

  // Drawn top prize first, so walk the array backwards.
  const rows = ladder
    .map((value, index) => ({ value, index }))
    .slice()
    .reverse();

  return (
    <ol className={`ladder ${compact ? 'ladder--compact' : ''}`}>
      {rows.map(({ value, index }) => {
        const banked = index < correctCount;
        const current = index === currentIndex;
        const state = current ? 'current' : banked ? 'banked' : 'upcoming';

        const banking = celebrate === index;

        return (
          <motion.li
            key={index}
            className={[
              'ladder__row',
              `ladder__row--${state}`,
              isSafetyNet(index, settings) ? 'ladder__row--net' : '',
              banking ? 'ladder__row--banking' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            {...(banking ? ladderBanked : {})}
          >
            {/* The gold bar is one element that moves between rungs, so the
                highlight travels down the ladder instead of blinking from
                one row to the next. It sits behind the text, hence aria-hidden. */}
            {current && (
              <motion.span
                className="ladder__glow"
                layoutId={`ladder-current-${compact ? 'host' : 'stage'}`}
                transition={ladderHighlight.transition}
                aria-hidden="true"
              />
            )}
            <span className="ladder__num">{index + 1}</span>
            <span className="ladder__value">{formatMoney(value, settings)}</span>
          </motion.li>
        );
      })}
    </ol>
  );
}
