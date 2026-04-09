const LEVEL_COLORS = {
  'Ophélie a honte 😬': '#64748b',
  'Ophélie hausse les épaules 😐': '#10b981',
  'Ophélie approuve 💪': '#6366f1',
  'Ophélie est fière 🏆': '#f59e0b',
};

export default function ProgressPanel({ me, myChallenges, allChallenges }) {
  const completedSet = new Set(myChallenges.map(Number));
  const points = Number(me.total_points);
  const completed = Number(me.challenges_completed);
  const levelColor = LEVEL_COLORS[me.level] ?? '#6366f1';
  const progressPercent = Math.round((completed / 10) * 100);

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
          {completed} / 10 défis complétés
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{progressPercent}%</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', marginBottom: '20px' }}>
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
