<?php

namespace App\Controller\Api;

use App\Entity\User;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/gamification')]
class GamificationController
{
    public function __construct(private readonly Connection $db)
    {
    }

    private function getLevel(int $points): string
    {
        return match (true) {
            $points >= 250 => '🏆',
            $points >= 150 => '💪',
            $points >= 50 => '😐',
            default => '😬',
        };
    }

    private function getNextLevel(int $points): ?array
    {
        return match (true) {
            $points < 50 => ['name' => 'Amateur', 'at' => 50],
            $points < 150 => ['name' => 'Confirmé', 'at' => 150],
            $points < 250 => ['name' => 'Expert', 'at' => 250],
            default => null,
        };
    }

    #[Route('/stats', methods: ['GET'])]
    public function stats(#[CurrentUser] User $user): JsonResponse
    {
        $userId = $user->getId();

        $me = $this->db->fetchAssociative('SELECT * FROM user_stats WHERE user_id = ?', [$userId]) ?: [
            'user_id' => $userId,
            'photo_count' => 0,
            'challenges_completed' => 0,
            'total_points' => 0,
        ];
        $totalPoints = (int) $me['total_points'];

        $myChallenges = array_map(
            fn ($row) => (int) $row['challenge_id'],
            $this->db->fetchAllAssociative('SELECT DISTINCT challenge_id FROM photos WHERE user_id = ?', [$userId]),
        );

        $leaderboard = array_map(
            fn ($row) => [
                'user_id' => (int) $row['user_id'],
                'pseudo' => $row['pseudo'],
                'total_points' => (int) $row['total_points'],
                'level' => $this->getLevel((int) $row['total_points']),
            ],
            $this->db->fetchAllAssociative(
                'SELECT user_id, pseudo, total_points, photo_count FROM user_stats ORDER BY total_points DESC LIMIT 10',
            ),
        );

        return new JsonResponse([
            'my_challenges' => $myChallenges,
            'level' => $this->getLevel($totalPoints),
            'total_points' => $totalPoints,
            'photo_count' => (int) $me['photo_count'],
            'challenges_completed' => (int) $me['challenges_completed'],
            'next_level' => $this->getNextLevel($totalPoints),
            'leaderboard' => $leaderboard,
        ]);
    }

    #[Route('/winner', methods: ['GET'])]
    public function winner(): JsonResponse
    {
        $row = $this->db->fetchAssociative(<<<'SQL'
            WITH ranked AS (
                SELECT
                    user_id,
                    challenge_id,
                    MIN(created_at) AS first_done_at,
                    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY MIN(created_at)) AS rn
                FROM photos
                WHERE challenge_id IS NOT NULL
                GROUP BY user_id, challenge_id
            )
            SELECT r.user_id, u.pseudo, r.first_done_at AS win_at
            FROM ranked r
            JOIN users u ON u.id = r.user_id
            WHERE r.rn = 8
            ORDER BY r.first_done_at ASC
            LIMIT 1
        SQL);

        return new JsonResponse([
            'winner' => $row ? [
                'user_id' => (int) $row['user_id'],
                'pseudo' => $row['pseudo'],
                'win_at' => $row['win_at'],
            ] : null,
        ]);
    }
}
