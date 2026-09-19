import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { apiFetch } from '../api/client';
import { Upload as UploadIcon, ArrowLeft, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FreeUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const isVideo = file && file.type.startsWith('video/');

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

        try {
            const response = await apiFetch('/api/photos/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

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
            <Navbar />
            <main style={{ maxWidth: '600px', margin: '32px auto', padding: '0 20px' }}>
                <Link to="/gallery" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', textDecoration: 'none', marginBottom: '24px', fontWeight: '600' }}>
                    <ArrowLeft size={18} /> Retour
                </Link>

                <div className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Heart size={24} style={{ color: 'var(--primary)' }} />
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Photo libre</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Envoie une photo ou une vidéo d'un moment marquant de la soirée, sans défi imposé.</p>

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
                                marginBottom: '24px',
                            }}
                            onClick={() => document.getElementById('free-file-upload').click()}
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
                            <input id="free-file-upload" type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </div>

                        {error && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '16px' }}>{error}</p>}

                        <button className="btn-primary" style={{ width: '100%' }} disabled={loading || !file}>
                            <Heart size={16} /> Envoyer la photo
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default FreeUpload;
