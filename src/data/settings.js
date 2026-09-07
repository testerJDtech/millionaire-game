/**
 * SETTINGS
 * ────────
 * Everything you might want to change on the night lives in this one file.
 * No game logic in here — just values. Change them and refresh.
 */

export const settings = {
  /** Shown on the title card and the top of the audience screen. */
  showTitle: 'The Golden Question',
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

  /** Audio. Drop your own files into public/audio using these exact names. */
  audio: {
    enabled: true,
    masterVolume: 0.7,
    /**
     * Which window outputs sound by default.
     *  'host' — the laptop window (recommended: it has definitely been clicked,
     *           so the browser will never block playback)
     *  'play' — the projector window
     *  'none' — silent until you press the sound button in a window
     */
    defaultOutput: 'host',
    files: {
      intro: 'audio/intro.mp3',
      bed: 'audio/question-bed.mp3',
      lockIn: 'audio/lock-in.mp3',
      correct: 'audio/correct.mp3',
      wrong: 'audio/wrong.mp3',
      win: 'audio/win.mp3',
    },
    /** Question-bed loop volume, relative to master. */
    bedVolume: 0.35,
  },

  /** Animation length in ms. Kept short so hosting never feels sluggish. */
  transitionMs: 300,

  /** Channel + storage keys. Only change these if you run two games at once. */
  syncChannelName: 'millionaire-sync-v1',
  storageKey: 'millionaire-state-v1',
};

export default settings;
