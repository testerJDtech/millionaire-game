/**
 * AUDIO
 *
 * Sound is driven by a "cue" in the game state: { name, id }. The host bumps
 * the id, both windows see it, and whichever window has sound switched on
 * plays the file. That keeps the two screens in step and means you decide,
 * on the night, which window actually makes noise.
 *
 * Missing files never break anything — a failed play is swallowed silently,
 * so the game runs perfectly well with no audio at all.
 */

import { useEffect, useRef } from 'react';
import { settings } from '../data/settings.js';

export function createAudioEngine() {
  const cache = new Map();
  let enabled = false;
  let muted = false;
  let volume = settings.audio.masterVolume;
  let bedShouldPlay = false;

  function element(src, loop) {
    if (!cache.has(src)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.loop = Boolean(loop);
      cache.set(src, audio);
    }
    return cache.get(src);
  }

  function effectiveVolume(scale) {
    if (muted) return 0;
    return Math.max(0, Math.min(1, volume * scale));
  }

  const bed = () => element(settings.audio.files.bed, true);

  function syncBed() {
    const track = bed();
    track.volume = effectiveVolume(settings.audio.bedVolume);
    if (enabled && bedShouldPlay && !muted) {
      const attempt = track.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    } else {
      track.pause();
    }
  }

  return {
    setEnabled(value) {
      enabled = value;
      syncBed();
    },
    setMuted(value) {
      muted = value;
      syncBed();
    },
    setVolume(value) {
      volume = value;
      syncBed();
    },

    /** Play a one-shot sound by settings key, e.g. 'correct'. */
    play(name) {
      if (!enabled || muted || !settings.audio.enabled) return;
      const src = settings.audio.files[name];
      if (!src) return;
      const track = element(src, false);
      try {
        track.currentTime = 0;
      } catch (error) {
        // Not yet loaded; playing from wherever it is, is fine.
      }
      track.volume = effectiveVolume(1);
      const attempt = track.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    },

    /** Turn the looping question bed on or off. */
    setBed(shouldPlay) {
      bedShouldPlay = shouldPlay;
      syncBed();
    },

    stopAll() {
      bedShouldPlay = false;
      cache.forEach((track) => {
        track.pause();
      });
    },
  };
}

/**
 * Wires the engine up to game state.
 *
 * @param state    the current game state
 * @param soundOn  whether THIS window should make noise
 */
export function useGameAudio(state, soundOn) {
  const engineRef = useRef(null);
  const lastCueRef = useRef(0);

  if (!engineRef.current && typeof window !== 'undefined') {
    engineRef.current = createAudioEngine();
  }

  // Volume, mute and on/off.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setEnabled(soundOn);
    engine.setMuted(state.audio.muted);
    engine.setVolume(state.audio.volume);
  }, [soundOn, state.audio.muted, state.audio.volume]);

  // One-shot cues. The id changes even when the same sound repeats.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (state.cue.id === lastCueRef.current) return;
    lastCueRef.current = state.cue.id;
    if (state.cue.name) engine.play(state.cue.name);
  }, [state.cue.id, state.cue.name]);

  // The looping question bed: on during a question, off once revealed so the
  // correct/wrong sting is heard cleanly.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const onQuestion =
      state.screen === 'game' && state.run && state.run.phase !== 'revealed';
    engine.setBed(Boolean(onQuestion) && !state.audio.bedPaused);
  }, [state.screen, state.run, state.audio.bedPaused]);

  // Stop everything if the window closes.
  useEffect(() => {
    const engine = engineRef.current;
    return () => {
      if (engine) engine.stopAll();
    };
  }, []);
}
