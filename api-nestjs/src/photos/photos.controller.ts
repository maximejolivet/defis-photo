import { randomBytes } from 'node:crypto'
import path from 'node:path'
import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import type { JwtPayload } from '../auth/jwt.strategy'
import { PhotosService, UPLOAD_DIR } from './photos.service'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/x-adobe-dng',
  'image/heif',
  'image/tiff',
  'image/bmp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/avi',
  'video/x-msvideo',
  'video/mpeg',
  'video/3gpp',
])

@Controller('api/photos')
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Get('gallery')
  gallery() {
    return this.photos.gallery()
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          cb(null, `tmp_${randomBytes(8).toString('hex')}${path.extname(file.originalname)}`)
        },
      }),
      limits: { fileSize: 250 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        cb(null, ALLOWED_TYPES.has(file.mimetype))
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
    @Body('challenge_id') challengeId?: string,
    @Body('recipient_user_id') recipientUserId?: string,
  ) {
    return this.photos.upload(file, user.id, user.pseudo, challengeId, recipientUserId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete')
  remove(@Body('photo_id') photoId: number, @CurrentUser() user: JwtPayload) {
    return this.photos.remove(Number(photoId) || 0, user.id)
  }
}
