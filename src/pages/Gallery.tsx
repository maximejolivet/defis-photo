import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { Trash2, X, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProgressPanel from '../components/ProgressPanel';
import WinnerBanner from '../components/WinnerBanner';
import { apiFetch } from '../api/client';
import { API_BASE_URL } from '../config';
import { isVideoPath } from '../utils/media';
import type { Photo, Stats, Winner } from '../types';

const Gallery = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<Photo | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [winner, setWinner] = useState<Winner | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchPhotos = async () => {
        try {
            const response = await apiFetch('/api/photos/gallery');
            const data = await response.json();
            setPhotos(data);
        } catch {
            console.error("Erreur lors de la récupération des photos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Chargement initial : les setState ont lieu après un await, pas de rendu en cascade
        // (la règle ne voit pas à travers fetchPhotos, réutilisée aussi par handleDelete).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPhotos();
        apiFetch('/api/gamification/winner')
            .then(r => r.ok ? r.json() : null)
            .then(data => data?.winner && setWinner(data.winner))
            .catch(() => {});
        if (user) {
            apiFetch('/api/gamification/stats')
                .then(r => r.ok ? r.json() : null)
                .then(data => data && setStats(data))
                .catch(() => {});
        }
    }, [user]);

    const handleDelete = async (photoId: number) => {
        if (!confirm('Supprimer cette photo ?')) return;
        try {
            const response = await apiFetch('/api/photos/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photo_id: photoId }),
            });
            if (response.ok) {
                setPhotos(prev => prev.filter(p => p.id !== photoId));
            }
        } catch {
            console.error("Erreur lors de la suppression");
        }
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <>
            <Navbar />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
                <WinnerBanner winner={winner} />

                <header style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: 'clamp(2.4rem, 9vw, 3.8rem)' }}>Soirée d'anniversaire</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: '1.05rem' }}>Partage tes plus beaux souvenirs de la soirée.</p>
                    <Link to="/upload" className="btn-primary" style={{ marginTop: '18px' }}>
                        Réaliser un défi
                    </Link>
                </header>

                {stats && (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
                        <ProgressPanel me={stats} />
                    </div>
                )}

                <h2 style={{ fontSize: '1.6rem' }}>Mes photos et vidéos</h2>
                {
                    loading ? (
                        <p role="status" style={{ padding: '48px 0', color: 'var(--text-muted)' }}>Chargement de la galerie…</p>
                    ) : photos.filter(p => p.user_id === user.id).length === 0 ? (
                        <div className="glass-card" style={{ padding: '28px', marginTop: '16px', maxWidth: '520px' }}>
                            <h3 style={{ fontSize: '1.4rem' }}>Ta pellicule est vide</h3>
                            <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px' }}>Choisis un défi pour envoyer ta première photo ou vidéo.</p>
                            <Link to="/upload" className="btn-primary">
                                Réaliser un défi
                            </Link>
                        </div>
                    ) : (
                        <div className="gallery-grid">
                            {
                                photos.filter(p => p.user_id === user.id).map((photo) => {
                                    const isVideo = isVideoPath(photo.image_path);
                                    return (
                                        <div
                                            key={photo.id}
                                            className="photo-card glass-card"
                                            style={{ cursor: 'pointer' }}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Agrandir la photo de ${photo.user_name}`}
                                            onClick={() => setLightbox(photo)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightbox(photo); } }}
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                                                aria-label="Supprimer cette photo"
                                                style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10, background: 'var(--danger)', border: '2px solid var(--paper)', cursor: 'pointer', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                            {isVideo ? (
                                                <>
                                                    <video src={`${API_BASE_URL}/uploads/${photo.image_path}`} preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                                        <div style={{ background: 'var(--ink)', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Play size={24} fill="white" color="white" style={{ marginLeft: '3px' }} />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <img src={`${API_BASE_URL}/uploads/${photo.image_path}`} alt="Défi photo" />
                                            )}
                                            <div className="photo-info">
                                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{photo.user_name}</div>
                                                {photo.challenge_icon && (
                                                    <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {photo.challenge_icon} {photo.challenge_title}
                                                    </div>
                                                )}
                                                {photo.recipient_pseudo && (
                                                    <div style={{ color: 'var(--ink)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        Pour {photo.recipient_pseudo}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )
                }
                {
                    lightbox && (
                        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(14, 11, 61, 0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                            <button onClick={() => setLightbox(null)} aria-label="Fermer" style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.14)', border: 'none', cursor: 'pointer', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                            {isVideoPath(lightbox.image_path) ? (
                                <video src={`${API_BASE_URL}/uploads/${lightbox.image_path}`} controls onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }} />
                            ) : (
                                <img src={`${API_BASE_URL}/uploads/${lightbox.image_path}`} alt="Défi photo" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }} />
                            )}
                        </div>
                    )
                }
            </main>
            <Footer />
        </>
    );
};

export default Gallery;
