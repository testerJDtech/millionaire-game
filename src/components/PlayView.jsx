import { useEffect, useRef, useState } from 'react';
import StartScreen from './StartScreen.jsx';
import TeamSelect from './TeamSelect.jsx';
import GameBoard from './GameBoard.jsx';
import Leaderboard from './Leaderboard.jsx';
import useGameState from '../hooks/useGameState.js';
import { useGameAudio } from '../utils/audio.js';
import { settings } from '../data/settings.js';
import { formatMoney } from '../utils/gameEngine.js';

/** Words for the pair-result screen. */
const RESULT_HEADLINE = {
  jackpot: 'Top prize',
  wrong: 'Game over',
  ended: 'Walked away',
};

/**
 * THE PROJECTOR VIEW (#/play)
 *
 * Presentation only. It reads game state and draws it. It never writes,
 * never decides anything, and never shows the answer key before the host
 * presses Reveal.
 */
export default function PlayView() {
  const { state, teams, currentTeam, currentQuestion } = useGameState('play');

  // Whether THIS window makes noise. Browsers block audio until a window has
  // been clicked, so this starts off unless settings say otherwise.
  const [soundOn, setSoundOn] = useState(settings.audio.defaultOutput === 'play');
  useGameAudio(state, soundOn);

  const [fullscreenBlocked, setFullscreenBlocked] = useState(false);
  const lastFullscreenRequest = useRef(state.fullscreenRequestId);

  const goFullscreen = () => {
    const target = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    const attempt = target.requestFullscreen ? target.requestFullscreen() : null;
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(
        () => setFullscreenBlocked(false),
        () => setFullscreenBlocked(true)
      );
    }
  };

  // The host can ask this window to go fullscreen. Browsers often refuse
  // unless the window itself has been clicked, so if it fails we say so
  // rather than leaving the host wondering.
  useEffect(() => {
    if (state.fullscreenRequestId === lastFullscreenRequest.current) return;
    lastFullscreenRequest.current = state.fullscreenRequestId;
    goFullscreen();
  }, [state.fullscreenRequestId]);

  // Shift+F works in this window too.
  useEffect(() => {
    const onKey = (event) => {
      if (event.shiftKey && (event.key === 'F' || event.key === 'f')) {
        event.preventDefault();
        goFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const teamName =
    currentTeam ? state.teamNames[currentTeam.id] ?? currentTeam.name : '';

  let screen = null;

  if (state.screen === 'start') {
    screen = <StartScreen waitingLabel="Standing by" />;
  } else if (state.screen === 'teams') {
    screen = (
      <div className="pad">
        <TeamSelect state={state} teams={teams} />
      </div>
    );
  } else if (state.screen === 'game' && state.run && currentQuestion) {
    screen = (
      <GameBoard state={state} question={currentQuestion} teamName={teamName} />
    );
  } else if (state.screen === 'result' && state.lastResult) {
    const result = state.lastResult;
    const name = state.teamNames[result.teamId] || result.teamId;
    screen = (
      <div className="result">
        <p className="result__kicker">{RESULT_HEADLINE[result.reason] || 'Result'}</p>
        <h2 className="result__name">{name}</h2>
        <p className="result__money">{formatMoney(result.winnings, settings)}</p>
        <p className="result__detail">
          {result.correctCount} of {settings.prizeLadder.length} answered correctly
        </p>
      </div>
    );
  } else if (state.screen === 'leaderboard') {
    screen = (
      <div className="pad">
        <Leaderboard state={state} teams={teams} />
      </div>
    );
  } else {
    // Covers the gap if the host resets while this window is mid-render.
    screen = <StartScreen waitingLabel="Standing by" />;
  }

  return (
    <div className="play">
      {screen}

      {/* Small, out-of-the-way controls. They fade out of sight in fullscreen. */}
      <div className="playtools">
        <button type="button" className="playtools__btn" onClick={goFullscreen}>
          Fullscreen
        </button>
        <button
          type="button"
          className="playtools__btn"
          onClick={() => setSoundOn((on) => !on)}
        >
          {soundOn ? 'Sound on' : 'Enable sound here'}
        </button>
        {fullscreenBlocked && (
          <span className="playtools__hint">
            Click this window, then press Shift+F
          </span>
        )}
      </div>
    </div>
  );
}
