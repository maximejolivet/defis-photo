<?php

namespace App\Support;

class FileNaming
{
    public static function sanitizeFilePart(string $str): string
    {
        $str = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str) ?: $str;
        $str = strtolower($str);
        $str = preg_replace('/[^a-z0-9]+/', '_', $str);

        return trim($str, '_');
    }
}
