import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rename, unlink } from 'node:fs/promises'
import { Router } from 'express'
import multer from 'multer'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { sanitizeFilePart } from '../utils/sanitize.js'
import { convertToJpeg } from '../utils/convertImage.js'

const router = Router()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')

// Liste blanche type MIME -> extension. L'extension du fichier stocké vient d'ici,
// jamais du nom envoyé par le client : sinon un `x.html` déclaré `image/png`
// serait servi en text/html par /uploads (XSS stocké).
const EXTENSION_BY_MIME = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/heic', 'heic'],
  ['image/heif', 'heif'],
  ['image/x-adobe-dng', 'dng'],
  ['image/tiff', 'tiff'],
  ['image/bmp', 'bmp'],
  ['video/mp4', 'mp4'],
  ['video/quicktime', 'mov'],
  ['video/webm', 'webm'],
  ['video/avi', 'avi'],
  ['video/x-msvideo', 'avi'],
  ['video/mpeg', 'mpeg'],
  ['video/3gpp', '3gp'],
])

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    // Extension neutre : le fichier est renommé juste après, ne jamais reprendre celle du client.
    filename: (_req, _file, cb) => {
      cb(null, `tmp_${randomBytes(8).toString('hex')}.part`)
    },
  }),
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, EXTENSION_BY_MIME.has(file.mimetype))
  },
})

router.get('/gallery', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.user_id, p.image_path, p.created_at, u.pseudo AS user_name,
             c.id AS challenge_id, c.title AS challenge_title, c.icon AS challenge_icon,
             p.recipient_user_id, ru.pseudo AS recipient_pseudo
      FROM photos p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN challenges c ON p.challenge_id = c.id
      LEFT JOIN users ru ON p.recipient_user_id = ru.id
      ORDER BY p.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur lors de la récupération de la galerie.' })
  }
})

router.post('/upload', requireAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier reçu, ou format non supporté.' })
  }

  const userId = req.user.id
  const pseudo = req.user.pseudo
  const challengeId = Number(req.body.challenge_id) > 0 ? Number(req.body.challenge_id) : null
  const recipientUserId = Number(req.body.recipient_user_id) > 0 ? Number(req.body.recipient_user_id) : null

  try {
    let challengeTitle = 'libre'
    if (challengeId !== null) {
      const [rows] = await pool.execute('SELECT title FROM challenges WHERE id = ?', [challengeId])
      if (!rows[0]) {
        await unlink(req.file.path)
        return res.status(400).json({ message: 'Défi invalide.' })
      }
      challengeTitle = rows[0].title
    }

    const extension = EXTENSION_BY_MIME.get(req.file.mimetype)
    const isVideo = req.file.mimetype.startsWith('video/')
    const prefix = isVideo ? 'video_' : 'photo_'
    const datetime = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)
    const uniqueKey = randomBytes(4).toString('hex')
    let filename = `${prefix}${sanitizeFilePart(pseudo)}_${sanitizeFilePart(challengeTitle)}_${datetime}_${uniqueKey}.${extension}`
    let finalPath = path.join(UPLOAD_DIR, filename)

    await rename(req.file.path, finalPath)

    if (!isVideo) {
      const convertedPath = await convertToJpeg(finalPath, req.file.mimetype)
      if (convertedPath) {
        filename = path.basename(convertedPath)
        finalPath = convertedPath
      }
    }

    const [result] = await pool.execute(
      'INSERT INTO photos (user_id, image_path, challenge_id, recipient_user_id) VALUES (?, ?, ?, ?)',
      [userId, filename, challengeId, recipientUserId],
    )

    res.json({
      message: 'Photo uploadée avec succès.',
      photo: { id: result.insertId, path: filename },
    })
  } catch (err) {
    console.error(err)
    await unlink(req.file.path).catch(() => {})
    res.status(500).json({ message: 'Erreur lors du traitement de la photo.' })
  }
})

router.post('/delete', requireAuth, async (req, res) => {
  const photoId = Number(req.body?.photo_id) || 0
  if (photoId < 1) {
    return res.status(400).json({ message: 'ID de photo invalide.' })
  }

  try {
    const [rows] = await pool.execute('SELECT id, user_id, image_path FROM photos WHERE id = ?', [photoId])
    const photo = rows[0]

    if (!photo) {
      return res.status(404).json({ message: 'Photo introuvable.' })
    }
    if (photo.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres photos.' })
    }

    await pool.execute('DELETE FROM photos WHERE id = ?', [photoId])
    await unlink(path.join(UPLOAD_DIR, photo.image_path)).catch(() => {})

    res.json({ message: 'Photo supprimée.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur lors de la suppression.' })
  }
})

export default router
