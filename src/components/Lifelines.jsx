/**
 * Lifeline availability. Display only — the host triggers lifelines from
 * their own panel, so nothing here is clickable on the projector.
 */
export default function Lifelines({ lifelines, compact }) {
  const items = [
    { key: 'fifty', label: '50:50', used: lifelines.fifty.used, glyph: '½' },
    { key: 'phone', label: 'Phone a friend', used: lifelines.phone.used, glyph: '☎' },
    { key: 'audience', label: 'Ask the audience', used: lifelines.audience.used, glyph: '👥' },
  ];

  return (
    <ul className={`lifelines ${compact ? 'lifelines--compact' : ''}`}>
      {items.map((item) => (
        <li
          key={item.key}
          className={`lifeline ${item.used ? 'lifeline--used' : ''}`}
          title={item.used ? `${item.label} — already used` : item.label}
        >
          <span className="lifeline__glyph" aria-hidden="true">
            {item.glyph}
          </span>
          <span className="lifeline__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
