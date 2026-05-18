import { Controller, Get, Inject } from "@nestjs/common";
import { UsersService } from "../users/users.service";

@Controller("stats")
export class StatsController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Get()
  public() {
    return this.users.publicStats();
  }
}
