import { settings } from '../data/settings.js';

/**
 * Phone a Friend countdown. Shown on both screens.
 *
 * The number itself lives in game state and is counted down by the host
 * window, so the projector can never drift out of step — and a refresh
 * picks up on the same second.
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
        <div className="timer__fill" style={{ width: `${fraction * 100}%` }} />
      </div>
    </div>
  );
}
