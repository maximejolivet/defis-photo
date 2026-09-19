// Le libellé du niveau commence par un prénom variable : on repère la couleur
// par la fin du texte plutôt que par la chaîne exacte.
const LEVEL_COLORS = [
  ['a honte', '#64748b'],
  ['hausse les épaules', '#10b981'],
  ['approuve', '#2f9e44'],
  ['est fière', '#f59e0b'],
];

export default function ProgressPanel({ me }) {
  const completed = Number(me.challenges_completed);
  const levelColor = LEVEL_COLORS.find(([keyword]) => me.level?.includes(keyword))?.[1] ?? '#2f9e44';
  const progressPercent = Math.round((completed / 8) * 100);

  return (
    <div className="glass-card" style={{ flex: 1, minWidth: 280, padding: '28px 24px' }}>
      <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Mes défis
      </div>

      {/* Level badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{
          background: levelColor,
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.82rem',
          padding: '4px 12px',
          borderRadius: '999px',
        }}>
          {me.level}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {me.photo_count} photo{me.photo_count !== 1 ? 's' : ''} envoyée{me.photo_count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
          {completed} / 8 défis complétés
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{progressPercent}%</span>
      </div>
      <div style={{ height: 8, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: 'linear-gradient(to right, var(--primary), #8b5cf6)',
          borderRadius: 999,
          transition: 'width 0.6s ease',
        }} />
      </div>


    </div>
  );
}
