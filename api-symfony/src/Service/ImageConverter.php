<?php

namespace App\Service;

use Imagick;

// Best-effort JPEG conversion, ported from the original api_old/api/photos/upload.php
// (Imagick first, GD fallback). On any failure the original file is kept as-is.
class ImageConverter
{
    private const IMAGE_MIMES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'image/heic', 'image/heif', 'image/x-adobe-dng', 'image/tiff', 'image/bmp',
    ];

    private const GD_UNSUPPORTED = ['image/heic', 'image/heif', 'image/x-adobe-dng', 'image/tiff'];

    /**
     * @return string|null the new filename if converted, null if kept as-is
     */
    public function convertToJpeg(string $uploadPath, string $mimeType, string $currentFilename): ?string
    {
        if (!in_array($mimeType, self::IMAGE_MIMES, true)) {
            return null;
        }

        $jpegFilename = pathinfo($currentFilename, PATHINFO_FILENAME) . '.jpg';
        $jpegPath = dirname($uploadPath) . '/' . $jpegFilename;

        if (class_exists(Imagick::class)) {
            try {
                $imagick = new Imagick($uploadPath);
                $imagick->setImageFormat('jpeg');
                $imagick->setImageCompressionQuality(90);
                $imagick->stripImage();
                $imagick->writeImage($jpegPath);
                $imagick->clear();
                $imagick->destroy();
                if ($jpegPath !== $uploadPath) {
                    @unlink($uploadPath);
                }

                return $jpegFilename;
            } catch (\Throwable) {
                // fall through to GD
            }
        }

        if (function_exists('imagecreatefromstring') && !in_array($mimeType, self::GD_UNSUPPORTED, true)) {
            $gdImage = @imagecreatefromstring((string) file_get_contents($uploadPath));
            if ($gdImage !== false) {
                imagejpeg($gdImage, $jpegPath, 90);
                imagedestroy($gdImage);
                if ($jpegPath !== $uploadPath) {
                    @unlink($uploadPath);
                }

                return $jpegFilename;
            }
        }

        return null;
    }
}
