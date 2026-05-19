# Desarrollo local

Guía detallada para correr Vaultio en tu máquina, debuggear flujos y resetear ambientes.

---

## TL;DR

```bash
npm install
docker compose up -d
cp apps/web/.env.example apps/web/.env.local      # y completar
# colocar el service account JSON en la raíz
npm run prisma:migrate:deploy
npm run prisma:generate
npm run dev:api
npm run dev:web
```

URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- MinIO Console: `http://localhost:9001` (user `vaultio`, pwd `vaultio-demo-secret`)
- Postgres: `localhost:5432` (DB `vaultio`, user `vaultio`, pwd `vaultio`)

---

## Setup detallado

### 1. Dependencias del sistema

| Herramienta       | Versión mínima | Verificar                |
| ----------------- | -------------- | ------------------------ |
| Node.js           | 20.x           | `node --version`         |
| npm               | 10.x           | `npm --version`          |
| Docker            | 24.x           | `docker --version`       |
| Docker Compose v2 | 2.x            | `docker compose version` |

### 2. Instalar dependencias del repo

```bash
npm install
```

Este comando instala los dos workspaces (`@vaultio/api` y `@vaultio/web`). Las deps quedan hoisted a `node_modules/` raíz; solo lo específico de cada workspace vive en `apps/<name>/node_modules/`.

### 3. Levantar servicios

```bash
docker compose up -d
```

Verifica:

```bash
docker compose ps
```

Debería mostrar `vaultio-postgres` y `vaultio-minio` con status `running`.

Para ver logs:

```bash
docker compose logs -f postgres
docker compose logs -f minio
```

### 4. Configurar Firebase

#### Frontend

Copiar y completar:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Los 4 valores VITE*FIREBASE*\* salen de Firebase Console → Project Settings → General → "Tus apps" → Config del SDK.

#### Backend

Descargar el service account JSON desde Firebase Console → Project Settings → **Service accounts** → "Generate new private key".

Colocá el archivo donde corresponda según prioridad:

1. Path en `GOOGLE_APPLICATION_CREDENTIALS` (env var).
2. Path relativo al root en `VAULTIO_FIREBASE_SERVICE_ACCOUNT`.
3. Cualquier archivo `*-firebase-adminsdk-*.json` en la **raíz del repo** (lo encuentra solo).
4. `firebase-service-account.json` en la raíz.

Está en `.gitignore`. No commitearlo nunca.

#### Habilitar proveedores

Firebase Console → Authentication → Sign-in method:

- **Google**: enable + email de soporte.
- **Email/Password**: enable.

### 5. Aplicar migraciones de Prisma y generar Client

```bash
npm run prisma:migrate:deploy    # aplica migraciones a la DB
npm run prisma:generate          # genera el client tipado
```

Para crear una migración nueva (cuando cambias `schema.prisma`):

```bash
npm run prisma:migrate:dev -- --name agrega_nueva_tabla
```

Para resetear todo:

```bash
npm run prisma:migrate:reset     # ⚠️ borra y reaplica todas las migraciones
```

### 6. Arrancar dev

En dos terminales:

```bash
npm run dev:api    # NestJS con hot reload via tsx
npm run dev:web    # Vite con HMR
```

---

## Variables de entorno

### Frontend (`apps/web/.env.local`)

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:4000
```

> Vite **no** recarga env vars en caliente. Tras editar `.env.local`, reiniciar `npm run dev:web`.

### Backend (`apps/api/.env` o variables del shell)

Todas tienen defaults sensatos para dev local. Las que típicamente vas a cambiar:

```dotenv
VAULTIO_API_PORT=4000
DATABASE_URL=postgresql://vaultio:vaultio@localhost:5432/vaultio?schema=public
GOOGLE_APPLICATION_CREDENTIALS=/abs/path/al/service-account.json
VAULTIO_AUTH_ALLOWED_DOMAIN=               # vacío = cualquier dominio
VAULTIO_STORAGE_ENDPOINT=http://localhost:9000
VAULTIO_STORAGE_PUBLIC_ENDPOINT=http://localhost:9000
```

Ver la tabla completa en el [README](../README.md#variables-de-entorno).

---

## Reset de datos

```bash
docker compose down -v
docker compose up -d
npm run prisma:migrate:deploy
```

Esto borra **ambos** volúmenes (Postgres y MinIO), arranca Postgres vacío y reaplica todas las migraciones. La data demo se siembra automáticamente al arrancar el API (`seed.service.ts`).

Alternativa con un solo comando:

```bash
npm run prisma:migrate:reset
```

> Si solo querés borrar MinIO sin perder Postgres: `docker compose down && docker volume rm vaultio_vaultio-minio-data && docker compose up -d`.

---

## Tests

```bash
docker compose up -d         # Postgres + MinIO arriba
npm run test:api
```

12 tests integrales contra Postgres real. El test runner usa `NODE_ENV=test` y `VAULTIO_ALLOW_DEMO_TOKENS=true` para autenticarse contra los usuarios sembrados (`maria@estudiantec.cr` y `carlos@estudiantec.cr`, password `demo123`).

Los tests **escriben en la base** y limpian después. Si querés correrlos contra otra DB:

```bash
DATABASE_URL=postgresql://... npm run test:api
```

---

## Verificaciones recomendadas antes de commitear

```bash
npm run lint            # ESLint
npm run format:check    # Prettier (sin escribir)
npm run typecheck:web   # typecheck del frontend
npm run build:api       # tsc del API
npm run build:web       # build completo de Vite
npm run test:api        # suite integral
```

> Husky corre `lint-staged` automáticamente en cada `git commit` (lint + format de los archivos staged). Si te incomoda, lo podés saltar con `git commit --no-verify`.

> GitHub Actions corre exactamente los mismos pasos en cada push/PR a `main` (ver `.github/workflows/ci.yml`).

---

## Checklist manual de demo

- [ ] Login con Google.
- [ ] Registro con Email/Password.
- [ ] Completar perfil (carrera) tras primer login.
- [ ] Edición de perfil (nombre, bio, carrera).
- [ ] Subida de archivo PDF a MinIO. Verificar en consola MinIO (`localhost:9001`).
- [ ] Creación de recurso tipo enlace externo.
- [ ] Filtros por carrera, curso, profesor, tipo y rating.
- [ ] Rating 1–5 y quitar rating clicando la misma estrella.
- [ ] Comentar, responder, votar, eliminar comentario propio.
- [ ] Guardar y desmarcar recurso.
- [ ] Descarga: verificar que abre el archivo y aumenta el contador.
- [ ] Perfil público de otro usuario.
- [ ] Reporte a otro usuario.
- [ ] Editar y eliminar (lógico) recurso propio.

---

## Debugging

### El API no encuentra la DB

```
PrismaClientInitializationError: P1001
```

Postgres no está arriba o la URL apunta a otro host.

```bash
docker compose ps
docker compose logs postgres
```

### El API responde `Token invalido` con cada request

El service account JSON no se está cargando. Verificá:

```bash
node -e "const fs=require('fs'); const path=require('path'); const m=fs.readdirSync('.').find(n=>/-firebase-adminsdk-.*\.json$/i.test(n)); console.log(m || 'no encontrado')"
```

O exportá `GOOGLE_APPLICATION_CREDENTIALS` con un path absoluto.

### MinIO devuelve `SignatureDoesNotMatch`

`VAULTIO_STORAGE_ENDPOINT` (con el que se firma) y `VAULTIO_STORAGE_PUBLIC_ENDPOINT` (que ve el navegador) tienen que apuntar al **mismo** host. En dev local ambos son `http://localhost:9000`.

### `EADDRINUSE :::4000`

Hay otra instancia del API corriendo.

Windows PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 4000 | Select-Object OwningProcess
Stop-Process -Id <pid>
```

Linux/macOS:

```bash
lsof -ti :4000 | xargs kill
```

### Vite no carga las nuevas env vars

Reiniciar `npm run dev:web` (Ctrl+C y arrancar de nuevo). HMR no aplica a `.env*`.

### Postgres se levantó pero no ejecuta los `.sql`

Los scripts en `/docker-entrypoint-initdb.d/` **solo corren la primera vez** con un volumen vacío. Si ya existe el volumen, hay que eliminarlo:

```bash
docker compose down -v
docker compose up -d
```
