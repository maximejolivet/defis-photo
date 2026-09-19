import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import { pool } from '../db.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

// Le PIN n'a que 10 000 combinaisons : on limite les échecs par (IP, pseudo).
// skipSuccessfulRequests : une connexion réussie ne consomme pas le quota, et la clé
// inclut le pseudo pour que des invités derrière la même box ne se bloquent pas entre eux.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.pseudo ?? '').slice(0, 64)}`,
  message: { message: 'Trop de tentatives, réessaie dans 15 minutes.' },
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: { message: 'Trop de créations de compte, réessaie plus tard.' },
})

router.post('/register', registerLimiter, async (req, res) => {
  const { pseudo, pin } = req.body || {}

  if (!pseudo || !pin) {
    return res.status(400).json({ message: 'Données incomplètes (pseudo et code PIN requis).' })
  }

  const trimmedPseudo = String(pseudo).trim()
  if (!trimmedPseudo) {
    return res.status(400).json({ message: 'Le pseudo ne peut pas être vide.' })
  }

  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ message: 'Le code PIN doit contenir exactement 4 chiffres.' })
  }

  try {
    const hashedPin = await bcrypt.hash(pin, 10)
    await pool.execute('INSERT INTO users (pseudo, password) VALUES (?, ?)', [trimmedPseudo, hashedPin])
    res.json({ message: 'Utilisateur créé avec succès.' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ce pseudo est déjà utilisé.' })
    }
    res.status(500).json({ message: "Erreur lors de l'inscription." })
  }
})

router.post('/login', loginLimiter, async (req, res) => {
  const { pseudo, pin } = req.body || {}

  if (!pseudo || !pin) {
    return res.status(400).json({ message: 'Données manquantes (pseudo ou code PIN).' })
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, pseudo, password FROM users WHERE pseudo = ?',
      [String(pseudo).trim()],
    )
    const user = rows[0]

    if (!user || !(await bcrypt.compare(pin, user.password))) {
      return res.status(401).json({ message: 'Identifiants incorrects.' })
    }

    const token = signToken(user)
    res.json({
      message: 'Connexion réussie.',
      token,
      user: { id: user.id, pseudo: user.pseudo },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur lors de la connexion.' })
  }
})

export default router
