import { motion } from 'framer-motion';
import { settings } from '../data/settings.js';
import { formatMoney } from '../utils/gameEngine.js';
import { staggerItem, staggerList } from '../utils/motion.js';

/**
 * The title card the room sees before the first pair sits down.
 *
 * Original branding: no TV-show logo, artwork, font or music is used
 * anywhere in this project.
 *
 * `onStart` is only passed in on the host panel. On the projector this is
 * a title card and nothing else — contestants never touch the laptop.
 *
 * This is the opening shot, so it builds: crest, then title, then the stakes.
 * It is also the one screen nobody is waiting on, which is what makes the
 * extra beat affordable here and nowhere else.
 */
export default function StartScreen({ onStart, waitingLabel }) {
  const topPrize = formatMoney(
    settings.prizeLadder[settings.prizeLadder.length - 1],
    settings
  );

  return (
    <motion.div
      className="titlecard"
      variants={staggerList}
      initial="initial"
      animate="animate"
    >
      <motion.div className="titlecard__crest" aria-hidden="true" variants={staggerItem}>
        <span className="titlecard__crestMark">?</span>
      </motion.div>

      <motion.h1 className="titlecard__title" variants={staggerItem}>
        {settings.showTitle}
      </motion.h1>
      <motion.p className="titlecard__sub" variants={staggerItem}>
        {settings.showSubtitle}
      </motion.p>

      <motion.p className="titlecard__prize" variants={staggerItem}>
        Ten questions. Three lifelines. {topPrize} on the line.
      </motion.p>

      <motion.div variants={staggerItem}>
        {onStart ? (
          <button type="button" className="btn btn--primary btn--big" onClick={onStart}>
            Start game
          </button>
        ) : (
          <p className="titlecard__waiting">{waitingLabel || 'Standing by'}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
