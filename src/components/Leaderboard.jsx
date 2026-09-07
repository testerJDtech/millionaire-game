import { buildLeaderboard, formatMoney } from '../utils/gameEngine.js';
import { settings } from '../data/settings.js';

/** How a pair's game ended, in words the room understands. */
const REASON_LABEL = {
  jackpot: 'Took the top prize',
  wrong: 'Fell on a wrong answer',
  ended: 'Walked away',
};

/**
 * Final standings. Ties share a position, so two pairs on £1,000 both
 * show as 2nd and the next pair is 4th.
 */
export default function Leaderboard({ state, teams, compact }) {
  const rows = buildLeaderboard(state, teams);
  const winner = rows[0];

  return (
    <div className={`board ${compact ? 'board--compact' : ''}`}>
      {!compact && (
        <header className="board__head">
          <h2 className="board__title">Final standings</h2>
          {winner && winner.finished && (
            <p className="board__winner">
              {winner.name} — {formatMoney(winner.winnings, settings)}
            </p>
          )}
        </header>
      )}

      <ol className="board__list">
        {rows.map((row) => (
          <li
            key={row.teamId}
            className={`board__row ${row.rank === 1 ? 'board__row--first' : ''}`}
          >
            <span className="board__rank">{row.rank}</span>
            <span className="board__name">{row.name}</span>
            <span className="board__note">
              {row.finished
                ? `${REASON_LABEL[row.reason] || ''} · ${row.correctCount}/${
                    settings.prizeLadder.length
                  } right`
                : 'Not played'}
            </span>
            <span className="board__money">{formatMoney(row.winnings, settings)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
