.PHONY: up down restart build-images logs ps sh-% lint build preview bruno compare docs db-init clean infos

infos:
	@echo "Stack Docker (Traefik, routage par domaine) :"
	@echo "  Frontend       : http://frontend.localhost:8088"
	@echo "  API Express    : http://api-express.localhost:8088"
	@echo "  API NestJS     : http://api-nest.localhost:8088"
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
	open -a Bruno ./bruno || echo "Ouvre l'app Bruno manuellement sur le dossier ./bruno"

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

clean:
	docker compose down -v --rmi local
