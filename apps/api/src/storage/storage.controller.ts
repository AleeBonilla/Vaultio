import { Body, Controller, Get, Headers, Inject, Post, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { StorageService } from "./storage.service";

@Controller("storage")
export class StorageController {
  constructor(@Inject(StorageService) private readonly storage: StorageService) {}

  @Post("uploads")
  createUploadUrl(@Headers("authorization") authorization: string | undefined, @Body() body: any) {
    return this.storage.createUploadUrl(authorization, body);
  }

  @Get("public")
  async publicObject(@Query("key") key: string, @Res() response: Response) {
    const url = await this.storage.createReadUrl(key);
    response.redirect(url);
  }
}
