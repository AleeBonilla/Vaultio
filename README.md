# Vaultio

Plataforma académica del **Instituto Tecnológico de Costa Rica (TEC)** para centralizar, organizar y compartir recursos educativos: apuntes, exámenes, ejercicios, resúmenes y código fuente. Todo organizado por carrera, curso, profesor y semestre.

## Stack

| Capa          | Tecnología                                          |
| ------------- | --------------------------------------------------- |
| Frontend      | Vite + React 18 + TypeScript + Tailwind CSS         |
| Routing       | `react-router` v7                                   |
| Auth          | Firebase Authentication (Google + Email/Password)   |
| API           | NestJS 11 + TypeScript                              |
| ORM           | Prisma 7 + adaptador `@prisma/adapter-pg`           |
| Base de datos | PostgreSQL 16 (Docker)                              |
| Storage       | MinIO S3-compatible (Docker)                        |
| Toasts        | `sonner`                                            |

## Estructura del repo

```text
vaultio/
├── apps/
│   ├── api/                  # Backend NestJS
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config.ts
│   │   │   ├── auth/         # auth.controller, auth.service, auth.util
│   │   │   ├── catalog/      # carreras, cursos, profesores, periodos
│   │   │   ├── common/       # errors, exception filter, serializers
│   │   │   ├── firebase/     # firebase-admin.service
│   │   │   ├── health/       # /health
│   │   │   ├── prisma/       # prisma.service
│   │   │   ├── resources/    # CRUD recursos, ratings, save, comments
│   │   │   ├── seed/         # bootstrap data seed
│   │   │   ├── stats/        # /stats publicos
│   │   │   ├── storage/      # MinIO presigned URLs
│   │   │   └── users/        # /users/me
│   │   ├── test/
│   │   │   └── api.test.ts   # 12 tests integrales
│   │   ├── package.json
│   │   ├── prisma.config.ts
│   │   └── tsconfig.json
│   └── web/                  # Frontend Vite + React
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── App.tsx
│       │   │   ├── routes.tsx
│       │   │   ├── components/  # layout, comments, filters, resources, ui
│       │   │   ├── lib/         # firebase, auth-context, RequireAuth, api
│       │   │   └── pages/       # auth, courses, home, library, profile, resources
│       │   └── styles/
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── .env.example
├── database/                 # SQL de inicio (montados por docker-compose)
│   ├── schema.sql
│   ├── logic.sql
│   └── seed.sql
├── docs/
│   └── plan-tecnico.md
├── docker-compose.yml        # Postgres + MinIO
├── package.json              # workspaces apps/*
├── README.md
└── CONTEXT.md
```

## Requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose
- Proyecto Firebase con Authentication habilitado (Google y Email/Password)

## Setup

### 1. Levantar servicios locales (Postgres + MinIO)

```bash
docker compose up -d
```

Esto levanta:

- **Postgres**: `localhost:5432`, base `vaultio` (usuario `vaultio` / contraseña `vaultio`). Los scripts `database/*.sql` se ejecutan automáticamente la primera vez.
- **MinIO**: API en `localhost:9000`, consola en `localhost:9001` (usuario `vaultio` / contraseña `vaultio-demo-secret`).

> Si necesitas resetear datos viejos: `docker compose down -v && docker compose up -d`.

### 2. Credenciales de Firebase

**Frontend** — copiá `apps/web/.env.example` a `apps/web/.env.local` y completalo:

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:4000
```

**Backend** — descargar el _service account JSON_ desde Firebase Console → ⚙️ Project Settings → Service accounts → "Generate new private key". Guardalo en la raíz del repo como `vaultio-auth-firebase-adminsdk-fbsvc-*.json` (queda en `.gitignore`). Alternativa: definir `GOOGLE_APPLICATION_CREDENTIALS` apuntando a la ruta del JSON.

En Firebase Console → Authentication → Sign-in method habilitar:

- **Google** (con email de soporte).
- **Email/Password**.

### 3. Instalar dependencias y generar Prisma Client

```bash
npm install
npm run prisma:generate
```

### 4. Arrancar dev

En dos terminales:

```bash
npm run dev:api       # NestJS en http://localhost:4000
npm run dev:web       # Vite en http://localhost:5173
```

## Comandos disponibles (raíz)

```bash
npm run dev:api                  # API watch
npm run dev:web                  # Frontend watch
npm run build:api                # tsc build del API
npm run build:web                # build de producción del frontend (tsc + vite)
npm run build                    # build API + web
npm run test:api                 # 12 tests integrales (requiere docker compose up)
npm run typecheck:web            # typecheck del frontend
npm run prisma:generate          # regenerar Prisma Client tras cambios al schema
```

## Flujo de demo

1. Abrí `http://localhost:5173` y entrá a **"Iniciar sesión"**.
2. Opciones:
   - **Continuar con Google** (popup), o
   - **Email + contraseña** → si no tenés cuenta, "Crear una".
3. Si es tu primera vez, completá nombre/apellido y elegí carrera.
4. Subí un recurso en `/app/upload`: seleccionás archivo → completás metadata → se sube directo a MinIO con URL firmada y se registra en Postgres.
5. Calificá, comentá, guardá recursos. Compartí enlaces.
6. Probá con un segundo usuario: cerrá sesión, registrate con otra cuenta y verás los recursos del primero.

## Endpoints principales

```
GET    /health
GET    /stats                       totales públicos (landing)

GET    /catalog/institutions
GET    /catalog/careers
GET    /catalog/careers/:id/courses
GET    /catalog/courses
GET    /catalog/resource-types
GET    /catalog/academic-periods
GET    /catalog/professors

GET    /auth/me                     perfil actual (verifica ID token Firebase)

GET    /users/me
PATCH  /users/me                    nombre, apellido, bio, carreras
GET    /users/me/stats
GET    /users/me/resources
GET    /users/me/saved

GET    /resources                   list (search, courseId, typeId, careerId)
GET    /resources/:id               detalle (incluye `saved` y `userRating`)
POST   /resources                   crear (con storage metadata)
POST   /resources/:id/download      registra descarga + URL firmada GET
POST   /resources/:id/ratings       upsert 1-5
POST   /resources/:id/save
DELETE /resources/:id/save
GET    /resources/:id/comments
POST   /resources/:id/comments

POST   /storage/uploads             URL pre-firmada PUT a MinIO
```

> Los endpoints demo `POST /auth/login` / `POST /auth/register` están bloqueados en producción y solo se activan con `NODE_ENV=test` o `VAULTIO_ALLOW_DEMO_TOKENS=true` (uso interno para los tests).

## Variables de entorno (backend)

| Variable                            | Default                                                             |
| ----------------------------------- | ------------------------------------------------------------------- |
| `VAULTIO_API_PORT`                  | `4000`                                                              |
| `DATABASE_URL`                      | `postgresql://vaultio:vaultio@localhost:5432/vaultio?schema=public` |
| `GOOGLE_APPLICATION_CREDENTIALS`    | path al service account JSON (default: raíz del repo)               |
| `VAULTIO_AUTH_ALLOWED_DOMAIN`       | vacío = cualquier email. `estudiantec.cr` fuerza dominio TEC.       |
| `VAULTIO_STORAGE_PROVIDER`          | `minio`                                                             |
| `VAULTIO_STORAGE_BUCKET`            | `vaultio-demo`                                                      |
| `VAULTIO_STORAGE_ENDPOINT`          | `http://localhost:9000`                                             |
| `VAULTIO_STORAGE_PUBLIC_ENDPOINT`   | `http://localhost:9000`                                             |
| `VAULTIO_STORAGE_ACCESS_KEY_ID`     | `vaultio`                                                           |
| `VAULTIO_STORAGE_SECRET_ACCESS_KEY` | `vaultio-demo-secret`                                               |
| `VAULTIO_ALLOW_DEMO_TOKENS`         | solo `true` en tests                                                |

## Notas de seguridad

- El service account JSON está en `.gitignore`. **No commitearlo nunca.**
- Para que tu compañero pruebe el proyecto, generale un service account JSON propio desde Firebase Console (no le pases el tuyo). El frontend `.env.local` con `VITE_FIREBASE_*` se puede compartir libremente (la apiKey de Firebase Web es pública por diseño).
- Para producción: rotar el service account, migrar storage a S3/GCS y servir con HTTPS.
