/**
 * AUDIO — the bridge between game state and the audio manager.
 *
 * HOW SOUND TRAVELS THROUGH THE APP
 *   1. The host does something. The action attaches a cue to the new state:
 *      { name: 'lockIn', id: 41 }. The id changes even when the same sound
 *      fires twice in a row, which is what makes a repeat audible.
 *   2. That state is broadcast to both windows.
 *   3. Both windows see the new cue id. Whichever one has sound switched on
 *      plays it. The other stays silent.
 *
 * The consequence worth knowing: the two screens are always in step because
 * neither of them decides anything. Sound is a function of game state, the
 * same way the projector's picture is.
 *
 * The engine itself is in audioManager.js; this file only decides *when*.
 */

import { useEffect, useRef } from 'react';
import { createAudioManager } from './audioManager.js';
import { bedForQuestion } from '../data/audioManifest.js';
import { questionCount } from './gameEngine.js';
import { settings } from '../data/settings.js';

/**
 * Cues that mean "run a sequence", not "play a file".
 * Everything else is played straight from the manifest by name.
 */
const SEQUENCES = {
  safetyNet: (audio) => audio.playSafetyNet(),
  finalQuestion: (audio) =>
    audio.presentFinalQuestion({
      silenceMs: settings.finalQuestion.silenceMs,
      riseMs: settings.finalQuestion.bedRiseMs,
    }),
};

/**
 * Wires the manager up to game state.
 *
 * @param state    the current game state
 * @param soundOn  whether THIS window should make noise
 */
export function useGameAudio(state, soundOn) {
  const ref = useRef(null);
  const lastCueRef = useRef(0);

  if (!ref.current && typeof window !== 'undefined') {
    ref.current = createAudioManager();
  }

  /* ── This window's output, and the host's three sliders ────────── */

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    // Switching sound on in a window is itself a click, so it is also the
    // moment that window is allowed to make noise at all.
    if (soundOn) {
      audio.unlock();
      audio.preload('eager');
    }
    audio.setEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    audio.setLevels({
      master: state.audio.volume,
      music: state.audio.musicVolume,
      sfx: state.audio.sfxVolume,
      muted: state.audio.muted,
    });
  }, [
    state.audio.volume,
    state.audio.musicVolume,
    state.audio.sfxVolume,
    state.audio.muted,
  ]);

  /* ── One-shots and sequences ───────────────────────────────────── */

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    if (state.cue.id === lastCueRef.current) return;
    lastCueRef.current = state.cue.id;

    const name = state.cue.name;
    if (!name) return;

    // Start show is the first real click of the night: use it to lift the
    // browser's autoplay block before anything actually needs to be heard.
    if (name === 'intro') audio.unlock();

    const sequence = SEQUENCES[name];
    if (sequence) sequence(audio);
    else audio.play(name);
  }, [state.cue.id, state.cue.name]);

  /* ── The bed: which one, and whether it should be playing at all ─ */

  const run = state.run;
  const screen = state.screen;
  const phase = run ? run.phase : null;
  const index = run ? run.index : 0;

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    if (state.audio.bedPaused) {
      audio.setBed(null, { fade: 600 });
      return;
    }

    // The £1,000,000 presentation owns the audio while it runs: silence,
    // then bedFinal creeping in. Anything set here would talk over it.
    if (phase === 'presenting') return;

    /**
     * The opening cue plays across the title card *and* the pair-select
     * screen — pressing Start show moves to pair select immediately, so
     * stopping it on "not the title card any more" would cut it off a second
     * after it began. It has done its job once someone is in the chair.
     */
    if (screen !== 'start' && screen !== 'teams' && audio.isPlaying('intro')) {
      audio.stop('intro', { fade: 1200 });
    }

    if (screen === 'game' && run) {
      /**
       * Winning the top prize takes the bed away entirely rather than ducking
       * it. `win` is the biggest cue in the show and it should have the room
       * to itself; a bed still running underneath makes it sound smaller.
       */
      const won =
        run.phase === 'revealed' &&
        run.outcome === 'correct' &&
        index === questionCount(settings) - 1;

      audio.setBed(won ? null : bedForQuestion(index), won ? { fade: 800 } : {});
      return;
    }

    // Won, lost, walked away: the bed stops. Whatever happens next should
    // land in a quiet room, not over the top of the last question's music.
    if (screen === 'leaderboard') {
      /**
       * The top-prize cue runs long, and rightly carries on over the result
       * screen while the room reacts. By the time the standings go up it has
       * had its moment — without this it would still be going underneath the
       * leaderboard music, which is the one place two pieces of music would
       * otherwise be left fighting.
       */
      if (audio.isPlaying('win')) audio.stop('win', { fade: 1200 });
      audio.setBed('leaderboard', { fade: 900 });
    } else {
      audio.setBed(null, { fade: 900 });
    }
  }, [screen, phase, index, run, state.audio.bedPaused]);

  /* ── Stop everything if the window closes ──────────────────────── */

  useEffect(() => {
    const audio = ref.current;
    return () => {
      if (audio) audio.stopAll();
    };
  }, []);

  return ref.current;
}

export default useGameAudio;
