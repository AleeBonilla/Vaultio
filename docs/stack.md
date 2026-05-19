# Stack y herramientas

Resumen de cada herramienta del proyecto, su rol concreto y dónde vive en el código.

---

## Lenguaje

### TypeScript 5.x

- **Backend**: configurado en `apps/api/tsconfig.json` con `module: Node16`, decoradores activos, `strict: true`.
- **Frontend**: configurado en `apps/web/tsconfig.json` con JSX automático, `moduleResolution: Bundler`.
- Ambos workspaces comparten el toolchain pero compilan independientes.

---

## Backend

### NestJS 11

Framework modular para Node con DI, decoradores y separación clara controller/service.

- **Bootstrap**: `apps/api/src/main.ts` — crea la app con CORS abierto y el `ApiExceptionFilter` global.
- **Módulo raíz**: `apps/api/src/app.module.ts` — único lugar donde se registran controllers y providers.
- **Convención**: cada dominio en su carpeta (`auth/`, `catalog/`, `resources/`, `users/`, `storage/`, `stats/`, `health/`, `seed/`) con un `*.controller.ts` (HTTP) y un `*.service.ts` (lógica).

### Prisma 7 + `@prisma/adapter-pg`

ORM tipado para Postgres. Usamos el **adapter-pg** porque es el modelo recomendado en Prisma 6+ (cliente sin engine binario).

- **Schema**: `apps/api/prisma/schema.prisma` — introspectado desde el SQL real con `prisma db pull`.
- **Config CLI**: `apps/api/prisma.config.ts`.
- **Service**: `apps/api/src/prisma/prisma.service.ts` — extiende `PrismaClient`, integra `OnModuleInit`/`OnModuleDestroy` para conectar/desconectar con el ciclo Nest.
- **Generar client tras cambios**: `npm run prisma:generate`.

### Firebase Admin SDK

Verifica los ID tokens emitidos por Firebase Auth en el frontend.

- **Service**: `apps/api/src/firebase/firebase-admin.service.ts`.
- **Carga del service account**: orden de resolución en `config.ts → findFirebaseServiceAccount()`.
- **Uso**: `auth.service.ts → readUserFromAuthorization()` llama a `firebase.verifyIdToken(token)`.

### `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`

Cliente S3 v3 modular. Lo usamos contra MinIO (S3-compatible).

- **Service**: `apps/api/src/storage/storage.service.ts`.
- **Operaciones**: `HeadBucket`, `CreateBucket`, `PutBucketPolicy` (lectura pública), `PutObject` (firmado), `GetObject` (firmado para download).
- **Endpoint** controlado por `VAULTIO_STORAGE_ENDPOINT` (firma) y `VAULTIO_STORAGE_PUBLIC_ENDPOINT` (URLs visibles al cliente).

### Test runner: `node:test` + `tsx`

Suite integral nativa de Node ejecutada con `tsx` para soportar TS sin build.

- **Spec**: `apps/api/test/api.test.ts` (12 casos).
- **Estrategia**: arranca la app Nest en puerto efímero, ejecuta requests reales contra Postgres + MinIO **del docker-compose**.
- **Pre-requisito**: `docker compose up -d` debe estar corriendo.

---

## Frontend

### Vite 6

Dev server y bundler.

- **Config**: `apps/web/vite.config.ts`.
- **Plugins**: `@vitejs/plugin-react` (Fast Refresh), `@tailwindcss/vite` (Tailwind 4 integrado).
- **Build**: `tsc -b` para typecheck previo + `vite build` para el bundle de producción.

### React 18 + react-router 7

UI declarativa y SPA.

- **Routing**: `apps/web/src/app/routes.tsx` define rutas y guard `RequireAuth`.
- **Composición**: `apps/web/src/app/App.tsx` envuelve `AuthProvider` + `RouterProvider` + `Toaster`.

### Firebase Web SDK

Cliente para que el navegador autentique y obtenga un ID token.

- **Init**: `apps/web/src/app/lib/firebase.ts` — `initializeApp`, `getAuth`, helpers de signIn/signUp/signOut, `translateFirebaseError`.
- **Listener**: `auth-context.tsx` escucha `onAuthStateChanged` y refresca el perfil del backend cuando el usuario cambia.

### Tailwind CSS 4

Utility-first. Sin componentes prefabricados.

- **Integración**: vía `@tailwindcss/vite`.
- **Estilos base**: `apps/web/src/styles/`.

### lucide-react

Iconos SVG consistentes.

### sonner

Toasts elegantes en acciones del usuario (guardar, calificar, comentar, etc.).

- **Mount**: `apps/web/src/app/App.tsx` monta `<Toaster richColors />`.

---

## Infraestructura local

### PostgreSQL 16

Base de datos relacional, fuente de verdad del producto.

- **Imagen Docker**: `postgres:16-alpine`.
- **Init SQL**: `database/schema.sql`, `database/logic.sql`, `database/seed.sql` se montan en `/docker-entrypoint-initdb.d/` y se ejecutan **solo la primera vez** que arranca con un volumen limpio.
- **Persistencia**: volumen `vaultio-postgres-data`.
- **Reset**: `docker compose down -v && docker compose up -d`.

### MinIO

Object storage S3-compatible para la demo local.

- **Imagen**: `minio/minio:RELEASE.2025-04-22T22-12-26Z`.
- **API S3**: `:9000`. **Consola web**: `:9001`.
- **Bucket**: creado automáticamente por `StorageService.onApplicationBootstrap`.
- **Política**: `PublicRead` sobre `arn:aws:s3:::{bucket}/*` para que los enlaces firmados funcionen en demos sin extra config.
- **Persistencia**: volumen `vaultio-minio-data`.

### Docker Compose

Orquesta Postgres + MinIO. Archivo único en la raíz: `docker-compose.yml`.

---

## Toolchain de monorepo

### npm workspaces

Raíz `package.json` con `"workspaces": ["apps/*"]`. Permite:

- Hoisting de dependencias compartidas a `node_modules/` raíz.
- Scripts cross-workspace: `npm run dev:api`, `npm run dev:web`, etc.
- Un único `package-lock.json` para todo el repo.

---

## Tabla resumen de paquetes principales

| Paquete                              | Versión   | Dónde se usa                                                     |
| ------------------------------------ | --------- | ---------------------------------------------------------------- |
| `@nestjs/common` `core` `platform-express` | 11.x      | API base                                                          |
| `@prisma/client` `@prisma/adapter-pg`     | 7.x       | DB tipada                                                         |
| `firebase-admin`                     | 13.x      | Verificación de ID tokens                                         |
| `@aws-sdk/client-s3` `@aws-sdk/s3-request-presigner` | 3.x | Cliente MinIO/S3                                                  |
| `pg`                                 | 8.x       | Driver Postgres usado por el adapter                              |
| `tsx`                                | 4.x       | Ejecutor de TS para dev y tests                                   |
| `react` `react-dom`                  | 18.3.x    | Frontend                                                          |
| `react-router`                       | 7.x       | Routing                                                           |
| `firebase` (web)                     | 12.x      | Firebase Web SDK                                                  |
| `lucide-react`                       | 0.487.0   | Iconos                                                            |
| `sonner`                             | 2.x       | Toasts                                                            |
| `tailwindcss` `@tailwindcss/vite`    | 4.x       | Estilos                                                           |
| `vite` `@vitejs/plugin-react`        | 6.x / 4.x | Dev/build frontend                                                |

---

## Lo que **NO** está y por qué

- **Express directo**: NestJS ya incluye `@nestjs/platform-express`. No hay rutas Express crudas.
- **ESLint/Prettier**: no instalados. Recomendado agregarlos (ver [MEJORAS.md](../MEJORAS.md)).
- **Logger estructurado** (pino/winston): se usa `console` por defecto de Nest. Pendiente.
- **Helmet/rate limiting**: pendiente. CORS está abierto a `*` (solo OK en demo local).
- **shadcn/ui u otra librería de componentes**: se descartó tras la limpieza inicial. Todos los componentes propios viven en `apps/web/src/app/components/ui/`.
- **Redux/Zustand/TanStack Query**: no se usan. El estado vive en componentes + AuthContext. Para listas grandes con cache, ver MEJORAS.
- **Next.js**: el plan técnico original lo mencionaba, pero se eligió Vite + react-router para mantener el frontend liviano y sin SSR.
