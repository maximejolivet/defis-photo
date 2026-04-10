import React, { useEffect, useRef } from 'react';

const COLORS = ['#e8638c', '#f59e0b', '#a855f7', '#10b981', '#3b82f6', '#f97316', '#ec4899', '#d4a843', '#84cc16', '#ef4444', '#06b6d4'];
const SHAPES = ['circle', 'rect', 'ribbon', 'rect', 'circle'];
const EMOJIS = ['🎈', '🎁', '📷', '🎀', '🎊', '🎉', '🎈', '🎁', '📸', '🎈'];
const EMOJI_COUNT = 20;
const SLOT = 100 / EMOJI_COUNT;

const confettiData = Array.from({ length: 70 }, (_, i) => ({
  left: (i * 1.45 + (i % 8) * 2.9) % 100,
  color: COLORS[i % COLORS.length],
  shape: SHAPES[i % SHAPES.length],
  size: 5 + (i % 6) * 2.2,
  delay: (i * 0.19) % 5,
  duration: 12 + (i % 7) * 2,
  drift: ((i % 11) - 5) * 28,
  startY: -((i % 7) * 16 + 8),
}));

const emojiData = Array.from({ length: EMOJI_COUNT }, (_, i) => ({
  emoji: EMOJIS[i % EMOJIS.length],
  left: i * SLOT + SLOT / 2 + (i % 3 - 1) * 1.2,
  size: 20 + (i % 4) * 7,
  delay: (i * 0.6) % 8,
  duration: 10 + (i % 5) * 1.8,
  drift: ((i % 3) - 1) * (SLOT * 0.35),
  isBalloon: i % EMOJIS.length === 0 || i % EMOJIS.length === 7,
}));

export default function Diaporama() {
  const confettiRef = useRef(null);

  useEffect(() => {
    // Inject keyframes
    let cssRules = '';
    confettiData.forEach((p, i) => {
      cssRules += `
        @keyframes diaFall${i} {
          0%   { transform: translateX(0px) translateY(${p.startY}px) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.75; }
          80%  { opacity: 0.75; }
          100% { transform: translateX(${p.drift}px) translateY(110vh) rotate(360deg); opacity: 0; }
        }`;
    });
    emojiData.forEach((p, i) => {
      if (p.isBalloon) {
        cssRules += `
        @keyframes diaRise${i} {
          0%   { transform: translateX(0px) translateY(110vh); opacity: 0; }
          10%  { opacity: 0.55; }
          40%  { transform: translateX(${p.drift * 0.4}px) translateY(60vh); opacity: 0.55; }
          70%  { transform: translateX(${-p.drift * 0.3}px) translateY(20vh); opacity: 0.55; }
          90%  { opacity: 0.55; }
          100% { transform: translateX(${p.drift * 0.2}px) translateY(-10vh); opacity: 0; }
        }`;
      } else {
        cssRules += `
        @keyframes diaDrop${i} {
          0%   { transform: translateX(0px) translateY(0) rotate(-8deg) scale(0.9); opacity: 0; }
          10%  { opacity: 0.55; }
          80%  { opacity: 0.55; }
          100% { transform: translateX(${p.drift}px) translateY(110vh) rotate(10deg) scale(1); opacity: 0; }
        }`;
      }
    });

    const styleEl = document.createElement('style');
    styleEl.id = 'diaporama-keyframes';
    styleEl.textContent = cssRules;
    document.head.appendChild(styleEl);

    // Build confetti elements
    const container = confettiRef.current;
    if (!container) return;

    confettiData.forEach((p, i) => {
      const el = document.createElement('div');
      const isRibbon = p.shape === 'ribbon';
      const w = isRibbon ? Math.max(3, p.size * 0.32) : p.size;
      const h = isRibbon ? p.size * 2.6 : p.size;
      el.style.cssText = `position:absolute;left:${p.left}%;top:0;width:${w}px;height:${h}px;border-radius:${p.shape === 'circle' ? '50%' : '2px'};background:${p.color};animation:diaFall${i} ${p.duration}s ${p.delay}s infinite linear;`;
      container.appendChild(el);
    });

    emojiData.forEach((p, i) => {
      const el = document.createElement('div');
      el.textContent = p.emoji;
      const anim = p.isBalloon ? `diaRise${i}` : `diaDrop${i}`;
      el.style.cssText = `position:absolute;left:${p.left}%;top:0;font-size:${p.size}px;line-height:1;user-select:none;animation:${anim} ${p.duration}s ${p.delay}s infinite ease-in-out;`;
      container.appendChild(el);
    });

    return () => {
      document.getElementById('diaporama-keyframes')?.remove();
    };
  }, []);

  return (
    <>
      <style>{`
        .dia-body {
          background: #0e0208;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        .dia-slide {
          width: 1920px;
          height: 1080px;
          background: #1a0510;
          background-image:
            radial-gradient(at 0%   0%,   #4a0a30 0, transparent 50%),
            radial-gradient(at 100% 0%,   #35082a 0, transparent 45%),
            radial-gradient(at 50%  100%, #150310 0, transparent 55%),
            radial-gradient(at 100% 100%, #3d0a28 0, transparent 45%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: stretch;
        }

        .dia-slide::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle 2px   at 8%  15%, rgba(232,99,140,0.5)  0%, transparent 100%),
            radial-gradient(circle 1.5px at 22% 65%, rgba(212,168,67,0.4)  0%, transparent 100%),
            radial-gradient(circle 3px   at 78% 20%, rgba(247,179,204,0.4) 0%, transparent 100%),
            radial-gradient(circle 1.5px at 88% 80%, rgba(212,168,67,0.4)  0%, transparent 100%),
            radial-gradient(circle 2px   at 95% 10%, rgba(232,99,140,0.5)  0%, transparent 100%),
            radial-gradient(circle 1.5px at 15% 90%, rgba(212,168,67,0.3)  0%, transparent 100%),
            radial-gradient(circle 2.5px at 55% 45%, rgba(247,179,204,0.3) 0%, transparent 100%),
            radial-gradient(circle 1.5px at 40% 78%, rgba(232,99,140,0.3)  0%, transparent 100%),
            radial-gradient(circle 1px   at 65% 92%, rgba(212,168,67,0.35) 0%, transparent 100%),
            radial-gradient(circle 2px   at 32% 30%, rgba(247,179,204,0.3) 0%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        .dia-deco-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .dia-deco-1 {
          width: 600px; height: 600px;
          top: -200px; right: -200px;
          background: radial-gradient(circle, rgba(232,99,140,0.1) 0%, transparent 70%);
        }
        .dia-deco-2 {
          width: 480px; height: 480px;
          bottom: -160px; left: -160px;
          background: radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%);
        }

        .dia-confetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        /* ── Colonne gauche ── */
        .dia-left {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 80px 60px 100px;
          gap: 28px;
          position: relative;
          z-index: 1;
        }

        .dia-badge {
          font-size: 1rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #d4a843;
          font-weight: 700;
          border: 1px solid rgba(212,168,67,0.4);
          border-radius: 999px;
          padding: 10px 28px;
        }

        .dia-photo-ring {
          width: 190px; height: 190px;
          border-radius: 50%;
          padding: 4px;
          background: linear-gradient(135deg, #e8638c, #d4a843, #e8638c);
          filter: drop-shadow(0 0 24px rgba(232,99,140,0.4));
          flex-shrink: 0;
        }
        .dia-photo-inner {
          width: 100%; height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: #2a0518;
        }
        .dia-photo-inner img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
        }

        .dia-title-block { text-align: center; }
        .dia-title {
          font-family: 'Playfair Display', serif;
          font-size: 4.2rem;
          font-weight: 900;
          color: #fde8f0;
          line-height: 1.05;
          margin-bottom: 10px;
        }
        .dia-title em { font-style: italic; color: #e8638c; }
        .dia-subtitle {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          font-style: italic;
          color: #d4a843;
          letter-spacing: 0.02em;
        }

        .dia-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          width: 100%;
        }
        .dia-chip {
          background: rgba(58,10,38,0.75);
          border: 1px solid rgba(232,99,140,0.25);
          border-radius: 10px;
          padding: 10px 8px;
          text-align: center;
          backdrop-filter: blur(8px);
        }
        .dia-chip-icon { font-size: 3rem; display: block; }

        /* ── Séparateur ── */
        .dia-sep {
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(212,168,67,0.5), transparent);
          align-self: stretch;
          margin: 60px 0;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        /* ── Colonne droite ── */
        .dia-right {
          flex: 0.8;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 100px 60px 80px;
          gap: 28px;
          position: relative;
          z-index: 1;
        }

        .dia-qr-label {
          font-size: 1.6rem;
          font-weight: 700;
          color: #fde8f0;
          text-align: center;
        }

        .dia-qr-box {
          width: 340px; height: 340px;
          background: #fff;
          border-radius: 18px;
          padding: 10px;
          filter: drop-shadow(0 0 32px rgba(255,255,255,0.15));
          flex-shrink: 0;
        }
        .dia-qr-box img { width: 100%; height: 100%; display: block; }

        .dia-qr-desc { text-align: center; }
        .dia-qr-desc p {
          font-size: 1.1rem;
          color: rgba(253,232,240,0.65);
          line-height: 1.6;
          margin-bottom: 12px;
        }

        /* ── Ligne bas ── */
        .dia-bottom {
          position: absolute;
          bottom: 28px;
          left: 0; right: 0;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 0 80px;
          z-index: 1;
        }
        .dia-bottom::before,
        .dia-bottom::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(212,168,67,0.35), transparent);
        }
        .dia-bottom span {
          font-size: 0.85rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(212,168,67,0.55);
          white-space: nowrap;
        }
      `}</style>

      <div className="dia-body">
        <div className="dia-slide" style={{ fontSize: '26px' }}>
          <div className="dia-confetti" ref={confettiRef} />
          <div className="dia-deco-circle dia-deco-1" />
          <div className="dia-deco-circle dia-deco-2" />

          {/* Colonne gauche */}
          <div className="dia-left">
            <div className="dia-badge">🎉 Soirée anniversaire 🎉</div>

            <div className="dia-photo-ring">
              <div className="dia-photo-inner">
                <img
                  src="/ophelie.jpg"
                  alt="Ophélie"
                  onError={e => { e.currentTarget.parentElement.style.background = 'linear-gradient(135deg,#3d0a28,#1a0510)'; }}
                />
              </div>
            </div>

            <div className="dia-title-block">
              <h1 className="dia-title">Les défis photo<br />d'<em>Ophélie</em></h1>
              <p className="dia-subtitle">30 ans !</p>
            </div>

            <div className="dia-grid">
              {['🥂', '👑', '🚀', '3️⃣0️⃣', '💛', '📷', '🎭', '🌅'].map((icon) => (
                <div className="dia-chip" key={icon}>
                  <span className="dia-chip-icon">{icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Séparateur */}
          <div className="dia-sep" />

          {/* Colonne droite */}
          <div className="dia-right">
            <p className="dia-qr-label">📱 Scanne pour participer</p>

            <div className="dia-qr-box">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=https%3A%2F%2Fdefis-photo.vercel.app%2F&bgcolor=ffffff&color=1a0510&margin=4&qzone=1"
                alt="QR Code"
              />
            </div>

            <div className="dia-qr-desc">
              <p>Inscris-toi, prends tes photos<br />et rejoins la galerie en direct&nbsp;!</p>
              <p style={{ marginTop: '12px', color: '#d4a843', fontWeight: 600 }}>
                Le premier à faire tous les défis<br /> sans tricher aura un cadeau&nbsp;! 🎁
              </p>
            </div>
          </div>

          <div className="dia-bottom">
            <span>📸 Bonne chance à tous 📸</span>
          </div>
        </div>
      </div>
    </>
  );
}
