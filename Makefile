.PHONY: install dev server build preview lint lintfix deploy clean infos

infos:
	@echo "Projet             : $$(node -p "require('./package.json').name")"
	@echo "Node actuel        : $$(node -v)"
	@echo "Node serveur requis: $$(node -p "require('./server/package.json').engines.node")"
	@echo "Branche            : $$(git rev-parse --abbrev-ref HEAD)"
	@echo "Dernier commit     : $$(git log -1 --format='%h %s')"
	@echo ""
	@echo "Commandes disponibles :"
	@echo "  install   Installer les dépendances (frontend + serveur)"
	@echo "  dev       Lancer le frontend en dev (http://localhost:5173)"
	@echo "  server    Lancer l'API Express en dev (http://localhost:3001)"
	@echo "  build     Build de production du frontend"
	@echo "  preview   Prévisualiser le build frontend"
	@echo "  lint      Vérifier le code frontend avec ESLint"
	@echo "  lintfix   Corriger automatiquement avec ESLint --fix"
	@echo "  deploy    Déployer sur Vercel (production)"
	@echo "  clean     Supprimer dist et node_modules (frontend + serveur)"
	@echo "  infos     Afficher ces informations"

install:
	npm install
	cd server && npm install

dev:
	npm run dev

server:
	cd server && npm run dev

build:
	npm run build

preview:
	npm run preview

lint:
	npm run lint

lintfix:
	npx eslint . --fix

deploy:
	vercel --prod

clean:
	rm -rf dist node_modules server/node_modules
