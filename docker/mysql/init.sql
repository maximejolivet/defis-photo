-- Schéma local pour le stack Docker (dev/comparaison des 4 API).
-- Reconstruit à partir des requêtes des 4 backends + api_old/migrations/002_gamification.sql
-- (les migrations 001 pour users/photos n'existaient pas dans api_old, reconstruites ici).
-- N'a aucun rapport avec la base de production réelle sur l'hébergement mutualisé.

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(500) NOT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '📷',
    sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO challenges (title, description, icon, sort_order) VALUES
('L''heure dorée',      'Une photo prise pendant le golden hour (1h après le lever ou avant le coucher du soleil).', '🌅', 1),
('Reflet',              'Capturer un reflet — dans l''eau, un miroir, une vitre ou n''importe quelle surface réfléchissante.', '🪞', 2),
('Minuscule',           'Mettre en valeur quelque chose de tout petit : un insecte, une goutte d''eau, un détail oublié.', '🔬', 3),
('Lignes et géométrie', 'Une composition dominée par des lignes droites, courbes, ou des formes géométriques.', '📐', 4),
('Monochrome',          'Une photo en noir et blanc, ou dans un seul ton dominant.', '⬛', 5),
('Mouvement flou',      'Capturer le mouvement avec un flou de bougé intentionnel (voiture, eau, foule…).', '💨', 6),
('Portrait de rue',     'Un portrait ou une scène de vie authentique dans un espace public.', '🧍', 7),
('Nature morte',        'Composer une scène avec des objets du quotidien, agencés de façon artistique.', '🍎', 8),
('Contre-jour',         'Photographier un sujet en silhouette avec la source lumineuse derrière lui.', '🌓', 9),
('Architecture cachée', 'Un détail architectural inattendu ou d''habitude ignoré.', '🏛️', 10);

CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    challenge_id INT NULL,
    recipient_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_photos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_photos_challenge FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL,
    CONSTRAINT fk_photos_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id                                    AS user_id,
    u.pseudo,
    COUNT(p.id)                             AS photo_count,
    COUNT(DISTINCT p.challenge_id)          AS challenges_completed,
    COUNT(p.id) * 10
        + COUNT(DISTINCT p.challenge_id) * 20 AS total_points
FROM users u
LEFT JOIN photos p ON p.user_id = u.id
GROUP BY u.id, u.pseudo;
