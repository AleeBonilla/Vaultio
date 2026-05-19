# MEJORAS — Propuestas estructurales nivel pro

Este documento recoge **propuestas concretas** para llevar el repo de un estado "demo académica funcional" a uno "listo para abrirlo a contribuidores externos y deployar a producción". Está ordenado por impacto y por complejidad.

Cada propuesta indica:

- **Por qué**: el problema actual.
- **Qué cambia**: forma final.
- **Esfuerzo**: orientativo en horas.
- **Riesgo**: qué se puede romper si se hace mal.

## Estado de aplicación

| #   | Mejora                                                  | Estado                                                             |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | Reorganizar `database/` → `apps/api/prisma/migrations/` | ✅ Aplicado                                                        |
| 3   | Prisma Migrate                                          | ✅ Aplicado (migración inicial `0_init`)                           |
| 10  | CI/CD con GitHub Actions                                | ✅ Aplicado (`.github/workflows/ci.yml`)                           |
| 12  | ESLint + Prettier + EditorConfig                        | ✅ Aplicado                                                        |
| 13  | Pre-commit hooks con Husky + lint-staged                | ✅ Aplicado                                                        |
| 14  | Helmet + CORS restrictivo + rate limiting               | ✅ Aplicado (`@nestjs/throttler` + helmet)                         |
| 20  | Multi-stage Dockerfile                                  | ✅ Aplicado (`apps/api/Dockerfile`, `apps/web/Dockerfile` + nginx) |
| 23  | Cleanup final                                           | ✅ Aplicado (db.json eliminado, encoding pendiente)                |
| 2   | Reorganizar `infra/` con compose modular                | ⏳ Pendiente                                                       |
| 4   | DTOs con Zod                                            | ⏳ Pendiente                                                       |
| 5   | `packages/shared`                                       | ⏳ Pendiente (workspace ya soporta `packages/*`)                   |
| 6   | Paginación DB-side                                      | ⏳ Pendiente                                                       |
| 7   | Full-text search                                        | ⏳ Índice GIN ya creado, falta exponer en API                      |
| 8   | Moderación real                                         | ⏳ Pendiente                                                       |
| 9   | Observabilidad (pino)                                   | ⏳ Pendiente                                                       |
| 11  | Tests E2E con Playwright                                | ⏳ Pendiente                                                       |
| 15  | S3/GCS productivo                                       | ⏳ Pendiente                                                       |
| 16  | AV + MIME real                                          | ⏳ Pendiente                                                       |
| 17  | Thumbnails                                              | ⏳ Pendiente                                                       |
| 18  | Cuotas + rate limit por acción                          | ⏳ Throttler global puesto, falta granular                         |
| 19  | Audit logs                                              | ⏳ Tabla `audit_log` en DB, falta interceptor                      |
| 21  | Deployment                                              | ⏳ Pendiente                                                       |
| 22  | OpenAPI auto-generado                                   | ⏳ Pendiente                                                       |

---

## Índice

1. [Reorganizar `database/` dentro de `apps/api/prisma/`](#1-reorganizar-database-dentro-de-appsapiprisma)
2. [Mover `docker-compose.yml` a `infra/` con compose modular](#2-mover-docker-composeyml-a-infra-con-compose-modular)
3. [Migraciones formales con Prisma Migrate](#3-migraciones-formales-con-prisma-migrate)
4. [DTOs + validación con Zod o class-validator](#4-dtos--validación-con-zod-o-class-validator)
5. [Package compartido `packages/shared` con tipos y schemas](#5-package-compartido-packagesshared-con-tipos-y-schemas)
6. [Paginación DB-side en listados](#6-paginación-db-side-en-listados)
7. [Búsqueda full-text en Postgres](#7-búsqueda-full-text-en-postgres)
8. [Moderación real de reportes](#8-moderación-real-de-reportes)
9. [Observabilidad mínima](#9-observabilidad-mínima)
10. [CI/CD con GitHub Actions](#10-cicd-con-github-actions)
11. [Tests E2E con Playwright](#11-tests-e2e-con-playwright)
12. [ESLint + Prettier + EditorConfig](#12-eslint--prettier--editorconfig)
13. [Pre-commit hooks con Husky + lint-staged](#13-pre-commit-hooks-con-husky--lint-staged)
14. [Helmet, rate limiting y CORS restrictivo](#14-helmet-rate-limiting-y-cors-restrictivo)
15. [Storage productivo: S3/GCS con CDN](#15-storage-productivo-s3gcs-con-cdn)
16. [Scan de archivos: AV + MIME real](#16-scan-de-archivos-av--mime-real)
17. [Thumbnails y previews](#17-thumbnails-y-previews)
18. [Cuotas por usuario y rate limiting por acción](#18-cuotas-por-usuario-y-rate-limiting-por-acción)
19. [Logs estructurados de auditoría](#19-logs-estructurados-de-auditoría)
20. [Containerización del API + multi-stage Dockerfile](#20-containerización-del-api--multi-stage-dockerfile)
21. [Deployment: Render/Fly/Railway/Vercel](#21-deployment-renderflyrailwayvercel)
22. [OpenAPI spec auto-generado desde NestJS](#22-openapi-spec-auto-generado-desde-nestjs)
23. [Cleanup final del repo](#23-cleanup-final-del-repo)

---

## 1. Reorganizar `database/` dentro de `apps/api/prisma/`

### Por qué

Tener `database/` en la raíz con tres archivos `.sql` sueltos es ambiguo:

- ¿Es la fuente de verdad o un dump?
- ¿Cómo se versionan los cambios?
- Está desacoplado del workspace que lo consume (`apps/api`).

### Qué cambia

```
apps/api/
└── prisma/
    ├── schema.prisma
    ├── migrations/            # ← nuevo, generado por Prisma Migrate
    │   ├── 20250101000000_init/
    │   │   └── migration.sql
    │   └── 20250102000000_add_reports/
    │       └── migration.sql
    └── seed.ts                # ← seed.service.ts pasa a script ejecutable
```

- Borrar `database/` de la raíz.
- `docker-compose.yml` ya no monta SQLs; en su lugar, Prisma corre `prisma migrate deploy` al arrancar el API o como job separado.
- Los seeds dejan de ser SQL y pasan a Prisma seed (TS con tipos).

### Esfuerzo

4–8 h (incluye convertir el SQL actual a una migración inicial limpia).

### Riesgo

Medio. Hay que validar que la migración generada coincide con el schema actual (`prisma migrate diff`).

---

## 2. Mover `docker-compose.yml` a `infra/` con compose modular

### Por qué

Un `docker-compose.yml` único en la raíz mezcla preocupaciones (DB, storage, futuros: redis, traefik). Para producción se suele querer perfiles distintos.

### Qué cambia

```
infra/
├── docker/
│   ├── compose.yaml              # base: postgres + minio
│   ├── compose.dev.yaml          # override para dev (mounts SQL, puertos)
│   ├── compose.prod.yaml         # override sin SQL init (usa migraciones)
│   └── postgres/
│       └── init/                 # solo si Prisma Migrate aún no está
└── README.md                     # explica perfiles
```

Comando dev: `docker compose -f infra/docker/compose.yaml -f infra/docker/compose.dev.yaml up -d`.

Agregar script al `package.json` raíz: `"docker:dev": "docker compose -f infra/docker/compose.yaml -f infra/docker/compose.dev.yaml up -d"`.

### Esfuerzo

2 h.

### Riesgo

Bajo.

---

## 3. Migraciones formales con Prisma Migrate

### Por qué

Hoy el schema vive en SQL crudo (`database/schema.sql`) y Prisma lo introspecta. Eso no es reversible ni versionado: si alguien cambia algo en Prisma, hay que actualizar SQL a mano y rezarle al docker-compose.

### Qué cambia

1. Tomar el schema actual como `init` migration: `npx prisma migrate dev --name init`.
2. Eliminar `database/schema.sql` (queda en historial git).
3. Cualquier cambio futuro: editar `schema.prisma` → `prisma migrate dev --name xxx`.
4. CI corre `prisma migrate deploy` antes de los tests.

### Esfuerzo

6 h.

### Riesgo

Alto si hay datos productivos (no aplica aquí porque es demo). Hay que portar también los triggers de `logic.sql` como SQL raw dentro de la migración.

---

## 4. DTOs + validación con Zod o class-validator

### Por qué

Controllers y services reciben `body: any` y validan a mano. Eso causa:

- Errores tardíos (en service, no en HTTP boundary).
- Falta de tipos en el body.
- Sin contract automático para el frontend.

### Qué cambia

Opción A — **Zod** (recomendada por su simplicidad):

```ts
// apps/api/src/resources/resources.dto.ts
import { z } from "zod";

export const createResourceSchema = z
  .object({
    title: z.string().min(1).max(80),
    description: z.string().min(1),
    courseId: z.number().int().positive(),
    resourceTypeId: z.number().int().positive(),
    tags: z.array(z.string()).optional(),
    storageKey: z.string().optional(),
    externalUrl: z.string().url().optional(),
  })
  .refine((d) => d.storageKey || d.externalUrl, { message: "Storage o URL externa requerido" });

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
```

Pipe Nest:

```ts
@UsePipes(new ZodValidationPipe(createResourceSchema))
@Post()
create(@Body() body: CreateResourceInput) { ... }
```

Opción B — **class-validator** (oficial Nest, decoradores).

### Esfuerzo

8–12 h (todos los endpoints).

### Riesgo

Bajo. Mejora masiva en mantenibilidad.

---

## 5. Package compartido `packages/shared` con tipos y schemas

### Por qué

Frontend y backend definen interfaces casi iguales (User, Resource, etc.). Cualquier cambio se desincroniza.

### Qué cambia

```
packages/
└── shared/
    ├── src/
    │   ├── api-types.ts        # tipos compartidos
    │   ├── schemas.ts          # Zod schemas reutilizables
    │   └── constants.ts
    ├── package.json            # name: @vaultio/shared
    └── tsconfig.json
```

Frontend y backend dependen de `@vaultio/shared`. Si se usan los Zod schemas del paso 4, también se comparten entre web y api.

### Esfuerzo

4 h.

### Riesgo

Bajo. Workspace nuevo.

---

## 6. Paginación DB-side en listados

### Por qué

`GET /resources` y `GET /resources/:id/comments` cargan todo en memoria. Con 10k+ recursos esto truena.

### Qué cambia

Cursor pagination con Prisma:

```ts
async list(query: { limit?: number; cursor?: string; ... }) {
  const limit = Math.min(Number(query.limit) || 20, 100);
  const items = await this.prisma.resources.findMany({
    where: { ... },
    take: limit + 1,
    cursor: query.cursor ? { id: query.cursor } : undefined,
    skip: query.cursor ? 1 : 0,
    orderBy: { created_at: "desc" },
  });
  const nextCursor = items.length > limit ? items.pop()!.id : null;
  return { items: items.map(summarizeResource), nextCursor };
}
```

Frontend usa infinite scroll o paginador.

### Esfuerzo

6 h (listados + UI).

### Riesgo

Bajo.

---

## 7. Búsqueda full-text en Postgres

### Por qué

`search` filtra con `contains` de Prisma → ILIKE lento sin índices.

### Qué cambia

- Columna `tsvector` calculada en `resources` (title + description + tags).
- Índice GIN.
- Query con `to_tsquery` y ranking.

```sql
ALTER TABLE resources ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('spanish', array_to_string(tags, ' ')), 'C')
  ) STORED;
CREATE INDEX idx_resources_search ON resources USING GIN(search_vector);
```

API expone `?search=foo&lang=spanish`.

### Esfuerzo

4 h.

### Riesgo

Bajo. Postgres es feliz con FTS.

---

## 8. Moderación real de reportes

### Por qué

`POST /users/:id/report` deja un registro pero no hay UI/flujo de moderación.

### Qué cambia

- Roles: `moderator`, `admin` (ya existen en schema, falta lógica).
- `GET /admin/reports?status=pending` (guard de rol).
- `PATCH /admin/reports/:id` con `status`, `resolution`, `admin_notes`.
- UI nueva en `apps/web/src/app/pages/admin/`.
- Auditoría de cada acción (ya hay tabla `audit_log` en el schema).

### Esfuerzo

12–16 h.

### Riesgo

Medio.

---

## 9. Observabilidad mínima

### Por qué

`console.log` no es suficiente.

### Qué cambia

- Logger estructurado con `pino` (JSON output).
- Request ID por request (interceptor Nest).
- Trazas mínimas: `method path status durationMs userId`.
- Errores con stack traces enviados a Sentry o similar (free tier).

```ts
// main.ts
import { Logger } from "nestjs-pino";
const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(Logger));
```

### Esfuerzo

3 h.

### Riesgo

Bajo.

---

## 10. CI/CD con GitHub Actions

### Por qué

Hoy no hay validación automática.

### Qué cambia

`.github/workflows/ci.yml`:

```yaml
name: ci
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: vaultio
          POSTGRES_USER: vaultio
          POSTGRES_PASSWORD: vaultio
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready"
          --health-interval 5s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run prisma:generate
      - run: npm run build:api
      - run: npm run typecheck:web
      - run: npm run build:web
      - run: npm run test:api
```

### Esfuerzo

2 h.

### Riesgo

Bajo.

---

## 11. Tests E2E con Playwright

### Por qué

Tenemos tests de API pero no del flujo navegable.

### Qué cambia

```
apps/web/tests-e2e/
├── auth.spec.ts        # signup, login, logout
├── resources.spec.ts   # crear, listar, descargar
└── playwright.config.ts
```

Script `npm run test:e2e` que arranca API + web y corre Playwright.

### Esfuerzo

8 h.

### Riesgo

Bajo. Pero requiere CI más complejo.

---

## 12. ESLint + Prettier + EditorConfig

### Por qué

Estilo inconsistente entre archivos.

### Qué cambia

- `.eslintrc.cjs` con `@typescript-eslint` y `eslint-plugin-react`.
- `.prettierrc` con reglas claras.
- `.editorconfig` para coherencia entre editores.
- Scripts: `npm run lint`, `npm run lint:fix`, `npm run format`.

### Esfuerzo

2 h.

### Riesgo

Bajo (puede generar un PR enorme la primera vez por reformatos).

---

## 13. Pre-commit hooks con Husky + lint-staged

### Por qué

Para que typecheck/lint/test corran antes de commitear.

### Qué cambia

```json
// .husky/pre-commit
npx lint-staged
```

```json
// package.json
"lint-staged": {
  "*.ts": ["eslint --fix", "prettier --write"],
  "*.tsx": ["eslint --fix", "prettier --write"]
}
```

### Esfuerzo

1 h.

### Riesgo

Bajo.

---

## 14. Helmet, rate limiting y CORS restrictivo

### Por qué

`main.ts` hoy hace `app.enableCors({ origin: true })` que acepta cualquier origen. Para prod necesitamos:

### Qué cambia

```ts
app.enableCors({
  origin: config.allowedOrigins, // array desde env
  credentials: true,
});
app.use(helmet());
app.useGlobalGuards(new ThrottlerGuard()); // @nestjs/throttler
```

### Esfuerzo

2 h.

### Riesgo

Bajo.

---

## 15. Storage productivo: S3/GCS con CDN

### Por qué

MinIO local no escala a producción.

### Qué cambia

- `VAULTIO_STORAGE_PROVIDER=s3` con endpoint AWS, bucket privado.
- CloudFront / Cloud CDN al frente para servir archivos públicos.
- Eliminar `PutBucketPolicy` automático; configurar el bucket vía IaC (Terraform/Pulumi).

Como el código ya usa `@aws-sdk/client-s3`, el cambio es **solo configuración**, no código.

### Esfuerzo

8 h (incluye IaC mínimo).

### Riesgo

Medio.

---

## 16. Scan de archivos: AV + MIME real

### Por qué

Hoy se confía en el `mimeType` que reporta el cliente. Riesgo de malware o tipos disfrazados.

### Qué cambia

- Hook tras upload: lambda/job que descarga el objeto, lo escanea con ClamAV (o servicio managed) y verifica MIME con `file-type`.
- Si falla, marcar `upload_status = rejected` y notificar al usuario.

### Esfuerzo

8 h.

### Riesgo

Medio.

---

## 17. Thumbnails y previews

### Por qué

Mostrar la primera página de un PDF o un thumbnail de imagen mejora muchísimo la UI.

### Qué cambia

- Job async tras upload (BullMQ + Redis o similar) que genera thumbnail.
- Campo `thumbnail_url` en `resources`.
- Tipo MIME: PDF → `pdf-poppler`; imagen → `sharp`.

### Esfuerzo

10 h.

### Riesgo

Bajo.

---

## 18. Cuotas por usuario y rate limiting por acción

### Por qué

Nada impide a un usuario subir 10k recursos o calificar 1000 veces en un minuto.

### Qué cambia

- Cuotas por rol en `roles` table (campos `max_uploads`, `max_storage_mb`).
- `ThrottlerGuard` de Nest por endpoint sensible (login, upload, rating, report).
- Mostrar "Cuota usada: 230/500 MB" en perfil.

### Esfuerzo

6 h.

### Riesgo

Bajo.

---

## 19. Logs estructurados de auditoría

### Por qué

Necesitamos saber quién editó/borró qué cuándo, especialmente para moderación.

### Qué cambia

La tabla `audit_log` ya existe en `database/schema.sql`. Falta:

- Interceptor Nest que escribe `(actor_id, action, entity, entity_id, before, after, at)` en cada mutación.
- UI admin para consultarlo.

### Esfuerzo

6 h.

### Riesgo

Bajo.

---

## 20. Containerización del API + multi-stage Dockerfile

### Por qué

Para deploy y CI necesitamos una imagen reproducible.

### Qué cambia

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /repo
COPY package*.json ./
COPY apps/api/package*.json apps/api/
RUN npm ci --workspaces

FROM deps AS build
COPY apps/api apps/api
RUN npm run build:api

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

Igual para `apps/web` (Nginx + assets estáticos).

### Esfuerzo

3 h.

### Riesgo

Bajo.

---

## 21. Deployment: Render/Fly/Railway/Vercel

### Por qué

Hoy solo corre local.

### Qué cambia (sugerencia mínima)

- **Frontend**: Vercel o Netlify (free tier).
- **API**: Render o Fly.io (free tier limitado pero suficiente para demo).
- **DB**: Render Postgres, Supabase, Neon (free tier).
- **Storage**: AWS S3 free tier o Cloudflare R2.

Variables de entorno gestionadas por el provider.

### Esfuerzo

4–8 h.

### Riesgo

Medio (primer despliegue suele tener fricción).

---

## 22. OpenAPI spec auto-generado desde NestJS

### Por qué

Documentación de API queda desactualizada a mano.

### Qué cambia

```ts
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
const config = new DocumentBuilder().setTitle("Vaultio API").setVersion("1.0").build();
SwaggerModule.setup("docs/api", app, SwaggerModule.createDocument(app, config));
```

UI Swagger en `http://localhost:4000/docs/api`. Spec descargable como `openapi.json` para generar cliente TypeScript (`openapi-typescript`).

### Esfuerzo

3 h (+ decorar controllers/DTOs con `@ApiProperty`).

### Riesgo

Bajo.

---

## 23. Cleanup final del repo

Lista corta de cosas chicas que vale revisar:

- [ ] **Borrar artefactos** que se rebuildean: `apps/api/dist/`, `apps/web/dist/`, `apps/web/tsconfig.tsbuildinfo`. Ya están en `.gitignore` pero revisar que no estén commiteados.
- [ ] **`apps/api/data/`**: ya fue removido (era el `db.json` legacy).
- [ ] **Encoding del `database/seed.sql`**: tiene mojibake en algunos textos (`Ingenier?a` por `Ingeniería`). Normalizar a UTF-8.
- [ ] **`CONTEXT.md`**: contiene contexto de producto histórico mezclado con stack viejo. Limpiar o mover a `docs/contexto-producto.md`.
- [ ] **`docs/plan-tecnico.md`**: histórico, marcar como "Plan inicial (referencia)" o mover a `docs/historico/`.
- [ ] **Imágenes `apps/web/public/vaultio_platform_preview*.png`**: dejar una sola, eliminar las viejas.

---

## Orden de implementación recomendado

Si tuviera que priorizar 3 cosas que dan **más valor con menor riesgo**:

1. **[#3] Prisma Migrate** + **[#1] reorganizar `database/`**. Te libera del SQL crudo y la pesadilla de seeds.
2. **[#4] DTOs con Zod** + **[#22] OpenAPI**. Documentación que nunca queda desactualizada y validación seria.
3. **[#10] CI/CD** + **[#12] ESLint/Prettier**. Hace que el repo se mantenga sano sin esfuerzo manual.

Después: paginación (#6), moderación (#8), observabilidad (#9), containerización (#20).

---

## Resumen tabular

| #   | Mejora                         | Esfuerzo | Impacto | Riesgo |
| --- | ------------------------------ | -------- | ------- | ------ |
| 1   | Reorganizar `database/`        | 4h       | Alto    | Medio  |
| 2   | `infra/` con compose modular   | 2h       | Medio   | Bajo   |
| 3   | Prisma Migrate                 | 6h       | Alto    | Alto   |
| 4   | DTOs con Zod                   | 12h      | Alto    | Bajo   |
| 5   | `packages/shared`              | 4h       | Medio   | Bajo   |
| 6   | Paginación DB-side             | 6h       | Alto    | Bajo   |
| 7   | Full-text search               | 4h       | Medio   | Bajo   |
| 8   | Moderación real                | 16h      | Alto    | Medio  |
| 9   | Observabilidad                 | 3h       | Alto    | Bajo   |
| 10  | CI/CD                          | 2h       | Alto    | Bajo   |
| 11  | Tests E2E                      | 8h       | Medio   | Bajo   |
| 12  | ESLint/Prettier                | 2h       | Medio   | Bajo   |
| 13  | Pre-commit hooks               | 1h       | Medio   | Bajo   |
| 14  | Helmet + rate limit + CORS     | 2h       | Alto    | Bajo   |
| 15  | S3/GCS productivo              | 8h       | Alto    | Medio  |
| 16  | AV + MIME real                 | 8h       | Alto    | Medio  |
| 17  | Thumbnails                     | 10h      | Medio   | Bajo   |
| 18  | Cuotas + rate limit por acción | 6h       | Medio   | Bajo   |
| 19  | Audit logs                     | 6h       | Alto    | Bajo   |
| 20  | Multi-stage Dockerfile         | 3h       | Alto    | Bajo   |
| 21  | Deployment                     | 8h       | Alto    | Medio  |
| 22  | OpenAPI auto-generado          | 3h       | Alto    | Bajo   |
| 23  | Cleanup final                  | 1h       | Medio   | Bajo   |
