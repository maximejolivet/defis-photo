# Collection Bruno — Défis Photo API

Une seule collection de requêtes, réutilisable contre les 4 implémentations de l'API (elles partagent exactement le même contrat REST). Ouvre ce dossier avec [Bruno](https://www.usebruno.com/), puis choisis l'environnement correspondant au backend que tu veux tester : **express**, **nest**, **laravel** ou **symfony** (menu déroulant en haut à droite).

## Utilisation

1. Lance le stack Docker (`make up`) ou les serveurs en natif.
2. Choisis un environnement (ex. `express`).
3. Lance **Auth / Register** une fois pour créer un utilisateur de test, puis **Auth / Login** — le token JWT est automatiquement stocké dans la variable d'environnement `token` et réutilisé par les requêtes protégées (`photos/upload`, `photos/delete`, `gamification/stats`, et `users/list` côté Express).
4. Les autres requêtes (`challenges/list`, `photos/gallery`, `gamification/winner`) sont publiques, pas besoin de token.

Changer d'environnement permet de rejouer exactement les mêmes requêtes contre une autre implémentation, pour comparer les réponses.

⚠️ Les 4 backends partagent la même base MySQL (contrainte `UNIQUE` sur `pseudo`) : si tu enregistres le même pseudo dans plusieurs environnements, un seul `Register` réussira, les autres renverront un `409`. Les comptes créés dans un backend sont utilisables dans les autres (même table `users`), sauf sur Laravel — voir plus bas.

⚠️ `photos/delete` envoie `photo_id: 1` : la suppression n'est acceptée que pour tes propres photos, mets l'id d'une photo que tu as uploadée (sinon tu obtiens un 403/404).

## Lancer la collection en ligne de commande

```bash
cd bruno
npx @usebruno/cli run auth/register.bru auth/login.bru challenges/list.bru users/list.bru \
  gamification/stats.bru gamification/winner.bru photos/gallery.bru --env express
```

⚠️ Le script post-réponse de `Login` écrit le JWT dans `bruno/environments/<env>.bru` : après un `bru run`, annule avec `git checkout -- bruno/environments` pour ne pas committer un token.

`photos/upload` (fichier à choisir dans l'interface) et `photos/delete` (id à adapter) restent manuels. Les requêtes n'ont **aucune assertion** : Bruno affiche « PASS » même sur un `500`. Lis les codes de statut, ou ajoute des blocs `assert` pour un vrai contrôle automatique.

## Comportement vérifié (19/09/2026)

Mêmes requêtes, un compte créé par environnement :

| Requête | express | nest | laravel | symfony |
|---|---|---|---|---|
| `register` (doublon → 409) | 200 | **201** | 200 | 200 |
| `login` | 200 | **201** | 200¹ | 200 |
| `challenges/list`, `users/list`², `gallery`, `winner` | 200 | 200 | 200 | 200 |
| `gamification/stats` (avec token) | 200 | 200 | **500**³ | 200 |
| `photos/upload` (PNG + `challenge_id`) | 200 | 200 | **500**³ | **500**⁴ |
| `photos/delete` (id inexistant → 404) | 404 | 404 | **500**³ | 404 |

¹ Laravel refuse les hash bcrypt produits par `bcryptjs` (préfixe `$2a$`/`$2b$` au lieu de `$2y$`) : `login` renvoie un `500` (« This password does not use the Bcrypt algorithm ») pour un compte créé par Express ou NestJS. Un compte créé par Laravel se connecte partout.
² Express exige un token sur `users/list` ; les autres backends la laissent publique.
³ Route authentifiée sur Laravel : d'abord la table `cache` absente (`CACHE_STORE` vaut `database` par défaut — même piège que `SESSION_DRIVER`), puis `App\Models\User` qui n'implémente pas l'interface d'authentification attendue par le guard JWT. À corriger dans `api-laravel`.
⁴ Symfony ne devine pas le type MIME du fichier : `symfony/mime` n'est pas installé (`composer require symfony/mime`).

NestJS renvoie le code `201` par défaut sur les `POST` (`register`, `login`, `delete`) au lieu de `200` : un écart de contrat, sans incidence pour le frontend qui teste `response.ok`.

## Alternatives navigateur

- **`public/api-compare.html`** (http://frontend.localhost:8088/api-compare.html, ou `make compare`) : envoie la même requête aux 4 API en parallèle, réponses côte à côte. Le plus rapide pour repérer une divergence entre implémentations.
- **`public/api-docs.html`** (http://frontend.localhost:8088/api-docs.html, ou `make docs`) : documentation Swagger UI générée depuis `public/openapi.yaml`, avec un sélecteur de serveur (un par backend) et un bouton "Try it out" pour exécuter une requête et voir la réponse formatée directement dans la doc — pratique pour découvrir le contrat sans écrire de requête.

Bruno reste le plus adapté pour un scénario avec plusieurs étapes (register → login → upload avec le token auto-injecté) ou pour tester un upload multipart (`photos/upload`).
