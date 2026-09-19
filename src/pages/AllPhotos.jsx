import React, { useState, useEffect } from 'react';
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiFetch } from '../api/client';
import { API_BASE_URL } from '../config';

const PER_PAGE = 8;

const AllPhotos = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        apiFetch('/api/photos/gallery')
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

    const totalPages = Math.ceil(photos.length / PER_PAGE);
    const paginated = photos.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const goTo = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Navbar />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: 'clamp(2.2rem, 8vw, 3.4rem)' }}>Les photos des invités</h1>
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
                    <p role="status" style={{ padding: '48px 0', color: 'var(--text-muted)' }}>Chargement de la galerie…</p>
                ) : photos.length === 0 ? (
                    <div className="glass-card" style={{ padding: '28px', maxWidth: '520px' }}>
                        <h3 style={{ fontSize: '1.4rem' }}>Aucune photo pour l'instant</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Sois le premier à relever un défi photo.</p>
                    </div>
                ) : (
                    <>
                        <div className="gallery-grid">
                            {paginated.map((photo) => {
                                const ext = photo.image_path.split('.').pop().toLowerCase();
                                const isVideo = ['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'].includes(ext);
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
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                                <button
                                    onClick={() => goTo(page - 1)}
                                    disabled={page === 1}
                                    aria-label="Page précédente"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        border: '1px solid var(--glass-border)', background: 'var(--surface)',
                                        color: 'var(--text)',
                                        cursor: page === 1 ? 'default' : 'pointer',
                                        opacity: page === 1 ? 0.4 : 1,
                                    }}
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => goTo(p)}
                                        aria-label={`Page ${p}`}
                                        aria-current={p === page ? 'page' : undefined}
                                        style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            border: '1px solid var(--glass-border)',
                                            background: p === page ? 'var(--flash)' : 'var(--surface)',
                                            color: p === page ? 'var(--ink)' : 'var(--text)', fontWeight: p === page ? '700' : '500',
                                            cursor: 'pointer', fontSize: '0.9rem',
                                        }}
                                    >
                                        {p}
                                    </button>
                                ))}

                                <button
                                    onClick={() => goTo(page + 1)}
                                    disabled={page === totalPages}
                                    aria-label="Page suivante"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        border: '1px solid var(--glass-border)', background: 'var(--surface)',
                                        color: 'var(--text)',
                                        cursor: page === totalPages ? 'default' : 'pointer',
                                        opacity: page === totalPages ? 0.4 : 1,
                                    }}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {lightbox && (
                    <div
                        onClick={() => setLightbox(null)}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(14, 11, 61, 0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <button
                            onClick={() => setLightbox(null)}
                            aria-label="Fermer"
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.14)', border: 'none', cursor: 'pointer', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={20} />
                        </button>
                        {['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'].includes(lightbox.image_path.split('.').pop().toLowerCase()) ? (
                            <video src={`${API_BASE_URL}/uploads/${lightbox.image_path}`} controls onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }} />
                        ) : (
                            <img src={`${API_BASE_URL}/uploads/${lightbox.image_path}`} alt="Défi photo" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }} />
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default AllPhotos;
