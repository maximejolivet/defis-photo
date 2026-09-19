import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function getLevel(points) {
  if (points >= 250) return '🏆'
  if (points >= 150) return '💪'
  if (points >= 50) return '😐'
  return '😬'
}

function getNextLevel(points) {
  if (points < 50) return { name: 'Amateur', at: 50 }
  if (points < 150) return { name: 'Confirmé', at: 150 }
  if (points < 250) return { name: 'Expert', at: 250 }
  return null
}

router.get('/stats', requireAuth, async (req, res) => {
  const userId = req.user.id

  try {
    const [statsRows] = await pool.execute('SELECT * FROM user_stats WHERE user_id = ?', [userId])
    const me = statsRows[0] || {
      user_id: userId,
      photo_count: 0,
      challenges_completed: 0,
      total_points: 0,
    }
    const totalPoints = Number(me.total_points)

    const [challengeRows] = await pool.execute(
      'SELECT DISTINCT challenge_id FROM photos WHERE user_id = ?',
      [userId],
    )
    const myChallenges = challengeRows.map((row) => Number(row.challenge_id))

    const [leaderboardRows] = await pool.query(
      'SELECT user_id, pseudo, total_points, photo_count FROM user_stats ORDER BY total_points DESC LIMIT 10',
    )
    const leaderboard = leaderboardRows.map((row) => ({
      user_id: Number(row.user_id),
      pseudo: row.pseudo,
      total_points: Number(row.total_points),
      level: getLevel(Number(row.total_points)),
    }))

    res.json({
      my_challenges: myChallenges,
      level: getLevel(totalPoints),
      total_points: totalPoints,
      photo_count: Number(me.photo_count),
      challenges_completed: Number(me.challenges_completed),
      next_level: getNextLevel(totalPoints),
      leaderboard,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques.' })
  }
})

router.get('/winner', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
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
    res.json({
      winner: row ? { user_id: Number(row.user_id), pseudo: row.pseudo, win_at: row.win_at } : null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur lors de la récupération du gagnant.' })
  }
})

export default router
