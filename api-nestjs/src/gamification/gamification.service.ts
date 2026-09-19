import { Inject, Injectable } from '@nestjs/common'
import type { Pool, RowDataPacket } from 'mysql2/promise'
import { DATABASE_POOL } from '../database/database.module'

interface StatsRow extends RowDataPacket {
  user_id: number
  pseudo: string
  photo_count: number
  challenges_completed: number
  total_points: number
}

function getLevel(points: number): string {
  if (points >= 250) return '🏆'
  if (points >= 150) return '💪'
  if (points >= 50) return '😐'
  return '😬'
}

function getNextLevel(points: number): { name: string; at: number } | null {
  if (points < 50) return { name: 'Amateur', at: 50 }
  if (points < 150) return { name: 'Confirmé', at: 150 }
  if (points < 250) return { name: 'Expert', at: 250 }
  return null
}

@Injectable()
export class GamificationService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async stats(userId: number) {
    const [statsRows] = await this.pool.execute<StatsRow[]>('SELECT * FROM user_stats WHERE user_id = ?', [userId])
    const me = statsRows[0] || {
      user_id: userId,
      photo_count: 0,
      challenges_completed: 0,
      total_points: 0,
    }
    const totalPoints = Number(me.total_points)

    const [challengeRows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT DISTINCT challenge_id FROM photos WHERE user_id = ?',
      [userId],
    )
    const myChallenges = challengeRows.map((row) => Number(row.challenge_id))

    const [leaderboardRows] = await this.pool.query<StatsRow[]>(
      'SELECT user_id, pseudo, total_points, photo_count FROM user_stats ORDER BY total_points DESC LIMIT 10',
    )
    const leaderboard = leaderboardRows.map((row) => ({
      user_id: Number(row.user_id),
      pseudo: row.pseudo,
      total_points: Number(row.total_points),
      level: getLevel(Number(row.total_points)),
    }))

    return {
      my_challenges: myChallenges,
      level: getLevel(totalPoints),
      total_points: totalPoints,
      photo_count: Number(me.photo_count),
      challenges_completed: Number(me.challenges_completed),
      next_level: getNextLevel(totalPoints),
      leaderboard,
    }
  }

  async winner() {
    const [rows] = await this.pool.query<RowDataPacket[]>(`
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
    `)
    const row = rows[0]
    return {
      winner: row ? { user_id: Number(row.user_id), pseudo: row.pseudo, win_at: row.win_at } : null,
    }
  }
}
