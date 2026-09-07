import { settings } from '../data/settings.js';
import { formatMoney } from '../utils/gameEngine.js';

/**
 * The title card the room sees before the first pair sits down.
 *
 * Original branding: no TV-show logo, artwork, font or music is used
 * anywhere in this project.
 *
 * `onStart` is only passed in on the host panel. On the projector this is
 * a title card and nothing else — contestants never touch the laptop.
 */
export default function StartScreen({ onStart, waitingLabel }) {
  const topPrize = formatMoney(
    settings.prizeLadder[settings.prizeLadder.length - 1],
    settings
  );

  return (
    <div className="titlecard">
      <div className="titlecard__crest" aria-hidden="true">
        <span className="titlecard__crestMark">?</span>
      </div>

      <h1 className="titlecard__title">{settings.showTitle}</h1>
      <p className="titlecard__sub">{settings.showSubtitle}</p>

      <p className="titlecard__prize">
        Ten questions. Three lifelines. {topPrize} on the line.
      </p>

      {onStart ? (
        <button type="button" className="btn btn--primary btn--big" onClick={onStart}>
          Start game
        </button>
      ) : (
        <p className="titlecard__waiting">{waitingLabel || 'Standing by'}</p>
      )}
    </div>
  );
}
