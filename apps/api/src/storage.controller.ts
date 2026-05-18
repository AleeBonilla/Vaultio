import { Body, Controller, Headers, Inject, Post } from "@nestjs/common";
import { StorageService } from "./storage.service";

@Controller("storage")
export class StorageController {
  constructor(@Inject(StorageService) private readonly storage: StorageService) {}

  @Post("uploads")
  createUploadUrl(@Headers("authorization") authorization: string | undefined, @Body() body: any) {
    return this.storage.createUploadUrl(authorization, body);
  }
}
