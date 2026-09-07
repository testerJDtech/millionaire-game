/**
 * GAME ENGINE — the rules of the game as plain functions.
 *
 * Nothing in this file touches React, the browser or the screen. That means
 * every rule can be reasoned about (and tested) on its own, and the UI can
 * never accidentally invent a different rule.
 *
 * KEY IDEA: winnings are never stored. They are always worked out from
 * `correctCount` and the prize ladder. That way "previous question", "skip"
 * and a mid-show refresh can't leave the money out of step with the game.
 */

import { settings as defaultSettings } from '../data/settings.js';

export const LETTERS = ['A', 'B', 'C', 'D'];

/* ────────────────────────────── MONEY ────────────────────────────── */

/** Format a number as money, e.g. 16000 → "£16,000". */
export function formatMoney(amount, settings = defaultSettings) {
  const safe = Number.isFinite(amount) ? amount : 0;
  return settings.currency + safe.toLocaleString('en-GB');
}

/** The prize for a question, by 0-based index. */
export function prizeAt(index, settings = defaultSettings) {
  return settings.prizeLadder[index] ?? 0;
}

/** How many questions each pair plays (driven by the length of the ladder). */
export function questionCount(settings = defaultSettings) {
  return settings.prizeLadder.length;
}

/**
 * Money currently "in hand" — the prize for the last question answered
 * correctly. 0 correct answers means nothing banked yet.
 */
export function currentWinnings(correctCount, settings = defaultSettings) {
  if (correctCount <= 0) return 0;
  return prizeAt(Math.min(correctCount, questionCount(settings)) - 1, settings);
}

/**
 * Money a pair keeps if they get a question WRONG.
 * Finds the highest safety net they have already passed.
 */
export function safetyNetWinnings(correctCount, settings = defaultSettings) {
  const net = settings.safetyNets;
  if (!net || !net.enabled) return 0;

  const passed = net.levels.filter((level) => correctCount >= level);
  if (passed.length === 0) return 0;

  const highest = Math.max(...passed);
  return prizeAt(highest - 1, settings);
}

/** True if this 0-based question index is a safety-net level. */
export function isSafetyNet(index, settings = defaultSettings) {
  const net = settings.safetyNets;
  if (!net || !net.enabled) return false;
  return net.levels.includes(index + 1);
}

/* ─────────────────────────── LIFELINE: 50:50 ─────────────────────────── */

/**
 * Turn any string into a stable number. Same string in, same number out —
 * every time, in every browser. Used so 50:50 is repeatable.
 */
function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Work out which two wrong answers 50:50 removes.
 * The correct answer can never be removed. The result is derived from the
 * question's id, so it is identical on the host screen, the projector, and
 * after a refresh — no randomness to lose.
 *
 * Returns an array of two letters, e.g. ['A', 'D'].
 */
export function fiftyFiftyRemovals(question) {
  const wrong = LETTERS.filter((letter) => letter !== question.correctAnswer);
  // Keep one wrong answer on screen; remove the other two.
  const keepIndex = hashString(question.id) % wrong.length;
  return wrong.filter((_, index) => index !== keepIndex);
}

/* ────────────────────────── ANSWER DISPLAY STATE ────────────────────────── */

/**
 * Decide how one answer capsule should look.
 * `phase` is 'asking' | 'locked' | 'revealed'.
 * `revealKey` is only passed in once the host has revealed — this is what
 * keeps the answer key off the projector until the right moment.
 */
export function answerState({ letter, selected, phase, removed, correctAnswer }) {
  if (removed.includes(letter)) return 'removed';

  if (phase === 'revealed') {
    if (letter === correctAnswer) return 'correct';
    if (letter === selected) return 'wrong';
    return 'idle';
  }

  if (letter === selected) return phase === 'locked' ? 'locked' : 'selected';
  return 'idle';
}

/* ──────────────────────────── INITIAL STATE ──────────────────────────── */

/** A fresh lifeline set. Lifelines reset for every pair. */
export function freshLifelines() {
  return {
    fifty: { used: false, removed: [], atIndex: null },
    // `hidden` takes the countdown off both screens once the call is over,
    // without un-spending the lifeline.
    phone: {
      used: false,
      atIndex: null,
      running: false,
      secondsLeft: null,
      finished: false,
      hidden: false,
    },
    audience: {
      used: false,
      atIndex: null,
      open: false,
      revealed: false,
      percents: { A: '', B: '', C: '', D: '' },
    },
  };
}

/** A fresh run for one pair (their turn at the game). */
export function freshRun(teamId) {
  return {
    teamId,
    index: 0, // 0-based question showing on screen
    correctCount: 0, // questions answered correctly (drives the money)
    selected: null, // 'A' | 'B' | 'C' | 'D' | null
    phase: 'asking', // 'asking' → 'locked' → 'revealed'
    outcome: null, // 'correct' | 'wrong' | null (set on reveal)
    lifelines: freshLifelines(),
  };
}

/** The whole game, at the very start. */
export function createInitialState(teams, settings = defaultSettings) {
  const names = {};
  teams.forEach((team) => {
    names[team.id] = team.name;
  });

  return {
    version: 1,
    screen: 'start', // 'start' | 'teams' | 'game' | 'result' | 'leaderboard'
    teamNames: names,
    results: {}, // { [teamId]: { winnings, reason, correctCount } }
    run: null, // the pair currently playing
    lastResult: null, // what the result screen shows
    audio: {
      muted: false,
      volume: settings.audio.masterVolume,
      bedPaused: false,
    },
    cue: { name: null, id: 0 }, // sound to play; id increments so repeats fire
    fullscreenRequestId: 0, // bumped when the host asks the projector to go fullscreen
  };
}

/* ─────────────────────────── TEAM PROGRESS ─────────────────────────── */

/** 'Not started' | 'In progress' | 'Finished' for the team-select screen. */
export function teamStatus(state, teamId) {
  if (state.results[teamId]) return 'Finished';
  if (state.run && state.run.teamId === teamId) return 'In progress';
  return 'Not started';
}

/** Have all pairs recorded a result? */
export function allTeamsFinished(state, teams) {
  return teams.every((team) => Boolean(state.results[team.id]));
}

/**
 * Leaderboard, highest winnings first. Ties keep the same rank number
 * (1, 2, 2, 4) so a shared position reads correctly on screen.
 */
export function buildLeaderboard(state, teams) {
  const rows = teams.map((team) => {
    const result = state.results[team.id];
    return {
      teamId: team.id,
      name: state.teamNames[team.id] || team.name,
      winnings: result ? result.winnings : 0,
      reason: result ? result.reason : null,
      correctCount: result ? result.correctCount : 0,
      finished: Boolean(result),
    };
  });

  rows.sort((a, b) => b.winnings - a.winnings || a.name.localeCompare(b.name));

  let lastWinnings = null;
  let lastRank = 0;
  rows.forEach((row, i) => {
    if (row.winnings === lastWinnings) {
      row.rank = lastRank;
    } else {
      row.rank = i + 1;
      lastRank = row.rank;
      lastWinnings = row.winnings;
    }
  });

  return rows;
}

/* ───────────────────── ASK THE AUDIENCE HELPERS ───────────────────── */

/** Add up the four host-entered percentages. Blank counts as 0. */
export function percentTotal(percents) {
  return LETTERS.reduce((sum, letter) => sum + (Number(percents[letter]) || 0), 0);
}

/**
 * Scale the four values so they total exactly 100, then fix any rounding
 * drift on the largest value. If nothing was entered, spread evenly.
 */
export function normalisePercents(percents) {
  const total = percentTotal(percents);
  if (total <= 0) return { A: 25, B: 25, C: 25, D: 25 };

  const scaled = {};
  LETTERS.forEach((letter) => {
    scaled[letter] = Math.round(((Number(percents[letter]) || 0) / total) * 100);
  });

  // Rounding can leave us on 99 or 101 — put the difference on the biggest bar.
  const drift = 100 - percentTotal(scaled);
  if (drift !== 0) {
    const biggest = LETTERS.reduce((a, b) => (scaled[a] >= scaled[b] ? a : b));
    scaled[biggest] += drift;
  }

  return scaled;
}
