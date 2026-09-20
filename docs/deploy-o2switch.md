# Déployer `api-express` (avec AdminJS) sur o2switch

Objectif : `https://photo.jolivetmaxime.fr` sert l'API Express (et `/admin`) au lieu de l'API PHP,
avec une **base MariaDB neuve**. Le front (Vercel) n'a rien à changer : `API_BASE_URL` pointe déjà
sur ce domaine par défaut.

> Les noms de menus cPanel sont ceux que o2switch affiche habituellement ; s'ils diffèrent
> chez toi, cherche la même fonction sous un autre libellé.

## 0. Avant de commencer : sauvegarde

Comme la base est neuve, **les comptes et les photos actuels n'apparaîtront plus** dans l'app.

1. phpMyAdmin → base actuelle (`defis_photo`) → *Exporter* → SQL. Garde le fichier.
2. Gestionnaire de fichiers (ou SSH) : archive le dossier de l'API PHP **et** son dossier d'uploads.

## 1. Créer la base

1. cPanel → **Bases de données MySQL** → crée une base (ex. `defis_v2`) et un utilisateur
   avec un mot de passe fort, puis **ajoute l'utilisateur à la base** avec tous les privilèges.
2. phpMyAdmin → la nouvelle base → *Importer* → `docker/mysql/init.sql` (tables + les 8 défis).
   À faire **une seule fois** : le `INSERT` des défis n'est pas protégé contre les doublons.

## 2. Récupérer le code (SSH)

```bash
ssh joma2966@<ton-serveur-o2switch>
git clone https://github.com/maximejolivet/defis-photo.git ~/defis-photo
```

Le dépôt est public, pas besoin de clé. L'application est dans `~/defis-photo/api-express`.

## 3. Libérer le domaine

Le dossier racine de `photo.jolivetmaxime.fr` (visible dans cPanel → *Domaines*) contient
l'API PHP. Déplace-le (ne le supprime pas, c'est ton plan B) :

```bash
mv ~/<dossier-racine-du-domaine> ~/photo-php-backup
```

Passenger recréera le dossier racine avec son `.htaccess`. Sans ça, les fichiers PHP restent
servis par Apache **avant** Node.

## 4. Créer l'application Node

cPanel → **Setup Node.js App** → *Create Application* :

| Champ                    | Valeur                    |
| ------------------------ | ------------------------- |
| Node.js version          | la plus récente ≥ 20      |
| Application mode         | Production                |
| Application root         | `defis-photo/api-express` |
| Application URL          | `photo.jolivetmaxime.fr`  |
| Application startup file | `app.cjs`                 |

## 5. Variables d'environnement

Crée `~/defis-photo/api-express/.env` (jamais commité) :

```ini
DB_HOST=localhost
DB_NAME=defis_v2
DB_USER=<utilisateur créé à l'étape 1>
DB_PASS=<son mot de passe>

# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=<chaîne aléatoire>
JWT_EXPIRES_IN=30d

# https://localhost et capacitor://localhost : origines des apps Android et iOS (Capacitor).
CORS_ORIGINS=https://defis-photo.vercel.app,https://localhost,capacitor://localhost

ADMIN_EMAIL=<ton email>
ADMIN_PASSWORD=<mot de passe long, unique>
ADMIN_COOKIE_SECRET=<autre chaîne aléatoire de 32+ caractères>
```

`PORT` est inutile : Passenger gère lui-même l'écoute.

## 6. Installer les dépendances et démarrer

Sur la page de l'application, clique **Run NPM Install**, puis **Restart**. Ou en SSH, avec la
commande `source .../activate` affichée en haut de cette même page :

```bash
source ~/nodevenv/defis-photo/api-express/<version>/bin/activate
cd ~/defis-photo/api-express && npm install --omit=dev
```

## 7. Vérifier

```bash
curl -i https://photo.jolivetmaxime.fr/api/challenges/list     # 200 + 8 défis
curl -I https://photo.jolivetmaxime.fr/admin/login             # 200
```

Puis dans l'app : inscription, connexion, envoi d'une photo (HEIC compris), et `/admin`.
Vérifie aussi que `X-Robots-Tag: noindex, nofollow, noarchive` est bien présent dans les en-têtes.

## 8. Mettre à jour plus tard

```bash
cd ~/defis-photo && git pull
cd api-express && npm install --omit=dev      # (dans le nodevenv, cf. étape 6)
mkdir -p tmp && touch tmp/restart.txt         # redémarre Passenger
```

`uploads/` et `.env` sont ignorés par git : un `git pull` n'y touche pas.

## Si ça ne démarre pas

- **Page d'erreur Passenger** : lis `stderr.log` dans le dossier de l'application, ou les journaux
  d'erreurs cPanel.
- **`ERR_REQUIRE_ESM`** : Passenger n'utilise pas `app.cjs`. Vérifie le champ *startup file*.
- **Mémoire / processus tués au démarrage** : AdminJS compile son interface au premier lancement
  (dossier `.adminjs/`), ce qui est gourmand pour un mutualisé. Redémarre une fois ; si ça persiste,
  on pré-compile l'interface en local (à voir ensemble).
- **Photos HEIC refusées** : dépend de la version de libvips embarquée par `sharp`
  (voir `api-express/README.md`).
- **`Access denied` MariaDB** : l'utilisateur n'est pas rattaché à la base (étape 1) ou le préfixe
  `` manque dans `DB_NAME` / `DB_USER`.

## Bon à savoir

- `/admin` est exposé sur Internet avec **un seul compte défini dans `.env`** : mot de passe long,
  HTTPS uniquement.
- Tout le site est en `noindex, nofollow, noarchive` (front, pages statiques, API, `/uploads`, `/admin`),
  voir `index.html`, `vercel.json` et `api-express/src/index.js`.
