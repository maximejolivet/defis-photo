import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { ChallengesModule } from './challenges/challenges.module'
import { DatabaseModule } from './database/database.module'
import { GamificationModule } from './gamification/gamification.module'
import { PhotosModule } from './photos/photos.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ChallengesModule,
    UsersModule,
    GamificationModule,
    PhotosModule,
  ],
})
export class AppModule {}
