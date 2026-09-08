# Collection Bruno — Défis Photo API

Une seule collection de requêtes, réutilisable contre les 4 implémentations de l'API (elles partagent exactement le même contrat REST). Ouvre ce dossier avec [Bruno](https://www.usebruno.com/), puis choisis l'environnement correspondant au backend que tu veux tester : **express**, **nest**, **laravel** ou **symfony** (menu déroulant en haut à droite).

## Utilisation

1. Lance le stack Docker (`make up`) ou les serveurs en natif.
2. Choisis un environnement (ex. `express`).
3. Lance **Auth / Register** une fois pour créer un utilisateur de test, puis **Auth / Login** — le token JWT est automatiquement stocké dans la variable d'environnement `token` et réutilisé par les requêtes protégées (`photos/upload`, `photos/delete`, `gamification/stats`).
4. Les autres requêtes (`challenges/list`, `users/list`, `photos/gallery`, `gamification/winner`) sont publiques, pas besoin de token.

Changer d'environnement permet de rejouer exactement les mêmes requêtes contre une autre implémentation, pour comparer les réponses.

⚠️ Les 4 backends partagent la même base MySQL (contrainte `UNIQUE` sur `pseudo`) : si tu enregistres le même pseudo dans plusieurs environnements, un seul `Register` réussira, les autres renverront un conflit (409 selon l'API, mais **Laravel renvoie un `500` générique** au lieu de gérer l'erreur proprement). Utilise un pseudo différent par environnement pour éviter la confusion.

## Alternatives navigateur

- **`public/api-compare.html`** (http://frontend.localhost:8088/api-compare.html, ou `make compare`) : envoie la même requête aux 4 API en parallèle, réponses côte à côte. Le plus rapide pour repérer une divergence entre implémentations.
- **`public/api-docs.html`** (http://frontend.localhost:8088/api-docs.html, ou `make docs`) : documentation Swagger UI générée depuis `public/openapi.yaml`, avec un sélecteur de serveur (un par backend) et un bouton "Try it out" pour exécuter une requête et voir la réponse formatée directement dans la doc — pratique pour découvrir le contrat sans écrire de requête.

Bruno reste le plus adapté pour un scénario avec plusieurs étapes (register → login → upload avec le token auto-injecté) ou pour tester un upload multipart (`photos/upload`).
