import "reflect-metadata";
import "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { config } from "./config";
import { ApiExceptionFilter } from "./common/http-exception.filter";

export async function createNestApp() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  app.enableCors({
    origin: config.cors.allowAny
      ? true
      : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin) return callback(null, true);
          if (config.cors.origins.includes(origin)) return callback(null, true);
          return callback(new Error(`Origin ${origin} no permitido por CORS`), false);
        },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization"],
    credentials: true,
  });

  app.useGlobalFilters(new ApiExceptionFilter());
  return app;
}

async function bootstrap() {
  const app = await createNestApp();
  await app.listen(config.port);

  console.info(`Vaultio API escuchando en http://localhost:${config.port}`);
}

if (require.main === module) {
  void bootstrap();
}
