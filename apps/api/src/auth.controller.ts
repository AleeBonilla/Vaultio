import { Body, Controller, Get, Headers, HttpCode, Inject, NotFoundException, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { config } from "./config";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() body: any) {
    if (!config.auth.allowDemoTokens) {
      throw new NotFoundException({ message: "Registro disponible solo via Firebase Auth" });
    }
    return this.auth.register(body);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() body: any) {
    if (!config.auth.allowDemoTokens) {
      throw new NotFoundException({ message: "Login disponible solo via Firebase Auth" });
    }
    return this.auth.login(body);
  }

  @Get("me")
  me(@Headers("authorization") authorization?: string) {
    return this.auth.me(authorization);
  }
}
