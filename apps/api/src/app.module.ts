import { Module } from "@nestjs/common";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { CatalogController } from "./catalog/catalog.controller";
import { CatalogService } from "./catalog/catalog.service";
import { FirebaseAdminService } from "./firebase/firebase-admin.service";
import { HealthController } from "./health/health.controller";
import { PrismaService } from "./prisma/prisma.service";
import { ResourcesController } from "./resources/resources.controller";
import { ResourcesService } from "./resources/resources.service";
import { SeedService } from "./seed/seed.service";
import { StatsController } from "./stats/stats.controller";
import { StorageController } from "./storage/storage.controller";
import { StorageService } from "./storage/storage.service";
import { PublicUsersController, UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";

@Module({
  controllers: [
    HealthController,
    AuthController,
    CatalogController,
    ResourcesController,
    StorageController,
    UsersController,
    PublicUsersController,
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
