import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/list', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, icon FROM challenges ORDER BY sort_order',
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur lors de la récupération des défis.' })
  }
})

export default router
