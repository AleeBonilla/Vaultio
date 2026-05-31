# Vaultio

Plataforma web para que estudiantes del **Instituto Tecnológico de Costa Rica** organicen, busquen y compartan recursos académicos (apuntes, exámenes, ejercicios resueltos, resúmenes, código y enlaces externos), estructurados por carrera, curso, profesor y semestre.

- **Auth real** con Firebase Authentication (Google y Email/Password).
- **Backend** NestJS sobre PostgreSQL via Prisma.
- **Storage** S3-compatible mediante MinIO local (intercambiable por S3/GCS sin tocar lógica de negocio).
- **Frontend** Vite + React + TypeScript + Tailwind.

---

## Tabla de contenido

- [Stack y herramientas](#stack-y-herramientas)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Setup paso a paso](#setup-paso-a-paso)
- [Variables de entorno](#variables-de-entorno)
- [Comandos disponibles](#comandos-disponibles)
- [Funcionalidades](#funcionalidades)
- [API HTTP](#api-http)
- [Flujo de demo](#flujo-de-demo)
- [Tests](#tests)
- [Troubleshooting](#troubleshooting)
- [Documentación adicional](#documentación-adicional)
- [Próximos pasos](#próximos-pasos)
- [Notas de seguridad](#notas-de-seguridad)

---

## Stack y herramientas

| Capa          | Herramienta                 | Rol                                                                                           |
| ------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| Lenguaje      | **TypeScript 5.x**          | Tipado estricto en API y web.                                                                 |
| Backend       | **NestJS 11**               | Framework modular del API (controllers, services, DI).                                        |
| ORM           | **Prisma 7 + adapter-pg**   | Tipado SQL, queries y client generado desde el schema introspectado de Postgres.              |
| Base de datos | **PostgreSQL 16**           | Fuente de verdad de usuarios, recursos, comentarios, ratings, guardados, reportes, auditoría. |
| Auth          | **Firebase Authentication** | Emisión de ID tokens (Google y Email/Password). El backend los valida con `firebase-admin`.   |
| Storage       | **MinIO** (S3-compatible)   | Objetos subidos por usuarios. URLs pre-firmadas PUT/GET.                                      |
| Infra local   | **Docker Compose**          | Levanta Postgres y MinIO de forma reproducible.                                               |
| Frontend      | **Vite 6 + React 18**       | Dev server con HMR, build optimizado.                                                         |
| Routing       | **react-router 7**          | Rutas declarativas con guard `RequireAuth`.                                                   |
| UI            | **Tailwind CSS 4**          | Sistema de utilidades. Sin librería de componentes externa.                                   |
| Iconos        | **lucide-react**            | Iconos consistentes en toda la app.                                                           |
| Toasts        | **sonner**                  | Notificaciones en acciones (guardar, calificar, comentar, etc.).                              |
| Tests API     | **node:test + tsx**         | Suite integral contra Postgres real (12 casos).                                               |
| AWS SDK v3    | **`@aws-sdk/client-s3`**    | Cliente S3 que firma URLs contra MinIO.                                                       |

Para detalles de configuración y por qué cada pieza está aquí, ver [docs/stack.md](docs/stack.md).

---

## Estructura del repositorio

```text
vaultio/
├── apps/
│   ├── api/                       # Backend NestJS (workspace @vaultio/api)
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Schema Prisma (fuente del client tipado)
│   │   │   └── migrations/        # Migraciones versionadas (prisma migrate)
│   │   │       ├── migration_lock.toml
│   │   │       └── 0_init/
│   │   │           └── migration.sql
│   │   ├── src/
│   │   │   ├── main.ts            # Bootstrap NestJS
│   │   │   ├── app.module.ts      # Módulo raíz que registra controllers/providers
│   │   │   ├── config.ts          # Lectura de env y defaults
│   │   │   ├── auth/              # Login, registro demo, /auth/me, sync Firebase
│   │   │   ├── catalog/           # Carreras, cursos, profesores, períodos, tipos
│   │   │   ├── common/            # errors, http-exception filter, serializers
│   │   │   ├── firebase/          # firebase-admin.service (verifyIdToken)
│   │   │   ├── health/            # GET /health
│   │   │   ├── prisma/            # PrismaService con lifecycle hooks Nest
│   │   │   ├── resources/         # CRUD, ratings, save, comments, download
│   │   │   ├── seed/              # Bootstrap de catálogos y demo data
│   │   │   ├── stats/             # GET /stats públicos para la landing
│   │   │   ├── storage/           # MinIO presigned URLs
│   │   │   └── users/             # /users/me + perfil público + reportes
│   │   ├── test/
│   │   │   └── api.test.ts        # Suite integral
│   │   ├── prisma.config.ts       # Config para Prisma CLI
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                       # Frontend Vite (workspace @vaultio/web)
│       ├── public/                # Assets estáticos servidos por Vite
│       ├── src/
│       │   ├── app/
│       │   │   ├── App.tsx        # AuthProvider + Router + Toaster
│       │   │   ├── routes.tsx     # Definición de rutas + RequireAuth
│       │   │   ├── components/    # layout, comments, filters, resources, ui
│       │   │   ├── lib/
│       │   │   │   ├── api.ts          # Cliente HTTP tipado del API
│       │   │   │   ├── auth-context.tsx # Sesión Firebase + perfil Vaultio
│       │   │   │   ├── firebase.ts     # Init Firebase Web SDK
│       │   │   │   └── RequireAuth.tsx # Guard de rutas
│       │   │   └── pages/         # auth, courses, home, library, profile, resources
│       │   └── styles/            # Tailwind + estilos base
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── package.json
│       ├── nginx.conf             # Nginx config para servir el bundle en runtime
│       ├── Dockerfile             # Multi-stage build → imagen Nginx
│       └── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml                 # Lint + typecheck + build + tests
├── .husky/
│   └── pre-commit                 # lint-staged
├── docs/                          # Documentación técnica
│   ├── stack.md                   # Rol de cada herramienta
│   ├── arquitectura.md            # Flujos y decisiones
│   ├── desarrollo-local.md        # Setup detallado y troubleshooting
│   ├── despliegue-vercel.md       # Checklist de despliegue del frontend
│   ├── api.md                     # Referencia de endpoints
│   ├── plan-tecnico.md            # Plan técnico inicial (histórico)
│   └── reporte-limpieza-y-mejoras.md
├── docker-compose.yml             # Postgres + MinIO
├── eslint.config.js               # ESLint flat config (TS + React)
├── .prettierrc.json
├── .editorconfig
├── package.json                   # Workspace root (npm workspaces)
├── package-lock.json
├── CONTEXT.md                     # Contexto funcional/producto
├── README.md
└── MEJORAS.md                     # Propuestas estructurales pro
```

### Archivos importantes (mapa rápido)

| Archivo                                       | Rol                                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `docker-compose.yml`                          | Postgres + MinIO listos para dev.                                                  |
| `apps/api/src/config.ts`                      | Variables de entorno y defaults del backend.                                       |
| `apps/api/src/main.ts`                        | Bootstrap del API (CORS, exception filter, listen).                                |
| `apps/api/src/app.module.ts`                  | Único lugar donde se declaran controllers/providers.                               |
| `apps/api/src/auth/auth.service.ts`           | Verificación de ID token Firebase + sync `users`/`identities`.                     |
| `apps/api/src/storage/storage.service.ts`     | MinIO/S3: bootstrap del bucket, presigned PUT/GET.                                 |
| `apps/api/prisma/schema.prisma`               | Modelo Prisma (introspectado, fuente de tipos para el client).                     |
| `apps/api/prisma/migrations/`                 | Migraciones versionadas (`prisma migrate`).                                        |
| `apps/api/test/api.test.ts`                   | 12 tests integrales que validan flujos end-to-end del API.                         |
| `apps/api/Dockerfile` / `apps/web/Dockerfile` | Builds multi-stage para deploy.                                                    |
| `apps/web/src/app/lib/api.ts`                 | Cliente HTTP del frontend (inyecta ID token automáticamente).                      |
| `apps/web/src/app/lib/auth-context.tsx`       | Sesión Firebase + perfil del backend + acciones (signIn, signUp, signOut, update). |
| `apps/web/src/app/lib/RequireAuth.tsx`        | Guard para rutas `/app/*`.                                                         |
| `eslint.config.js` / `.prettierrc.json`       | Estándar de código común a todo el monorepo.                                       |
| `.github/workflows/ci.yml`                    | CI: lint + typecheck + build + tests con Postgres y MinIO efímeros.                |
| `.husky/pre-commit`                           | Corre lint-staged antes de cada commit.                                            |

---

## Requisitos

- Node.js **20+**
- npm **10+**
- Docker + Docker Compose
- Proyecto Firebase con Authentication habilitado:
  - Proveedor **Google** activado (con email de soporte).
  - Proveedor **Email/Password** activado.
- Service account JSON del proyecto Firebase (para `firebase-admin`).

---

## Setup paso a paso

### 1. Clonar e instalar

```bash
git clone <repo>
cd Vaultio
npm install
```

`npm install` instala los workspaces `apps/api` y `apps/web` con sus dependencias.

### 2. Levantar Postgres y MinIO

```bash
docker compose up -d
```

Esto levanta:

| Servicio | Imagen                       | Puertos    | Credenciales por defecto                         |
| -------- | ---------------------------- | ---------- | ------------------------------------------------ |
| Postgres | `postgres:16-alpine`         | 5432       | DB `vaultio`, user `vaultio`, password `vaultio` |
| MinIO    | `minio/minio:RELEASE.2025-…` | 9000, 9001 | user `vaultio`, password `vaultio-demo-secret`   |

Postgres arranca **vacío** — el schema se aplica vía Prisma Migrate en el paso siguiente. El bucket de MinIO se crea automáticamente al bootear el API.

### 3. Aplicar migraciones de Prisma y generar el client

```bash
npm run prisma:migrate:deploy      # aplica todas las migraciones a la DB
npm run prisma:generate            # genera el client en node_modules/@prisma
```

Si después cambias `apps/api/prisma/schema.prisma`, generá una migración con:

```bash
npm run prisma:migrate:dev -- --name <descripcion-corta>
```

### 4. Configurar Firebase para el frontend

Copiar `.env.example` y rellenar con tu config de Firebase Web SDK (Firebase Console → Project Settings → General → Tus apps → Configuración del SDK):

```bash
cp apps/web/.env.example apps/web/.env.local
```

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:4000
```

> La `apiKey` de Firebase Web es **pública por diseño**; se distribuye con el bundle del navegador. Las restricciones reales viven en Firebase (Auth, IAM, Security Rules). No requiere canal cifrado.

### 5. Configurar Firebase Admin para el backend

Descargar el _service account JSON_ desde Firebase Console -> Project Settings -> **Service accounts** -> "Generate new private key". Para la demo local, dejarlo en:

```txt
secrets/vaultio-auth-service-account.json
```

Luego configurar:

```env
VAULTIO_FIREBASE_SERVICE_ACCOUNT=secrets/vaultio-auth-service-account.json
```

El backend resuelve credenciales en este orden:

1. `GOOGLE_APPLICATION_CREDENTIALS` (path absoluto al JSON).
2. `VAULTIO_FIREBASE_SERVICE_ACCOUNT` (path relativo al root del repo).
3. Cualquier archivo `*-firebase-adminsdk-*.json` en la raíz del repo.
4. `firebase-service-account.json` en la raíz del repo.

La carpeta `secrets/` esta en `.gitignore` para no commitearse. Si se entrega un ZIP manual para demo, incluir esa carpeta dentro del ZIP.

> Este JSON **sí es sensible**: da acceso administrativo al proyecto Firebase. Compartilo con tus compañeros vía gestor de contraseñas o generales uno propio.

### 6. Arrancar dev

En dos terminales:

```bash
npm run dev:api    # NestJS en http://localhost:4000
npm run dev:web    # Vite en http://localhost:5173
```

Abrir `http://localhost:5173` y registrarse.

---

## Variables de entorno

### Frontend (`apps/web/.env.local`)

| Variable                    | Default                 | Rol                      |
| --------------------------- | ----------------------- | ------------------------ |
| `VITE_FIREBASE_API_KEY`     | _(requerido)_           | Firebase Web SDK config. |
| `VITE_FIREBASE_AUTH_DOMAIN` | _(requerido)_           | Firebase Web SDK config. |
| `VITE_FIREBASE_PROJECT_ID`  | _(requerido)_           | Firebase Web SDK config. |
| `VITE_FIREBASE_APP_ID`      | _(requerido)_           | Firebase Web SDK config. |
| `VITE_API_URL`              | `http://localhost:4000` | URL base del backend.    |

### Backend

| Variable                            | Default                                                             | Rol                                                                          |
| ----------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `VAULTIO_API_PORT`                  | `4000`                                                              | Puerto HTTP del API.                                                         |
| `VAULTIO_API_PUBLIC_URL`            | `http://localhost:{port}`                                           | URL pública (para construir links absolutos).                                |
| `DATABASE_URL`                      | `postgresql://vaultio:vaultio@localhost:5432/vaultio?schema=public` | Conexión a Postgres.                                                         |
| `GOOGLE_APPLICATION_CREDENTIALS`    | _(vacio)_                                                           | Path absoluto al service account JSON. Tiene prioridad.                      |
| `VAULTIO_FIREBASE_SERVICE_ACCOUNT`  | `secrets/vaultio-auth-service-account.json`                         | Path relativo al root recomendado para la demo local.                        |
| `VAULTIO_AUTH_PROVIDER`             | `firebase`                                                          | Proveedor de auth.                                                           |
| `VAULTIO_AUTH_ALLOWED_DOMAIN`       | _(vacío)_                                                           | Si se setea (ej. `estudiantec.cr`), solo acepta correos de ese dominio.      |
| `VAULTIO_ALLOW_DEMO_TOKENS`         | `false`                                                             | `true` solo para tests; habilita `POST /auth/login` y `POST /auth/register`. |
| `VAULTIO_STORAGE_PROVIDER`          | `minio`                                                             | Etiqueta del proveedor (informativa).                                        |
| `VAULTIO_STORAGE_BUCKET`            | `vaultio-demo`                                                      | Nombre del bucket S3/MinIO.                                                  |
| `VAULTIO_STORAGE_REGION`            | `us-east-1`                                                         | Región S3 (MinIO la ignora pero requiere algo).                              |
| `VAULTIO_STORAGE_ENDPOINT`          | `http://localhost:9000`                                             | Endpoint S3/MinIO para firmar y subir.                                       |
| `VAULTIO_STORAGE_PUBLIC_ENDPOINT`   | `http://localhost:9000`                                             | Endpoint público para construir URLs descargables.                           |
| `VAULTIO_STORAGE_ACCESS_KEY_ID`     | `vaultio`                                                           | Access key MinIO/S3.                                                         |
| `VAULTIO_STORAGE_SECRET_ACCESS_KEY` | `vaultio-demo-secret`                                               | Secret key MinIO/S3.                                                         |
| `VAULTIO_STORAGE_FORCE_PATH_STYLE`  | `true`                                                              | `path-style` URLs (necesario para MinIO).                                    |
| `VAULTIO_STORAGE_PUBLIC_INCLUDE_BUCKET` | `true` local, `false` si `provider=r2`                          | Incluye el bucket en URLs públicas. Para dominios públicos de R2 debe ser `false`. |
| `VAULTIO_STORAGE_AUTO_CREATE_BUCKET` | `true` local, `false` si `provider=r2`                            | Permite crear bucket automáticamente. En R2 el bucket debe existir antes.     |

Para producción se recomienda mover **toda** la configuración a variables de entorno reales (no defaults), incluyendo passwords de Postgres y MinIO/S3.

### Cloudflare R2

Para R2 usa el bucket ya creado y configura el backend con:

```env
VAULTIO_STORAGE_PROVIDER=r2
VAULTIO_STORAGE_BUCKET=nombre-del-bucket
VAULTIO_STORAGE_REGION=auto
VAULTIO_STORAGE_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
VAULTIO_STORAGE_PUBLIC_ENDPOINT=https://<dominio-publico-r2>
VAULTIO_STORAGE_ACCESS_KEY_ID=...
VAULTIO_STORAGE_SECRET_ACCESS_KEY=...
VAULTIO_STORAGE_FORCE_PATH_STYLE=true
VAULTIO_STORAGE_PUBLIC_INCLUDE_BUCKET=false
VAULTIO_STORAGE_AUTO_CREATE_BUCKET=false
```

El bucket necesita CORS para permitir `PUT`, `GET` y `HEAD` desde el dominio de Vercel.

---

## Comandos disponibles

Desde la raíz del repo:

| Comando                         | Qué hace                                                       |
| ------------------------------- | -------------------------------------------------------------- |
| `npm run dev:api`               | Inicia el API en watch mode (NestJS via `tsx`).                |
| `npm run dev:web`               | Inicia el frontend en watch mode (Vite).                       |
| `npm run start:api`             | Corre el API desde el build (`apps/api/dist/main.js`).         |
| `npm run build:api`             | Compila NestJS con `tsc`.                                      |
| `npm run build:web`             | Typecheck + build de Vite.                                     |
| `npm run build`                 | Build de ambos workspaces.                                     |
| `npm run typecheck:web`         | Typecheck del frontend (sin emitir).                           |
| `npm run test:api`              | Corre la suite integral del API contra la DB local (12 casos). |
| `npm run lint`                  | ESLint sobre todo el monorepo.                                 |
| `npm run lint:fix`              | ESLint con autofix.                                            |
| `npm run format`                | Prettier sobre todo el repo.                                   |
| `npm run format:check`          | Verifica formato sin escribir (lo usa CI).                     |
| `npm run prisma:generate`       | Genera el Prisma Client tras cambios al schema.                |
| `npm run prisma:migrate:dev`    | Crea una migración nueva y la aplica en dev.                   |
| `npm run prisma:migrate:deploy` | Aplica migraciones pendientes (prod / CI).                     |
| `npm run prisma:migrate:reset`  | Resetea la DB y reaplica todas las migraciones.                |
| `npm run prisma:studio`         | Abre Prisma Studio para inspeccionar la DB.                    |

---

## Funcionalidades

- **Auth** con Firebase: Google OAuth + Email/Password con recuperación de contraseña.
- **Perfiles**: nombre, apellido, foto, bio, carreras y cursos actuales editables.
- **Perfil público** de otros usuarios con sus recursos.
- **Recursos**: subir archivos a MinIO (presigned PUT) o registrar enlaces externos.
- **Búsqueda y filtros**: por carrera, curso, profesor, semestre, tipo, origen y rating mínimo.
- **Ratings 1–5**: clic en una estrella ya calificada la retira.
- **Comentarios anidados**: respuestas, likes/dislikes, eliminación lógica (`[comentario eliminado]`).
- **Guardados**: marcar/desmarcar recursos, lista en `/app/saved`.
- **Descargas con audit trail**: cada descarga deja registro y devuelve URL firmada GET.
- **Reportes**: usuarios pueden reportar a otros usuarios.
- **Edición y baja lógica** de recursos propios desde el perfil.
- **Estadísticas públicas** para landing y privadas en perfil (uploads, ratings dados/recibidos, descargas).
- **404 page** y guard `RequireAuth` que redirige a `/login` o `/register` (completar perfil).

---

## API HTTP

Resumen rápido. Referencia completa en [docs/api.md](docs/api.md).

```
GET    /health
GET    /stats
GET    /auth/me
GET    /catalog/{institutions,careers,courses,resource-types,academic-periods,professors}
GET    /catalog/careers/:id/courses

GET    /users/me                  PATCH /users/me
GET    /users/me/stats
GET    /users/me/resources
GET    /users/me/saved
GET    /users/me/activity
GET    /users/me/courses          PATCH /users/me/courses

GET    /users/:id
GET    /users/:id/resources
POST   /users/:id/report

GET    /resources                 POST /resources
GET    /resources/:id             PATCH /resources/:id    DELETE /resources/:id
POST   /resources/:id/download
POST   /resources/:id/ratings
POST   /resources/:id/save        DELETE /resources/:id/save
GET    /resources/:id/comments    POST   /resources/:id/comments
POST   /resources/:id/comments/:commentId/vote
DELETE /resources/:id/comments/:commentId/vote
DELETE /resources/:id/comments/:commentId

POST   /storage/uploads
```

`POST /auth/login` y `POST /auth/register` son legacy demo y solo responden cuando `VAULTIO_ALLOW_DEMO_TOKENS=true` o `NODE_ENV=test`. En producción devuelven 404.

---

## Flujo de demo

1. Abrí `http://localhost:5173`.
2. **"Crear cuenta"** con email/contraseña, completá nombre/apellido y carrera. (También podés usar Google si lo preferís).
3. Vas a `/app/upload` → seleccionás archivo → completás metadata → publicar. El archivo se sube **directo a MinIO** con URL pre-firmada PUT, y el API registra la metadata en Postgres.
4. Calificá, comentá, guardá el recurso. Compartí el enlace.
5. Cerrá sesión. Registrate como un **segundo usuario** con otro email.
6. Buscá el recurso del primer usuario en `/app/resources` o navegando por carreras/cursos. Calificalo, comentá, guardalo.
7. Reportá el perfil del primero desde `/app/users/:id` si querés probar moderación.

---

## Tests

```bash
docker compose up -d        # asegurate de que Postgres esté arriba
npm run test:api
```

Pasan 12 tests integrales contra la base real:

- Health check
- Stats públicas
- Catálogos (carreras, cursos)
- `GET /auth/me` con y sin token
- `GET /users/me` + `PATCH /users/me`
- Listado, detalle y descarga de recursos
- Creación de recursos con metadata MinIO **y** con enlace externo
- Save / unsave
- Ratings upsert
- Comentarios
- Stats del usuario

> Los tests usan el modo demo (`VAULTIO_ALLOW_DEMO_TOKENS=true`) para autenticarse contra `maria@estudiantec.cr` y `carlos@estudiantec.cr` que crea `seed.service.ts`. En producción ese modo nunca se activa.

---

## Troubleshooting

| Síntoma                                                     | Causa probable                                          | Solución                                                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Firebase no está configurado…` en el login                 | Falta `apps/web/.env.local` o las vars VITE*FIREBASE*\* | Crear el archivo desde `.env.example` y **reiniciar `npm run dev:web`** (Vite no recarga env vars).    |
| `Token invalido` en cada request                            | El service account no se esta cargando                  | Verificar que exista `secrets/vaultio-auth-service-account.json` y que `VAULTIO_FIREBASE_SERVICE_ACCOUNT` apunte a esa ruta. |
| `auth/operation-not-allowed` en login con Google            | Proveedor no habilitado en Firebase                     | Firebase Console → Authentication → Sign-in method → habilitar Google y Email/Password.                |
| `EADDRINUSE :::4000`                                        | Otra instancia del API corriendo                        | Matar el proceso o cambiar `VAULTIO_API_PORT`.                                                         |
| Tests fallan con `relation "..." does not exist`            | Postgres se levantó con volumen viejo                   | `docker compose down -v && docker compose up -d`.                                                      |
| MinIO devuelve `SignatureDoesNotMatch` al subir             | `VAULTIO_STORAGE_PUBLIC_ENDPOINT` distinto del firmado  | Ambos endpoints deben apuntar al **mismo** host visible desde el navegador.                            |
| El frontend muestra recursos pero los archivos no descargan | Bucket sin policy pública o URL firmada expirada        | El API genera una URL nueva en cada click; si falla, revisar logs del API y del contenedor MinIO.      |

---

## Documentación adicional

- [docs/stack.md](docs/stack.md) — Qué hace cada herramienta del stack y por qué está acá.
- [docs/arquitectura.md](docs/arquitectura.md) — Flujos (auth, upload, link externo) y decisiones.
- [docs/desarrollo-local.md](docs/desarrollo-local.md) — Setup detallado y reset de datos.
- [docs/despliegue-vercel.md](docs/despliegue-vercel.md) — Checklist para publicar el frontend en Vercel.
- [docs/api.md](docs/api.md) — Referencia completa de endpoints.
- [docs/plan-tecnico.md](docs/plan-tecnico.md) — Plan técnico inicial (histórico).
- [docs/reporte-limpieza-y-mejoras.md](docs/reporte-limpieza-y-mejoras.md) — Reporte de limpieza ejecutada.
- [MEJORAS.md](MEJORAS.md) — **Propuestas estructurales para llevar el repo a nivel pro**.
- [CONTEXT.md](CONTEXT.md) — Contexto funcional y de producto (origen del proyecto).

---

## Próximos pasos

Resumen alto nivel (detalle en [MEJORAS.md](MEJORAS.md)):

1. **Migraciones formales** con Prisma Migrate (reemplazar el bootstrap por SQL).
2. **Reorganizar `database/`** dentro de `apps/api/prisma/` o crear `infra/postgres/` con seeds versionados.
3. **Reorganizar infra** (`infra/docker/`) y mover `docker-compose.yml` adentro.
4. **DTOs + validación con Zod o class-validator** para reemplazar `any` en controllers/services.
5. **Cliente API generado** desde OpenAPI/tRPC para evitar drift entre web y API.
6. **Paginación DB-side** en listados de recursos y comentarios.
7. **Moderación real** de reportes con estados y auditoría.
8. **Observabilidad**: logs estructurados, request id, métricas.
9. **CI/CD**: GitHub Actions con typecheck, test y build en cada PR.
10. **Tests E2E** con Playwright para flujos críticos.

---

## Notas de seguridad

- Firebase Auth emite el ID token; el API lo verifica con Firebase Admin en cada request.
- Postgres es la fuente de verdad de negocio. Firebase **no almacena metadata** del producto.
- MinIO solo guarda objetos. URLs firmadas con expiración corta.
- `.env*`, service accounts y volúmenes Docker están en `.gitignore`.
- Para producción: HTTPS obligatorio, rotación de service account, secretos en un vault, política de retención, escaneo MIME/AV en uploads y moderación activa.
