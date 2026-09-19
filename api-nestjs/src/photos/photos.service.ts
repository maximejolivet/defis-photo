import { randomBytes } from 'node:crypto'
import { unlink, rename } from 'node:fs/promises'
import path from 'node:path'
import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { Pool, RowDataPacket } from 'mysql2/promise'
import { DATABASE_POOL } from '../database/database.module'
import { convertToJpeg } from '../common/convert-image.util'
import { sanitizeFilePart } from '../common/sanitize.util'

export const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'])

@Injectable()
export class PhotosService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async gallery() {
    const [rows] = await this.pool.query(`
      SELECT p.id, p.user_id, p.image_path, p.created_at, u.pseudo AS user_name,
             c.id AS challenge_id, c.title AS challenge_title, c.icon AS challenge_icon,
             p.recipient_user_id, ru.pseudo AS recipient_pseudo
      FROM photos p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN challenges c ON p.challenge_id = c.id
      LEFT JOIN users ru ON p.recipient_user_id = ru.id
      ORDER BY p.created_at DESC
    `)
    return rows
  }

  async upload(
    file: Express.Multer.File,
    userId: number,
    pseudo: string,
    challengeIdRaw: string | undefined,
    recipientUserIdRaw: string | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu, ou format non supporté.')
    }

    const challengeId = Number(challengeIdRaw) > 0 ? Number(challengeIdRaw) : null
    const recipientUserId = Number(recipientUserIdRaw) > 0 ? Number(recipientUserIdRaw) : null

    let challengeTitle = 'libre'
    if (challengeId !== null) {
      const [rows] = await this.pool.execute<RowDataPacket[]>('SELECT title FROM challenges WHERE id = ?', [
        challengeId,
      ])
      if (!rows[0]) {
        await unlink(file.path)
        throw new BadRequestException('Défi invalide.')
      }
      challengeTitle = rows[0].title
    }

    const extension = path.extname(file.originalname).slice(1)
    const isVideo = file.mimetype.startsWith('video/') || VIDEO_EXTENSIONS.has(extension.toLowerCase())
    const prefix = isVideo ? 'video_' : 'photo_'
    const datetime = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)
    const uniqueKey = randomBytes(4).toString('hex')
    let filename = `${prefix}${sanitizeFilePart(pseudo)}_${sanitizeFilePart(challengeTitle)}_${datetime}_${uniqueKey}.${extension}`
    let finalPath = path.join(UPLOAD_DIR, filename)

    await rename(file.path, finalPath)

    if (!isVideo) {
      const convertedPath = await convertToJpeg(finalPath, file.mimetype)
      if (convertedPath) {
        filename = path.basename(convertedPath)
        finalPath = convertedPath
      }
    }

    const [result] = await this.pool.execute<any>(
      'INSERT INTO photos (user_id, image_path, challenge_id, recipient_user_id) VALUES (?, ?, ?, ?)',
      [userId, filename, challengeId, recipientUserId],
    )

    return { message: 'Photo uploadée avec succès.', photo: { id: result.insertId, path: filename } }
  }

  async remove(photoId: number, userId: number) {
    if (photoId < 1) {
      throw new BadRequestException('ID de photo invalide.')
    }

    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT id, user_id, image_path FROM photos WHERE id = ?',
      [photoId],
    )
    const photo = rows[0]

    if (!photo) {
      throw new NotFoundException('Photo introuvable.')
    }
    if (photo.user_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres photos.')
    }

    await this.pool.execute('DELETE FROM photos WHERE id = ?', [photoId])
    await unlink(path.join(UPLOAD_DIR, photo.image_path)).catch(() => {})

    return { message: 'Photo supprimée.' }
  }
}
