import "reflect-metadata";
import "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "./config";
import { ApiExceptionFilter } from "./http-exception.filter";

export async function createNestApp() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization"],
  });
  app.useGlobalFilters(new ApiExceptionFilter());
  return app;
}

async function bootstrap() {
  const app = await createNestApp();
  await app.listen(config.port);
  console.log(`Vaultio API escuchando en http://localhost:${config.port}`);
}

if (require.main === module) {
  void bootstrap();
}
