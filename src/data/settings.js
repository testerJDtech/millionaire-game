/**
 * SETTINGS
 * ────────
 * Everything you might want to change on the night lives in this one file.
 * No game logic in here — just values. Change them and refresh.
 */

export const settings = {
  /** Shown on the title card and the top of the audience screen. */
  showTitle: 'Who Wants To Be A Millionaire?',
  showSubtitle: 'Quiz Night',

  /** Money symbol used everywhere. */
  currency: '£',

  /**
   * PRIZE LADDER — question 1 is the first value, question 10 the last.
   * The number of entries here defines how many questions each pair plays.
   * Every question's `value` in questions.js must match its position here.
   */
  prizeLadder: [
    100,
    500,
    1000,
    5000,
    10000,
    25000,
    50000,
    100000,
    500000,
    1000000,
  ],

  /**
   * SAFETY NETS
   * `levels` are question numbers (1-based). Once a pair has answered that
   * question correctly, a later wrong answer still banks that question's prize.
   *
   * Current: pass question 4 and a wrong answer still banks £5,000;
   * pass question 8 and it banks £100,000.
   * Set `enabled: false` for brutal mode (wrong answer = £0).
   */
  safetyNets: {
    enabled: true,
    levels: [4, 8],
  },

  /** How many pairs you expect. Used for a startup warning only. */
  expectedTeamCount: 4,

  /** Phone a Friend countdown. */
  phoneTimerSeconds: 30,
  phoneWarningAtSeconds: 5,
  /**
   * How long "Time up" stays on screen before the timer clears itself.
   * The lifeline is spent by then, so the board goes back to the question
   * without you having to do anything. Set to 0 to clear it instantly.
   */
  phoneTimerHideAfterSeconds: 3,

  /**
   * AUDIO
   *
   * Filenames, per-sound levels and ducking live in src/data/audioManifest.js
   * — one row per moment in the show. What's here is the behaviour around
   * them: starting levels for the host's sliders, and the timing of the two
   * sequences that are more than a single sound.
   */
  audio: {
    enabled: true,

    /* Starting positions for the host's three sliders. Adjustable on the
       night from the Sound panel, and remembered between sessions. */
    /* Music sits at full on its bus so the top-prize cue has clear headroom
       above the safety-net sting — the beds are kept quiet by their own
       levels in the manifest, not by pulling this down. */
    masterVolume: 0.7,
    musicVolume: 1,
    sfxVolume: 1,

    /**
     * Which window outputs sound by default.
     *  'host' — the laptop window (recommended: it has definitely been clicked,
     *           so the browser will never block playback)
     *  'play' — the projector window
     *  'none' — silent until you press the sound button in a window
     */
    defaultOutput: 'host',
  },

  /**
   * THE £1,000,000 QUESTION
   *
   * The last question gets an introduction rather than just appearing. The
   * board clears, the room gets a moment of near-silence, the value comes up
   * on its own, and the final bed creeps in underneath it before the question
   * and answers arrive.
   *
   * Set `present: false` to skip all of it and play question 10 like any
   * other. Times are in milliseconds.
   */
  finalQuestion: {
    present: true,
    /** Quiet after the previous audio fades, before anything appears. */
    silenceMs: 1100,
    /** How slowly bedFinal comes up. Long on purpose — it should creep. */
    bedRiseMs: 3000,
    /** Total time the value card holds before the question comes in. */
    holdMs: 4200,
  },

  /**
   * SAFETY-NET MOMENTS (questions 4 and 8)
   *
   * A banked safety net gets held for a beat: the verdict lands a moment
   * later than usual, the ladder rung it just guaranteed pulses, and the
   * bed drops right down so the achievement sting has the room to itself.
   */
  safetyNetMoment: {
    /** Pause before the answers turn green, so the room leans in first. */
    revealHoldMs: 550,
  },

  /** Animation length in ms. Kept short so hosting never feels sluggish. */
  transitionMs: 300,

  /** Channel + storage keys. Only change these if you run two games at once. */
  syncChannelName: 'millionaire-sync-v1',
  storageKey: 'millionaire-state-v1',
};

export default settings;
