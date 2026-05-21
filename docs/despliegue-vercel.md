# Despliegue en Vercel

Esta guía documenta el intento de despliegue del frontend de Vaultio en Vercel. El backend NestJS sigue pensado para ejecutarse como servicio separado porque depende de Prisma, Postgres y storage S3-compatible.

## Alcance del despliegue

- Vercel compila y publica `apps/web` como aplicación Vite.
- El build se ejecuta desde la raiz con `npm run build:web`.
- El directorio publicado es `apps/web/dist`.
- Las rutas de React se redirigen a `index.html` desde `vercel.json`.

## Variables requeridas

Configurar estas variables en Vercel Project Settings -> Environment Variables:

```text
VITE_API_URL=https://api.example.com
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

`VITE_API_URL` debe apuntar al API público. En local se mantiene `http://localhost:4000`.

## Build local

Antes de abrir un preview deployment, correr:

```bash
npm run vercel:build
```

Ese script usa el mismo comando que Vercel ejecuta en `vercel.json`, por lo que sirve para detectar errores del frontend antes de subir cambios.

## Checklist

1. Confirmar que `npm install` usa Node 22.x, como indica `package.json`.
2. Configurar las variables `VITE_*` en los ambientes Production y Preview.
3. Ejecutar `npm run build:web` localmente antes de conectar el repo.
4. Revisar que el API permita el dominio de Vercel en `VAULTIO_CORS_ORIGINS`.
5. Validar login, listado de recursos y subida de archivos en el preview deployment.

## Pendientes para producción

- Publicar el backend en Render, Railway, Fly.io u otro runtime persistente.
- Usar una base Postgres administrada y ejecutar `npm run prisma:migrate:deploy`.
- Reemplazar MinIO local por S3, Cloudflare R2 o un proveedor compatible.
- Registrar el dominio final de Vercel en Firebase Authentication.
