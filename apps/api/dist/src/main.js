"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNestApp = createNestApp;
require("reflect-metadata");
require("@nestjs/platform-express");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("./config");
const http_exception_filter_1 = require("./common/http-exception.filter");
async function createNestApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["content-type", "authorization"],
    });
    app.useGlobalFilters(new http_exception_filter_1.ApiExceptionFilter());
    return app;
}
async function bootstrap() {
    const app = await createNestApp();
    await app.listen(config_1.config.port);
    console.log(`Vaultio API escuchando en http://localhost:${config_1.config.port}`);
}
if (require.main === module) {
    void bootstrap();
}
