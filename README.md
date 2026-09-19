# Défis Photo

[![Deploy to Vercel](https://github.com/maximejolivet/defis-photo/actions/workflows/deploy.yml/badge.svg)](https://github.com/maximejolivet/defis-photo/actions/workflows/deploy.yml)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7.18-CA4245?logo=reactrouter&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-13-0055FF?logo=framer&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ESNext-F7DF1E?logo=javascript&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)

Application web (React + Vite) de défis photo entre participants : inscription, upload de photos, galerie, classement et diaporama.

<p align="center">
  <a href="https://github.com/maximejolivet"><img src="docs/maxime.svg" width="96" height="96" alt="Maxime Jolivet"></a>
</p>
<p align="center">
  Contribué par <a href="https://github.com/maximejolivet"><strong>Maxime</strong></a> · orchestré avec <a href="https://claude.com/claude-code"><strong>Claude Code</strong></a>
</p>

## Stack frontend

- [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- [React Router v7](https://reactrouter.com/) pour la navigation
- [Framer Motion](https://www.framer.com/motion/) pour les animations
- [Lucide React](https://lucide.dev/) pour les icônes
- [heic2any](https://github.com/alexcorvi/heic2any) pour convertir les photos HEIC (iPhone) côté client

Pas de TypeScript — projet en JavaScript/JSX pur.

## Fonctionnement

L'application est une SPA 100% front-end : toutes les données (authentification, photos, classement, uploads) proviennent d'une API REST, appelée via `apiFetch` (`src/api/client.js`) qui préfixe l'URL avec `API_BASE_URL` (`src/config.js`).

- `API_BASE_URL` vaut `VITE_API_BASE_URL` si la variable est définie, sinon l'API PHP de production (`https://photo.jolivetmaxime.fr`). Vite l'injecte au démarrage du serveur / au build.
- L'authentification est par **JWT** : `login` / `register` renvoient `{ user, token }`, stockés ensemble dans le `localStorage` (voir `src/context/AuthContext.jsx`), et `apiFetch` envoie le token en `Authorization: Bearer`. Les routes protégées du front vérifient seulement la présence d'un utilisateur ; le contrôle réel des droits est fait par l'API à chaque requête.

## Structure

```
src/
  pages/        # Login, Register, Gallery, Upload, AllPhotos, FreeUpload, Diaporama
  components/   # Navbar, Footer, ProgressPanel, ChallengeSelector, WinnerBanner, BirthdayConfetti
  context/      # AuthContext (provider), authState (objet contexte), useAuth (hook)
  api/          # client.js : apiFetch (base URL + token JWT)
  config.js     # API_BASE_URL
  App.jsx       # Déclaration des routes
public/
  diaporama.html  # Diaporama HTML statique (indépendant de src/pages/Diaporama.jsx)
```

## Développement

```bash
npm install     # installer les dépendances
npm run dev     # lancer le serveur de dev (http://localhost:5173)
npm run lint    # vérifier le code avec ESLint
npm run build   # build de production
npm run preview # prévisualiser le build
```

Pour pointer le serveur de dev vers une autre API, définir `VITE_API_BASE_URL` (par exemple dans `.env.development.local`, ignoré par git : `VITE_API_BASE_URL=http://api-express.localhost:8088`), puis relancer `npm run dev`.

## Déploiement

Déployé sur [Vercel](https://vercel.com/). `vercel.json` redirige toutes les routes vers `/index.html` pour le routage côté client (SPA).

Le déploiement en production se fait via GitHub Actions (`.github/workflows/deploy.yml`) : chaque push sur `master` build et déploie avec le CLI Vercel, ce qui donne un historique de déploiement consultable dans l'onglet Actions du repo. Le workflow a besoin de trois secrets GitHub : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Stack backend (comparaison, local, hors production)

![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-12.0-E0234E?logo=nestjs&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-13.17-FF2D20?logo=laravel&logoColor=white)
![Symfony](https://img.shields.io/badge/Symfony-8.1-000000?logo=symfony&logoColor=white)

Le repo contient aussi, indépendamment de l'app ci-dessus, quatre réécritures de la même API REST — Express (`api-express/`), NestJS (`api-nestjs/`), Laravel (`api-laravel/`), Symfony (`api-symfony/`) — dans un but d'apprentissage/comparaison entre technos backend. Elles partagent une seule base MariaDB et tournent en local derrière Traefik (routage par domaine), pilotées par `docker-compose.yml`.

```bash
make up       # build + démarre tout le stack (Traefik, 4 API, frontend, MySQL)
make infos    # liste toutes les URLs et commandes disponibles
make db-init  # (ré)applique le schéma et le seed de docker/mysql/init.sql
make down     # arrête le stack
```

Nécessite [Colima](https://github.com/abiosoft/colima) (`colima start`) ou tout runtime Docker compatible. Les ports publiés (Traefik `8088`, dashboard `8081`, MariaDB `3306`) ne sont liés qu'à `127.0.0.1`. Le frontend du stack Docker est branché sur l'API Express (`VITE_API_BASE_URL` dans `docker-compose.yml`).

**Back office AdminJS** : Express (http://api-express.localhost:8088/admin) et NestJS (http://api-nest.localhost:8088/admin) exposent chacun un back office pour gérer utilisateurs, défis et photos. Connexion : `admin@local.dev` / `admin` (identifiants de dev, définis dans `docker-compose.yml`). Comme la base est partagée, les deux voient les mêmes données.

Trois outils pour explorer/comparer les 4 API :
- **[Bruno](https://www.usebruno.com/)** (`make bruno`) : collection de requêtes (`bruno/`), un environnement par backend — pour tester une requête en détail ou un scénario à plusieurs étapes (register → login → upload). Le comportement connu de chaque backend est résumé dans `bruno/README.md`.
- **Comparateur navigateur** (`make compare`) : `public/api-compare.html`, envoie la même requête aux 4 API en parallèle et affiche les réponses côte à côte — pour repérer une divergence de comportement rapidement.
- **Docs API / Swagger UI** (`make docs`) : `public/api-docs.html`, génère une doc interactive à partir de `public/openapi.yaml` (spec écrite à la main — aucun des 4 backends ne génère de Swagger) avec un sélecteur de serveur et un bouton "Try it out".

Voir `CLAUDE.md` pour les gotchas connus de ce stack (migrations Laravel, driver de session, init du schéma MySQL) et `SECURITY.md` pour l'état de la sécurité.
