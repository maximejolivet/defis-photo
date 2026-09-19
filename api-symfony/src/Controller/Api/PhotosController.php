<?php

namespace App\Controller\Api;

use App\Entity\Photo;
use App\Entity\User;
use App\Repository\ChallengeRepository;
use App\Repository\PhotoRepository;
use App\Service\FileNaming;
use App\Service\ImageConverter;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/photos')]
class PhotosController
{
    private const ALLOWED_TYPES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/x-adobe-dng',
        'image/heif', 'image/tiff', 'image/bmp',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/avi', 'video/x-msvideo', 'video/mpeg', 'video/3gpp',
    ];

    private const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi', 'mpeg', '3gp'];

    public function __construct(
        private readonly Connection $db,
        private readonly EntityManagerInterface $em,
        private readonly ChallengeRepository $challenges,
        private readonly PhotoRepository $photos,
        private readonly ImageConverter $imageConverter,
        #[Autowire('%kernel.project_dir%/uploads')] private readonly string $uploadDir,
    ) {
    }

    #[Route('/gallery', methods: ['GET'])]
    public function gallery(): JsonResponse
    {
        $rows = $this->db->fetchAllAssociative(<<<'SQL'
            SELECT p.id, p.user_id, p.image_path, p.created_at, u.pseudo AS user_name,
                   c.id AS challenge_id, c.title AS challenge_title, c.icon AS challenge_icon,
                   p.recipient_user_id, ru.pseudo AS recipient_pseudo
            FROM photos p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN challenges c ON p.challenge_id = c.id
            LEFT JOIN users ru ON p.recipient_user_id = ru.id
            ORDER BY p.created_at DESC
        SQL);

        return new JsonResponse($rows);
    }

    #[Route('/upload', methods: ['POST'])]
    public function upload(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $file = $request->files->get('photo');
        if (!$file || !$file->isValid() || !in_array($file->getMimeType(), self::ALLOWED_TYPES, true)) {
            return new JsonResponse(['message' => 'Aucun fichier reçu, ou format non supporté.'], 400);
        }
        if ($file->getSize() > 250 * 1024 * 1024) {
            return new JsonResponse(['message' => 'Fichier trop volumineux (max 250MB).'], 400);
        }

        $challengeId = (int) $request->request->get('challenge_id', 0) > 0
            ? (int) $request->request->get('challenge_id') : null;
        $recipientUserId = (int) $request->request->get('recipient_user_id', 0) > 0
            ? (int) $request->request->get('recipient_user_id') : null;

        $challengeTitle = 'libre';
        if ($challengeId !== null) {
            $challenge = $this->challenges->find($challengeId);
            if (!$challenge) {
                return new JsonResponse(['message' => 'Défi invalide.'], 400);
            }
            $challengeTitle = $challenge->getTitle();
        }

        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $isVideo = str_starts_with($mimeType, 'video/') || in_array(strtolower($extension), self::VIDEO_EXTENSIONS, true);
        $prefix = $isVideo ? 'video_' : 'photo_';
        $datetime = (new \DateTimeImmutable())->format('Ymd_His');
        $uniqueKey = bin2hex(random_bytes(4));
        $filename = sprintf(
            '%s%s_%s_%s_%s.%s',
            $prefix,
            FileNaming::sanitize($user->getPseudo()),
            FileNaming::sanitize($challengeTitle),
            $datetime,
            $uniqueKey,
            $extension,
        );

        $file->move($this->uploadDir, $filename);
        $uploadPath = $this->uploadDir . '/' . $filename;

        if (!$isVideo) {
            $converted = $this->imageConverter->convertToJpeg($uploadPath, $mimeType, $filename);
            if ($converted) {
                $filename = $converted;
            }
        }

        $photo = new Photo();
        $photo->setUserId($user->getId());
        $photo->setImagePath($filename);
        $photo->setChallengeId($challengeId);
        $photo->setRecipientUserId($recipientUserId);

        $this->em->persist($photo);
        $this->em->flush();

        return new JsonResponse([
            'message' => 'Photo uploadée avec succès.',
            'photo' => ['id' => $photo->getId(), 'path' => $filename],
        ]);
    }

    #[Route('/delete', methods: ['POST'])]
    public function delete(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $photoId = (int) ($data['photo_id'] ?? 0);

        if ($photoId < 1) {
            return new JsonResponse(['message' => 'ID de photo invalide.'], 400);
        }

        $photo = $this->photos->find($photoId);
        if (!$photo) {
            return new JsonResponse(['message' => 'Photo introuvable.'], 404);
        }
        if ($photo->getUserId() !== $user->getId()) {
            return new JsonResponse(['message' => 'Vous ne pouvez supprimer que vos propres photos.'], 403);
        }

        $this->em->remove($photo);
        $this->em->flush();
        @unlink($this->uploadDir . '/' . $photo->getImagePath());

        return new JsonResponse(['message' => 'Photo supprimée.']);
    }
}
