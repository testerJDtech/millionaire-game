/**
 * THE AUDIO MANAGER
 * ─────────────────
 * One object owns every sound in the show. Components never touch an
 * <audio> element; they call this, and this decides what that means.
 *
 * ── WHY HTMLAudioElement AND NOT THE WEB AUDIO API ──────────────────
 * The Web Audio API gives sample-accurate ramps, which sounds like the right
 * answer until you look at the job. This show needs: long files that loop
 * (Web Audio wants them decoded into memory in full), files that might not
 * exist (decode failures are messier than an element's error event), and
 * volume ramps measured in hundreds of milliseconds, where the difference
 * between a scheduled ramp and one driven by rAF is inaudible.
 *
 * So: <audio> elements, streamed, with fades driven by one rAF loop. Fewer
 * ways to fail on a laptop in a function room with no internet.
 *
 * ── THE THREE BUSES ─────────────────────────────────────────────────
 *   master → music → the slot's own volume
 *   master → sfx   → the slot's own volume
 * The host's sliders move master, music and sfx. The manifest sets the slot.
 * Every level in the show is that multiplication, so no slider can ever be
 * bypassed by a sound that sets its own volume directly.
 *
 * ── AUTOPLAY ────────────────────────────────────────────────────────
 * Browsers refuse to play audio until the page has been clicked. `unlock()`
 * is called when the host presses Start show — a real click, guaranteed —
 * and primes every eager element so nothing is stuck on first use.
 *
 * ── MISSING FILES ───────────────────────────────────────────────────
 * Never fatal, ever. A file that fails to load is marked missing, reported
 * once, and skipped from then on. A show with no audio files at all runs
 * exactly as well as one with the full set.
 */

import { AUDIO_SLOTS, BED_CROSSFADE_MS, DUCK_LEVEL } from '../data/audioManifest.js';

/** Volume below which we treat a fade as finished and pause the element. */
const SILENT = 0.001;

export function createAudioManager() {
  /* ── State ─────────────────────────────────────────────────────── */

  const elements = new Map(); // slot id → HTMLAudioElement
  const missing = new Set(); // slot ids whose file would not load
  const lastFired = new Map(); // slot id → timestamp, for the retrigger guard
  const ramps = new Map(); // element → active fade

  let unlocked = false;
  let enabled = false; // does THIS window make noise?
  let levels = { master: 0.7, music: 1, sfx: 1, muted: false };

  let bed = null; // { slot, el } currently playing
  let duckUntil = 0; // timestamp the bed is held down until
  let duckTimer = null;
  let rafId = null;
  let sequenceTimers = [];

  /* ── Levels ────────────────────────────────────────────────────── */

  function busLevel(slot) {
    const spec = AUDIO_SLOTS[slot];
    if (!spec) return 0;
    if (levels.muted) return 0;
    const bus = spec.bus === 'music' ? levels.music : levels.sfx;
    return clamp(levels.master * bus * spec.volume);
  }

  /** A bed's level, taking any active duck into account. */
  function bedLevel(slot) {
    const base = busLevel(slot);
    return Date.now() < duckUntil ? base * DUCK_LEVEL : base;
  }

  function clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  /* ── Elements ──────────────────────────────────────────────────── */

  function element(slot) {
    if (missing.has(slot)) return null;
    if (elements.has(slot)) return elements.get(slot);

    const spec = AUDIO_SLOTS[slot];
    if (!spec || typeof Audio === 'undefined') return null;

    const el = new Audio(spec.file);
    el.preload = 'auto';
    el.loop = spec.role === 'bed';
    el.volume = 0;
    // One report per missing file, then silence about it. A quiz night is not
    // the time to be filling a console with the same warning every question.
    el.addEventListener('error', () => {
      if (!missing.has(slot)) {
        missing.add(slot);
        console.warn(`[audio] ${slot}: no file at ${spec.file} — skipping it.`);
      }
    });

    elements.set(slot, el);
    return el;
  }

  function safePlay(el) {
    const attempt = el.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
  }

  /* ── Fades: one rAF loop drives every ramp in flight ───────────── */

  function rampTo(el, target, ms, onDone) {
    if (!el) return;
    if (ms <= 0) {
      ramps.delete(el);
      el.volume = clamp(target);
      if (onDone) onDone();
      return;
    }
    ramps.set(el, {
      from: el.volume,
      to: clamp(target),
      start: performance.now(),
      ms,
      onDone,
    });
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick(now) {
    ramps.forEach((ramp, el) => {
      const progress = Math.min(1, (now - ramp.start) / ramp.ms);
      // Equal-power-ish curve. A linear fade between two beds dips in the
      // middle; this keeps the perceived loudness steady across a crossfade.
      const eased = progress * progress * (3 - 2 * progress);
      el.volume = clamp(ramp.from + (ramp.to - ramp.from) * eased);
      if (progress >= 1) {
        ramps.delete(el);
        if (ramp.onDone) ramp.onDone();
      }
    });
    rafId = ramps.size > 0 ? requestAnimationFrame(tick) : null;
  }

  function cancelRamp(el) {
    ramps.delete(el);
  }

  /* ── Public surface ────────────────────────────────────────────── */

  return {
    /**
     * Called on a real user gesture (Start show). Primes every eager element
     * by starting and immediately pausing it, which is what actually lifts
     * the browser's autoplay block for the rest of the session.
     */
    unlock() {
      if (unlocked || typeof Audio === 'undefined') return;
      unlocked = true;
      Object.entries(AUDIO_SLOTS).forEach(([slot, spec]) => {
        if (spec.preload !== 'eager') return;
        const el = element(slot);
        if (!el) return;
        el.volume = 0;
        const attempt = el.play();
        if (attempt && typeof attempt.then === 'function') {
          attempt.then(
            () => {
              el.pause();
              el.currentTime = 0;
            },
            () => {}
          );
        }
      });
    },

    /** Fetch files ahead of time without playing anything. */
    preload(which = 'eager') {
      Object.entries(AUDIO_SLOTS).forEach(([slot, spec]) => {
        if (which !== 'all' && spec.preload !== which) return;
        const el = element(slot);
        if (el) el.load();
      });
    },

    /** Whether this window is the one making noise. */
    setEnabled(value) {
      enabled = value;
      if (!enabled) this.stopAll({ fade: 200 });
      else if (bed) rampTo(bed.el, bedLevel(bed.slot), 300);
    },

    /** Master / music / sfx / mute, straight from the host's sliders. */
    setLevels(next) {
      levels = { ...levels, ...next };
      // Anything already playing follows the slider immediately. Ramped over
      // a few frames rather than set outright: dragging a slider, or hitting
      // mute while a sting is ringing, would otherwise click.
      if (bed) rampTo(bed.el, bedLevel(bed.slot), 120);
      elements.forEach((el, slot) => {
        if (el.paused || (bed && bed.slot === slot)) return;
        rampTo(el, busLevel(slot), 90);
      });
    },

    getLevels() {
      return { ...levels };
    },

    /** Slots whose file could not be loaded — shown in the host's test panel. */
    getMissing() {
      return Array.from(missing);
    },

    /**
     * Fire a one-shot. Repeated presses inside the slot's `minGap` are
     * ignored, so a host leaning on Enter can't stack three lock-in hits.
     */
    play(slot, { force = false } = {}) {
      const spec = AUDIO_SLOTS[slot];
      if (!spec || !enabled || levels.muted) return false;

      const now = Date.now();
      const previous = lastFired.has(slot) ? lastFired.get(slot) : -Infinity;
      if (!force && now - previous < spec.minGap) return false;
      lastFired.set(slot, now);

      const el = element(slot);
      if (!el) return false;

      // A bed asked to fire as a one-shot (the host testing it) still loops,
      // so route it through the bed machinery instead.
      if (spec.role === 'bed') {
        this.setBed(slot, { fade: 600 });
        return true;
      }

      cancelRamp(el);
      try {
        el.currentTime = 0;
      } catch (error) {
        // Not loaded yet; playing from wherever it is beats not playing.
      }
      el.volume = busLevel(slot);
      safePlay(el);

      if (spec.duck > 0) this.duck(spec.duck);
      return true;
    },

    /**
     * Bring a bed up, taking the current one down as it comes — a crossfade,
     * not a cut. Passing null clears the bed entirely.
     */
    setBed(slot, { fade = BED_CROSSFADE_MS, fromSilence = false } = {}) {
      if (!enabled) return;
      if (bed && bed.slot === slot) return; // already there; leave it alone

      const outgoing = bed;
      if (outgoing) {
        rampTo(outgoing.el, 0, fade, () => {
          outgoing.el.pause();
          outgoing.el.currentTime = 0;
        });
      }

      if (!slot) {
        bed = null;
        return;
      }

      const el = element(slot);
      if (!el) {
        bed = null;
        return;
      }

      cancelRamp(el);
      el.volume = 0;
      if (fromSilence) {
        try {
          el.currentTime = 0;
        } catch (error) {
          /* not loaded yet */
        }
      }
      safePlay(el);
      bed = { slot, el };
      rampTo(el, bedLevel(slot), fade);
    },

    /** What's playing under the question right now, if anything. */
    currentBed() {
      return bed ? bed.slot : null;
    },

    /**
     * Fade out one specific sound. The intro is the reason this exists: an
     * opening cue can run half a minute, and it should be gone by the time
     * the first pair is in the chair rather than playing under them.
     */
    stop(slot, { fade = 900 } = {}) {
      const el = elements.get(slot);
      if (!el || el.paused) return;
      if (bed && bed.slot === slot) bed = null;
      rampTo(el, 0, fade, () => {
        el.pause();
        el.currentTime = 0;
      });
    },

    /** Is this slot making noise right now? */
    isPlaying(slot) {
      const el = elements.get(slot);
      return Boolean(el && !el.paused);
    },

    /**
     * Hold the bed down so a sting can be heard over it, then bring it back.
     * Overlapping ducks extend rather than fight: the bed comes back once,
     * after the last one has finished.
     */
    duck(ms, { level = DUCK_LEVEL } = {}) {
      if (!bed) return;
      duckUntil = Math.max(duckUntil, Date.now() + ms);
      rampTo(bed.el, busLevel(bed.slot) * level, 140);

      if (duckTimer) clearTimeout(duckTimer);
      duckTimer = setTimeout(() => {
        duckTimer = null;
        if (bed) rampTo(bed.el, bedLevel(bed.slot), 700);
      }, Math.max(0, duckUntil - Date.now()));
    },

    /**
     * BANKING A SAFETY NET — the one place two stings play as a sequence.
     * The right-answer sting lands first, the bed drops away underneath it,
     * and the bigger safety-net cue arrives into the gap it leaves.
     */
    playSafetyNet() {
      if (!enabled) return;
      this.play('correct');
      this.duck(3400, { level: 0.12 });
      sequenceTimers.push(
        setTimeout(() => this.play('safetyNet', { force: true }), 900)
      );
    },

    /**
     * THE £1,000,000 QUESTION — audio half of the sequence.
     * Everything stops, the room gets a moment of near-silence, and the
     * final bed creeps in underneath the reveal rather than starting.
     */
    presentFinalQuestion({ silenceMs = 1100, riseMs = 3000 } = {}) {
      if (!enabled) return;
      this.fadeOutAll(700);
      sequenceTimers.push(
        setTimeout(() => {
          this.setBed('bedFinal', { fade: riseMs, fromSilence: true });
        }, 700 + silenceMs)
      );
    },

    /** Everything down over `fade` ms, then stopped. */
    fadeOutAll(fade = 1200) {
      clearSequences();
      duckUntil = 0;
      if (duckTimer) {
        clearTimeout(duckTimer);
        duckTimer = null;
      }
      elements.forEach((el) => {
        if (el.paused) return;
        rampTo(el, 0, fade, () => {
          el.pause();
          el.currentTime = 0;
        });
      });
      bed = null;
    },

    /** Hard stop. Used for panic buttons and when a window closes. */
    stopAll({ fade = 0 } = {}) {
      if (fade > 0) {
        this.fadeOutAll(fade);
        return;
      }
      clearSequences();
      duckUntil = 0;
      if (duckTimer) {
        clearTimeout(duckTimer);
        duckTimer = null;
      }
      elements.forEach((el) => {
        cancelRamp(el);
        el.pause();
        try {
          el.currentTime = 0;
        } catch (error) {
          /* nothing loaded to rewind */
        }
        el.volume = 0;
      });
      bed = null;
    },
  };

  function clearSequences() {
    sequenceTimers.forEach(clearTimeout);
    sequenceTimers = [];
  }
}

export default createAudioManager;
