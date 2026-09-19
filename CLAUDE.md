# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 + Vite 7, plain JavaScript/JSX (no TypeScript — `@types/react*` are editor-support only). React Router v7 for routing. Also used: `framer-motion` (animations), `lucide-react` (icons), `heic2any` (HEIC→JPEG conversion for iPhone photo uploads).

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint (flat config in `eslint.config.js`)
- `npm run preview` — preview the production build

There is no test suite in this repo.

## Architecture

This is a client-only SPA ("Défis photo", a birthday photo-challenge app) deployed to Vercel (`vercel.json` just rewrites everything to `/index.html` for client-side routing).

- All data (auth, photos, gallery, leaderboard, uploads) comes from a backend API, called through `src/api/client.js` (`apiFetch`), which prepends `API_BASE_URL` (`src/config.js`) and attaches the JWT from `localStorage` as a `Bearer` token. `API_BASE_URL` reads `import.meta.env.VITE_API_BASE_URL`, falling back to the production PHP backend at `https://photo.jolivetmaxime.fr` when unset. Vite inlines this at dev-server start/build time from the launching process's env — `npm run dev` on the host has no `VITE_API_BASE_URL` set, so it hits the PHP backend; `docker-compose.yml` sets it to `http://api-express.localhost:8088` for the `frontend` container, so the dockerized stack talks to the local Express API instead.
- Auth is JWT-based: login/register hit `/api/auth/...` on whichever backend `API_BASE_URL` points to, and the returned `{ user, token }` is stored together in `localStorage` via `AuthContext`; `apiFetch` reads the token back out and sends it as `Authorization: Bearer`. Protected routes still just check truthiness of the stored user client-side — there's no real session validation beyond what the backend enforces per-request.
- `src/App.jsx` defines the router and protected routes: `/login`, `/register`, `/gallery`, `/upload`, `/all-photos`, `/photo-libre`, `/diaporama`, with `/` redirecting to `/gallery`.

## Gotcha: two unrelated "diaporama" files

- `src/pages/Diaporama.jsx` is a React page (part of the router).
- `public/diaporama.html` is a separate static standalone HTML slideshow, not related to the React page.

Confirm which one is meant before editing "the diaporama."

## Local backend comparison stack (api-express / api-nestjs / api-laravel / api-symfony)

The deployed app above uses the external PHP API — that hasn't changed. Separately, this repo also contains a **local-only, learning/comparison stack**: four rewrites of the same REST API (Node/Express, NestJS, Laravel, Symfony) sharing one MariaDB database, meant to compare backend techs, not to replace the production PHP API.

- `docker-compose.yml` + `docker/` run the whole thing behind Traefik, routed by domain (`frontend.localhost`, `api-express.localhost`, `api-nest.localhost`, `api-laravel.localhost`, `api-symfony.localhost`, all on port `8088`). See `make infos` for the full URL list, or `README.md` for setup.
- This machine uses **Colima**, not Docker Desktop, as the Docker runtime — `colima start` before `make up` if `docker info` fails.
- `api-express` and `api-nestjs` both mount an **AdminJS** back office at `/admin` (Express: `api-express/src/admin.js`; NestJS: `api-nestjs/src/admin/admin.mjs`, a copy of it — keep the two in sync), reading `users`/`challenges`/`photos` straight from MariaDB via `@adminjs/sql` (no ORM models). Login is a single env-based account (`ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_COOKIE_SECRET`; disabled if unset) — there's no `role` column since the DB is shared with the other 3 backends. Passwords typed in the admin are bcrypt-hashed (cost 10) by a hook to stay compatible with `/api/auth/login`. After adding npm deps to `api-express`, rebuild with `docker compose up -d --build --renew-anon-volumes api-express`, otherwise the old `node_modules` anonymous volume shadows the new packages. `node --watch` doesn't see file changes through the Colima bind mount, so after editing `admin.js` or `admin-components/*` run `docker compose restart api-express`. On NestJS, AdminJS is ESM-only while the project compiles to CommonJS, so `main.ts` loads `admin.mjs` through a real dynamic `import()` (the `importEsm` wrapper) and `nest-cli.json` copies the `.mjs`/`.jsx` files into `dist`; there is no bind mount, so any change needs `docker compose up -d --build api-nest`. `admin.js` also monkey-patches `@adminjs/sql`'s `Resource.prototype.filterQuery` (its MySQL text filter adds `COLLATE utf8_bin`, which fails on utf8mb4 → 500) — re-check whether it's still needed if that package is upgraded.
- `bruno/` is a Bruno API collection (one environment per backend) for exploring/testing requests manually — see `bruno/README.md`, which also records the verified per-backend behavior (status-code differences, and the currently broken Laravel authenticated routes, Laravel login of bcryptjs-hashed accounts and Symfony upload). The requests have no assertions, so `bru run` says PASS even on a 500.
- `public/api-compare.html` (`make compare`) fires the same request at all 4 backends in parallel and renders the responses side by side — faster than Bruno for spotting a divergence between implementations, but Bruno is better for a deep look at one request (e.g. `photos/upload`).
- `public/api-docs.html` (`make docs`) is a Swagger UI reading `public/openapi.yaml` — a hand-written spec of the shared contract (not auto-generated by any of the 4 backends, none of them have Swagger/OpenAPI tooling installed). Server dropdown switches between the 4 backends; keep it in sync by hand if an endpoint's shape changes.
- Gotcha: the 4 backends share one MySQL `users` table with a `UNIQUE(pseudo)` constraint — registering the same pseudo against more than one backend races, and only one insert wins. all four now return a clean 409 on the losers (Laravel used to return a raw `500`).
- Gotcha: `docker-entrypoint-initdb.d/init.sql` (schema + seed data) only runs the first time the `mysql_data` volume is created. If that volume already exists without the full schema, `make up` won't fix it — run `make db-init` to (re)apply `docker/mysql/init.sql` (idempotent `CREATE TABLE IF NOT EXISTS`).
- Gotcha: `api-laravel` deliberately ships with no migrations (see `api-laravel/README.md` — it consumes the existing schema from `init.sql`, doesn't create one). It needs `SESSION_DRIVER=file` (set in `docker-compose.yml`) — without it, Laravel 11's config default (`database`) makes it try to read a `sessions` table that doesn't exist, and every request 500s.

## Git conventions

- Commit directly to `master` — no feature-branch/PR workflow is used in this repo.
- Commit messages are short, imperative, capitalized (e.g. "Add BirthdayConfetti and refactor WinnerBanner"), no prefix/type convention.
