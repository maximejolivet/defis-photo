import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload as UploadIcon, ArrowLeft } from 'lucide-react';
import ChallengeSelector from '../components/ChallengeSelector';

const Upload = () => {
    const [step, setStep] = useState('challenge'); // 'challenge' | 'file'
    const [challenges, setChallenges] = useState([]);
    const [doneChallengeIds, setDoneChallengeIds] = useState([]);
    const [challengeId, setChallengeId] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const isVideo = file && file.type.startsWith('video/');
    const selectedChallenge = challenges.find(c => c.id === challengeId);

    useEffect(() => {
        fetch('http://photo.jolivetmaxime.fr/api/challenges/list.php')
            .then(r => r.json())
            .then(setChallenges)
            .catch(() => { });

        fetch(`http://photo.jolivetmaxime.fr/api/gamification/stats.php?user_id=${user.id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setDoneChallengeIds(data.my_challenges))
            .catch(() => { });
    }, []);

    const handleChallengeSelect = (id) => {
        setChallengeId(id);
        setStep('file');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Veuillez sélectionner une image.');

        setLoading(true);
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('challenge_id', challengeId);

        try {
            const response = await fetch(`http://photo.jolivetmaxime.fr/api/photos/upload.php?user_id=${user.id}`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/gallery');
            } else {
                setError(data.message || "Erreur lors de l'envoi.");
            }
        } catch (err) {
            setError("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div style={{ maxWidth: step === 'challenge' ? '900px' : '600px', margin: '40px auto', padding: '0 20px', transition: 'max-width 0.3s' }}>
            <Link to="/gallery" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px', fontWeight: '500' }}>
                <ArrowLeft size={18} /> Retour à la galerie
            </Link>

            {step === 'challenge' ? (
                <div style={{ padding: '16px', background: 'var(--card-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '24px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)' }}>
                    <ChallengeSelector
                        challenges={challenges.filter(c => !doneChallengeIds.includes(c.id))}
                        selected={challengeId}
                        onSelect={handleChallengeSelect}
                    />
                </div>
            ) : (
                <div style={{ padding: '16px', background: 'var(--card-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '24px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)' }}>
                    {/* Selected challenge badge + back */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setStep('challenge')}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-muted)',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.82rem',
                            }}
                        >
                            <ArrowLeft size={14} /> Changer de défi
                        </button>
                        {selectedChallenge && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(99,102,241,0.15)',
                                border: '1px solid rgba(99,102,241,0.4)',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                fontSize: '0.88rem',
                                fontWeight: 600,
                                color: 'var(--text)',
                            }}>
                                <span>{selectedChallenge.icon}</span>
                                <span>{selectedChallenge.title}</span>
                            </div>
                        )}
                    </div>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>Ajouter une photo ou vidéo</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Montrez-nous votre meilleur cliché !</p>

                    {loading && (
                        <div style={{
                            borderRadius: '24px',
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            zIndex: 1000, gap: '20px',
                        }}>
                            <div style={{
                                width: '52px', height: '52px',
                                border: '4px solid rgba(255,255,255,0.15)',
                                borderTop: '4px solid var(--primary)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', textAlign: 'center' }}>Envoi en cours… Ne pas fermer la page</p>
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', textAlign: 'center' }}>Attendre le transfert qui se termine, tu vas être redirigé vers la galerie.</p>

                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div
                            style={{
                                border: '2px dashed var(--glass-border)',
                                borderRadius: '20px',
                                padding: '40px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                marginBottom: '32px'
                            }}
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            {preview ? (
                                isVideo ? (
                                    <video src={preview} controls style={{ width: '100%', maxHeight: '300px', borderRadius: '12px' }} />
                                ) : (
                                    <img src={preview} alt="Preview" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px' }} />
                                )
                            ) : (
                                <div style={{ padding: '40px 0' }}>
                                    <UploadIcon size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                                    <p style={{ fontWeight: '600' }}>Cliquez pour sélectionner un fichier</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>Images (JPEG, PNG, HEIC…) ou vidéos (MP4, MOV…) · Max 50MB</p>
                                </div>
                            )}
                            <input id="file-upload" type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </div>

                        {error && <p style={{ color: 'var(--accent)', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || !file}>
                            Publier mon fichier
                        </button>
                    </form>
                </div>
            )
            }
        </div >
    );
};

export default Upload;
