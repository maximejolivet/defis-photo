.PHONY: up down restart build-images logs ps sh-% lint build preview bruno compare docs db-init clean infos cap-sync cap-ios cap-android cap-run-ios cap-run-android cap-icons cap-doctor cap-ls

infos:
	@echo "Stack Docker (Traefik, routage par domaine) :"
	@echo "  Frontend       : http://frontend.localhost:8088"
	@echo "  API Express    : http://api-express.localhost:8088"
	@echo "  Back office (AdminJS) : http://api-express.localhost:8088/admin (admin@local.dev / admin)"
	@echo "  API NestJS     : http://api-nest.localhost:8088"
	@echo "  Back office NestJS (AdminJS) : http://api-nest.localhost:8088/admin (admin@local.dev / admin)"
	@echo "  API Laravel    : http://api-laravel.localhost:8088"
	@echo "  API Symfony    : http://api-symfony.localhost:8088"
	@echo "  Dashboard Traefik : http://localhost:8081"
	@echo "  Comparateur API   : http://frontend.localhost:8088/api-compare.html"
	@echo "  Docs API (Swagger UI) : http://frontend.localhost:8088/api-docs.html"
	@echo "  MySQL (local)  : localhost:3306 (defis_photo/defis_photo)"
	@echo ""
	@echo "Commandes disponibles :"
	@echo "  up            Construire et démarrer tout le stack (Traefik + 4 API + frontend + MySQL)"
	@echo "  down          Arrêter le stack"
	@echo "  restart       Redémarrer tous les services"
	@echo "  build-images  Rebuild les images Docker sans redémarrer"
	@echo "  logs          Suivre les logs de tous les services (Ctrl+C pour quitter)"
	@echo "  ps            Lister les services et leur état"
	@echo "  sh-<service>  Ouvrir un shell dans un service (ex: make sh-api-express)"
	@echo "  bruno         Ouvrir la collection Bruno (app Bruno requise)"
	@echo "  compare       Ouvrir le comparateur API dans le navigateur"
	@echo "  docs          Ouvrir la doc API (Swagger UI) dans le navigateur"
	@echo "  db-init       (Re)jouer docker/mysql/init.sql sur la base existante (idempotent)"
	@echo "  lint          Vérifier le code frontend avec ESLint (hors Docker)"
	@echo "  build         Build de production du frontend (hors Docker)"
	@echo "  preview       Prévisualiser le build frontend (hors Docker)"
	@echo "  cap-sync         Build du frontend + copie dans android/ et ios/ (Capacitor)"
	@echo "  cap-ios          Sync puis ouvrir le projet dans Xcode"
	@echo "  cap-android      Sync puis ouvrir le projet dans Android Studio"
	@echo "  cap-run-ios      Sync puis lancer l'app iOS (simulateur/appareil, choix en ligne de commande)"
	@echo "  cap-run-android  Sync puis lancer l'app Android (émulateur/appareil)"
	@echo "  cap-icons        Générer les icônes iOS/Android depuis resources/icon.svg"
	@echo "  cap-doctor       Diagnostiquer l'installation Capacitor (iOS/Android)"
	@echo "  cap-ls           Lister les plugins Capacitor installés"
	@echo "  clean         Arrêter le stack et supprimer volumes + images du projet"
	@echo "  infos         Afficher ces informations"

up:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

build-images:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

sh-%:
	docker compose exec $* sh

bruno:
	open -a Bruno ./docs/bruno || echo "Ouvre l'app Bruno manuellement sur le dossier ./docs/bruno"

compare:
	open http://frontend.localhost:8088/api-compare.html

docs:
	open http://frontend.localhost:8088/api-docs.html

# docker-entrypoint-initdb.d/init.sql ne s'exécute qu'à la création du volume
# mysql_data. Si ce volume existait déjà (schéma partiel, ancien projet...),
# `up` ne le rejoue pas : utiliser `db-init` pour le réappliquer à la main
# (CREATE TABLE IF NOT EXISTS, sans danger pour les données existantes).
db-init:
	docker compose exec -T mysql sh -c "mariadb --default-character-set=utf8mb4 -udefis_photo -pdefis_photo defis_photo" < docker/mysql/init.sql

lint:
	npm run lint

build:
	npm run build

preview:
	npm run preview

# Capacitor (apps mobiles) : après un changement du code React, l'app native
# garde l'ancienne version tant qu'on n'a pas relancé cap-sync.
cap-sync:
	npm run cap:sync

cap-ios:
	npm run cap:ios

cap-android:
	npm run cap:android

cap-run-ios: cap-sync
	npx cap run ios

cap-run-android: cap-sync
	npx cap run android

# Génère toutes les tailles d'icônes à partir d'une seule image (resources/icon.svg ou .png).
# --assetPath : @capacitor/assets cherche par défaut dans assets/, pas resources/.
cap-icons:
	npx @capacitor/assets generate --assetPath resources --iconBackgroundColor '#3b2fe0' --iconBackgroundColorDark '#2a1fb8'

cap-doctor:
	npx cap doctor

cap-ls:
	npx cap ls

clean:
	docker compose down -v --rmi local
