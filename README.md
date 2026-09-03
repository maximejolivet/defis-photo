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

## Stack

- [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- [React Router v7](https://reactrouter.com/) pour la navigation
- [Framer Motion](https://www.framer.com/motion/) pour les animations
- [Lucide React](https://lucide.dev/) pour les icônes
- [heic2any](https://github.com/alexcorvi/heic2any) pour convertir les photos HEIC (iPhone) côté client

Pas de TypeScript — projet en JavaScript/JSX pur.

## Fonctionnement

L'application est une SPA 100% front-end : toutes les données (authentification, photos, classement, uploads) proviennent d'une API PHP externe hébergée séparément. Il n'y a pas de backend dans ce dépôt et pas de variables d'environnement — les URLs de l'API sont codées en dur dans les pages.

L'authentification est simple : l'utilisateur est stocké dans le `localStorage` du navigateur (voir `src/context/AuthContext.jsx`), sans token ni session côté serveur.

## Structure

```
src/
  pages/        # Login, Register, Gallery, Upload, AllPhotos, FreeUpload, Diaporama
  components/   # Navbar, Footer, Leaderboard, ProgressPanel, ChallengeSelector, WinnerBanner, BirthdayConfetti
  context/      # AuthContext (session utilisateur en localStorage)
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

## Déploiement

Déployé sur [Vercel](https://vercel.com/). `vercel.json` redirige toutes les routes vers `/index.html` pour le routage côté client (SPA).

Le déploiement en production se fait via GitHub Actions (`.github/workflows/deploy.yml`) : chaque push sur `master` build et déploie avec le CLI Vercel, ce qui donne un historique de déploiement consultable dans l'onglet Actions du repo. Le workflow a besoin de trois secrets GitHub : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
