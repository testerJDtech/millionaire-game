/**
 * THE AUDIO MANIFEST — every sound in the show, in one table.
 * ──────────────────────────────────────────────────────────
 *
 * This is the only file that knows what a sound is called, where it lives,
 * how loud it should be and how it behaves. Components never name a file;
 * they name a slot ('lockIn'), and this table says the rest.
 *
 * TO REPLACE A SOUND: drop your file into public/audio/ and change the `file`
 * line here. Nothing else in the project needs touching.
 *
 * TO RE-BALANCE THE SHOW: change `volume` here. It is a fraction of that
 * slot's bus (music or sfx), which is itself a fraction of master — so the
 * host's three sliders keep working whatever you set.
 *
 * NO FILE? NO PROBLEM. A missing file is noticed once, logged quietly and
 * skipped forever after. The game never waits on audio and never breaks
 * because of it, so you can run the show with two sounds or twenty.
 *
 * LICENCES: every file that ships in public/audio must have a row in
 * AUDIO_ASSETS.md. If a licence is unclear, the file does not go in.
 *
 * ── THE FIELDS ──────────────────────────────────────────────────────
 *   file     path under public/. Never starts with a slash.
 *   bus      'music' | 'sfx' — which of the host's two sliders owns it.
 *   role     'oneshot' | 'bed' — beds loop and crossfade, one-shots fire.
 *   volume   0-1, this slot's level within its bus.
 *   preload  'eager'  fetched before the show starts
 *            'lazy'   fetched on first use (fine for anything after Q1)
 *   duck     ms to hold the bed down under this sound, or 0 for none.
 *   minGap   ms before the same slot can fire again. Stops a double-press
 *            or a repeated key from stacking two copies into a flam.
 *   note     what the sound is for, in one line. Search terms for finding
 *            each one live in AUDIO_ASSETS.md.
 */

/** Held down to this fraction of its normal level while a sting plays. */
export const DUCK_LEVEL = 0.32;

/** Standard crossfade between two beds, in ms. */
export const BED_CROSSFADE_MS = 1400;

export const AUDIO_SLOTS = {
  /* ─────────────────────────── OPENING ─────────────────────────── */

  intro: {
    file: 'audio/music/intro.mp3',
    bus: 'music',
    role: 'oneshot',
    volume: 0.9,
    preload: 'eager',
    duck: 0,
    minGap: 2000,
    note: 'Big cinematic opening, 8-15s. Plays over the title card.',
  },

  teamTakesSeat: {
    file: 'audio/sfx/team-takes-seat.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.55,
    preload: 'eager',
    duck: 0,
    minGap: 800,
    note: 'Short contestant-entrance stinger as a pair takes the chair.',
  },

  questionStart: {
    file: 'audio/sfx/question-start.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.45,
    preload: 'eager',
    duck: 0,
    minGap: 400,
    note: 'Subtle suspense transition as a new question comes up.',
  },

  /* ───────────────── QUESTION BEDS (the tension ladder) ───────────────── */

  bedEasy: {
    file: 'audio/music/bed-easy.mp3',
    bus: 'music',
    role: 'bed',
    volume: 0.26,
    preload: 'eager',
    duck: 0,
    minGap: 0,
    note: 'Q1-3. Light, confident, moving. Should feel like fun, not danger.',
  },

  bedMedium: {
    file: 'audio/music/bed-medium.mp3',
    bus: 'music',
    role: 'bed',
    volume: 0.26,
    preload: 'eager',
    duck: 0,
    minGap: 0,
    note: 'Q4-6. Focused. A pulse arrives; the room settles down.',
  },

  bedHard: {
    file: 'audio/music/bed-hard.mp3',
    bus: 'music',
    role: 'bed',
    volume: 0.24,
    preload: 'lazy',
    duck: 0,
    minGap: 0,
    note: 'Q7-8. Serious. Low strings, real weight, no melody to speak of.',
  },

  bedFinal: {
    file: 'audio/music/bed-final.mp3',
    bus: 'music',
    role: 'bed',
    // Quieter than the rest on purpose: the host and the contestants have to
    // be able to talk over this one, and the silence is doing the work.
    volume: 0.18,
    preload: 'lazy',
    duck: 0,
    minGap: 0,
    note: 'Q9-10. Sparse and very tense. Heartbeat, drone, almost nothing else.',
  },

  /* ──────────────────────── PLAYING A QUESTION ──────────────────────── */

  lockIn: {
    file: 'audio/sfx/lock-in.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.65,
    preload: 'eager',
    duck: 1400,
    minGap: 700,
    note: 'Final answer. A hit with a short riser into it.',
  },

  correct: {
    file: 'audio/sfx/correct.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.75,
    preload: 'eager',
    duck: 1800,
    minGap: 700,
    note: 'Right answer. Triumphant, short, warm.',
  },

  wrong: {
    file: 'audio/sfx/wrong.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.72,
    preload: 'eager',
    duck: 2200,
    minGap: 700,
    note: 'Wrong answer. Dramatic and low. Never comedic — nobody is being mocked.',
  },

  safetyNet: {
    file: 'audio/sfx/safety-net.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.8,
    preload: 'eager',
    duck: 3200,
    minGap: 1200,
    note: 'Banking Q4 or Q8. Bigger than `correct` — this is an achievement.',
  },

  /* ─────────────────────────── LIFELINES ─────────────────────────── */

  fiftyFifty: {
    file: 'audio/sfx/fifty-fifty.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.55,
    preload: 'eager',
    duck: 1200,
    minGap: 900,
    note: 'Digital sweep with two hits in it, one per answer removed.',
  },

  phoneRing: {
    file: 'audio/sfx/phone-ring.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.5,
    preload: 'eager',
    duck: 0,
    minGap: 1000,
    note: 'Placing the call. Ring then connect — clean, not a novelty ringtone.',
  },

  phoneWarning: {
    file: 'audio/sfx/phone-warning.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.6,
    preload: 'eager',
    duck: 900,
    minGap: 900,
    note: 'Five seconds left. Urgent, short, one or two beeps.',
  },

  phoneTimeUp: {
    file: 'audio/sfx/phone-time-up.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.7,
    preload: 'eager',
    duck: 1400,
    minGap: 900,
    note: 'Out of time. A clear, dramatic full stop.',
  },

  askAudience: {
    file: 'audio/sfx/ask-audience.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.5,
    preload: 'lazy',
    duck: 0,
    minGap: 900,
    note: 'The vote opens. A polling / handing-over-to-the-room transition.',
  },

  audienceResults: {
    file: 'audio/sfx/audience-results.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.55,
    preload: 'lazy',
    // Long enough to cover the bars growing (see audienceBar in utils/motion.js).
    duck: 1600,
    minGap: 900,
    note: 'Rising sweep that lands as the bars finish growing. ~1.2s.',
  },

  /* ──────────────────────────── ENDINGS ──────────────────────────── */

  walkAway: {
    file: 'audio/sfx/walk-away.mp3',
    bus: 'sfx',
    role: 'oneshot',
    volume: 0.7,
    preload: 'lazy',
    duck: 2500,
    minGap: 1200,
    note: 'Taking the money. Warm and positive — this is a good outcome.',
  },

  win: {
    file: 'audio/music/win.mp3',
    bus: 'music',
    role: 'oneshot',
    volume: 1,
    preload: 'lazy',
    duck: 4000,
    minGap: 2000,
    note: 'The top prize. The biggest thing in the show. Nothing else comes close.',
  },

  leaderboard: {
    file: 'audio/music/leaderboard.mp3',
    bus: 'music',
    role: 'bed',
    volume: 0.32,
    preload: 'lazy',
    duck: 0,
    minGap: 0,
    note: 'Final standings. Celebratory, loops under the room emptying out.',
  },
};

/* ───────────────────── THE PROGRESSIVE TENSION LADDER ───────────────────── */

/**
 * Which bed belongs to which question. `upTo` is the last question number
 * (1-based) in that tier, so this reads the way you'd say it out loud:
 * "one to three easy, four to six medium, seven and eight hard, then final".
 *
 * A shorter prize ladder still works — the tiers apply by question number and
 * anything past the last boundary gets bedFinal.
 */
export const BED_TIERS = [
  { upTo: 3, slot: 'bedEasy', label: 'Q1-3 · light' },
  { upTo: 6, slot: 'bedMedium', label: 'Q4-6 · focused' },
  { upTo: 8, slot: 'bedHard', label: 'Q7-8 · serious' },
  { upTo: Infinity, slot: 'bedFinal', label: 'Q9-10 · the room goes quiet' },
];

/** The bed for a 0-based question index. */
export function bedForQuestion(index) {
  const number = index + 1;
  const tier = BED_TIERS.find((t) => number <= t.upTo);
  return tier ? tier.slot : 'bedFinal';
}

/** Every slot id, in the order the host panel should list them for testing. */
export const SLOT_IDS = Object.keys(AUDIO_SLOTS);

/** Just the beds, for the host's test panel and for preloading. */
export const BED_IDS = SLOT_IDS.filter((id) => AUDIO_SLOTS[id].role === 'bed');

export default AUDIO_SLOTS;
