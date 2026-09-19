import { Inject, Injectable } from '@nestjs/common'
import type { Pool } from 'mysql2/promise'
import { DATABASE_POOL } from '../database/database.module'

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async list() {
    const [rows] = await this.pool.query('SELECT id, pseudo FROM users ORDER BY pseudo ASC')
    return rows
  }
}
