import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { apiFetch } from '../api/client';
import { Upload as UploadIcon, ArrowLeft } from 'lucide-react';
import ChallengeSelector from '../components/ChallengeSelector';
import Footer from '../components/Footer';
import type { ApiMessage, Challenge } from '../types';

const Upload = () => {
    const [step, setStep] = useState<'challenge' | 'file'>('challenge');
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [doneChallengeIds, setDoneChallengeIds] = useState<number[]>([]);
    const [challengeId, setChallengeId] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const isVideo = file && file.type.startsWith('video/');
    const selectedChallenge = challenges.find(c => c.id === challengeId);

    useEffect(() => {
        apiFetch('/api/challenges/list')
            .then(r => r.json())
            .then(setChallenges)
            .catch(() => { });

        apiFetch('/api/gamification/stats')
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setDoneChallengeIds(data.my_challenges))
            .catch(() => { });
    }, []);

    const handleChallengeSelect = (id: number) => {
        setChallengeId(id);
        setStep('file');
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError('');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (challengeId === null) return;
        if (!file) return setError('Veuillez sélectionner une image.');

        setLoading(true);
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('challenge_id', String(challengeId));

        try {
            const response = await apiFetch('/api/photos/upload', {
                method: 'POST',
                body: formData
            });

            const data: ApiMessage = await response.json();

            if (response.ok) {
                navigate('/gallery');
            } else {
                setError(data.message || "Erreur lors de l'envoi.");
            }
        } catch {
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
        <>
        <main style={{ maxWidth: step === 'challenge' ? '900px' : '600px', margin: '32px auto', padding: '0 20px' }}>
            <Link to="/gallery" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', textDecoration: 'none', marginBottom: '24px', fontWeight: '600' }}>
                <ArrowLeft size={18} /> Retour
            </Link>

            {step === 'challenge' ? (
                <div className="glass-card" style={{ padding: '16px' }}>
                    <ChallengeSelector
                        challenges={challenges.filter(c => !doneChallengeIds.includes(c.id))}
                        selected={challengeId}
                        onSelect={handleChallengeSelect}
                    />
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '16px' }}>
                    {/* Selected challenge badge + back */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setStep('challenge')}
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-muted)',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.9rem',
                            }}
                        >
                            <ArrowLeft size={14} /> Changer de défi
                        </button>
                        {selectedChallenge && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'var(--flash)',
                                border: '2px solid var(--ink)',
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

                    <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Ajoute ta photo ou vidéo</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Montre-nous ton meilleur cliché.</p>

                    {loading && (
                        <div style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(14, 11, 61, 0.92)',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            zIndex: 1000, gap: '20px',
                        }}>
                            <div style={{
                                width: '52px', height: '52px',
                                border: '4px solid rgba(255,255,255,0.15)',
                                borderTop: '4px solid var(--flash)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                            <p role="status" style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', textAlign: 'center' }}>Envoi en cours, ne ferme pas la page</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', textAlign: 'center' }}>Tu seras redirigé vers la galerie<br />dès que le transfert est terminé.</p>

                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div
                            style={{
                                border: '2px dashed var(--ink)',
                                borderRadius: '10px',
                                padding: '40px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                backgroundColor: 'var(--surface)',
                                marginBottom: '32px'
                            }}
                            role="button"
                            tabIndex={0}
                            onClick={() => document.getElementById('file-upload')?.click()}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('file-upload')?.click(); } }}
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
                                    <p style={{ fontWeight: '600' }}>Choisir un fichier</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>Images (JPEG, PNG, HEIC…) ou vidéos (MP4, MOV…) · Max 50MB</p>
                                </div>
                            )}
                            <input id="file-upload" type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </div>

                        {error && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '16px' }}>{error}</p>}

                        <button className="btn-primary" style={{ width: '100%' }} disabled={loading || !file}>
                            Publier mon fichier
                        </button>
                    </form>
                </div>
            )
            }
        </main>
        <Footer />
        </>
    );
};

export default Upload;
