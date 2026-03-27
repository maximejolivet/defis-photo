export default function ChallengeSelector({ challenges, selected, onSelect }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
        Choisissez votre défi
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
        Sélectionnez le thème photo auquel vous répondez avec votre envoi.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px',
      }}>
        {challenges.map((challenge) => {
          const isSelected = selected === challenge.id;
          return (
            <div
              key={challenge.id}
              onClick={() => onSelect(challenge.id)}
              className="glass-card"
              style={{
                padding: '20px 16px',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                textAlign: 'center',
                transition: 'border-color 0.2s, transform 0.2s',
                transform: isSelected ? 'translateY(-4px)' : 'none',
                boxShadow: isSelected ? '0 8px 24px rgba(99,102,241,0.3)' : undefined,
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{challenge.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '6px' }}>
                {challenge.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {challenge.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
