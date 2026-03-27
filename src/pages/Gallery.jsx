import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Upload as UploadIcon, Grid, Calendar, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProgressPanel from '../components/ProgressPanel';
import Leaderboard from '../components/Leaderboard';

const Gallery = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gamification, setGamification] = useState(null);
    const [allChallenges, setAllChallenges] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPhotos();
        fetchGamification();
        fetchChallenges();
    }, []);

    const fetchPhotos = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/photos/gallery.php');
            const data = await response.json();
            setPhotos(data);
        } catch (err) {
            console.error("Erreur lors de la récupération des photos");
        } finally {
            setLoading(false);
        }
    };

    const fetchGamification = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/gamification/stats.php', {
                credentials: 'include'
            });
            if (response.ok) {
                setGamification(await response.json());
            }
        } catch (err) {
            // gamification is optional — fail silently
        }
    };

    const fetchChallenges = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/challenges/list.php');
            if (response.ok) setAllChallenges(await response.json());
        } catch (err) {}
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(to right, #fdf2f8, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✨ 30 ans d'Ophélie</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Partagez vos plus beaux souvenirs de la soirée !</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Link to="/upload" className="btn-primary">
                        <UploadIcon size={20} /> Participer
                    </Link>
                    <button onClick={handleLogout} className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Gamification panels */}
            {gamification && allChallenges.length > 0 && (
                <div style={{ display: 'flex', gap: '24px', marginBottom: '48px', flexWrap: 'wrap' }}>
                    <ProgressPanel
                        me={gamification.me}
                        myChallenges={gamification.my_challenges}
                        allChallenges={allChallenges}
                    />
                    <Leaderboard
                        entries={gamification.leaderboard}
                        currentUserId={user.id}
                    />
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>Chargement de la galerie...</div>
            ) : photos.filter(p => p.user_id === user.id).length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '80px' }}>
                    <Grid size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h3>Pas encore de photos</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Soyez le premier à ajouter une photo au défi !</p>
                    <Link to="/upload" className="btn-primary" style={{ marginTop: '24px' }}>
                        Ajouter ma photo
                    </Link>
                </div>
            ) : (
                <div className="gallery-grid">
                    {photos.filter(p => p.user_id === user.id).map((photo) => {
                        const ext = photo.image_path.split('.').pop().toLowerCase();
                        const isVideo = ['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'].includes(ext);
                        return (
                        <div key={photo.id} className="photo-card glass-card">
                            {isVideo ? (
                                <video src={`http://localhost:8000/uploads/${photo.image_path}`} controls style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />
                            ) : (
                                <img src={`http://localhost:8000/uploads/${photo.image_path}`} alt="Défi photo" />
                            )}
                            <div className="photo-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <UserIcon size={14} />
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{photo.user_name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8, fontSize: '0.8rem' }}>
                                    <Calendar size={12} />
                                    <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                                </div>
                                {photo.challenge_icon && (
                                    <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                                        {photo.challenge_icon} {photo.challenge_title}
                                    </div>
                                )}
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Gallery;
