import path from 'node:path'
import { fileURLToPath } from 'node:url'
import AdminJS, { ComponentLoader } from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import { Adapter, Database, Resource } from '@adminjs/sql'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// AdminJS bundle les composants React déclarés ici (esbuild) au démarrage du serveur.
const componentLoader = new ComponentLoader()
const Components = {
  PhotoPreview: componentLoader.add('PhotoPreview', path.join(__dirname, 'admin-components/PhotoPreview.jsx')),
}

// Le plugin SQL lit le schéma MariaDB tout seul (pas de modèles à écrire).
AdminJS.registerAdapter({ Database, Resource })

// Contournement d'un bug de @adminjs/sql 2.2.6 : pour MySQL/MariaDB, le filtre texte utilise
// knex.whereLike() qui ajoute `COLLATE utf8_bin`, refusé par une base en utf8mb4
// (ER_COLLATION_CHARSET_MISMATCH) -> chercher un pseudo dans l'admin faisait un 500.
// Un simple LIKE suit la collation de la colonne (insensible à la casse ici).
const originalFilterQuery = Resource.prototype.filterQuery
Resource.prototype.filterQuery = function filterQuery(filter) {
  const { filters, ...rest } = filter ?? {}
  const textKeys = Object.entries(filters ?? {}).filter(
    ([, f]) => f.property.type() === 'string' && !f.property.availableValues(),
  )
  const otherFilters = Object.fromEntries(
    Object.entries(filters ?? {}).filter(([k]) => !textKeys.some(([tk]) => tk === k)),
  )
  const q = originalFilterQuery.call(this, filter ? { ...rest, filters: otherFilters } : filter)
  textKeys.forEach(([key, f]) => q.whereRaw('?? like ?', [key, `%${f.value}%`]))
  return q
}

// Même coût que auth.routes.js, sinon le login de l'API refuserait les hash créés ici.
const hashPassword = async (request) => {
  if (request.method !== 'post') return request
  const { password } = request.payload ?? {}
  if (password) {
    request.payload = { ...request.payload, password: await bcrypt.hash(password, 10) }
  } else {
    // Champ vide à l'édition = on garde l'ancien hash (sinon on l'écraserait par '').
    const { password: _omit, ...rest } = request.payload ?? {}
    request.payload = rest
  }
  return request
}

export async function buildAdminRouter() {
  const db = await new Adapter('mysql2', {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  }).init()

  const admin = new AdminJS({
    rootPath: '/admin',
    componentLoader,
    branding: { companyName: 'Défis photo', withMadeWithLove: false },
    resources: [
      {
        resource: db.table('challenges'),
        options: {
          navigation: 'Contenu',
          titleProperty: 'title', // texte affiché quand une autre table pointe vers un défi
          listProperties: ['id', 'icon', 'title', 'sort_order'],
        },
      },
      {
        resource: db.table('users'),
        options: {
          navigation: 'Contenu',
          titleProperty: 'pseudo',
          listProperties: ['id', 'pseudo', 'created_at'],
          properties: {
            // type 'password' = champ masqué dans le formulaire ; jamais affiché en liste/détail.
            password: { type: 'password', isVisible: { list: false, show: false, filter: false, edit: true } },
          },
          actions: {
            new: { before: [hashPassword] },
            edit: { before: [hashPassword] },
          },
        },
      },
      {
        resource: db.table('photos'),
        options: {
          navigation: 'Contenu',
          listProperties: ['id', 'image_path', 'user_id', 'challenge_id', 'created_at'],
          properties: {
            image_path: { components: { list: Components.PhotoPreview, show: Components.PhotoPreview } },
          },
        },
      },
    ],
  })

  // Le back office a son propre compte (env), sans colonne `role` : la base est partagée
  // avec les 3 autres API, on évite de modifier le schéma.
  return AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email, password) =>
        email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD
          ? { email }
          : null,
      cookieName: 'adminjs',
      cookiePassword: process.env.ADMIN_COOKIE_SECRET,
    },
    null,
    { resave: false, saveUninitialized: false, secret: process.env.ADMIN_COOKIE_SECRET },
  )
}
