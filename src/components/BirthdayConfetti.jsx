import { motion } from 'framer-motion';

// ── Emojis ──────────────────────────────────────────────────────────────────
const EMOJIS = ['🎈', '🎁', '📷', '🎀', '🎊', '🎉', '🎈', '🎁', '📸', '🎈'];

const EMOJI_PIECES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  emoji: EMOJIS[i % EMOJIS.length],
  left: (i * 3.47 + (i % 6) * 5.3) % 100,
  size: 20 + (i % 5) * 8,
  delay: (i * 0.41) % 7,
  duration: 9 + (i % 7) * 1.5,
  drift: ((i % 9) - 4) * 35,
  isBalloon: i % EMOJIS.length === 0 || i % EMOJIS.length === 7,
}));

// ── Confettis ────────────────────────────────────────────────────────────────
const COLORS = ['#e8638c', '#f59e0b', '#a855f7', '#10b981', '#3b82f6', '#f97316', '#ec4899', '#d4a843', '#84cc16', '#ef4444', '#06b6d4'];
const SHAPES = ['circle', 'rect', 'ribbon', 'rect', 'circle']; // rect + circle plus fréquents

const CONFETTI_PIECES = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  left: (i * 1.45 + (i % 8) * 2.9) % 100,
  color: COLORS[i % COLORS.length],
  shape: SHAPES[i % SHAPES.length],
  size: 5 + (i % 6) * 2.2,
  delay: (i * 0.19) % 5,
  duration: 5 + (i % 7) * 0.9,
  drift: ((i % 11) - 5) * 28,
  startY: -((i % 7) * 16 + 8),
}));

// ── Composants ───────────────────────────────────────────────────────────────
function FloatingEmoji({ p }) {
  if (p.isBalloon) {
    return (
      <motion.div
        initial={{ y: '110vh', x: 0, opacity: 0 }}
        animate={{
          y: ['110vh', '-10vh'],
          x: [0, p.drift * 0.4, -p.drift * 0.3, p.drift * 0.2],
          opacity: [0, 0.55, 0.55, 0.55, 0],
          rotate: [0, 8, -8, 5, -5, 0],
        }}
        transition={{
          duration: p.duration,
          delay: p.delay,
          repeat: Infinity,
          repeatDelay: (p.id % 4) * 0.8,
          ease: 'easeInOut',
        }}
        style={{ position: 'fixed', left: `${p.left}%`, top: 0, fontSize: p.size, lineHeight: 1, userSelect: 'none' }}
      >
        {p.emoji}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: p.id * -30, x: 0, opacity: 0 }}
      animate={{
        y: ['0vh', '110vh'],
        x: [0, p.drift, -p.drift * 0.4, p.drift * 0.5],
        opacity: [0, 0.55, 0.55, 0.55, 0],
        rotate: [-8, 8, -6, 10, -4],
        scale: [0.9, 1.05, 0.95, 1],
      }}
      transition={{
        duration: p.duration,
        delay: p.delay,
        repeat: Infinity,
        repeatDelay: (p.id % 4) * 0.8,
        ease: 'linear',
      }}
      style={{ position: 'fixed', left: `${p.left}%`, top: 0, fontSize: p.size, lineHeight: 1, userSelect: 'none' }}
    >
      {p.emoji}
    </motion.div>
  );
}

function Confetto({ p }) {
  const isRibbon = p.shape === 'ribbon';
  const width  = isRibbon ? Math.max(3, p.size * 0.32) : p.size;
  const height = isRibbon ? p.size * 2.6 : p.size;

  return (
    <motion.div
      initial={{ y: p.startY, x: 0, opacity: 0, rotate: 0, scaleY: 1 }}
      animate={{
        y: ['0vh', '110vh'],
        x: [0, p.drift, -p.drift * 0.5, p.drift * 0.3],
        opacity: [0, 0.75, 0.75, 0.75, 0],
        rotate: [0, 180, 360],
        scaleY: isRibbon ? [1, 0.4, 1, 0.6, 1] : 1,
      }}
      transition={{
        duration: p.duration,
        delay: p.delay,
        repeat: Infinity,
        repeatDelay: (p.id % 5) * 0.35,
        ease: 'linear',
      }}
      style={{
        position: 'fixed',
        left: `${p.left}%`,
        top: 0,
        width,
        height,
        borderRadius: p.shape === 'circle' ? '50%' : '2px',
        background: p.color,
        transformOrigin: 'center center',
      }}
    />
  );
}

export default function BirthdayConfetti() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {CONFETTI_PIECES.map(p => <Confetto key={`c${p.id}`} p={p} />)}
      {EMOJI_PIECES.map(p => <FloatingEmoji key={`e${p.id}`} p={p} />)}
    </div>
  );
}
