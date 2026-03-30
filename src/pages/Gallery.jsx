import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Grid, User as UserIcon, Trash2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
const Gallery = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            const response = await fetch('https://maxime.go.yo.fr//api/photos/gallery.php');
            const data = await response.json();
            setPhotos(data);
        } catch {
            console.error("Erreur lors de la récupération des photos");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (photoId) => {
        if (!confirm('Supprimer cette photo ?')) return;
        try {
            const response = await fetch('https://maxime.go.yo.fr//api/photos/delete.php', {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photo_id: photoId, user_id: user.id }),
            });
            if (response.ok) {
                setPhotos(prev => prev.filter(p => p.id !== photoId));
            }
        } catch {
            console.error("Erreur lors de la suppression");
        }
    };

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
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
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <header style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>🎂 30ans d'Ophélie</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Partagez vos plus beaux souvenirs de la soirée !</p>
                    <Link to="/upload" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
                        Réalise un défi
                    </Link>
                </header>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Mes photos, vidéos réalisées</h2>
                {
                    loading ? (
                        <div style={{ textAlign: 'center', padding: '100px' }}>Chargement de la galerie...</div>
                    ) : photos.filter(p => p.user_id === user.id).length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '80px', marginTop: '24px' }}>
                            <Grid size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                            <h3>Pas encore de photos</h3>
                            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Soyez le premier à relever le défi photo !</p>
                            <Link to="/upload" className="btn-primary" style={{ marginTop: '24px' }}>
                                Réalise un défi
                            </Link>
                        </div>
                    ) : (
                        <div className="gallery-grid">
                            {
                                photos.filter(p => p.user_id === user.id).map((photo) => {
                                    const ext = photo.image_path.split('.').pop().toLowerCase();
                                    const isVideo = ['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'].includes(ext);
                                    return (
                                        <div key={photo.id} className="photo-card glass-card" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setLightbox(photo)}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                                                title="Supprimer"
                                                style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: '#e53e3e', border: 'none', cursor: 'pointer', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            {isVideo ? (
                                                <video src={`https://maxime.go.yo.fr//uploads/${photo.image_path}`} controls style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} onClick={(e) => e.stopPropagation()} />
                                            ) : (
                                                <img src={`https://maxime.go.yo.fr//uploads/${photo.image_path}`} alt="Défi photo" />
                                            )}
                                            <div className="photo-info">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <UserIcon size={14} />
                                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{photo.user_name}</span>
                                                </div>
                                                {photo.challenge_icon && (
                                                    <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                                                        {photo.challenge_icon} {photo.challenge_title}
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
                        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                            {['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'].includes(lightbox.image_path.split('.').pop().toLowerCase()) ? (
                                <video src={`https://maxime.go.yo.fr//uploads/${lightbox.image_path}`} controls onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }} />
                            ) : (
                                <img src={`https://maxime.go.yo.fr//uploads/${lightbox.image_path}`} alt="Défi photo" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }} />
                            )}
                        </div>
                    )
                }
            </div>
        </>
    );
};

export default Gallery;
