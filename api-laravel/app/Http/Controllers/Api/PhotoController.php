<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\Photo;
use App\Support\FileNaming;
use App\Support\ImageConverter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PhotoController extends Controller
{
    private const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'];

    public function gallery()
    {
        return DB::table('photos as p')
            ->join('users as u', 'p.user_id', '=', 'u.id')
            ->leftJoin('challenges as c', 'p.challenge_id', '=', 'c.id')
            ->leftJoin('users as ru', 'p.recipient_user_id', '=', 'ru.id')
            ->orderByDesc('p.created_at')
            ->get([
                'p.id', 'p.user_id', 'p.image_path', 'p.created_at', 'u.pseudo as user_name',
                'c.id as challenge_id', 'c.title as challenge_title', 'c.icon as challenge_icon',
                'p.recipient_user_id', 'ru.pseudo as recipient_pseudo',
            ]);
    }

    public function upload(Request $request)
    {
        $file = $request->file('photo');
        if (! $file || ! $file->isValid()) {
            return response()->json(['message' => 'Aucun fichier reçu, ou format non supporté.'], 400);
        }

        $user = $request->user();
        $challengeId = (int) $request->input('challenge_id') > 0 ? (int) $request->input('challenge_id') : null;
        $recipientUserId = (int) $request->input('recipient_user_id') > 0 ? (int) $request->input('recipient_user_id') : null;

        $challengeTitle = 'libre';
        if ($challengeId !== null) {
            $challenge = Challenge::find($challengeId);
            if (! $challenge) {
                return response()->json(['message' => 'Défi invalide.'], 400);
            }
            $challengeTitle = $challenge->title;
        }

        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType();
        $isVideo = str_starts_with($mimeType, 'video/') || in_array($extension, self::VIDEO_EXTENSIONS, true);
        $prefix = $isVideo ? 'video_' : 'photo_';
        $datetime = now()->format('Ymd_His');
        $uniqueKey = Str::random(8);
        $filename = $prefix.FileNaming::sanitizeFilePart($user->pseudo).'_'.FileNaming::sanitizeFilePart($challengeTitle).'_'.$datetime.'_'.$uniqueKey.'.'.$extension;

        $uploadDir = public_path('uploads');
        $file->move($uploadDir, $filename);
        $finalPath = $uploadDir.DIRECTORY_SEPARATOR.$filename;

        if (! $isVideo) {
            $converted = ImageConverter::toJpeg($finalPath, $mimeType);
            if ($converted) {
                $filename = basename($converted);
            }
        }

        $photo = Photo::create([
            'user_id' => $user->id,
            'image_path' => $filename,
            'challenge_id' => $challengeId,
            'recipient_user_id' => $recipientUserId,
        ]);

        return response()->json([
            'message' => 'Photo uploadée avec succès.',
            'photo' => ['id' => $photo->id, 'path' => $filename],
        ]);
    }

    public function delete(Request $request)
    {
        $photoId = (int) $request->input('photo_id');
        if ($photoId < 1) {
            return response()->json(['message' => 'ID de photo invalide.'], 400);
        }

        $photo = Photo::find($photoId);
        if (! $photo) {
            return response()->json(['message' => 'Photo introuvable.'], 404);
        }
        if ($photo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez supprimer que vos propres photos.'], 403);
        }

        $photo->delete();
        @unlink(public_path('uploads/'.$photo->image_path));

        return response()->json(['message' => 'Photo supprimée.']);
    }
}
