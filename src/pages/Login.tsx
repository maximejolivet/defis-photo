import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { apiFetch } from '../api/client';
import { User as UserIcon, Lock } from 'lucide-react';
import FilmStrip from '../components/FilmStrip';
import type { LoginResponse } from '../types';

const Login = () => {
    const [pseudo, setPseudo] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiFetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pseudo, pin })
            });

            const data: LoginResponse = await response.json();

            if (response.ok) {
                login({ ...data.user, token: data.token });
                navigate('/gallery');
            } else {
                setError(data.message || "Identifiants incorrects");
            }
        } catch {
            setError("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: '28px', padding: '32px 20px' }}>
            <header style={{ width: '100%', maxWidth: '440px' }}>
                <FilmStrip preview develop />
                <h1 style={{ fontSize: 'clamp(2.8rem, 12vw, 4.2rem)', marginTop: '28px' }}>
                    8 défis,<br />une soirée.
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '14px', maxWidth: '34ch' }}>
                    Connecte-toi pour relever les défis photo et partager tes souvenirs avec les autres invités.
                </p>
            </header>

            <div className="glass-card" style={{ padding: '28px', width: '100%', maxWidth: '440px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="pseudo">Pseudo</label>
                        <div style={{ position: 'relative' }}>
                            <UserIcon size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="pseudo"
                                className="input-field"
                                type="text"
                                autoComplete="username"
                                placeholder="Ton pseudo"
                                style={{ paddingLeft: '40px' }}
                                value={pseudo}
                                onChange={(e) => setPseudo(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="pin">Code PIN à 4 chiffres</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="pin"
                                className="input-field"
                                type="text"
                                inputMode="numeric"
                                autoComplete="current-password"
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

                    {error && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '16px' }}>{error}</p>}

                    <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Connexion…' : 'Se connecter'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Pas encore de compte ? <Link to="/register" style={{ color: 'var(--ink)', fontWeight: 700 }}>Créer un compte</Link>
                </p>
            </div>

            <section style={{ width: '100%', maxWidth: '440px' }} aria-labelledby="how-it-works">
                <h2 id="how-it-works" style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Comment ça marche</h2>
                <ul style={{ color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px' }}>
                    <li>Crée ton compte avec un pseudo et un code PIN.</li>
                    <li>Relève les défis photo tout au long de la soirée.</li>
                    <li>Envoie tes photos et vidéos, et découvre celles des autres.</li>
                </ul>
                <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.9rem' }}>
                    En souvenir, toutes les photos et vidéos seront transmises à la personne fêtée.
                </p>
            </section>
        </div>
    );
};

export default Login;
