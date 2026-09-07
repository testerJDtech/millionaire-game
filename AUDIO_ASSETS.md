# Audio assets

Every sound file that ships in `public/audio` **must** have a row in the
[register](#the-register) below, filled in from the licence you accepted when
you downloaded it. If you can't fill in the licence column, don't ship the
file — the game runs perfectly with that slot empty.

**Nothing is bundled with this project.** No audio ships in the repository, by
design: see [Why the folders are empty](#why-the-folders-are-empty).

> **Never use the real show's music.** Beyond the copyright problem — and it is
> a real one, the theme and stings are actively licensed and enforced — a venue
> playing it to a paying room may need its own permission. Everything below is
> about finding sounds that do the same *job*, not sounds that imitate it.

---

## Why the folders are empty

I looked for assets to ship with this. I could reach Mixkit's catalogue and
verify that specific items exist (the shortlists below are real, checked
against their live pages), but their licence text is rendered by JavaScript and
isn't in the page source, so **I could not read the actual terms** — not
whether attribution is required, not whether public-event use is covered, not
what redistribution inside a project repository counts as.

Downloading twenty files on that basis and writing "licence: fine" in a table
would have been a guess dressed up as a record. So the folders are empty and
the shortlists below are candidates for you to audition and licence yourself.

One other thing worth saying plainly: I can't hear. The recommendations below
come from titles, durations, and what each slot needs — they're a informed
starting point for your ears, not a substitute for them.

---

## How to fill the folders

1. **Pick a library.** Suggested ones are [below](#where-to-look).
2. **Download through the site's normal flow**, not a direct file link — that
   flow is where the licence is presented and accepted.
3. **Read the licence.** You need: commercial/public-event use permitted, and
   whether attribution is required. If either is unclear, pick something else.
4. **Rename to the filename in the table** and drop it in `public/audio/music`
   or `public/audio/sfx`.
5. **Fill in the row** in the register below.
6. **Check it.** Host panel → Sound → **Test audio** → **Check files** lists
   anything missing, then play each slot through the venue's speakers.

You don't have to do all twenty. Start with `bedEasy`, `lockIn`, `correct`,
`wrong` and `win` — that's most of the feel for five files.

### Format notes

- **MP3** everywhere. Smallest, and every browser plays it.
- **Beds must loop.** MP3 adds a few milliseconds of silence at the start and
  end of every file, so a bed will click on each repeat unless the file was
  authored as a seamless loop. Look for "loop" in the title, or trim the
  silence in Audacity. Ambience and drones hide the seam best; music with a
  strong downbeat exposes it worst.
- **Beds want to be 30s+.** Shorter loops start to sound like a stuck record
  by the third repeat.
- **Keep stings short** — 1 to 3 seconds. A long sting delays the host.
- **Normalise, don't maximise.** Levels are balanced in the manifest; wildly
  different source loudnesses make that fight you.

---

## The slots

Twenty of them, defined in [`src/data/audioManifest.js`](src/data/audioManifest.js).
That file is the only place filenames appear — change a path there and the
whole game follows.

### Music — `public/audio/music/`

| Slot | Filename | What it's for | Length |
|---|---|---|---|
| `intro` | `intro.mp3` | Big cinematic opening as the title card comes up | 8–15s |
| `bedEasy` | `bed-easy.mp3` | Q1–3. Light, confident, moving | 30s+ loop |
| `bedMedium` | `bed-medium.mp3` | Q4–6. Focused; a pulse arrives | 30s+ loop |
| `bedHard` | `bed-hard.mp3` | Q7–8. Serious, low, weighty | 30s+ loop |
| `bedFinal` | `bed-final.mp3` | Q9–10. Sparse and very tense | 30s+ loop |
| `win` | `win.mp3` | The top prize. The biggest thing in the show | 10–30s |
| `leaderboard` | `leaderboard.mp3` | Final standings, loops under the room | 30s+ loop |

### Sound effects — `public/audio/sfx/`

| Slot | Filename | What it's for | Length |
|---|---|---|---|
| `teamTakesSeat` | `team-takes-seat.mp3` | A pair takes the chair | 2–5s |
| `questionStart` | `question-start.mp3` | A new question comes up | 1–2s |
| `lockIn` | `lock-in.mp3` | Final answer | 1–3s |
| `correct` | `correct.mp3` | Right answer | 1–2s |
| `wrong` | `wrong.mp3` | Wrong answer | 1–3s |
| `safetyNet` | `safety-net.mp3` | Banking Q4 or Q8 | 2–4s |
| `fiftyFifty` | `fifty-fifty.mp3` | Two answers vanish | 1–2s |
| `phoneRing` | `phone-ring.mp3` | Placing the call | 2–4s |
| `phoneWarning` | `phone-warning.mp3` | Five seconds left | 1–2s |
| `phoneTimeUp` | `phone-time-up.mp3` | Out of time | 1–2s |
| `askAudience` | `ask-audience.mp3` | The vote opens | 2–4s |
| `audienceResults` | `audience-results.mp3` | The bars go up | ~1.2s |
| `walkAway` | `walk-away.mp3` | Taking the money | 2–4s |

---

## What to search for

Search terms first — they work in any library. Then, where I found real
candidates, the specific items.

The Mixkit candidates below **were checked against their live catalogue** —
the titles and durations are real, and each is on the linked page. What I
could *not* check is the licence. Read it at download.

### `intro` — the opening
> **Search:** `game show intro` · `tv quiz opening` · `cinematic logo sting`
> `orchestral fanfare opening` · `broadcast title music`

Wants: brass or synth brass, a build, a definite landing. This is the sound of
the room turning to face the front.

*Mixkit candidates* ([game-show](https://mixkit.co/free-sound-effects/game-show/),
[win](https://mixkit.co/free-sound-effects/win/)):
- **Game show intro** (0:36) — the closest thing to the job, but long; the game
  fades it out once a pair sits down, or trim it to 12s.
- **Medieval show fanfare announcement** (0:08) — right length and shape;
  audition it, the name may or may not reflect how it reads in a function room.

### `teamTakesSeat` — the entrance
> **Search:** `dramatic entrance stinger` · `contestant reveal` ·
> `epic orchestral transition short` · `spotlight sting`

*Mixkit candidates* ([transition](https://mixkit.co/free-sound-effects/transition/)):
- **Epic orchestra transition** (0:07)
- **Magic transition sweep presentation** (0:03)

### `questionStart` — the turn
> **Search:** `subtle whoosh transition` · `short suspense sweep` ·
> `ui transition swoosh`

Wants: quiet. It happens ten times per pair — anything characterful becomes
irritating by Q4.

*Mixkit candidates* (transition):
- **Short transition sweep** (0:01) · **Fast small sweep transition** (0:01)

### `bedEasy` / `bedMedium` / `bedHard` / `bedFinal` — the tension ladder
> **Search (easy):** `light suspense loop` · `quiz show background music` ·
> `playful tension loop`
> **Search (medium):** `suspense pulse loop` · `ticking tension underscore`
> **Search (hard):** `dark suspense loop` · `low strings tension` ·
> `dramatic underscore serious`
> **Search (final):** `tense drone` · `heartbeat suspense` ·
> `minimal dark ambience` · `sparse cinematic tension`

The set matters more than any one of them: they should sound like the same
room getting darker, not four different pieces of music. Easiest way to get
that is four tracks by one composer, or one track in four arrangements.

`bedFinal` has one hard requirement: **the host has to talk over it.** No
melody, no rhythm competing with speech. A drone and a pulse is plenty.

*Mixkit candidates* ([game-show](https://mixkit.co/free-sound-effects/game-show/),
[suspense](https://mixkit.co/free-sound-effects/suspense/)):
- easy — **Game show fun suspense** (0:44) or **Game show happy timer** (0:40)
- medium — **Game show suspense timer** (0:54) or **Game show suspense waiting** (0:41)
- hard — **Suspense mystery bass** (1:05) or **Cinematic deep drums suspense swell** (0:31)
- final — **Dark cinematic room tone** (1:15) or **Tactical drone ambience** (0:54)

### `lockIn` — final answer
> **Search:** `cinematic impact hit` · `braam` · `riser impact` · `trailer hit`

Wants weight, not volume. A short riser into a hit reads as "decision made".

*Mixkit candidates* (transition): **Movie trailer epic impact** (0:04) ·
**Cool impact movie trailer** (0:06) · **Apocalyptic stomp impact** (0:02)

### `correct` — right answer
> **Search:** `correct answer sting` · `positive game show chime` ·
> `success fanfare short`

*Mixkit candidates* (game-show): **Correct answer reward** (0:02) ·
**Correct positive answer** (0:01) · **Musical reveal** (0:02)

### `wrong` — wrong answer
> **Search:** `dramatic fail sting` · `negative answer low` ·
> `cinematic downer hit`

Wants: serious. **Avoid the comedy buzzer** — someone's evening just ended in
front of a room, and a slide-whistle failure sound makes that worse.

*Mixkit candidates* (game-show): **Negative answer lose** (0:03) ·
**Musical game over** (0:02) · **Ominous drums** (0:04)

### `safetyNet` — banking Q4 or Q8
> **Search:** `achievement unlocked sting` · `milestone fanfare` ·
> `reward chime big` · `payout win`

Must be **audibly bigger than `correct`** — they play 900ms apart, so the pair
is heard back to back. If they're the same size the moment doesn't land.

*Mixkit candidates* ([win](https://mixkit.co/free-sound-effects/win/)):
**Payout award** (0:04) · **Magic sweep game trophy** (0:03) ·
**Achievement bell** (0:02)

### `fiftyFifty`
> **Search:** `digital sweep` · `glitch transition short` ·
> `data delete sound` · `sci fi swipe`

*Mixkit candidates* (transition): **Fast sci fi transition sweep** (0:01) ·
**Technology transition slide** (0:01) · **Quick metal transition sweep** (0:01)

### `phoneRing` / `phoneWarning` / `phoneTimeUp`
> **Search:** `office phone ring` · `phone dial connect` ·
> `urgent beep countdown` · `timer expired buzzer` · `dramatic time up hit`

Keep the ring clean and modern — novelty ringtones puncture the tension you've
spent four questions building.

*Mixkit candidates* ([phone](https://mixkit.co/free-sound-effects/phone/),
[countdown](https://mixkit.co/free-sound-effects/countdown/), transition):
- ring — **Office telephone ring** (0:01) · **Old telephone ring** (0:08)
- warning — **Sport start bleeps** (0:03) · **Clock countdown bleeps** (0:05)
- time up — **Apocalyptic stomp impact** (0:02) · **Musical game over** (0:02)

### `askAudience` / `audienceResults`
> **Search:** `voting transition` · `news broadcast transition` ·
> `poll results reveal` · `rising sweep reveal`

`audienceResults` should **land as the bars finish growing**, about 1.2s after
it starts — a rise that arrives, not a hit.

*Mixkit candidates* (transition, game-show):
**Television news report transition** (0:07) · **Musical reveal** (0:02) ·
**Tile game reveal** (0:02)

### `walkAway`
> **Search:** `warm positive sting` · `gentle success chime` ·
> `soft achievement`

Taking the money is a **good** outcome. Warm, not triumphant, and definitely
not sad.

*Mixkit candidates* (win): **Winning chimes** (0:02) · **Achievement bell** (0:02)

### `win` — £1,000,000
> **Search:** `epic victory orchestral` · `triumphant fanfare cinematic` ·
> `grand celebration music` · `jackpot win big`

The biggest thing in the show, by a distance. It should be uncomfortable how
much bigger it is than `correct`. If someone actually wins, this is the moment
they'll remember.

*Mixkit candidates* (game-show, win): **Game show uplifting** (0:34) ·
**Slot machine payout alarm** (0:10) · **Medieval show fanfare announcement** (0:08)

### `leaderboard`
> **Search:** `end credits upbeat loop` · `celebration background music` ·
> `awards ceremony bed`

Loops under people talking and collecting prizes, so: pleasant, low, no
dramatic swells.

*Mixkit candidates* (game-show, [crowd](https://mixkit.co/free-sound-effects/crowd/)):
**Game show happy timer** (0:40) · **Ending show audience clapping** (0:24)

---

## Where to look

| Library | Licence in short | Watch for |
|---|---|---|
| [Pixabay](https://pixabay.com/sound-effects/) | Pixabay Content Licence — free for commercial use, no attribution | Read the current licence; the terms were revised in 2024 |
| [Mixkit](https://mixkit.co/free-sound-effects/) | Mixkit Free Licence | Terms are shown at download — read them there; separate licences for music and SFX |
| [Freesound](https://freesound.org/) | **Per file** — CC0, CC-BY or CC-BY-NC | Filter to CC0 to avoid attribution; **CC-BY-NC is not usable at a ticketed event** |
| [Uppbeat](https://uppbeat.io/) | Free tier requires attribution and a credit | Check whether their credit requirement works for a live event |
| [Zapsplat](https://www.zapsplat.com/) | Free tier requires attribution | Same |
| [YouTube Audio Library](https://studio.youtube.com/) | Mixed; filter to no-attribution | Nominally for YouTube — check before using at an event |

**The one that catches people out:** CC-BY-NC (non-commercial) is fine for a
free staff quiz and *not* fine if tickets are sold or it's a company event
promoting a business. If money changes hands anywhere near the room, you need
CC0, CC-BY or an explicit commercial licence.

**Attribution:** if any file requires it, put the credit on the final
leaderboard slide or in the printed programme, and record it in the register.

---

## The register

Fill in one row per file you add. This is the record that says you checked.

| Filename | Slot | Source | Creator | Licence | Attribution required? | Source URL | Public/commercial use OK? |
|---|---|---|---|---|---|---|---|
| _(none yet)_ | | | | | | | |

<!--
Example of a completed row:

| bed-easy.mp3 | bedEasy | Pixabay | J. Bloggs | Pixabay Content Licence | No | https://pixabay.com/sound-effects/xxxx/ | Yes — commercial use permitted |

Keep the wording of the licence exactly as the library states it. "Free" is
not a licence name.
-->

---

## Checking your work

Before the event:

1. Host panel → **Sound** → **Test audio** → **Check files**. Anything listed
   as missing will simply play nothing.
2. Play every slot **through the venue's speakers**, at the volume you'll
   actually use. Laptop speakers hide everything that matters.
3. Listen for the handover between **Q3 and Q4**, and again at **Q8 to Q9** —
   the crossfade is where a mismatched set of beds gives itself away.
4. Check `bedFinal` with someone **talking over it**. If you have to raise
   your voice, it's too busy or too loud.
5. Run `correct` straight into `safetyNet` (test both, back to back) and
   confirm the second one is clearly the bigger moment.
6. Set the three sliders where you want them. They're remembered, including
   across a game reset.
