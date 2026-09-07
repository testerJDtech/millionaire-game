AUDIO — put your sound files here
=================================

Nothing ships in this folder. See AUDIO_ASSETS.md in the project root for
where to find sounds you are allowed to use, exact search terms for each
one, and the register you fill in as you add them.

The game runs perfectly in silence. Every slot is optional and independent:
add five files, add twenty, add none.

  music/
    intro.mp3          big cinematic opening, over the title card
    bed-easy.mp3       Q1-3   light, confident        (loops)
    bed-medium.mp3     Q4-6   focused                 (loops)
    bed-hard.mp3       Q7-8   serious                 (loops)
    bed-final.mp3      Q9-10  sparse and very tense   (loops)
    win.mp3            the top prize
    leaderboard.mp3    final standings                (loops)

  sfx/
    team-takes-seat.mp3   a pair takes the chair
    question-start.mp3    a new question comes up
    lock-in.mp3           final answer
    correct.mp3           right answer
    wrong.mp3             wrong answer
    safety-net.mp3        banking Q4 or Q8
    fifty-fifty.mp3       two answers vanish
    phone-ring.mp3        placing the call
    phone-warning.mp3     five seconds left
    phone-time-up.mp3     out of time
    ask-audience.mp3      the vote opens
    audience-results.mp3  the bars go up
    walk-away.mp3         taking the money

Different names, or a .wav instead? Every path above is one line in
src/data/audioManifest.js. That file is the only place filenames appear.

THE FOUR BEDS ARE THE IMPORTANT ONES
  They carry the tension of the whole show. They should sound like the same
  room getting darker, not four different pieces of music — four tracks by
  one composer, or one track in four arrangements.

  They must loop cleanly. MP3 puts a few milliseconds of silence at the start
  and end of every file, so a bed clicks on each repeat unless it was made as
  a seamless loop. Drones and ambience hide that; anything with a strong beat
  exposes it.

  bed-final.mp3 has one hard rule: the host has to be able to talk over it.

CHECK IT BEFORE THE NIGHT
  Host panel -> Sound -> Test audio. Every slot is a button, plus Stop all,
  Fade out, and Check files (which tells you what's missing). Do it through
  the venue's speakers, not the laptop's.

DO NOT USE THE REAL SHOW'S MUSIC
  It is actively licensed and enforced, and a venue playing it to a paying
  room may need its own permission. Find sounds that do the same job instead.
