import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { Lock, User as UserIcon } from 'lucide-react';
import FilmStrip from '../components/FilmStrip';

const Register = () => {
    const [pseudo, setPseudo] = useState('');
    const [pin, setPin] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const normalizePseudo = (value) =>
        value
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // supprime les accents
            .replace(/[^a-z0-9_-]/g, '');                     // retire espaces et caractères spéciaux

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!/^[a-z0-9_-]+$/.test(pseudo)) {
            setError("Le pseudo ne peut contenir que des lettres minuscules, chiffres, - et _");
            setLoading(false);
            return;
        }

        if (pin !== pinConfirm) {
            setError("Les codes PIN ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            const response = await apiFetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pseudo, pin })
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login');
            } else {
                setError(data.message || "Erreur lors de l'inscription");
            }
        } catch {
            setError("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: '24px', padding: '32px 20px' }}>
            <header style={{ width: '100%', maxWidth: '440px' }}>
                <FilmStrip preview develop />
                <h1 style={{ fontSize: 'clamp(2.4rem, 10vw, 3.4rem)', marginTop: '24px' }}>Créer un compte</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '12px' }}>Un pseudo et un code PIN à 4 chiffres suffisent pour participer.</p>
            </header>

            <div className="glass-card" style={{ padding: '28px', width: '100%', maxWidth: '440px' }}>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="reg-pseudo">Pseudo</label>
                        <div style={{ position: 'relative' }}>
                            <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="reg-pseudo"
                                className="input-field"
                                type="text"
                                autoComplete="username"
                                placeholder="Ton pseudo"
                                style={{ paddingLeft: '40px' }}
                                value={pseudo}
                                onChange={(e) => setPseudo(normalizePseudo(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="reg-pin">Code PIN</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="reg-pin"
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

                    <div className="input-group">
                        <label htmlFor="reg-pin2">Confirmer le code PIN</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="reg-pin2"
                                className="input-field"
                                type="text"
                                inputMode="numeric"
                                placeholder="••••"
                                maxLength={4}
                                pattern="[0-9]{4}"
                                style={{ paddingLeft: '40px', letterSpacing: '0.3em' }}
                                value={pinConfirm}
                                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                required
                            />
                        </div>
                    </div>

                    {error && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '16px' }}>{error}</p>}

                    <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Création…' : 'Créer mon compte'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Déjà un compte ? <Link to="/login" style={{ color: 'var(--ink)', fontWeight: 700 }}>Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
