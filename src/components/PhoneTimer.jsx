import { motion } from 'framer-motion';
import { settings } from '../data/settings.js';
import { timerFill } from '../utils/motion.js';

/**
 * Phone a Friend countdown. Shown on both screens.
 *
 * The number itself lives in game state and is counted down by the host
 * window, so the projector can never drift out of step — and a refresh
 * picks up on the same second.
 *
 * The bar drains continuously across each of those seconds so the eye sees
 * time running out, not a bar stepping down once a second. It scales rather
 * than resizes, which keeps it off the layout path and on the GPU.
 */
export default function PhoneTimer({ phone, compact }) {
  const seconds = phone.secondsLeft === null ? settings.phoneTimerSeconds : phone.secondsLeft;
  const warning = seconds <= settings.phoneWarningAtSeconds && seconds > 0;
  const total = settings.phoneTimerSeconds;
  const fraction = Math.max(0, Math.min(1, seconds / total));

  return (
    <div
      className={[
        'timer',
        compact ? 'timer--compact' : '',
        warning ? 'timer--warning' : '',
        phone.finished ? 'timer--finished' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="timer"
      aria-live="off"
    >
      <div className="timer__label">
        {phone.finished ? 'Time up' : 'Phone a friend'}
      </div>
      <div className="timer__count">{seconds}</div>
      <div className="timer__track">
        <motion.div
          className="timer__fill"
          initial={false}
          animate={{ scaleX: fraction }}
          transition={timerFill.transition}
        />
      </div>
    </div>
  );
}
