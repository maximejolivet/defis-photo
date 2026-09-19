# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 + Vite 7, TypeScript (`strict`, `.ts`/`.tsx` only — no JS/JSX left). React Router v7 for routing. Also used: `framer-motion` (animations), `lucide-react` (icons), `heic2any` (HEIC→JPEG conversion for iPhone photo uploads).

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — type-check (`tsc -b`) then production build; a type error fails the build, hence the Vercel deploy
- `npx tsc -b` — type-check only (Vite/esbuild strips types without checking them, so `npm run dev` never reports type errors)
- `npm run lint` — ESLint (flat config in `eslint.config.ts`)
- `npm run preview` — preview the production build

There is no test suite in this repo.

## Architecture

This is a client-only SPA ("Défis photo", a birthday photo-challenge app) deployed to Vercel (`vercel.json` just rewrites everything to `/index.html` for client-side routing).

- All data (auth, photos, gallery, leaderboard, uploads) comes from a backend API, called through `src/api/client.ts` (`apiFetch`), which prepends `API_BASE_URL` (`src/config.ts`) and attaches the JWT from `localStorage` as a `Bearer` token. `API_BASE_URL` reads `import.meta.env.VITE_API_BASE_URL`, falling back to the production PHP backend at `https://photo.jolivetmaxime.fr` when unset. Vite inlines this at dev-server start/build time from the launching process's env — `npm run dev` on the host has no `VITE_API_BASE_URL` set, so it hits the PHP backend; `docker-compose.yml` sets it to `http://api-express.localhost:8088` for the `frontend` container, so the dockerized stack talks to the local Express API instead.
- Auth is JWT-based: login/register hit `/api/auth/...` on whichever backend `API_BASE_URL` points to, and the returned `{ user, token }` is stored together in `localStorage` via `AuthContext`; `apiFetch` reads the token back out and sends it as `Authorization: Bearer`. Protected routes still just check truthiness of the stored user client-side — there's no real session validation beyond what the backend enforces per-request.
- `src/App.tsx` defines the router and protected routes: `/login`, `/register`, `/gallery`, `/upload`, `/all-photos`, `/photo-libre`, `/diaporama`, with `/` redirecting to `/gallery`.
- API response shapes live in `src/types.ts` (`Photo`, `Challenge`, `Stats`, …), inferred from how the front uses them — `public/openapi.yaml` is less complete. They're compile-time only: `response.json()` is `any` and nothing validates the payload at runtime, so keep them in sync by hand if the API changes.
- TS config is split Vite-style: `tsconfig.app.json` (`src/`, browser types) and `tsconfig.node.json` (`vite.config.ts`), tied together by `tsconfig.json` project references.

## Theme ("la pellicule")

Styling lives in `src/index.css` (custom properties on `:root`) plus lots of inline styles that reference those variables. Non-obvious rule: `--text`, `--text-muted`, `--text-strong`, `--primary`, `--surface` and `--glass-border` describe text on the **blue page background**; the `.glass-card` class (a white "paper" panel, also used by `.photo-card`) redefines them locally to dark ink. So inline `var(--text)` is correct in both contexts — don't hardcode colors, and put light surfaces in `.glass-card` rather than styling a `div` with `var(--card-bg)`. `FilmStrip` (8 frames = the 8 challenges, each showing the challenge's emoji and number, loaded through the shared `src/api/challenges.ts`; a frame is "done" when its challenge id is in `stats.my_challenges`) is the one signature element, and the footer (`.film-edge`) is the end of the roll. The animated page background is `ViewfinderBackground` (pure CSS: drifting autofocus frames/rings that briefly "lock" in yellow; mounted inside the Router in `App.tsx`, hidden on `/diaporama`, frozen under `prefers-reduced-motion`). Both diaporamas have their own hardcoded palette and fonts (keep them in sync by hand). Vite in Docker doesn't see file changes through the Colima bind mount: `docker compose restart frontend` after edits.

## Gotcha: two unrelated "diaporama" files

- `src/pages/Diaporama.tsx` is a React page (part of the router).
- `public/diaporama.html` is a separate static standalone HTML slideshow, not related to the React page.

Confirm which one is meant before editing "the diaporama."

## Local backend comparison stack (api-express / api-nestjs / api-laravel / api-symfony)

The deployed app above uses the external PHP API — that hasn't changed. Separately, this repo also contains a **local-only, learning/comparison stack**: four rewrites of the same REST API (Node/Express, NestJS, Laravel, Symfony) sharing one MariaDB database, meant to compare backend techs, not to replace the production PHP API.

- `docker-compose.yml` + `docker/` run the whole thing behind Traefik, routed by domain (`frontend.localhost`, `api-express.localhost`, `api-nest.localhost`, `api-laravel.localhost`, `api-symfony.localhost`, all on port `8088`). See `make infos` for the full URL list, or `README.md` for setup.
- This machine uses **Colima**, not Docker Desktop, as the Docker runtime — `colima start` before `make up` if `docker info` fails.
- `api-express` and `api-nestjs` both mount an **AdminJS** back office at `/admin` (Express: `api-express/src/admin.js`; NestJS: `api-nestjs/src/admin/admin.mjs`, a copy of it — keep the two in sync), reading `users`/`challenges`/`photos` straight from MariaDB via `@adminjs/sql` (no ORM models). Login is a single env-based account (`ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_COOKIE_SECRET`; disabled if unset) — there's no `role` column since the DB is shared with the other 3 backends. Passwords typed in the admin are bcrypt-hashed (cost 10) by a hook to stay compatible with `/api/auth/login`. After adding npm deps to `api-express`, rebuild with `docker compose up -d --build --renew-anon-volumes api-express`, otherwise the old `node_modules` anonymous volume shadows the new packages. `node --watch` doesn't see file changes through the Colima bind mount, so after editing `admin.js` or `admin-components/*` run `docker compose restart api-express`. On NestJS, AdminJS is ESM-only while the project compiles to CommonJS, so `main.ts` loads `admin.mjs` through a real dynamic `import()` (the `importEsm` wrapper) and `nest-cli.json` copies the `.mjs`/`.jsx` files into `dist`; there is no bind mount, so any change needs `docker compose up -d --build api-nest`. `admin.js` also monkey-patches `@adminjs/sql`'s `Resource.prototype.filterQuery` (its MySQL text filter adds `COLLATE utf8_bin`, which fails on utf8mb4 → 500) — re-check whether it's still needed if that package is upgraded.
- `bruno/` is a Bruno API collection (one environment per backend) for exploring/testing requests manually — see `bruno/README.md`, which also records the verified per-backend behavior (the only remaining difference is NestJS answering 201 on POSTs, and Express requiring a token on `users/list`). The requests have no assertions, so `bru run` says PASS even on a 500.
- `public/api-compare.html` (`make compare`) fires the same request at all 4 backends in parallel and renders the responses side by side — faster than Bruno for spotting a divergence between implementations, but Bruno is better for a deep look at one request (e.g. `photos/upload`).
- `public/api-docs.html` (`make docs`) is a Swagger UI reading `public/openapi.yaml` — a hand-written spec of the shared contract (not auto-generated by any of the 4 backends, none of them have Swagger/OpenAPI tooling installed). Server dropdown switches between the 4 backends; keep it in sync by hand if an endpoint's shape changes.
- Gotcha: the 4 backends share one MySQL `users` table with a `UNIQUE(pseudo)` constraint — registering the same pseudo against more than one backend races, and only one insert wins. all four now return a clean 409 on the losers (Laravel used to return a raw `500`).
- Gotcha: `docker-entrypoint-initdb.d/init.sql` (schema + seed data) only runs the first time the `mysql_data` volume is created. If that volume already exists without the full schema, `make up` won't fix it — run `make db-init` to (re)apply `docker/mysql/init.sql` (idempotent `CREATE TABLE IF NOT EXISTS`).
- Gotcha: `api-laravel` deliberately ships with no migrations (see `api-laravel/README.md` — it consumes the existing schema from `init.sql`, doesn't create one). It needs `SESSION_DRIVER=file` and `CACHE_STORE=file` (set in `docker-compose.yml`) — without them, Laravel's config default (`database`) makes it read `sessions`/`cache` tables that don't exist, and every request (the JWT blacklist uses the cache) 500s. `config/hashing.php` sets `bcrypt.verify` to `false` on purpose: accounts created by Express/NestJS are hashed by `bcryptjs` (`$2a$`/`$2b$` prefix), which Laravel's algorithm check otherwise rejects with a 500 on login.

## Git conventions

- Commit directly to `master` — no feature-branch/PR workflow is used in this repo.
- Commit messages are short, imperative, capitalized (e.g. "Add BirthdayConfetti and refactor WinnerBanner"), no prefix/type convention.
