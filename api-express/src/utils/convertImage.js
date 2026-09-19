import { rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const CONVERTIBLE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/bmp',
])

// Best-effort JPEG conversion, mirroring the old PHP Imagick/GD pipeline.
// HEIC/HEIF support depends on the libvips build sharp links against, and
// DNG isn't supported at all — on any failure we keep the original file,
// same fallback behavior as the PHP version.
export async function convertToJpeg(uploadPath, mimeType) {
  if (!CONVERTIBLE_MIMES.has(mimeType)) return null

  const jpegPath = path.join(
    path.dirname(uploadPath),
    `${path.parse(uploadPath).name}.jpg`,
  )

  try {
    await sharp(uploadPath).jpeg({ quality: 90 }).toFile(`${jpegPath}.tmp`)
    await rename(`${jpegPath}.tmp`, jpegPath)
    if (jpegPath !== uploadPath) await unlink(uploadPath)
    return jpegPath
  } catch {
    return null
  }
}
