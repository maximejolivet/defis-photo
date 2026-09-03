# Sécurité

![npm audit](https://img.shields.io/badge/npm%20audit-13%20vulnerabilities-red)
[![Security Policy](https://img.shields.io/badge/security%20policy-see%20below-informational)](#signalement-dune-vulnérabilité)

## Signalement d'une vulnérabilité

> [!NOTE]
> Ce dépôt est un projet personnel, sans processus de disclosure formel. Pour signaler un problème de sécurité, contacter directement le mainteneur plutôt que d'ouvrir une issue publique.

## État des audits de dépendances

### Frontend (`npm audit`)

```
13 vulnerabilities (2 low, 1 moderate, 10 high)
```

Les avis concernent `react-router`/`react-router-dom` (SSR/RSC, CSRF, DoS — modes non utilisés par cette SPA 100% client) et `vite` (essentiellement le serveur de dev, non embarqué dans le build de production). Correctifs disponibles via `npm audit fix`, pas encore appliqués.

## Authentification

Il n'y a pas de backend dans ce dépôt : toutes les données transitent par une API PHP externe, hébergée séparément. Côté frontend, l'authentification est volontairement simple : l'utilisateur est stocké dans le `localStorage` du navigateur (`src/context/AuthContext.jsx`), sans token ni validation de session — les routes protégées vérifient seulement la présence d'un utilisateur en mémoire. Toute vérification réelle des droits doit être assurée côté API.

## Secrets

Aucun secret dans ce dépôt : pas de variables d'environnement, pas de clé d'API. Les URLs de l'API externe (`https://photo.jolivetmaxime.fr/...`) sont des endpoints publics codés en dur, pas des identifiants.
