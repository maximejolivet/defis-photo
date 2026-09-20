# Tester l'app mobile (Capacitor) sur iOS et Android

L'app web est empaquetée avec [Capacitor](https://capacitorjs.com/) : le build (`dist/`) tourne dans un
WebView natif. Le code React est le même, seuls les projets natifs (`android/`, `ios/`) sont en plus.

## Comment ça marche

```
src/ (React) ──npm run build──▶ dist/ ──cap sync──▶ android/ et ios/ ──▶ Android Studio / Xcode ──▶ appareil
```

À chaque modification du code web, il faut **rebuilder et resynchroniser** :

```bash
npm run cap:sync      # build web + copie dans android/ et ios/
npm run cap:android   # sync, puis ouvre Android Studio
npm run cap:ios       # sync, puis ouvre Xcode
```

Des raccourcis `make` existent aussi (`make infos` les liste) :

| Commande | Effet |
|---|---|
| `make cap-sync` / `cap-ios` / `cap-android` | Équivalents des scripts `npm run cap:*` ci-dessus |
| `make cap-run-ios` / `cap-run-android` | Sync, puis lance l'app directement (`npx cap run`), sans ouvrir l'IDE |
| `make cap-icons` | Génère les icônes iOS/Android depuis `resources/icon.svg` |
| `make cap-doctor` | Vérifie l'installation (Xcode, Android Studio, versions Capacitor) |
| `make cap-ls` | Liste les plugins Capacitor installés |

## Prérequis communs : une API joignable

L'app charge ses données depuis `API_BASE_URL` (par défaut `https://photo.jolivetmaxime.fr`).

1. **L'API doit répondre en HTTPS.** Le WebView bloque les requêtes `http://` (contenu mixte sur
   Android, ATS sur iOS). Une API locale (`api-express.localhost:8088`) ne fonctionne donc pas
   telle quelle : il faudrait un tunnel HTTPS (ngrok, cloudflared) et
   `VITE_API_BASE_URL=https://<tunnel> npm run cap:sync`.
2. **Le CORS doit autoriser l'origine du WebView.** Dans le `.env` de l'API (`CORS_ORIGINS`) :

   | Plateforme | Origine du WebView |
   |---|---|
   | Android | `https://localhost` |
   | iOS | `capacitor://localhost` |

   ```ini
   CORS_ORIGINS=https://defis-photo.vercel.app,https://localhost,capacitor://localhost
   ```

   Sans ça, l'app s'ouvre mais reste vide : toutes les requêtes sont refusées par le WebView.

Vérification rapide (doit afficher l'origine en retour) :

```bash
curl -s -o /dev/null -D - -H "Origin: capacitor://localhost" \
  https://photo.jolivetmaxime.fr/api/challenges/list | grep -i access-control-allow-origin
```

## iOS (Mac uniquement)

### Installation (une fois)

1. Installe **Xcode** depuis l'App Store (environ 10 Go) et lance-le une fois pour accepter la licence.
2. Pointe la ligne de commande vers Xcode :
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   xcodebuild -version        # doit afficher la version de Xcode
   ```

3. Télécharge le runtime iOS du simulateur (environ 8 Go). Sans lui, aucun simulateur n'est disponible :
   ```bash
   xcodebuild -downloadPlatform iOS
   xcrun simctl list runtimes    # doit lister « iOS xx.x »
   ```
   (ou dans Xcode : *Settings → Components*.)

Le projet iOS utilise Swift Package Manager : **pas besoin de CocoaPods**.

### Sur le simulateur

```bash
npm run cap:ios      # ou : make cap-ios
```

**Première fois : choisir une équipe de signature.** Xcode refuse de compiler avec l'erreur
*« Signing for "App" requires a development team »*. Dans Xcode : projet **App** (première ligne à
gauche) → cible **App** → onglet *Signing & Capabilities* → *Team* : ton Apple ID (*Add an Account…* s'il
n'y est pas). Le compte gratuit suffit, y compris pour le simulateur. Ce réglage est enregistré dans
`ios/App/App.xcodeproj` et ne se refait pas ensuite.

Dans Xcode : choisis un simulateur iPhone dans la barre du haut, puis clique sur ▶ (⌘R).

Le simulateur n'a pas de vraie caméra : « Prendre une photo » n'y est pas testable. La galerie
(photos d'exemple) fonctionne.

### Sur un vrai iPhone

1. Branche l'iPhone, déverrouille-le et accepte « Faire confiance à cet ordinateur ».
2. Sur l'iPhone : Réglages → Confidentialité et sécurité → **Mode développeur** → activer (redémarrage).
3. Xcode → cible **App** → onglet *Signing & Capabilities* → *Team* : ton Apple ID personnel
   (gratuit). Si le *Bundle Identifier* est refusé, il est pris : ajoute un suffixe
   (ex. `fr.jolivetmaxime.defisphoto.test`), uniquement pour tes essais.
4. Sélectionne ton iPhone dans la barre du haut, puis ▶.
5. Au premier lancement : Réglages → Général → **VPN et gestion de l'appareil** → fais confiance
   à ton profil développeur.

Avec un compte gratuit, l'app **expire au bout de 7 jours** : il suffit de la réinstaller depuis Xcode.

## Android

### Installation (une fois)

```bash
brew install --cask android-studio
```

Ouvre Android Studio : l'assistant de démarrage installe le SDK Android et un JDK (celui d'Android
Studio suffit, pas besoin d'installer Java séparément).

### Sur l'émulateur

```bash
npm run cap:android
```

1. Attends la fin de la synchronisation Gradle (barre de progression en bas, la première fois
   c'est long).
2. *Device Manager* (icône de téléphone à droite) → **Create Device** → un Pixel récent → une image
   système récente (télécharge-la si besoin) → *Finish*.
3. Lance l'émulateur, puis clique sur ▶ (*Run 'app'*).

L'émulateur a une caméra virtuelle, mais elle n'est pas proposée par le sélecteur de fichier
d'Android (voir « Limites » plus bas) : tu testeras l'envoi depuis la galerie.

### Sur un vrai téléphone

1. Réglages → À propos du téléphone → appuie 7 fois sur **Numéro de build** (active les options
   développeur).
2. Options pour les développeurs → active le **Débogage USB**.
3. Branche le téléphone, accepte la clé RSA affichée. Il apparaît dans la liste des appareils
   d'Android Studio : sélectionne-le, puis ▶.

Pour générer un APK à installer à la main : *Build → Build Bundle(s) / APK(s) → Build APK(s)*.

## Déboguer

Le WebView se débogue comme une page web, avec console et réseau.

- **iOS** : Safari → menu *Développement* → ton simulateur ou iPhone → la page.
  (Si le menu est absent : Safari → Réglages → Avancé → « Afficher les fonctionnalités pour
  les développeurs web ».)
- **Android** : Chrome → `chrome://inspect` → *inspect* sous ton appareil.

Les erreurs CORS et les requêtes bloquées s'y voient directement : c'est le premier endroit à
regarder si l'app reste vide.

## Checklist de test

- [ ] Inscription puis connexion
- [ ] Choix d'un défi, envoi d'une **photo** depuis la galerie
- [ ] Envoi d'une **vidéo**
- [ ] iOS : « Prendre une photo » avec la caméra (vrai iPhone), autorisation caméra et micro
- [ ] Suppression d'une photo, agrandissement (lightbox)
- [ ] `/all-photos` : pagination
- [ ] Mise en page sur un écran à encoche, en portrait et en paysage
- [ ] Fermer puis rouvrir l'app : toujours connecté (le token est dans le `localStorage` du WebView)

## Limites connues

- **Caméra sur Android** : le sélecteur de fichier n'y propose que la galerie, alors que sur iOS il
  propose « Prendre une photo ». Une vraie prise de photo directe demande le plugin
  `@capacitor/camera` et une modification de `Upload.tsx` et `FreeUpload.tsx`.
- **Icône et écran de démarrage** : l'icône source est `resources/icon.svg` ; `make cap-icons` génère
  toutes les tailles iOS/Android (outil `@capacitor/assets`, lancé via `npx`, il faut du réseau la
  première fois). Tant que la commande n'a pas été lancée, c'est l'icône par défaut de Capacitor.
  Après changement, supprime l'app du simulateur avant de relancer : l'ancienne icône reste en cache.
  L'écran de démarrage reste celui par défaut.
- **`appId`** (`fr.jolivetmaxime.defisphoto`, dans `capacitor.config.ts`) : définitif une fois l'app
  publiée sur un store.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| L'app s'ouvre mais reste vide / « impossible de contacter le serveur » | CORS : l'origine du WebView n'est pas dans `CORS_ORIGINS`, ou l'API ne répond pas (regarde la console) |
| Requêtes bloquées « Mixed Content » ou « App Transport Security » | `API_BASE_URL` en `http://` : il faut du HTTPS |
| Modifications du code non visibles dans l'app | Oubli de `npm run cap:sync` |
| `xcode-select: error: tool 'xcodebuild' requires Xcode` | Xcode non installé, ou étape `xcode-select -s` oubliée |
| `Unable to locate a Java Runtime` en ligne de commande | Normal : le JDK est celui d'Android Studio, lance le build depuis l'IDE |
| iOS : l'app plante en choisissant « Prendre une photo » | Texte `NSCameraUsageDescription` manquant dans `ios/App/App/Info.plist` (déjà présent) |
| Xcode : « Signing for "App" requires a development team » | Aucune équipe choisie : *Signing & Capabilities* → *Team* (voir « Sur le simulateur ») |
| Xcode : aucun simulateur dans la liste | Runtime iOS non installé : `xcodebuild -downloadPlatform iOS` |
| iOS : « Untrusted Developer » au lancement | Fais confiance à ton profil dans Réglages → Général → VPN et gestion de l'appareil |

## Et pour publier ?

- **App Store** : compte Apple Developer (99 $/an), puis *Product → Archive* dans Xcode et envoi
  via App Store Connect. La validation prend quelques jours.
- **Google Play** : compte Google Play Console (25 $, une seule fois), puis *Build → Generate Signed
  Bundle* (format AAB) dans Android Studio. Garde précieusement ta clé de signature.
