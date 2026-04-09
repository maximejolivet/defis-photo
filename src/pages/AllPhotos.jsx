import React, { useState, useEffect } from 'react';
import { User as UserIcon, X, Images, Play } from 'lucide-react';
import Navbar from '../components/Navbar';

const AllPhotos = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        fetch('https://photo.jolivetmaxime.fr/api/photos/gallery.php')
            .then(r => r.json())
            .then(data => setPhotos(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>📸 Toutes les photos des invités</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                        {(() => {
                            const defis = photos.filter(p => p.challenge_id).length;
                            const libres = photos.filter(p => !p.challenge_id).length;
                            const parts = [];
                            if (defis > 0) parts.push(`${defis} défi${defis > 1 ? 's' : ''} réalisé${defis > 1 ? 's' : ''}`);
                            if (libres > 0) parts.push(`${libres} photo${libres > 1 ? 's' : ''} libre${libres > 1 ? 's' : ''}`);
                            return parts.join(' · ');
                        })()}
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>Chargement de la galerie...</div>
                ) : photos.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '80px' }}>
                        <Images size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                        <h3>Aucune photo pour l'instant</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Soyez le premier à relever un défi !</p>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {photos.map((photo) => {
                            const ext = photo.image_path.split('.').pop().toLowerCase();
                            const isVideo = ['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'].includes(ext);
                            return (
                                <div
                                    key={photo.id}
                                    className="photo-card glass-card"
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={() => setLightbox(photo)}
                                >
                                    {isVideo ? (
                                        <>
                                            <video src={`https://photo.jolivetmaxime.fr/uploads/${photo.image_path}`} preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                                <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Play size={24} fill="white" color="white" style={{ marginLeft: '3px' }} />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <img src={`https://photo.jolivetmaxime.fr/uploads/${photo.image_path}`} alt="Défi photo" />
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
                                        {photo.recipient_pseudo && (
                                            <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--primary)' }}>
                                                💌 Pour {photo.recipient_pseudo}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {lightbox && (
                    <div
                        onClick={() => setLightbox(null)}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <button
                            onClick={() => setLightbox(null)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={20} />
                        </button>
                        {['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'].includes(lightbox.image_path.split('.').pop().toLowerCase()) ? (
                            <video src={`https://photo.jolivetmaxime.fr/uploads/${lightbox.image_path}`} controls onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }} />
                        ) : (
                            <img src={`https://photo.jolivetmaxime.fr/uploads/${lightbox.image_path}`} alt="Défi photo" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }} />
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default AllPhotos;
