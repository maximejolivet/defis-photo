import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Camera, Images, Upload, LogOut, Menu, X, Heart } from 'lucide-react';

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { to: '/gallery', label: 'Mes photos', icon: <Camera size={18} /> },
        { to: '/all-photos', label: 'Toutes les photos', icon: <Images size={18} /> },
        { to: '/upload', label: 'Réaliser un défi', icon: <Upload size={18} /> },
        { to: '/photo-libre', label: 'Photo libre', icon: <Heart size={18} /> },
    ];

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'var(--ground)',
            borderBottom: '1px solid var(--glass-border)',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
                {/* Logo */}
                <Link to="/gallery" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1 }}>
                        Défis photo<br />
                        <span style={{ fontFamily: 'var(--font-main)', fontSize: '0.75rem', fontWeight: '500', letterSpacing: 0, color: 'var(--text-muted)' }}>Soirée d'anniversaire</span>
                    </span>
                </Link>

                {/* Desktop links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="nav-desktop">
                    {links.map(({ to, label, icon }) => (
                        <Link
                            key={to}
                            to={to}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: '10px', textDecoration: 'none',
                                fontSize: '0.9rem', fontWeight: '500',
                                color: location.pathname === to ? 'var(--ink)' : 'var(--text)',
                                background: location.pathname === to ? 'var(--flash)' : 'transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            {icon}{label}
                        </Link>
                    ))}
                    {user && (
                        <button onClick={handleLogout} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                            fontSize: '0.9rem', fontWeight: '500', color: 'var(--text)',
                            background: 'transparent', border: 'none',
                            transition: 'all 0.2s',
                        }}>
                            <LogOut size={18} />Déconnexion
                        </button>
                    )}
                </div>

                {/* Hamburger */}
                <button
                    onClick={() => setOpen(!open)}
                    className="nav-hamburger"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '8px', display: 'none' }}
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="nav-mobile" style={{
                    borderTop: '1px solid var(--glass-border)',
                    padding: '12px 20px 16px',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                }}>
                    {links.map(({ to, label, icon }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '12px 16px', borderRadius: '10px', textDecoration: 'none',
                                fontSize: '0.95rem', fontWeight: '500',
                                color: location.pathname === to ? 'var(--ink)' : 'var(--text)',
                                background: location.pathname === to ? 'var(--flash)' : 'var(--surface)',
                            }}
                        >
                            {icon}{label}
                        </Link>
                    ))}
                    {user && (
                        <button onClick={handleLogout} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                            fontSize: '0.95rem', fontWeight: '500', color: 'var(--text)',
                            background: 'var(--surface)', border: 'none', textAlign: 'left',
                        }}>
                            <LogOut size={18} />Déconnexion
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
