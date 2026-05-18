"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth/auth.controller");
const auth_service_1 = require("./auth/auth.service");
const catalog_controller_1 = require("./catalog/catalog.controller");
const catalog_service_1 = require("./catalog/catalog.service");
const firebase_admin_service_1 = require("./firebase/firebase-admin.service");
const health_controller_1 = require("./health/health.controller");
const prisma_service_1 = require("./prisma/prisma.service");
const resources_controller_1 = require("./resources/resources.controller");
const resources_service_1 = require("./resources/resources.service");
const seed_service_1 = require("./seed/seed.service");
const stats_controller_1 = require("./stats/stats.controller");
const storage_controller_1 = require("./storage/storage.controller");
const storage_service_1 = require("./storage/storage.service");
const users_controller_1 = require("./users/users.controller");
const users_service_1 = require("./users/users.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            health_controller_1.HealthController,
            auth_controller_1.AuthController,
            catalog_controller_1.CatalogController,
            resources_controller_1.ResourcesController,
            storage_controller_1.StorageController,
            users_controller_1.UsersController,
            users_controller_1.PublicUsersController,
            stats_controller_1.StatsController,
        ],
        providers: [
            prisma_service_1.PrismaService,
            seed_service_1.SeedService,
            firebase_admin_service_1.FirebaseAdminService,
            auth_service_1.AuthService,
            catalog_service_1.CatalogService,
            resources_service_1.ResourcesService,
            storage_service_1.StorageService,
            users_service_1.UsersService,
        ],
    })
], AppModule);
