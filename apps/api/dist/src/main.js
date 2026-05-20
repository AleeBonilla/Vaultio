"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNestApp = createNestApp;
require("reflect-metadata");
require("@nestjs/platform-express");
const core_1 = require("@nestjs/core");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const config_1 = require("./config");
const http_exception_filter_1 = require("./common/http-exception.filter");
async function createNestApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    app.enableCors({
        origin: config_1.config.cors.allowAny
            ? true
            : (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                if (config_1.config.cors.origins.includes(origin))
                    return callback(null, true);
                return callback(new Error(`Origin ${origin} no permitido por CORS`), false);
            },
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["content-type", "authorization"],
        credentials: true,
    });
    app.useGlobalFilters(new http_exception_filter_1.ApiExceptionFilter());
    return app;
}
async function bootstrap() {
    const app = await createNestApp();
    await app.listen(config_1.config.port);
    console.info(`Vaultio API escuchando en http://localhost:${config_1.config.port}`);
}
if (require.main === module) {
    void bootstrap();
}
