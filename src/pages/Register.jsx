import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Lock, User as UserIcon } from 'lucide-react';

const Register = () => {
    const [pseudo, setPseudo] = useState('');
    const [pin, setPin] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (pin !== pinConfirm) {
            setError("Les codes PIN ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://photo.jolivetmaxime.fr/api/auth/register.php', {
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
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Créer un compte</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Créez votre compte pour participer 🎉</p>
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

                    <div className="input-group">
                        <label>Confirmer le code PIN</label>
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
                                value={pinConfirm}
                                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                required
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Création...' : "S'inscrire"}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
