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
            const response = await fetch('http://localhost:8000/api/auth/login.php', {
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
        <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        🎂
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Connexion</h2>
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
        </div>
    );
};

export default Login;
