<?php

namespace App\Support;

// Best-effort JPEG conversion, ported from api_old/api/photos/upload.php (Imagick with a
// GD fallback). On any failure we keep the original file untouched — same fallback the
// old PHP API used for formats it couldn't convert (notably DNG).
class ImageConverter
{
    private const IMAGE_MIMES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/heic',
        'image/heif',
        'image/x-adobe-dng',
        'image/tiff',
        'image/bmp',
    ];

    private const GD_UNSUPPORTED = [
        'image/heic',
        'image/heif',
        'image/x-adobe-dng',
        'image/tiff',
    ];

    public static function toJpeg(string $path, string $mimeType): ?string
    {
        if (! in_array($mimeType, self::IMAGE_MIMES, true)) {
            return null;
        }

        $jpegPath = preg_replace('/\.[^.]+$/', '', $path).'.jpg';

        if (class_exists(\Imagick::class)) {
            try {
                $imagick = new \Imagick($path);
                $imagick->setImageFormat('jpeg');
                $imagick->setImageCompressionQuality(90);
                $imagick->stripImage();
                $imagick->writeImage($jpegPath);
                $imagick->clear();
                $imagick->destroy();

                if ($jpegPath !== $path) {
                    @unlink($path);
                }

                return $jpegPath;
            } catch (\Throwable) {
                // fall through to GD
            }
        }

        if (function_exists('imagecreatefromstring') && ! in_array($mimeType, self::GD_UNSUPPORTED, true)) {
            $data = @file_get_contents($path);
            $gdImage = $data !== false ? @imagecreatefromstring($data) : false;

            if ($gdImage !== false) {
                imagejpeg($gdImage, $jpegPath, 90);
                imagedestroy($gdImage);

                if ($jpegPath !== $path) {
                    @unlink($path);
                }

                return $jpegPath;
            }
        }

        return null;
    }
}
