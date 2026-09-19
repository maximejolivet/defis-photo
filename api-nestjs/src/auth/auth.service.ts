import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcryptjs'
import type { Pool, RowDataPacket } from 'mysql2/promise'
import { DATABASE_POOL } from '../database/database.module'
import type { LoginDto } from './dto/login.dto'
import type { RegisterDto } from './dto/register.dto'

interface UserRow extends RowDataPacket {
  id: number
  pseudo: string
  password: string
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly jwt: JwtService,
  ) {}

  async register({ pseudo, pin }: RegisterDto) {
    if (!pseudo || !pin) {
      throw new BadRequestException('Données incomplètes (pseudo et code PIN requis).')
    }

    const trimmedPseudo = String(pseudo).trim()
    if (!trimmedPseudo) {
      throw new BadRequestException('Le pseudo ne peut pas être vide.')
    }
    if (!/^\d{4}$/.test(pin)) {
      throw new BadRequestException('Le code PIN doit contenir exactement 4 chiffres.')
    }

    const hashedPin = await bcrypt.hash(pin, 10)
    try {
      await this.pool.execute('INSERT INTO users (pseudo, password) VALUES (?, ?)', [trimmedPseudo, hashedPin])
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ce pseudo est déjà utilisé.')
      }
      throw err
    }

    return { message: 'Utilisateur créé avec succès.' }
  }

  async login({ pseudo, pin }: LoginDto) {
    if (!pseudo || !pin) {
      throw new BadRequestException('Données manquantes (pseudo ou code PIN).')
    }

    const [rows] = await this.pool.execute<UserRow[]>('SELECT id, pseudo, password FROM users WHERE pseudo = ?', [
      String(pseudo).trim(),
    ])
    const user = rows[0]

    if (!user || !(await bcrypt.compare(pin, user.password))) {
      throw new UnauthorizedException('Identifiants incorrects.')
    }

    const token = this.jwt.sign({ id: user.id, pseudo: user.pseudo })
    return {
      message: 'Connexion réussie.',
      token,
      user: { id: user.id, pseudo: user.pseudo },
    }
  }
}
