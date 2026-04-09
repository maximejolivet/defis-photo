export default function ChallengeSelector({ challenges, selected, onSelect }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
        Choisissez votre défi
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
        Sélectionnez le défi photo auquel vous allez envoyer votre photo ou vidéo.{' '}
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{challenges.length} défi{challenges.length !== 1 ? 's' : ''} restant{challenges.length !== 1 ? 's' : ''}</span>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {challenges.map((challenge) => {
          const isSelected = selected === challenge.id;
          return (
            <div
              key={challenge.id}
              onClick={() => onSelect(challenge.id)}
              className="glass-card"
              style={{
                padding: '14px 16px',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'border-color 0.2s',
                boxShadow: isSelected ? '0 4px 16px rgba(99,102,241,0.3)' : undefined,
              }}
            >
              <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{challenge.icon}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '6px' }}>
                  {challenge.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'wrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {challenge.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
