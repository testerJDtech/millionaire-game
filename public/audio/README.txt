AUDIO — drop your own files in this folder
==========================================

The game runs perfectly in silence. There are no sound files here, because
none can be shipped for you: TV-show music is copyrighted, and bundling it
would make the project not legally usable. Everything below is optional.

Use these exact filenames and the game picks them up with no code changes.
Every one of them is independent — add three, add all of them, add none.


THE SIX ESSENTIALS (start here)
-------------------------------
  intro.mp3            "Start show" pressed
  question-bed.mp3     loops under each question (should be seamless)
  lock-in.mp3          "Lock in" — final answer
  correct.mp3          right answer revealed
  wrong.mp3            wrong answer revealed
  win.mp3              top prize taken


THE REST (this is what makes it feel like the show)
---------------------------------------------------
  team-seat.mp3        a pair is put in the chair
  question-start.mp3   a new question comes up on screen
  safety-net.mp3       a right answer that banks a safety net (Q4 and Q8)
  fifty-fifty.mp3      50:50 used, two answers vanish
  phone-ring.mp3       Phone a Friend — the call is placed
  phone-warning.mp3    the 5-second warning (settings.phoneWarningAtSeconds)
  phone-timeup.mp3     the phone timer hits zero
  ask-audience.mp3     the audience vote opens
  audience-results.mp3 the bars go up on the projector
  walk-away.mp3        a pair walks away with the money
  leaderboard.mp3      the final leaderboard is shown

Leave any of these out and the game falls back sensibly: safety-net borrows
correct.mp3, phone-warning borrows lock-in.mp3, phone-timeup borrows
wrong.mp3, and walk-away and leaderboard borrow win.mp3. So the six
essentials on their own already sound exactly as they always did.


A DIFFERENT BED PER QUESTION (optional, very effective)
-------------------------------------------------------
The show tightens the music as the money climbs. To do the same, add
bed-q1.mp3 … bed-q10.mp3 and uncomment the `bedByQuestion` block in
src/data/settings.js. A short list is fine — the last entry covers every
question after it (e.g. four files = a new bed at Q1, Q2, Q3, then Q4-Q10).

Different names? Every slot above is a line in the `audio.files` block in
src/data/settings.js, each one commented with exactly what triggers it.


WHERE TO GET SOUNDS YOU CAN ACTUALLY USE
  - freesound.org (check each licence; many are CC0)
  - incompetech.com (Kevin MacLeod, Creative Commons with attribution)
  - pixabay.com/sound-effects (Pixabay licence)
  - YouTube Audio Library (filter to no-attribution tracks)

Do not use the real TV show's music or logo. Beyond the licence problem,
a venue playing it publicly may need its own permission.

A FEW PRACTICAL NOTES
  - MP3 or WAV. MP3 is smaller and every browser plays it.
  - Keep the stings short (1-3 seconds). Long ones make hosting feel slow.
  - Beds should loop cleanly and sit low — they play under a talking host.
  - Test the levels through the actual venue speakers before the room fills.
  - The question bed plays at 35% of master volume (settings.audio.bedVolume).
  - A missing file is ignored silently. It will never interrupt the game.
