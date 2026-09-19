# Défis Photo — API (NestJS)

Même API que [`api-express/`](../api-express), réécrite en NestJS — à but de comparaison/apprentissage. Se connecte à la même base MySQL/MariaDB, aucune migration nécessaire. Voir `api-express/README.md` pour le détail des endpoints et du schéma de base — ils sont identiques ici.

## Différences avec la version Express

- Architecture en modules Nest (`AuthModule`, `PhotosModule`, etc.) avec injection de dépendances au lieu d'imports directs.
- JWT géré via `@nestjs/passport` + `passport-jwt` (stratégie standard Nest) au lieu d'un middleware fait main.
- Erreurs via les exceptions HTTP natives de Nest (`BadRequestException`, `UnauthorizedException`, ...) au lieu de `res.status().json()` manuel — la forme de la réponse d'erreur diffère donc légèrement (`{ statusCode, message, error }` au lieu de `{ message }`), mais le champ `message` reste présent.
- Port par défaut différent (`3002` au lieu de `3001`) pour pouvoir tourner en parallèle de `api-express/` en local.

## Installation

```bash
cd api-nestjs
npm install
cp .env.example .env   # renseigner DB_*, JWT_SECRET (différent de celui de api-express), CORS_ORIGINS (et ADMIN_* pour le back office)
npm run dev             # ou npm run build && npm start en production
```

## Back office (AdminJS)

Disponible sur `/admin` (http://api-nest.localhost:8088/admin en local), avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_COOKIE_SECRET` ; désactivé s'ils sont absents. Le code (`src/admin/admin.mjs`) est une copie de celui d'`api-express` — le garder synchronisé. AdminJS n'existe qu'en ESM alors que le projet compile en CommonJS : `main.ts` le charge via un vrai `import()` dynamique (`importEsm`) et `nest-cli.json` copie les fichiers `.mjs` / `.jsx` (ignorés par `tsc`) dans `dist/`. Il est monté avant les body parsers de Nest, car AdminJS parse lui-même ses requêtes. Pas de bind mount dans Docker : toute modification demande `docker compose up -d --build api-nest`.
