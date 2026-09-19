# Sécurité

![npm audit](https://img.shields.io/badge/npm%20audit-0%20vulnerabilities-brightgreen)
[![Security Policy](https://img.shields.io/badge/security%20policy-see%20below-informational)](#signalement-dune-vulnérabilité)

## Signalement d'une vulnérabilité

> [!NOTE]
> Ce dépôt est un projet personnel, sans processus de disclosure formel. Pour signaler un problème de sécurité, contacter directement le mainteneur plutôt que d'ouvrir une issue publique.

## État des audits de dépendances

### Frontend (`npm audit`)

```
found 0 vulnerabilities
```

Les dépendances (`react`, `react-router-dom`, `vite`, `eslint`...) sont à jour ; les avis précédemment ouverts sur `react-router`/`react-router-dom` et `vite` sont résolus.

## Authentification

L'application appelle une API REST (`src/api/client.js`) : par défaut l'API PHP de production, hébergée séparément, ou une des API locales du stack de comparaison via `VITE_API_BASE_URL`. L'authentification est par **JWT** : `login` renvoie `{ user, token }`, stockés dans le `localStorage` (`src/context/AuthContext.jsx`) et envoyés en `Authorization: Bearer` à chaque requête. Le stockage en `localStorage` expose le token à une éventuelle faille XSS du frontend ; les routes protégées du front ne vérifient que la présence d'un utilisateur — toute vérification réelle des droits est faite par l'API.

## API locales (stack de comparaison)

Les quatre API (`api-express`, `api-nestjs`, `api-laravel`, `api-symfony`) et le back office AdminJS ne tournent qu'en local, derrière Traefik, et ne sont **pas** déployés.

- Les ports publiés (`8088`, `8081`, `3306`) sont liés à `127.0.0.1` : le stack n'est pas joignable depuis le réseau local.
- Les identifiants de dev sont volontairement triviaux (`admin@local.dev` / `admin`, MariaDB `root`/`root`, secrets JWT « local-dev ») : ne jamais les réutiliser ailleurs.

### Durcissement d'`api-express` (seul backend audité)

- Uploads : le type MIME doit figurer dans une liste blanche et l'extension du fichier stocké en est déduite (jamais du nom envoyé par le client) ; `/uploads` est servi avec `X-Content-Type-Options: nosniff` et une CSP `sandbox`.
- `POST /api/auth/login` : 5 échecs par 15 min et par couple (IP, pseudo) — le PIN n'a que 10 000 combinaisons. `POST /api/auth/register` : 20 créations par heure et par IP.
- `GET /api/users/list` exige un token (les trois autres backends la laissent publique).
- CORS limité à `CORS_ORIGINS` (à défaut `http://localhost:5173`) et en-têtes `helmet` ; l'interface `/admin` est montée avant `helmet`, dont la CSP par défaut casserait AdminJS.

### Non audité / connu

- `api-nestjs`, `api-laravel` et `api-symfony` n'ont pas été relus. En particulier `api-nestjs` autorise encore toutes les origines CORS si `CORS_ORIGINS` est vide et n'a ni limitation de débit ni `helmet`.
- `npm audit` sur `api-express` : 41 vulnérabilités (40 modérées, 1 haute — `tinymce`, tirée par AdminJS). Le correctif proposé (`--force`) rétrograde AdminJS en 6.x et casse le back office ; le risque est limité car AdminJS n'écoute qu'en local.

## Secrets

Aucun secret dans le code du frontend. `VITE_API_BASE_URL` est une URL publique, pas un identifiant, et `.env*` est ignoré par git. L'URL de l'API de production (`https://photo.jolivetmaxime.fr`) est un endpoint public codé en dur comme valeur par défaut dans `src/config.js`.

Les valeurs `JWT_SECRET`, `ADMIN_PASSWORD`… de `docker-compose.yml` sont des valeurs de développement local, pas des secrets.

Le déploiement (`.github/workflows/deploy.yml`) utilise trois secrets GitHub Actions — `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — stockés côté GitHub, jamais versionnés.
