import { Controller, Get } from '@nestjs/common'
import { ChallengesService } from './challenges.service'

@Controller('api/challenges')
export class ChallengesController {
  constructor(private readonly challenges: ChallengesService) {}

  @Get('list')
  list() {
    return this.challenges.list()
  }
}
