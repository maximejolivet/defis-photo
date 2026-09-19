# Défis Photo — API (Symfony)

Même API que [`api-express/`](../api-express) et [`api-nestjs/`](../api-nestjs), réécrite en Symfony 8.1 — à but de comparaison/apprentissage. Se connecte à la même base MySQL/MariaDB, aucune migration nécessaire.

## Stack

- Symfony 8.1 (skeleton, pas de Twig — API pure)
- Doctrine ORM/DBAL pour l'accès base (entités pour `users`/`photos`/`challenges`, requêtes DBAL brutes pour `user_stats` qui est une vue)
- `lexik/jwt-authentication-bundle` pour le JWT (idiomatique Symfony), avec un firewall stateless sur `/api`
- `nelmio/cors-bundle` pour le CORS

## Différences avec les versions Express/NestJS

- Authentification via le Security component de Symfony : `User` implémente `UserInterface`, un firewall `jwt` protège `/api/photos/upload`, `/api/photos/delete` et `/api/gamification/stats` via `access_control` (le reste est public). `#[CurrentUser]` injecte l'utilisateur authentifié dans les contrôleurs.
- Conversion JPEG réutilise directement la logique Imagick/GD de `api_old/api/photos/upload.php` (même langage, pas de portage nécessaire) — voir `src/Service/ImageConverter.php`.
- Un `ApiExceptionListener` force toutes les erreurs (y compris les erreurs infra comme une DB injoignable) à répondre en JSON plutôt qu'en page HTML de debug.
- Port de dev par défaut : `8002` (pour tourner en parallèle de `api-express` :3001, `api-nestjs` :3002, `api-laravel` :8001).

## Installation

```bash
cd api-symfony
composer install
cp .env .env.local   # renseigner DB_HOST/DB_NAME/DB_USER/DB_PASS, CORS_ALLOW_ORIGIN
php bin/console lexik:jwt:generate-keypair --skip-if-exists
php -S localhost:8002 -t public
```

## Endpoints

| Méthode | Route                      | Auth | Description |
|---------|-----------------------------|:----:|-------------|
| POST    | `/api/auth/register`        |  –   | Crée un utilisateur (`pseudo`, `pin` à 4 chiffres) |
| POST    | `/api/auth/login`           |  –   | Renvoie `{ token, user }` |
| GET     | `/api/challenges/list`      |  –   | Liste des défis |
| GET     | `/api/users/list`           |  –   | Liste des utilisateurs |
| GET     | `/api/photos/gallery`       |  –   | Toutes les photos |
| POST    | `/api/photos/upload`        |  ✅  | Upload (`multipart/form-data`, champ `photo`) |
| POST    | `/api/photos/delete`        |  ✅  | `{ photo_id }` |
| GET     | `/api/gamification/stats`   |  ✅  | Stats de l'utilisateur authentifié + classement |
| GET     | `/api/gamification/winner`  |  –   | Premier utilisateur à avoir complété 8 défis |
