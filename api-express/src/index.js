import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { buildAdminRouter } from './admin.js'
import authRoutes from './routes/auth.routes.js'
import challengesRoutes from './routes/challenges.routes.js'
import gamificationRoutes from './routes/gamification.routes.js'
import usersRoutes from './routes/users.routes.js'
import photosRoutes from './routes/photos.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Derrière Traefik : sans ça req.ip serait toujours l'IP du proxy (rate limiting inutile).
app.set('trust proxy', 1)

// Sans CORS_ORIGINS on n'autorise que le dev server Vite : jamais « toutes les origines »
// (origin: true + credentials reflèterait n'importe quel site).
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins, credentials: true }))
// AdminJS doit passer avant express.json() : il parse lui-même ses requêtes (formidable).
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_COOKIE_SECRET) {
  app.use('/admin', await buildAdminRouter())
} else {
  console.warn('Back office AdminJS désactivé (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_COOKIE_SECRET manquants).')
}

// Après /admin : la CSP par défaut de helmet casserait l'UI AdminJS (scripts/styles inline).
// CORP cross-origin : le frontend (autre origine) charge les images depuis /uploads.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(express.json())
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'), {
    setHeaders: (res) => {
      // Un upload ne doit jamais être interprété comme une page (défense en profondeur).
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox")
    },
  }),
)

app.use('/api/auth', authRoutes)
app.use('/api/challenges', challengesRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/photos', photosRoutes)

app.use((err, _req, res, _next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Fichier trop volumineux (max 250MB).' })
  }
  console.error(err)
  res.status(500).json({ message: 'Erreur interne du serveur.' })
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`API listening on port ${port}`))
