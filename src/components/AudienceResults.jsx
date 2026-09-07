import { motion } from 'framer-motion';
import { LETTERS } from '../utils/gameEngine.js';
import { audienceBar } from '../utils/motion.js';

/**
 * Ask the Audience bars.
 *
 * These are the numbers the host typed in — nothing is generated. The bars
 * genuinely grow from the floor, one after another, because each one animates
 * from a height of zero to its percentage as the panel appears.
 */
export default function AudienceResults({ percents, compact }) {
  return (
    <div className={`bars ${compact ? 'bars--compact' : ''}`}>
      <div className="bars__title">Ask the audience</div>
      <div className="bars__row">
        {LETTERS.map((letter, i) => {
          const value = Number(percents[letter]) || 0;
          return (
            <div className="bar" key={letter}>
              <div className="bar__value">{value}%</div>
              <div className="bar__track">
                <motion.div className="bar__fill" {...audienceBar(value, i)} />
              </div>
              <div className="bar__letter">{letter}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
