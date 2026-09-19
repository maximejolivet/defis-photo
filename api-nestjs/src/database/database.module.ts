import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import mysql from 'mysql2/promise'

export const DATABASE_POOL = 'DATABASE_POOL'

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        mysql.createPool({
          host: config.get<string>('DB_HOST'),
          database: config.get<string>('DB_NAME'),
          user: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASS'),
          waitForConnections: true,
          connectionLimit: 10,
          charset: 'utf8mb4',
        }),
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule {}
