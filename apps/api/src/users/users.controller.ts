import { Body, Controller, Get, Headers, Inject, Param, Patch, Post } from "@nestjs/common";
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

  @Get("activity")
  activity(@Headers("authorization") authorization?: string) {
    return this.users.activity(authorization);
  }

  @Get("courses")
  courses(@Headers("authorization") authorization?: string) {
    return this.users.courses(authorization);
  }

  @Patch("courses")
  updateCourses(@Headers("authorization") authorization: string | undefined, @Body() body: any) {
    return this.users.updateCourses(authorization, body);
  }
}

@Controller("users")
export class PublicUsersController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Get(":id")
  profile(@Param("id") id: string) {
    return this.users.publicProfile(id);
  }

  @Get(":id/resources")
  uploads(@Param("id") id: string) {
    return this.users.publicUploads(id);
  }

  @Post(":id/report")
  report(
    @Headers("authorization") authorization: string | undefined,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.users.reportUser(authorization, id, body);
  }
}
