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

- All data (auth, photos, gallery, leaderboard, uploads) comes from an external PHP backend at `https://photo.jolivetmaxime.fr/api/...`, called directly from page components. URLs are hardcoded — there are **no environment variables** in this project.
- Auth is naive: `src/context/AuthContext.jsx` stores the user object in `localStorage`; protected routes just check truthiness, there's no real token/session validation on the frontend.
- `src/App.jsx` defines the router and protected routes: `/login`, `/register`, `/gallery`, `/upload`, `/all-photos`, `/photo-libre`, `/diaporama`, with `/` redirecting to `/gallery`.

## Gotcha: two unrelated "diaporama" files

- `src/pages/Diaporama.jsx` is a React page (part of the router).
- `public/diaporama.html` is a separate static standalone HTML slideshow, not related to the React page.

Confirm which one is meant before editing "the diaporama."

## Git conventions

- Commit directly to `master` — no feature-branch/PR workflow is used in this repo.
- Commit messages are short, imperative, capitalized (e.g. "Add BirthdayConfetti and refactor WinnerBanner"), no prefix/type convention.
