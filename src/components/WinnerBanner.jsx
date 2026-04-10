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
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(99,102,241,0.18) 100%)',
        border: '1px solid rgba(245,158,11,0.4)',
        boxShadow: '0 0 40px rgba(245,158,11,0.12)',
        textAlign: 'center',
      }}
    >
      {/* Confettis CSS */}
      <Confettis />

      <motion.div
        animate={{ rotate: [0, -8, 8, -6, 6, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
        style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '12px' }}
      >
        🏆
      </motion.div>

      <div style={{
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#f59e0b',
        fontWeight: 700,
        marginBottom: '8px',
      }}>
        Gagnant(e) — 8 défis réalisés 🎁
      </div>

      <div style={{
        fontSize: '1.8rem',
        fontWeight: 800,
        fontFamily: 'var(--font-display)',
        color: 'var(--champagne)',
        marginBottom: '6px',
      }}>
        {winner.pseudo}
      </div>

      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Tous les défis le {formatDate(winner.win_at)}
      </div>
    </motion.div>
  );
}

function Confettis() {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.8) % 100}%`,
    color: ['#f59e0b', '#6366f1', '#10b981', '#ec4899', '#f97316'][i % 5],
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
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}
