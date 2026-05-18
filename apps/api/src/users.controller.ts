import { Body, Controller, Get, Headers, Inject, Patch } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("users/me")
export class UsersController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Get()
  me(@Headers("authorization") authorization?: string) {
    return this.users.me(authorization);
  }

  @Patch()
  update(@Headers("authorization") authorization: string | undefined, @Body() body: any) {
    return this.users.updateMe(authorization, body);
  }

  @Get("stats")
  stats(@Headers("authorization") authorization?: string) {
    return this.users.stats(authorization);
  }

  @Get("resources")
  uploads(@Headers("authorization") authorization?: string) {
    return this.users.uploads(authorization);
  }

  @Get("saved")
  saved(@Headers("authorization") authorization?: string) {
    return this.users.saved(authorization);
  }
}
