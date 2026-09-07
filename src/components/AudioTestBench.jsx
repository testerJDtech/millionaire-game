import { useState } from 'react';
import { AUDIO_SLOTS, BED_TIERS, SLOT_IDS } from '../data/audioManifest.js';

/** The order the slots are listed in, grouped the way you'd check them. */
const NAMED_GROUPS = [
  { title: 'Opening', ids: ['intro', 'teamTakesSeat', 'questionStart'] },
  { title: 'Question beds', ids: ['bedEasy', 'bedMedium', 'bedHard', 'bedFinal'] },
  { title: 'Answering', ids: ['lockIn', 'correct', 'wrong', 'safetyNet'] },
  {
    title: 'Lifelines',
    ids: [
      'fiftyFifty',
      'phoneRing',
      'phoneWarning',
      'phoneTimeUp',
      'askAudience',
      'audienceResults',
    ],
  },
  { title: 'Endings', ids: ['walkAway', 'win', 'leaderboard'] },
];

/**
 * The groups above, plus anything in the manifest they don't mention.
 * Add a slot to audioManifest.js and it turns up here on its own — a sound
 * check that quietly omits a sound is worse than no sound check.
 */
export function buildGroups(slotIds = SLOT_IDS) {
  const grouped = new Set(NAMED_GROUPS.flatMap((g) => g.ids));
  const groups = NAMED_GROUPS.map((g) => ({
    ...g,
    ids: g.ids.filter((id) => slotIds.includes(id)),
  })).filter((g) => g.ids.length > 0);

  const ungrouped = slotIds.filter((id) => !grouped.has(id));
  if (ungrouped.length > 0) groups.push({ title: 'Other', ids: ungrouped });
  return groups;
}

/**
 * TEST AUDIO — the sound check.
 *
 * Every slot in the manifest, on a button, so the whole set can be run
 * through the venue's speakers before anyone is in the room. Beds start and
 * keep looping (press another, or Stop all); one-shots fire once.
 *
 * "Check files" loads every file and reports the ones that aren't there,
 * which is the question you actually want answered an hour before doors.
 */
export default function AudioTestBench({ audio, soundOn }) {
  const [open, setOpen] = useState(false);
  const [missing, setMissing] = useState(null);
  const [checking, setChecking] = useState(false);
  const [playing, setPlaying] = useState(null);
  const groups = buildGroups();

  if (!audio) return null;

  const fire = (id) => {
    audio.unlock();
    audio.play(id, { force: true });
    setPlaying(id);
  };

  const check = () => {
    setChecking(true);
    audio.preload('all');
    // Give the browser a moment to fail on the ones that aren't there.
    setTimeout(() => {
      setMissing(audio.getMissing());
      setChecking(false);
    }, 1500);
  };

  return (
    <div className="testbench">
      <button
        type="button"
        className="btn btn--small"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {open ? 'Hide sound check' : 'Test audio'}
      </button>

      {open && (
        <div className="testbench__body">
          {!soundOn && (
            <p className="panel__note panel__note--warn">
              This window is silent — switch it on above, or run the check in
              whichever window is feeding the speakers.
            </p>
          )}

          {groups.map((group) => (
            <div className="testbench__group" key={group.title}>
              <h3 className="testbench__title">{group.title}</h3>
              <div className="testbench__grid">
                {group.ids.map((id) => {
                  const spec = AUDIO_SLOTS[id];
                  const isMissing = missing && missing.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      className={[
                        'btn',
                        'btn--small',
                        playing === id ? 'btn--on' : '',
                        isMissing ? 'btn--missing' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => fire(id)}
                      title={`${spec.file} — ${spec.note}`}
                    >
                      {id}
                      {isMissing ? ' · no file' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="btnrow">
            <button
              type="button"
              className="btn btn--small"
              onClick={() => {
                audio.fadeOutAll(1200);
                setPlaying(null);
              }}
            >
              Fade out
            </button>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => {
                audio.stopAll();
                setPlaying(null);
              }}
            >
              Stop all audio
            </button>
            <button
              type="button"
              className="btn btn--small"
              onClick={check}
              disabled={checking}
            >
              {checking ? 'Checking…' : 'Check files'}
            </button>
          </div>

          {missing && (
            <p className="panel__note">
              {missing.length === 0
                ? `All ${SLOT_IDS.length} sounds found.`
                : `${missing.length} of ${SLOT_IDS.length} missing: ${missing.join(', ')}. ` +
                  'Those moments will simply play nothing.'}
            </p>
          )}

          <p className="panel__note">
            Beds follow the money:{' '}
            {BED_TIERS.map((tier) => tier.label).join(' · ')}. They crossfade
            when the tier changes, so listen for the handover between Q3 and Q4
            as well as to each one on its own.
          </p>
        </div>
      )}
    </div>
  );
}
