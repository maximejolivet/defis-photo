const LEVEL_COLORS = {
  'Ophélie a honte 😬': '#64748b',
  'Ophélie hausse les épaules 😐': '#10b981',
  'Ophélie approuve 💪': '#6366f1',
  'Ophélie est fière 🏆': '#f59e0b',
};

function rankIcon(index) {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `${index + 1}`;
}

export default function Leaderboard({ entries, currentUserId }) {
  return (
    <div className="glass-card" style={{ flex: 1, minWidth: 280, padding: '28px 24px' }}>
      <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Classement
      </div>

      {entries.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucun participant pour l'instant.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {entries.slice(0, 3).map((entry, index) => {
          const isMe = Number(entry.user_id) === Number(currentUserId);
          const levelColor = LEVEL_COLORS[entry.level] ?? '#6366f1';
          return (
            <div
              key={entry.user_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: isMe ? 'rgba(99,102,241,0.15)' : 'transparent',
                borderLeft: isMe ? '3px solid var(--primary)' : '3px solid transparent',
              }}
            >
              <span style={{
                width: 28,
                textAlign: 'center',
                fontSize: index < 3 ? '1.2rem' : '0.85rem',
                fontWeight: index < 3 ? 'normal' : 700,
                color: index >= 3 ? 'var(--text-muted)' : undefined,
                flexShrink: 0,
              }}>
                {rankIcon(index)}
              </span>

              <span style={{
                flex: 1,
                fontWeight: isMe ? 700 : 500,
                color: 'var(--text)',
                fontSize: '0.9rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {entry.pseudo}{isMe ? ' (moi)' : ''}
              </span>

              <span style={{
                background: levelColor,
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                flexShrink: 0,
              }}>
                {entry.level}
              </span>

              <span style={{
                fontWeight: 700,
                color: 'var(--text)',
                fontSize: '0.9rem',
                flexShrink: 0,
                minWidth: 48,
                textAlign: 'right',
              }}>
                {entry.total_points} pts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
