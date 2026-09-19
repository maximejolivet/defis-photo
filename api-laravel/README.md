# Défis Photo — API (Laravel)

Même API que [`api-express/`](../api-express) et [`api-nestjs/`](../api-nestjs), réécrite en Laravel — à but de comparaison/apprentissage. Se connecte à la même base MySQL/MariaDB, aucune migration à exécuter (les migrations par défaut de Laravel ont été supprimées : ce projet consomme un schéma existant, il ne le crée pas).

## Différences avec les versions Node

- Auth via [`tymon/jwt-auth`](https://github.com/tymondesigns/jwt-auth) (package JWT idiomatique Laravel), guard `api` en driver `jwt`.
- Erreurs via les réponses JSON natives de Laravel (validation, `AuthenticationException`, etc.) — la forme diffère légèrement de `{ message }` selon le cas (ex. `{"message":"Unauthenticated."}` sur 401), mais un champ `message` reste toujours présent.
- Upload : les fichiers sont stockés dans `public/uploads/` (et non un dossier `uploads/` à la racine du projet comme dans les versions Node) — c'est `public/` qui sert de document root en Laravel, donc les fichiers doivent y résider pour être accessibles sans route dédiée.
- Conversion JPEG : portée directement depuis `api_old/api/photos/upload.php` (Imagick avec fallback GD), donc identique à l'ancienne API PHP plutôt que rewrite via `sharp` (Node). Même limite : DNG non supporté, HEIC dépend de l'extension Imagick compilée avec support HEIF sur l'hébergement.
- Port de dev par défaut : `8001` (`api-express` utilise `3001`, `api-nestjs` `3002`).

## Installation

```bash
cd api-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret          # génère JWT_SECRET dans .env — ne pas réutiliser celui des autres backends
# renseigner DB_HOST/DB_NAME/DB_USER/DB_PASS, CORS_ORIGINS dans .env
php artisan serve --port=8001
```

Nécessite l'extension PHP Imagick pour bénéficier de la conversion HEIC/TIFF (fallback GD sinon, qui ne gère pas ces formats).

## Endpoints

| Méthode | Route                      | Auth | Description |
|---------|----------------------------|:----:|-------------|
| POST    | `/api/auth/register`       |  –   | Crée un utilisateur (`pseudo`, `pin` à 4 chiffres) |
| POST    | `/api/auth/login`          |  –   | Renvoie `{ token, user }` |
| GET     | `/api/challenges/list`     |  –   | Liste des défis |
| GET     | `/api/users/list`          |  –   | Liste des utilisateurs |
| GET     | `/api/photos/gallery`      |  –   | Toutes les photos |
| POST    | `/api/photos/upload`       |  ✅  | Upload (`multipart/form-data`, champ `photo`, `challenge_id`/`recipient_user_id` optionnels) |
| POST    | `/api/photos/delete`       |  ✅  | `{ photo_id }` — supprime une photo de l'utilisateur authentifié |
| GET     | `/api/gamification/stats`  |  ✅  | Stats de l'utilisateur authentifié + classement top 10 |
| GET     | `/api/gamification/winner` |  –   | Premier utilisateur à avoir complété 8 défis |
