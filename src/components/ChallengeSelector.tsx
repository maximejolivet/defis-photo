import { Link } from 'react-router-dom';
import type { Challenge } from '../types';

interface ChallengeSelectorProps {
  challenges: Challenge[];
  selected: number | null;
  onSelect: (id: number) => void;
}

export default function ChallengeSelector({ challenges, selected, onSelect }: ChallengeSelectorProps) {
  if (challenges.length === 0) {
    return (
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Pellicule terminée</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Tu as relevé tous les défis. Tu peux encore partager un moment de la soirée en photo libre.
        </p>
        <Link to="/photo-libre" className="btn-primary">Envoyer une photo libre</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
        Quel défi relever ?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1rem' }}>
        Il te reste <strong style={{ color: 'var(--text)' }}>{challenges.length} défi{challenges.length !== 1 ? 's' : ''}</strong>. Choisis celui de ta prochaine photo ou vidéo.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {challenges.map((challenge) => {
          const isSelected = selected === challenge.id;
          return (
            <button
              type="button"
              key={challenge.id}
              onClick={() => onSelect(challenge.id)}
              aria-pressed={isSelected}
              className="glass-card"
              style={{
                width: '100%',
                textAlign: 'left',
                font: 'inherit',
                color: 'var(--text)',
                padding: '14px 16px',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--ink)' : '2px solid var(--glass-border)',
                background: isSelected ? 'var(--flash)' : 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{challenge.icon}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', marginBottom: '2px' }}>
                  {challenge.title}
                </div>
                <div style={{ fontSize: '0.88rem', color: isSelected ? 'var(--ink)' : 'var(--text-muted)' }}>
                  {challenge.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
