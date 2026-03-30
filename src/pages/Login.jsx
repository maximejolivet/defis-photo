import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User as UserIcon, Lock } from 'lucide-react';

const Login = () => {
    const [pseudo, setPseudo] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://photo.jolivetmaxime.fr/api/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ pseudo, pin })
            });

            const data = await response.json();

            if (response.ok) {
                login(data.user);
                navigate('/gallery');
            } else {
                setError(data.message || "Identifiants incorrects");
            }
        } catch (err) {
            setError("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>


                    <div style={{ position: 'relative', width: '100px', margin: '0 auto 16px' }}>
                        <img src="/ophelie.jpg" alt="Ophélie" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', display: 'block', border: '3px solid var(--primary)' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎂</div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Bienvenue à la soirée d'Ophélie</p>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Chaud pour le jeu des défis ?</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Pseudo</label>
                        <div style={{ position: 'relative' }}>
                            <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Votre pseudo"
                                style={{ paddingLeft: '40px' }}
                                value={pseudo}
                                onChange={(e) => setPseudo(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Code PIN</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                type="text"
                                inputMode="numeric"
                                placeholder="••••"
                                maxLength={4}
                                pattern="[0-9]{4}"
                                style={{ paddingLeft: '40px', letterSpacing: '0.3em' }}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                required
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Pas encore de compte ? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>S'inscrire</Link>
                </p>
            </div>

            <div style={{
                background: 'rgba(212, 168, 67, 0.06)',
                border: '1px solid rgba(212, 168, 67, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'left'
            }}>
                <p style={{ fontWeight: '600', color: '#d4a843', marginBottom: '8px', fontSize: '0.95rem' }}>
                    ✨ Comment ça marche ?
                </p>
                <ul style={{ color: '#e8c4a0', fontSize: '0.85rem', lineHeight: '1.7', paddingLeft: '16px', margin: 0 }}>
                    <li>Crée ton compte avec un pseudo et un code PIN</li>
                    <li>Relève des défis photo tout au long de la soirée</li>
                    <li>Upload tes photos, tes vidéos et consulte celles des autres</li>
                </ul>
                <p style={{ fontWeight: '500', color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                        📸  </span>   Toutes les photos, vidéos seront envoyés à Ophélie.</p>
            </div>
        </div>
    );
};

export default Login;
