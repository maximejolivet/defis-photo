import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('list')
  list() {
    return this.users.list()
  }
}
