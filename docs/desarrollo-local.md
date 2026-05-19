# Desarrollo local

## Inicio rapido

```bash
npm install
docker compose up -d
npm run prisma:generate
npm run dev:api
npm run dev:web
```

Abrir:

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- MinIO Console: `http://localhost:9001`

## Variables

Frontend:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:4000
```

Backend principales:

```dotenv
VAULTIO_API_PORT=4000
DATABASE_URL=postgresql://vaultio:vaultio@localhost:5432/vaultio?schema=public
GOOGLE_APPLICATION_CREDENTIALS=./vaultio-auth-firebase-adminsdk-xxxxx.json
VAULTIO_STORAGE_PROVIDER=minio
VAULTIO_STORAGE_BUCKET=vaultio-demo
VAULTIO_STORAGE_ENDPOINT=http://localhost:9000
VAULTIO_STORAGE_PUBLIC_ENDPOINT=http://localhost:9000
VAULTIO_STORAGE_ACCESS_KEY_ID=vaultio
VAULTIO_STORAGE_SECRET_ACCESS_KEY=vaultio-demo-secret
```

## Reset de datos locales

```bash
docker compose down -v
docker compose up -d
npm run prisma:generate
```

Esto borra volumenes de Postgres y MinIO.

## Verificaciones recomendadas

```bash
npm run build:api
npm run typecheck:web
npm run build:web
npm run test:api
```

## Checklist manual

- Login con Google.
- Login/registro con Email/Password si esta habilitado en Firebase.
- Subida de archivo a MinIO.
- Creacion de recurso tipo link.
- Filtros por carrera, curso, profesor, tipo y rating.
- Rating y quitar rating al clicar la misma estrella.
- Comentarios, respuestas, voto y eliminacion.
- Foto de perfil visible en perfil y comentarios.
- Perfil publico y reporte de usuario.
- Edicion/eliminacion de recurso propio desde perfil.
