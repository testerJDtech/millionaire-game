import { motion } from 'framer-motion';
import { formatMoney, teamStatus } from '../utils/gameEngine.js';
import { settings } from '../data/settings.js';
import { staggerItem, staggerList } from '../utils/motion.js';

/**
 * The four pairs and where each one is up to.
 *
 * One component, two jobs:
 *   • projector — read-only board the room can see
 *   • host      — pass `onSelect` and `onRename` to make it interactive
 */
export default function TeamSelect({ state, teams, onSelect, onRename, compact }) {
  const interactive = typeof onSelect === 'function';

  return (
    <div className={`teams ${compact ? 'teams--compact' : ''}`}>
      {!compact && <h2 className="teams__heading">Who's in the chair?</h2>}

      <motion.ul
        className="teams__list"
        variants={staggerList}
        initial="initial"
        animate="animate"
      >
        {teams.map((team) => {
          const status = teamStatus(state, team.id);
          const result = state.results[team.id];
          const name = state.teamNames[team.id] ?? team.name;

          return (
            <motion.li
              key={team.id}
              className={`teamcard teamcard--${status.replace(/\s+/g, '-').toLowerCase()}`}
              variants={staggerItem}
            >
              <div className="teamcard__top">
                {onRename ? (
                  <input
                    className="teamcard__input"
                    value={name}
                    aria-label={`Name for ${team.name}`}
                    onChange={(event) => onRename(team.id, event.target.value)}
                    maxLength={28}
                  />
                ) : (
                  <span className="teamcard__name">{name}</span>
                )}
              </div>

              <div className="teamcard__meta">
                <span className="teamcard__status">{status}</span>
                {result && (
                  <span className="teamcard__winnings">
                    {formatMoney(result.winnings, settings)}
                  </span>
                )}
              </div>

              {interactive && (
                <button
                  type="button"
                  className="btn btn--ghost teamcard__play"
                  onClick={() => onSelect(team.id)}
                  disabled={Boolean(result)}
                >
                  {result ? 'Finished' : 'Put in the chair'}
                </button>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
