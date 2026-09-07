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

  let bedIndex = 0;
  let playingBedSrc = null;

  /**
   * Which loop belongs under question `index` (0-based). With
   * settings.audio.bedByQuestion set, the bed tightens as the money climbs;
   * a short list just means the last entry covers the rest of the ladder.
   */
  function bedSrc(index) {
    const perQuestion = settings.audio.bedByQuestion;
    if (Array.isArray(perQuestion) && perQuestion.length > 0) {
      const pick = perQuestion[Math.min(Math.max(index, 0), perQuestion.length - 1)];
      if (pick) return pick;
    }
    return settings.audio.files.bed;
  }

  function syncBed() {
    const src = bedSrc(bedIndex);

    // Swapped to a different loop (or lost the file): silence the old one.
    if (playingBedSrc && playingBedSrc !== src) {
      const previous = cache.get(playingBedSrc);
      if (previous) previous.pause();
      playingBedSrc = null;
    }
    if (!src) return;

    const track = element(src, true);
    track.volume = effectiveVolume(settings.audio.bedVolume);
    if (enabled && bedShouldPlay && !muted) {
      playingBedSrc = src;
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

    /**
     * Play a one-shot sound by settings key, e.g. 'correct'.
     * `fallback` covers slots you have not filled in — a safety-net sting with
     * no file of its own still gets the normal "correct" sound.
     */
    play(name, fallback) {
      if (!enabled || muted || !settings.audio.enabled) return;
      const src = settings.audio.files[name] || (fallback && settings.audio.files[fallback]);
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

    /**
     * Turn the looping question bed on or off.
     * `index` is the 0-based question number, so per-question beds can switch.
     */
    setBed(shouldPlay, index = 0) {
      bedShouldPlay = shouldPlay;
      bedIndex = index;
      syncBed();
    },

    stopAll() {
      bedShouldPlay = false;
      playingBedSrc = null;
      cache.forEach((track) => {
        track.pause();
      });
    },
  };
}

/**
 * What each new cue falls back to when you have not given it its own file.
 * This is what keeps the original six-file set sounding exactly as it did:
 * add nothing and the new moments borrow the closest old sting.
 */
const CUE_FALLBACKS = {
  safetyNet: 'correct',
  phoneWarning: 'lockIn',
  phoneTimeUp: 'wrong',
  leaderboard: 'win',
  walkAway: 'win',
};

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
    if (state.cue.name) engine.play(state.cue.name, CUE_FALLBACKS[state.cue.name]);
  }, [state.cue.id, state.cue.name]);

  // The looping question bed: on during a question, off once revealed so the
  // correct/wrong sting is heard cleanly. The question number goes through too,
  // so settings.audio.bedByQuestion can tighten the loop as the money climbs.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const onQuestion =
      state.screen === 'game' && state.run && state.run.phase !== 'revealed';
    engine.setBed(
      Boolean(onQuestion) && !state.audio.bedPaused,
      state.run ? state.run.index : 0
    );
  }, [state.screen, state.run, state.audio.bedPaused]);

  // Stop everything if the window closes.
  useEffect(() => {
    const engine = engineRef.current;
    return () => {
      if (engine) engine.stopAll();
    };
  }, []);
}
