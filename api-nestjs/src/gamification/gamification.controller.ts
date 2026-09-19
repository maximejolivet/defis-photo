import { Controller, Get, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import type { JwtPayload } from '../auth/jwt.strategy'
import { GamificationService } from './gamification.service'

@Controller('api/gamification')
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats(@CurrentUser() user: JwtPayload) {
    return this.gamification.stats(user.id)
  }

  @Get('winner')
  winner() {
    return this.gamification.winner()
  }
}
