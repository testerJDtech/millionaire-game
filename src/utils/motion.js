/**
 * MOTION — every animation in the show, defined once.
 *
 * WHY THIS FILE EXISTS
 * Components describe *what* is happening ("this answer just locked in") and
 * ask this file *how* that should look. Nothing declares its own durations or
 * easings, so the whole app moves as one piece and re-timing the show is a
 * change in here, not a hunt through twelve components.
 *
 * ── THE TWO TIERS ───────────────────────────────────────────────────
 * They are deliberately separate, because they serve opposite goals.
 *
 *   FUNCTIONAL (150–450ms) — navigation, panels, lists, hovers.
 *     Gets out of the way. The host presses a key and the app responds now.
 *     Never let one of these sit between the host and their next action.
 *
 *   DRAMATIC (500–2500ms) — lock-in, the reveal, the top prize.
 *     Buys tension on purpose. Only ever used where the room is *meant* to
 *     be held waiting, and never on a control the host has to press through.
 *
 * ── RULES OF THE HOUSE ──────────────────────────────────────────────
 *   • Animate transform and opacity only. Both are composited, so the
 *     projector holds 60fps and nothing below reflows.
 *   • Entrances ease out, exits ease in, state changes ease in-out.
 *   • Reduced motion is handled globally by <MotionConfig reducedMotion="user">
 *     in App.jsx (and a matching CSS media query), so nothing here needs to
 *     ask. Framer drops transforms and keeps opacity; the show still reads.
 */

/* ───────────────────────────── EASING ───────────────────────────── */

export const EASE = {
  /** Entering: fast off the mark, settles softly. Matches CSS --ease. */
  out: [0.22, 0.61, 0.36, 1],
  /** Leaving: drifts, then goes. Nothing lingers on the way out. */
  in: [0.55, 0.06, 0.68, 0.19],
  /** Changing state in place: even at both ends. */
  inOut: [0.65, 0, 0.35, 1],
};

/* ──────────────────────────── DURATIONS ─────────────────────────── */
/* Seconds, because that is what Framer Motion speaks. */

export const T = {
  /* Functional */
  hover: 0.2,
  panel: 0.25,
  screen: 0.4,
  question: 0.45,
  select: 0.25,
  stagger: 0.1,

  /* Dramatic — the moments the room is supposed to feel */
  lockIn: 0.65,
  reveal: 0.9,
  jackpot: 2,
};

/* ───────────────────────── SCREEN CHANGES ───────────────────────── */

/**
 * Whole-screen crossfade. Both screens are on top of each other for a beat
 * (see .screenlayer), so one dissolves into the next rather than blinking.
 * The scale is tiny on purpose: it reads as depth, not as a zoom.
 */
export const screenLayer = {
  initial: { opacity: 0, scale: 1.015 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: T.screen, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    transition: { duration: T.panel, ease: EASE.in },
  },
};

/**
 * The pair-result screen. `jackpot` earns the long version — this is the
 * £1,000,000 moment and the only place in the app that takes two seconds.
 */
export function resultLayer(jackpot) {
  return {
    initial: { opacity: 0, scale: jackpot ? 0.94 : 0.985 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: jackpot ? T.jackpot : T.screen,
        ease: EASE.out,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.99,
      transition: { duration: T.panel, ease: EASE.in },
    },
  };
}

/** The winnings figure on the result screen: lifts and settles under the name. */
export function resultMoney(jackpot) {
  return {
    initial: { opacity: 0, y: 18, scale: jackpot ? 0.9 : 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: jackpot ? T.jackpot * 0.8 : T.reveal * 0.6,
        delay: jackpot ? 0.35 : 0.1,
        ease: EASE.out,
      },
    },
  };
}

/* ──────────────────────── THE QUESTION CARD ─────────────────────── */

/** Fade up on arrival, fade down on the way out. Keyed on the question index. */
export const questionCard = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: T.question, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: T.panel, ease: EASE.in },
  },
};

/* ───────────────────────────── ANSWERS ──────────────────────────── */

/**
 * A, B, C, D arriving one after another, and every state an answer can be in
 * afterwards — all from one object, so entrance and feedback can never fight
 * each other for control of the same element.
 *
 * The delay is per-answer rather than a parent stagger for exactly that
 * reason: `animate` stays a plain target this component owns outright.
 *
 * @param state  'idle' | 'selected' | 'locked' | 'correct' | 'wrong' | 'removed'
 * @param index  0-3, its place in the run of four
 * @param final  true on the last question, where a correct answer is the win
 */
export function answerMotion(state, index, final = false) {
  const entrance = { opacity: 1, y: 0 };

  const feedback = {
    /* Final answer: one deliberate swell. The room should feel it land. */
    locked: {
      scale: [1, 1.035, 1],
      transition: { duration: T.lockIn, ease: EASE.inOut },
    },
    /* Right: a slower swell, longer still if this is for the top prize. */
    correct: {
      scale: [1, 1.045, 1],
      transition: {
        duration: final ? T.jackpot * 0.75 : T.reveal,
        ease: EASE.inOut,
      },
    },
    /* Wrong: a short shake. Tasteful — it says no, it doesn't throw a fit. */
    wrong: {
      x: [0, -7, 6, -4, 2, 0],
      transition: { duration: 0.42, ease: EASE.inOut },
    },
    /* Taken by 50:50: settles back a touch as it empties out. */
    removed: {
      scale: 0.985,
      transition: { duration: T.select, ease: EASE.inOut },
    },
  }[state];

  return {
    initial: { opacity: 0, y: 14 },
    animate: { ...entrance, ...(feedback || {}) },
    transition: {
      duration: T.question * 0.8,
      delay: index * T.stagger,
      ease: EASE.out,
    },
  };
}

/* ──────────────── THE £1,000,000 PRESENTATION ──────────────── */

/**
 * The value card that introduces the last question.
 *
 * The delay is the point: the previous audio is still fading for the first
 * 700ms, so the card arrives into the silence rather than over the top of
 * the question that came before it. Then it holds, alone, while bedFinal
 * creeps in underneath — see settings.finalQuestion.
 */
export const finalIntro = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, delay: 0.7, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    scale: 1.04,
    transition: { duration: T.screen, ease: EASE.in },
  },
};

/**
 * A safety-net rung being banked. One slow pulse of light, timed to sit
 * under the safetyNet sting rather than race it.
 */
export const ladderBanked = {
  animate: {
    scale: [1, 1.04, 1],
    transition: { duration: 1.1, ease: EASE.inOut, delay: 0.35 },
  },
};

/* ──────────────────────── LISTS THAT STAGGER ────────────────────── */

/**
 * Pair cards and leaderboard rows. Parent drives, children follow — safe here
 * because these children have no state animation of their own to conflict.
 */
export const staggerList = {
  animate: {
    transition: { staggerChildren: T.stagger, delayChildren: 0.08 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: T.screen, ease: EASE.out },
  },
};

/* ─────────────────── OVERLAYS, PANELS AND MODALS ────────────────── */

/** Anything that appears over the top: the timer, the audience bars, the ask panel. */
export const modalPop = {
  initial: { opacity: 0, scale: 0.94, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: T.panel, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: T.hover, ease: EASE.in },
  },
};

/** Host-panel blocks swapping over. Deliberately the quickest thing in here. */
export const panelSwap = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: T.panel, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: EASE.in },
  },
};

/* ───────────────────────────── LIFELINES ────────────────────────── */

/** Available → spent. Fades and shrinks a touch, never disappears. */
export function lifelineState(used) {
  return {
    animate: {
      opacity: used ? 0.5 : 1,
      scale: used ? 0.96 : 1,
      transition: { duration: T.select + 0.05, ease: EASE.inOut },
    },
  };
}

/* ───────────────────────── THE MONEY LADDER ─────────────────────── */

/**
 * The gold highlight slides from the old rung to the new one instead of
 * blinking between them — one element with a shared layoutId, moved by
 * Framer's layout engine.
 */
export const ladderHighlight = {
  transition: { duration: T.screen, ease: EASE.inOut },
};

/* ─────────────────────────── THE TIMER ──────────────────────────── */

/**
 * The bar drains continuously between ticks rather than stepping once a
 * second. Linear because a countdown that eases is a countdown that lies.
 * scaleX, not width, so it never triggers layout.
 */
export const timerFill = {
  transition: { duration: 1, ease: 'linear' },
};

/** Audience bars growing out of the floor as they appear. */
export function audienceBar(percent, index) {
  return {
    initial: { height: 0 },
    animate: { height: `${percent}%` },
    transition: {
      duration: T.reveal,
      delay: 0.12 + index * 0.08,
      ease: EASE.out,
    },
  };
}
