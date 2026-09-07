import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import HostPanel from './components/HostPanel.jsx';
import PlayView from './components/PlayView.jsx';
import { settings } from './data/settings.js';

/**
 * A very small router. Hash routes (#/host, #/play) rather than paths,
 * because hashes work everywhere with no server configuration: `npm run dev`,
 * `npm run preview`, a static host, or a folder on a USB stick.
 */
function readRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (hash.startsWith('host')) return 'host';
  if (hash.startsWith('play')) return 'play';
  return 'launcher';
}

export default function App() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /**
   * One motion root for the whole app.
   *
   * `reducedMotion="user"` means a viewer whose system asks for less motion
   * gets opacity changes only — no movement, no scaling — without a single
   * component having to check. The CSS media query at the foot of styles.css
   * does the same for the animations that aren't Framer's.
   */
  return (
    <MotionConfig reducedMotion="user">
      <Route route={route} />
    </MotionConfig>
  );
}

function Route({ route }) {
  if (route === 'host') return <HostPanel />;
  if (route === 'play') return <PlayView />;

  // The launcher: what you see when you first open the app.
  return (
    <div className="launcher">
      <h1 className="launcher__title">{settings.showTitle}</h1>
      <p className="launcher__sub">
        Open one window for yourself and one for the projector.
      </p>

      <div className="launcher__cards">
        <a className="launcher__card" href="#/host">
          <span className="launcher__cardTitle">Host controls</span>
          <span className="launcher__cardBody">
            Keep this on the laptop screen. Shows the answer key, every control
            and the keyboard shortcuts.
          </span>
        </a>

        <a
          className="launcher__card"
          href="#/play"
          target="_blank"
          rel="noreferrer"
        >
          <span className="launcher__cardTitle">Projector screen</span>
          <span className="launcher__cardBody">
            Drag this to the projector and press Fullscreen. Shows the question,
            answers, ladder and lifelines — never the answer key.
          </span>
        </a>
      </div>

      <p className="launcher__note">
        Extend your display rather than mirroring it, so the two windows can sit
        on different screens. Everything runs on this laptop; no internet needed.
      </p>
    </div>
  );
}
