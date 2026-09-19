<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use App\Models\UserStat;
use Illuminate\Support\Facades\DB;

class GamificationController extends Controller
{
    public function stats()
    {
        $userId = auth('api')->id();

        $me = UserStat::find($userId) ?? (object) [
            'user_id' => $userId,
            'photo_count' => 0,
            'challenges_completed' => 0,
            'total_points' => 0,
        ];
        $totalPoints = (int) $me->total_points;

        $myChallenges = Photo::where('user_id', $userId)
            ->distinct()
            ->pluck('challenge_id')
            ->map(fn ($id) => (int) $id)
            ->values();

        $leaderboard = UserStat::orderByDesc('total_points')
            ->limit(10)
            ->get(['user_id', 'pseudo', 'total_points', 'photo_count'])
            ->map(fn ($row) => [
                'user_id' => (int) $row->user_id,
                'pseudo' => $row->pseudo,
                'total_points' => (int) $row->total_points,
                'level' => self::level((int) $row->total_points),
            ]);

        return response()->json([
            'my_challenges' => $myChallenges,
            'level' => self::level($totalPoints),
            'total_points' => $totalPoints,
            'photo_count' => (int) $me->photo_count,
            'challenges_completed' => (int) $me->challenges_completed,
            'next_level' => self::nextLevel($totalPoints),
            'leaderboard' => $leaderboard,
        ]);
    }

    public function winner()
    {
        $row = DB::selectOne(<<<'SQL'
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

        return response()->json([
            'winner' => $row ? [
                'user_id' => (int) $row->user_id,
                'pseudo' => $row->pseudo,
                'win_at' => $row->win_at,
            ] : null,
        ]);
    }

    private static function level(int $points): string
    {
        return match (true) {
            $points >= 250 => '🏆',
            $points >= 150 => '💪',
            $points >= 50 => '😐',
            default => '😬',
        };
    }

    private static function nextLevel(int $points): ?array
    {
        return match (true) {
            $points < 50 => ['name' => 'Amateur', 'at' => 50],
            $points < 150 => ['name' => 'Confirmé', 'at' => 150],
            $points < 250 => ['name' => 'Expert', 'at' => 250],
            default => null,
        };
    }
}
