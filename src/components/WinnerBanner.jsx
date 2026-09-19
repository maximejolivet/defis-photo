import { motion } from 'framer-motion';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function WinnerBanner({ winner }) {
  if (!winner) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-panel)',
        padding: '24px 24px',
        marginBottom: '28px',
        background: 'var(--flash)',
        color: 'var(--ink)',
        textAlign: 'left',
      }}
    >
      {/* Confettis CSS */}
      <Confettis />

      <div style={{ position: 'relative', fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>
        Premier(e) à avoir relevé les 8 défis 🏆
      </div>

      <div style={{
        position: 'relative',
        fontSize: 'clamp(2rem, 8vw, 3rem)',
        fontWeight: 800,
        fontFamily: 'var(--font-display)',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        color: 'var(--ink)',
        marginBottom: '8px',
      }}>
        {winner.pseudo}
      </div>

      <div style={{ position: 'relative', fontSize: '0.9rem' }}>
        Terminé le {formatDate(winner.win_at)}
      </div>
    </motion.div>
  );
}

function Confettis() {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.8) % 100}%`,
    color: ['#3b2fe0', '#ffffff', '#c62a1a', '#0e0b3d', '#3b2fe0'][i % 5],
    delay: (i * 0.12).toFixed(2),
    duration: (1.8 + (i % 4) * 0.3).toFixed(2),
    size: 6 + (i % 3) * 3,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: 120, opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: Number(p.duration), delay: Number(p.delay), repeat: Infinity, repeatDelay: 2 }}
          style={{
            position: 'absolute',
            left: p.left,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: p.id % 2 === 0 ? '50%' : '2px',
            background: p.color,
            opacity: 0.55,
          }}
        />
      ))}
    </div>
  );
}
