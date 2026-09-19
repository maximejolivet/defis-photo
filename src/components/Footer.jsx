import React from 'react';

const Footer = () => (
    <footer style={{
        textAlign: 'center',
        padding: '32px 20px',
        marginTop: '40px',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        borderTop: '1px solid rgba(232, 89, 12, 0.1)',
    }}>
        Créé avec ❤️ par <a href="https://maxime.bzh" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Maxime Jolivet</a>
    </footer>
);

export default Footer;
