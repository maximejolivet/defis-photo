import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { AppModule } from './app.module'

// AdminJS est 100 % ESM alors que ce projet compile en CommonJS : tsc transformerait un
// `import()` en `require()` et planterait. Ce wrapper garde un vrai import() dynamique.
const importEsm = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
  app.enableCors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true })

  // AdminJS doit être monté avant les body parsers de Nest (ils sont enregistrés au listen()) :
  // il parse lui-même ses requêtes (formidable).
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_COOKIE_SECRET) {
    const { buildAdminRouter } = await importEsm(pathToFileURL(path.join(__dirname, 'admin', 'admin.mjs')).href)
    app.use('/admin', await buildAdminRouter())
  } else {
    console.warn('Back office AdminJS désactivé (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_COOKIE_SECRET manquants).')
  }

  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), { prefix: '/uploads' })

  const port = process.env.PORT || 3002
  await app.listen(port)
  console.log(`API (NestJS) listening on port ${port}`)
}

bootstrap()
