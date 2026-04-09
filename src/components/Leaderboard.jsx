const LEVEL_COLORS = {
  '😬': '#64748b',
  '😐': '#10b981',
  '💪': '#6366f1',
  '🏆': '#f59e0b',
};

function rankIcon(index) {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `${index + 1}`;
}

export default function Leaderboard({ entries, currentUserId }) {
  return ('');
}
