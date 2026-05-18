import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { HealthController } from "./health.controller";
import { FirebaseAdminService } from "./firebase-admin.service";
import { PrismaService } from "./prisma.service";
import { ResourcesController } from "./resources.controller";
import { ResourcesService } from "./resources.service";
import { SeedService } from "./seed";
import { StatsController } from "./stats.controller";
import { StorageController } from "./storage.controller";
import { StorageService } from "./storage.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [
    HealthController,
    AuthController,
    CatalogController,
    ResourcesController,
    StorageController,
    UsersController,
    StatsController,
  ],
  providers: [
    PrismaService,
    SeedService,
    FirebaseAdminService,
    AuthService,
    CatalogService,
    ResourcesService,
    StorageService,
    UsersService,
  ],
})
export class AppModule {}
