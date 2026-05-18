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

## Requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose
- Proyecto Firebase con Authentication habilitado (Google y Email/Password)

## Setup

### 1. Servicios locales (Postgres + MinIO)

```bash
docker compose up -d
```

Esto levanta:

- **Postgres**: `localhost:5432`, base `vaultio` (usuario `vaultio` / contraseña `vaultio`). Los scripts `backend/database/*.sql` se ejecutan automáticamente la primera vez.
- **MinIO**: API en `localhost:9000`, consola en `localhost:9001` (usuario `vaultio` / contraseña `vaultio-demo-secret`).

> Si ya existen datos viejos y queres resetear: `docker compose down -v && docker compose up -d`.

### 2. Credenciales de Firebase

**Frontend** — copiar `frontend/.env.example` a `frontend/.env.local` y completar:

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:4000
```

**Backend** — descargar el _service account JSON_ desde Firebase Console → ⚙️ Project Settings → Service accounts → "Generate new private key". Guardarlo en la raíz del repo como `vaultio-auth-firebase-adminsdk-fbsvc-*.json` (queda en `.gitignore`). Alternativa: definir `GOOGLE_APPLICATION_CREDENTIALS` apuntando a la ruta.

En Firebase Console → Authentication → Sign-in method habilitar:

- **Google** (con email de soporte).
- **Email/Password**.

### 3. Instalar dependencias y generar Prisma Client

```bash
npm install
cd frontend && npm install && cd ..
npm run prisma:generate --workspace apps/api
```

### 4. Arrancar dev

En dos terminales:

```bash
npm run dev:api       # NestJS en http://localhost:4000
npm run dev:web       # Vite en http://localhost:5173
```

## Flujo de demo

1. Abrí `http://localhost:5173` y entrá a **"Iniciar sesión"**.
2. Opciones:
   - **Continuar con Google** (popup), o
   - **Email + contraseña** → si no tenés cuenta, clic en "Crear una" para registrarte.
3. Si es tu primera vez, completá nombre/apellido y elegí carrera.
4. Subí un recurso en `/app/upload`: seleccioná archivo → completá metadata → se sube directo a MinIO con URL firmada y se registra en Postgres.
5. Calificá, comentá, guardá recursos. Compartí enlaces (copia al portapapeles).
6. Probá con un segundo usuario: cerrá sesión, registrate con otra cuenta y verás los recursos del primer usuario.

## Endpoints principales

```
GET    /health
GET    /stats                       — totales públicos (landing)

GET    /catalog/institutions
GET    /catalog/careers
GET    /catalog/careers/:id/courses
GET    /catalog/courses
GET    /catalog/resource-types
GET    /catalog/academic-periods
GET    /catalog/professors

GET    /auth/me                     — perfil actual (verifica ID token Firebase)

GET    /users/me                    — equivalente a /auth/me
PATCH  /users/me                    — nombre, apellido, bio, carreras
GET    /users/me/stats              — uploads, saved, ratings dados/recibidos
GET    /users/me/resources          — recursos del usuario actual
GET    /users/me/saved              — recursos guardados

GET    /resources                   — list (search, courseId, typeId, careerId)
GET    /resources/:id               — detalle (incluye `saved` y `userRating`)
POST   /resources                   — crear (requiere storage metadata)
POST   /resources/:id/download      — registra descarga + URL firmada GET
POST   /resources/:id/ratings       — calificar (1-5, upsert)
POST   /resources/:id/save          — guardar
DELETE /resources/:id/save          — desmarcar
GET    /resources/:id/comments
POST   /resources/:id/comments

POST   /storage/uploads             — URL pre-firmada PUT a MinIO
```

> Los endpoints `POST /auth/login` y `POST /auth/register` se quedaron bloqueados en producción/dev. Solo se activan con `NODE_ENV=test` o `VAULTIO_ALLOW_DEMO_TOKENS=true` (uso interno para los tests).

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

## Comandos

```bash
npm run dev:api                       # API en watch
npm run dev:web                       # Frontend en watch
npm run test:api                      # 12 tests integrales (requiere DB up)
npm run build                         # Build API + frontend
cd frontend && npm run typecheck      # Typecheck del frontend
```

## Estructura

```text
apps/api/
  prisma/schema.prisma         # esquema (introspectado desde SQL)
  src/
    auth.controller.ts         # GET /auth/me
    auth.service.ts            # verifica ID token Firebase y sincroniza users/identities
    catalog.controller.ts      # carreras, cursos, periodos, profesores
    resources.controller.ts    # CRUD + download + ratings + save + comments
    users.controller.ts        # /users/me y derivados
    storage.controller.ts      # presigned URLs MinIO
    stats.controller.ts        # GET /stats
    firebase-admin.service.ts  # init firebase-admin
    seed.ts                    # seed catálogos
  test/api.test.ts             # 12 tests integrales

backend/database/
  schema.sql, logic.sql, seed.sql   # init Postgres (montado por docker-compose)

frontend/
  src/app/
    App.tsx                    # AuthProvider + Toaster + Router
    routes.tsx                 # rutas con RequireAuth
    lib/
      firebase.ts              # Firebase Web SDK (Google + email/password + reset)
      auth-context.tsx         # signIn/signUp/signOut + perfil
      RequireAuth.tsx          # guard
      api.ts                   # cliente del backend (token desde Firebase)
    pages/                     # auth, courses, home, library, profile, resources
    components/                # layout, comments, filters, resources, ui

docker-compose.yml             # Postgres + MinIO
```

## Notas de seguridad

- El service account JSON está en `.gitignore`. **No commitearlo nunca.**
- El bucket de MinIO se crea automáticamente al primer arranque del API.
- Para producción: rotar el service account, migrar storage a S3/GCS y servir con HTTPS.
