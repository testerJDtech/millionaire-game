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

    /**
     * SOUND EFFECTS — ONE SLOT PER MOMENT IN THE GAME
     * ───────────────────────────────────────────────
     * Drop a file into public/audio and point the slot at it. Every slot is
     * optional: leave it as-is with no file present, or set it to null, and
     * that moment simply plays nothing. Nothing here can break the game.
     *
     * The right-hand column is exactly what triggers the sound.
     */
    files: {
      /* — Opening — */
      intro: 'audio/intro.mp3', //          "Start show" pressed (title → pair select)
      teamTakesSeat: 'audio/team-seat.mp3', // a pair is put in the chair

      /* — Each question — */
      questionStart: 'audio/question-start.mp3', // a new question comes up
      bed: 'audio/question-bed.mp3', //     loops under the question (see bedByQuestion)
      lockIn: 'audio/lock-in.mp3', //       "Lock in" — final answer
      correct: 'audio/correct.mp3', //      right answer revealed
      wrong: 'audio/wrong.mp3', //          wrong answer revealed
      safetyNet: 'audio/safety-net.mp3', // right answer that banks a safety net
      //                                    (falls back to `correct` if missing)

      /* — Lifelines — */
      fiftyFifty: 'audio/fifty-fifty.mp3', //     50:50 used, two answers vanish
      phoneRing: 'audio/phone-ring.mp3', //       Phone a Friend timer started
      phoneWarning: 'audio/phone-warning.mp3', // phoneWarningAtSeconds reached
      phoneTimeUp: 'audio/phone-timeup.mp3', //   phone timer hits zero
      askAudience: 'audio/ask-audience.mp3', //   audience vote opened
      audienceResults: 'audio/audience-results.mp3', // the bars go up on screen

      /* — Endings — */
      walkAway: 'audio/walk-away.mp3', //   pair walks away with the money
      win: 'audio/win.mp3', //              top prize taken
      leaderboard: 'audio/leaderboard.mp3', // final leaderboard shown
    },

    /**
     * PER-QUESTION BEDS (optional — this is the big one for a real feel)
     * The show uses a different, tenser loop as the money climbs. Give this
     * an array of 10 files, one per question, and the bed changes as they go.
     * Set it to null (or delete it) to use the single `files.bed` throughout.
     * A short array is fine — the last entry covers every question beyond it.
     */
    bedByQuestion: null,
    // bedByQuestion: [
    //   'audio/bed-q1.mp3',  'audio/bed-q2.mp3',  'audio/bed-q3.mp3',
    //   'audio/bed-q4.mp3',  'audio/bed-q5.mp3',  'audio/bed-q6.mp3',
    //   'audio/bed-q7.mp3',  'audio/bed-q8.mp3',  'audio/bed-q9.mp3',
    //   'audio/bed-q10.mp3',
    // ],

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
