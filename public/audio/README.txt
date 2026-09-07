AUDIO — drop your own files in this folder
==========================================

The game runs perfectly in silence. There are no sound files here, because
none can be shipped for you: TV-show music is copyrighted, and bundling it
would make the project not legally usable. Everything below is optional.

Use these exact filenames and the game picks them up with no code changes:

  intro.mp3          plays when you press Start game
  question-bed.mp3   loops quietly under each question (should be seamless)
  lock-in.mp3        plays on Lock in, and as the 5-second timer warning
  correct.mp3        right answer
  wrong.mp3          wrong answer, and when the phone timer hits zero
  win.mp3            top prize, and the final leaderboard

Different names? Edit the `audio.files` block in src/data/settings.js.

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
  - Test the levels through the actual venue speakers before the room fills.
  - The question bed plays at 35% of master volume (settings.audio.bedVolume).
  - A missing file is ignored silently. It will never interrupt the game.
