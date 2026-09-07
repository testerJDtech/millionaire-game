import { formatMoney, isSafetyNet } from '../utils/gameEngine.js';
import { settings } from '../data/settings.js';

/**
 * The prize ladder, top prize first.
 *
 * Three looks:
 *   • banked   — already won (dimmer gold, ticked)
 *   • current  — the question being played (the strongest thing on screen)
 *   • upcoming — still to come (quiet)
 *
 * Safety-net rungs get a small marker so contestants can see where the
 * guaranteed money sits.
 */
export default function MoneyLadder({ currentIndex, correctCount, compact }) {
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

        return (
          <li
            key={index}
            className={`ladder__row ladder__row--${state} ${
              isSafetyNet(index, settings) ? 'ladder__row--net' : ''
            }`}
          >
            <span className="ladder__num">{index + 1}</span>
            <span className="ladder__value">{formatMoney(value, settings)}</span>
          </li>
        );
      })}
    </ol>
  );
}
