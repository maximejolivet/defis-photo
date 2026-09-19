import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/list', requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, pseudo FROM users ORDER BY pseudo ASC')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' })
  }
})

export default router
