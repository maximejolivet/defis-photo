# Défis Photo — API (Node/Express)

Réécriture de l'ancienne API PHP (`api_old/`, gardée uniquement comme référence, non déployée) en API REST Node.js/Express. Se connecte à la même base MySQL/MariaDB que l'ancienne API — aucune migration de données n'est nécessaire.

## Différences avec l'ancienne API PHP

- **Authentification par JWT** au lieu de faire confiance à un `user_id` envoyé en clair par le client. `POST /api/auth/login` renvoie un `token` ; les routes qui modifient des données (upload, delete, stats perso) exigent désormais `Authorization: Bearer <token>` et déduisent l'utilisateur du token, plus jamais d'un paramètre client.
- Les routes de lecture publique (`gallery`, `challenges/list`, `gamification/winner`) restent ouvertes, comme avant. `users/list` exige en revanche un token (écart volontaire avec les autres backends).
- Les hash de PIN restent du bcrypt standard (`bcryptjs`), donc les comptes déjà créés via l'ancienne API PHP continuent de fonctionner sans migration.

## Installation

```bash
cd api-express
npm install
cp .env.example .env   # renseigner DB_*, JWT_SECRET, CORS_ORIGINS (et ADMIN_* pour le back office)
npm run dev             # ou npm start en production
```

## Variables d'environnement

Voir `.env.example`. `JWT_SECRET` doit être une chaîne aléatoire longue, différente de tout autre projet — ne jamais la committer. `CORS_ORIGINS` (liste séparée par des virgules) restreint les origines autorisées ; sans lui, seul `http://localhost:5173` l'est. `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `ADMIN_COOKIE_SECRET` (32 caractères min.) activent le back office, désactivé s'ils sont absents.

## Base de données

Se connecte à la base existante (mêmes tables que l'ancienne API PHP) :

- `users (id, pseudo, password)` — `password` est un hash bcrypt.
- `photos (id, user_id, image_path, challenge_id, recipient_user_id, created_at)`
- `challenges (id, title, description, icon, sort_order)`
- `user_stats` (vue) — voir `api_old/migrations/002_gamification.sql` pour sa définition.

## Endpoints

| Méthode | Route                    | Auth | Description |
|---------|--------------------------|:----:|-------------|
| POST    | `/api/auth/register`     |  –   | Crée un utilisateur (`pseudo`, `pin` à 4 chiffres) |
| POST    | `/api/auth/login`        |  –   | Renvoie `{ token, user }` |
| GET     | `/api/challenges/list`   |  –   | Liste des défis |
| GET     | `/api/users/list`        |  ✅  | Liste des utilisateurs |
| GET     | `/api/photos/gallery`    |  –   | Toutes les photos |
| POST    | `/api/photos/upload`     |  ✅  | Upload (`multipart/form-data`, champ `photo`, `challenge_id`/`recipient_user_id` optionnels) |
| POST    | `/api/photos/delete`     |  ✅  | `{ photo_id }` — supprime une photo de l'utilisateur authentifié |
| GET     | `/api/gamification/stats`|  ✅  | Stats de l'utilisateur authentifié + classement top 10 |
| GET     | `/api/gamification/winner`| –  | Premier utilisateur à avoir complété 8 défis |

## Upload de fichiers

Les fichiers sont stockés sur disque dans `api-express/uploads/` et servis statiquement sur `/uploads/<nom>`. Le type MIME doit figurer dans une liste blanche et l'extension du fichier stocké en est déduite (jamais du nom envoyé par le client), et `/uploads` est servi avec `X-Content-Type-Options: nosniff` et une CSP `sandbox`. Les images sont converties en JPEG via `sharp` (best-effort : en cas d'échec — notamment HEIC/DNG selon la build de `libvips` disponible — le fichier original est conservé tel quel, comme le faisait l'ancienne API PHP en fallback).

Ceci suppose un process Node long-running avec disque persistant (déploiement sur le même hébergement mutualisé que l'ancienne API, via l'outil "Setup Node.js App" de cPanel ou équivalent). Un déploiement serverless (Vercel, etc.) nécessiterait un stockage objet externe (S3, Vercel Blob) à la place du disque local.

## Sécurité

- `POST /api/auth/login` : 5 échecs par 15 minutes et par couple (IP, pseudo) ; `POST /api/auth/register` : 20 par heure et par IP (`express-rate-limit`). `trust proxy` est activé pour lire l'IP réelle derrière Traefik.
- En-têtes de sécurité via `helmet` (avec `Cross-Origin-Resource-Policy: cross-origin` pour que le frontend, sur une autre origine, charge les images de `/uploads`).

## Back office (AdminJS)

Disponible sur `/admin` (http://api-express.localhost:8088/admin en local), défini dans `src/admin.js` : il lit `users`, `challenges` et `photos` directement dans MariaDB via `@adminjs/sql`, sans modèle. Un seul compte, configuré par `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Les mots de passe saisis dans l'admin sont hachés en bcrypt (coût 10) pour rester compatibles avec `/api/auth/login`. `node --watch` ne voit pas les changements de fichiers à travers le bind mount Colima : après une modification de `src/admin.js` ou `src/admin-components/`, faire `docker compose restart api-express`.
