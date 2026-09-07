import { LETTERS } from '../utils/gameEngine.js';

/**
 * Ask the Audience bars.
 *
 * These are the numbers the host typed in — nothing is generated. The bars
 * grow from zero when this appears because the height comes straight from
 * the percentage and CSS transitions it.
 */
export default function AudienceResults({ percents, compact }) {
  return (
    <div className={`bars ${compact ? 'bars--compact' : ''}`}>
      <div className="bars__title">Ask the audience</div>
      <div className="bars__row">
        {LETTERS.map((letter) => {
          const value = Number(percents[letter]) || 0;
          return (
            <div className="bar" key={letter}>
              <div className="bar__value">{value}%</div>
              <div className="bar__track">
                <div className="bar__fill" style={{ height: `${value}%` }} />
              </div>
              <div className="bar__letter">{letter}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
