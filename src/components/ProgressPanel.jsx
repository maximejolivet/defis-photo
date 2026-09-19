import FilmStrip from './FilmStrip';

// Le libellé du niveau commence par un prénom variable : on repère la couleur
// par la fin du texte plutôt que par la chaîne exacte.
const LEVEL_COLORS = [
  ['a honte', '#6b6a95', '#ffffff'],
  ['hausse les épaules', '#3b2fe0', '#ffffff'],
  ['approuve', '#0e0b3d', '#ffffff'],
  ['est fière', '#ffe94a', '#0e0b3d'],
];

const TOTAL = 8;

export default function ProgressPanel({ me }) {
  const completed = Number(me.challenges_completed);
  const [, levelBg, levelFg] = LEVEL_COLORS.find(([keyword]) => me.level?.includes(keyword)) ?? [null, '#0e0b3d', '#ffffff'];
  const photoCount = Number(me.photo_count);

  return (
    <section className="glass-card" style={{ flex: '0 1 520px', minWidth: 280, padding: '20px' }} aria-label="Ma pellicule">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1.5rem' }}>
          {completed} / {TOTAL} défis
        </h2>
        {me.level && (
          <span style={{
            background: levelBg,
            color: levelFg,
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '3px 12px',
            borderRadius: '999px',
          }}>
            {me.level}
          </span>
        )}
      </div>

      <FilmStrip doneIds={me.my_challenges ?? []} total={TOTAL} develop />

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
        {photoCount} photo{photoCount !== 1 ? 's' : ''} envoyée{photoCount !== 1 ? 's' : ''}
      </p>
    </section>
  );
}
