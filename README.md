# Who Wants To Be A Millionaire? — quiz night game

A host-controlled quiz show for one laptop and a projector. React + Vite,
no backend, no database, no internet needed once installed.

Original branding throughout: no TV-show logo, artwork, font or music is used
or bundled anywhere in this project.

---

## Quick start

```bash
# Requires Node.js 20 or newer
npm install
npm run dev
```

A browser opens on the launcher. It gives you two links:

| Window | Open on | Shows |
|---|---|---|
| **Host controls** (`#/host`) | your laptop screen | the answer key, every control, shortcuts |
| **Projector screen** (`#/play`) | the projector | the show — never the answer key |

Before the event, check the production build too:

```bash
npm run build
npm run preview
```

> **Please run `npm run build` yourself before the event.** The project was
> written in an environment with no network access, so `npm install` and the
> Vite build could not be executed there. Every non-React file was executed
> and tested (see *What was verified* below), but the build itself is
> unverified until you run it.

---

## Editing the quiz

Everything lives in **`src/data/questions.js`**. Nothing is hard-coded into
components. One question looks like this:

```js
{
  id: 'p1-q1',            // unique across the whole file
  value: 100,             // must match the prize ladder position
  question: 'What is the capital city of France?',
  answers: { A: 'Madrid', B: 'Paris', C: 'Rome', D: 'Berlin' },
  correctAnswer: 'B'      // 'A' | 'B' | 'C' | 'D'
}
```

**Paste your own questions over the four `questions: [...]` arrays** in the
`teams` export. Keep ten per pair, in ladder order (£100 first).

The app checks the data every time it loads and lists any problem in red at
the top of the host panel — a missing answer, a duplicate id, a value that
doesn't match the ladder, the wrong number of questions. Fix a typo during
setup, not mid-show.

### The six groups

Your quiz sheet had six groups; the event is set up for four pairs.
Groups 1–4 are live in `teams`. Groups 5–6 are in the `sparePairs` export at
the bottom of the same file, ready to swap in — cut one out, paste it into
`teams`, and set `expectedTeamCount` in `settings.js` to match.

To run all six pairs, move both into `teams` and set `expectedTeamCount: 6`.
Everything else (ladder, leaderboard, team select) reads the array length,
so nothing else needs changing.

## Changing the rules

**`src/data/settings.js`** holds the prize ladder, safety nets, timer length,
audio filenames and the show title.

```js
prizeLadder: [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000],
safetyNets: { enabled: true, levels: [4, 8] },
```

The ladder's length defines how many questions each pair plays, so shortening
it to five values gives you a five-question game with no other edits. Change a
value and every question's `value` in `questions.js` must be changed to match —
the host panel lists any mismatch on startup.

**Safety nets**: pass question 4 and a later wrong answer still banks £5,000;
pass question 8 and it banks £100,000. Set `enabled: false` for wrong
answer = £0, or add levels for a gentler game.

## Sound

Optional. With no files there the game runs identically, in silence — a missing
file is ignored and never interrupts anything.

Every moment in the game has its own sound slot: the pair taking the chair, a
question coming up, lock-in, right, wrong, a banked safety net, each of the
three lifelines, walking away, the top prize, the leaderboard. They are listed
with their triggers in `settings.audio.files` (`src/data/settings.js`), and by
filename in `public/audio/README.txt` — drop a file in and it plays, no code
change. Six core files are enough to start; the rest borrow from those until
you add them.

For the real thing, `settings.audio.bedByQuestion` takes one looping bed per
question, so the music tightens as the money climbs.

Sound comes out of the **host window** by default. That's deliberate: the host
window has definitely been clicked, so browsers will never block playback.
Audio output still goes wherever your laptop's output is set, HDMI included.
Both windows have a sound toggle if you'd rather it came from the projector.

---

## Event-day runbook

1. **Set up displays.** *Extend* the display, don't mirror it.
2. `npm run dev` (or `npm run preview`) on the laptop. Local only — never
   depend on venue Wi-Fi.
3. Open the host window, keep it on the laptop screen.
4. Press **Open projector window**, drag it to the projector, click it once,
   press **Fullscreen** (or Shift+F in that window).
5. Type the four pair names into the host panel. They appear on the projector.
6. Test one full question end to end: select, lock in, reveal, next. Test each
   lifeline. Check the sound level through the venue speakers.
7. Turn off system notifications and system sounds.
8. **Backups:** the project folder on a USB stick, and a printed question sheet.

### Running a pair

1. Put a pair in the chair from the host panel.
2. Read the question. The room sees it; the answer key is only on your screen.
3. Press **1/2/3/4** (or click) for their answer → it lights amber on both screens.
4. **Enter** to lock in. **R** to reveal. **N** to move on.
5. Wrong answer or the top prize ends their run and records the winnings.
6. **Next pair** takes you back to team select.
7. After the fourth pair, **Show the leaderboard**.

### Keyboard shortcuts (host window)

| Key | Action |
|---|---|
| `1` `2` `3` `4` or `A` `B` `C` `D` | select that answer |
| `Enter` | lock in / final answer |
| `R` | reveal result |
| `N` | next question |
| `F` | 50:50 |
| `P` | phone-a-friend timer |
| `U` | ask the audience |
| `M` | mute / unmute |
| `Shift+F` | fullscreen the projector |

Shortcuts are ignored while you're typing in a text box.

The phone timer clears itself: it shows "Time up" for a moment
(`phoneTimerHideAfterSeconds`), then comes off both screens, and it also goes
the instant an answer is locked in. **Clear timer** on the host panel takes it
down early; **Reset timer** puts it back for another go on the same question.

### If something goes wrong

| Problem | Fix |
|---|---|
| Projector window is blank or stale | Refresh it. It asks the host for the current state on load. |
| Wrong answer clicked | **Previous question** re-asks it and un-awards the prize. |
| A question is bad or already known | **Skip question** — moves on without awarding it. |
| Browser refreshed / laptop slept | Nothing is lost. State is saved after every action. |
| Host asked for fullscreen and nothing happened | Click the projector window once, then Shift+F. |
| Need to redo a whole pair | **Reset [pair]** in the host panel. |
| Total disaster | **Reset entire game** (keeps the team names). |

Every destructive control asks you to confirm first.

---

## How it fits together

```
src/
├── data/
│   ├── questions.js     ← the quiz. The only file you need to edit.
│   └── settings.js      ← ladder, safety nets, audio, timings.
├── hooks/useGameState.js  ← the whole game state + every action.
├── utils/
│   ├── gameEngine.js    ← the rules, as pure functions. No React.
│   ├── validation.js    ← startup checks on the question data.
│   ├── syncChannel.js   ← keeps the two windows in step.
│   └── audio.js         ← sound engine, driven by cues in state.
└── components/          ← the screens.
```

**One writer.** The host window owns the state. Every action creates a new
state object, saves it to `localStorage`, and broadcasts it. The projector
window only ever reads. There is no two-way merge that can go wrong mid-show.

**Winnings are derived, not stored.** Money is always worked out from
`correctCount` plus the ladder, so *previous question*, *skip* and a refresh
can't leave the prize out of step with the game.

**Nothing turns green early.** Answer appearance is decided by one function,
`answerState()`, which can only return `'correct'` once the host has moved the
phase to `revealed`.

**50:50 is repeatable, not random.** The two answers it removes come from a
hash of the question's id, so the host screen, the projector, and the page
after a refresh all agree.

### Deliberate choices worth knowing

- **Hash routes** (`#/host`) rather than paths, so the app works under
  `npm run dev`, `npm run preview`, a static host and a subfolder with no
  server configuration.
- **Resume is automatic.** The saved game is restored on load rather than
  hidden behind a button, which is what you want when a laptop wakes up
  mid-show. There's also an explicit **Resume game** button that jumps you
  back to the live board from anywhere.
- **No `StrictMode`.** In development it runs effects twice, which would
  double-fire the timer tick. A show should behave in dev exactly as it does
  in the build.
- **No web fonts.** Google Fonts would need internet. The type stack is
  cross-platform; add an `@font-face` and a file in `public/fonts` if you want
  something custom.
- **"Start game" is on the host panel**, not the projector — contestants never
  touch the laptop. The projector shows a title card until you start.
- **End pair = walk away**, banking whatever they've already won.

### What was verified

`gameEngine.js`, `validation.js` and the question data were executed directly
and pass 40 checks, including: all 60 questions validate; 50:50 never removes
the correct answer on any question and returns the same pair twice; safety-net
maths at every rung and with nets disabled; the answer-state function refusing
to return `correct` before reveal; percentage normalisation always totalling
exactly 100; and leaderboard ties sharing a rank. The React components were
reviewed by hand and checked for balanced syntax, resolvable imports and
matching CSS classes — but **not** compiled. Run `npm run build` once before
the event.

---

## Optional: deploy online

Only after the local version works. `npm run build`, then drop `dist/` onto
Vercel or Netlify. Useful for rehearsing from home; not something to depend on
during the show. `base: './'` in `vite.config.js` means it works from a
subfolder too.

## Version 2 ideas (not built)

Real audience voting from phones, using Supabase or Firebase for live updates —
the audience view would show genuine incoming votes instead of numbers you type
in. It needs a backend and internet on the night, so it was deliberately left
out. Say the word if you want it.

## Acceptance checklist

Walk this before the event:

- [ ] Four pairs can each complete ten questions
- [ ] The correct answer never appears on the projector before reveal
- [ ] All three lifelines work, once per pair
- [ ] Refresh restores the game exactly
- [ ] Host and projector stay in sync
- [ ] The leaderboard ranks winnings correctly
- [ ] Keyboard shortcuts work
- [ ] Mute works
- [ ] `npm run build` completes with no errors
- [ ] Readable at 1920×1080 with no scrollbars, and on the laptop screen
