# Vaultio - Handoff de estado actual

Este documento resume el estado real del repo despues de revisar el arbol de trabajo actual. Esta pensado para que otro agente pueda continuar sin reconstruir todo el contexto del chat.

## Resumen ejecutivo

El proyecto ya no es la API Express/JSON original. El trabajo actual migro la API a NestJS + Prisma + PostgreSQL, agrego MinIO local como storage S3-compatible y empezo a convertir el frontend a autenticacion real con Firebase Auth.

La base compila y las pruebas actuales de API pasan, pero el proyecto no esta terminado. El flujo visible de login depende de Firebase, varias pantallas siguen con datos mock, y la subida de archivos todavia registra metadata pero no sube el archivo real a MinIO.

## Estado Git / higiene

- El worktree esta sucio y contiene muchos cambios sin commit.
- Los archivos JS viejos de `apps/api/src/*.js` y `apps/api/test/api.test.js` estan marcados como borrados; fueron reemplazados por TypeScript/Nest.
- `package-lock.json` en raiz esta untracked y probablemente debe versionarse si se mantiene npm.
- `frontend/package-lock.json` y `frontend/package.json` cambiaron por la dependencia `firebase`.
- `frontend/.env.local` existe localmente, pero esta ignorado por `.gitignore`.
- La credencial `vaultio-auth-firebase-adminsdk-fbsvc-04da3d9bea.json` esta ignorada por `.gitignore`.
- Se agrego `.claude/` a `.gitignore` porque habia quedado un worktree completo del agente anterior con `node_modules`, envs y artefactos locales. No debe commitearse.

Validacion de ignore realizada:

```txt
frontend/.env.local -> ignorado por .env.*
vaultio-auth-firebase-adminsdk-fbsvc-04da3d9bea.json -> ignorado por *-firebase-adminsdk-*.json
.claude/... -> ignorado por .claude/
```

## Servicios locales

`docker ps` muestra activos:

- `vaultio-postgres`, imagen `postgres:16-alpine`, puerto `5432:5432`.
- `vaultio-minio`, imagen `minio/minio:RELEASE.2025-04-22T22-12-26Z`, puertos `9000:9000` y `9001:9001`.

`docker-compose.yml` monta:

- `backend/database/schema.sql`
- `backend/database/logic.sql`
- `backend/database/seed.sql`

Nota: si el volumen de Postgres ya existia, Docker no vuelve a ejecutar los scripts de init. Para recrear desde cero hay que resetear el volumen explicitamente.

## Validaciones ejecutadas

Resultado al momento de esta revision:

```txt
npm test      -> OK, 5/5 tests API pasan
npm run build -> OK, API + frontend compilan
```

Advertencias observadas:

- `pg` emite deprecation warning durante tests: `Calling client.query() when the client is already executing a query is deprecated...`.
- Vite advierte chunk JS > 500 kB por Firebase/dependencias. No bloquea.
- El build frontend de Vite no hace type-check fuerte; transpila. No hay `frontend/tsconfig.json` en el repo principal.

Firebase:

- Firebase Admin responde con la credencial local (`firebase-admin-ok`).
- El provider Google en Firebase Auth existe y esta habilitado al momento de esta revision.
- No imprimir ni commitear el contenido del service account.

## API actual

Ubicacion: `apps/api`.

Stack:

- NestJS 11.
- TypeScript.
- Prisma 7 + `@prisma/adapter-pg`.
- PostgreSQL.
- Firebase Admin.
- AWS SDK S3 para MinIO.

Scripts relevantes:

```txt
npm run dev --workspace apps/api
npm run build --workspace apps/api
npm run test --workspace apps/api
npm run prisma:generate --workspace apps/api
```

Puerto por defecto:

```txt
http://localhost:4000
```

Config por defecto:

- `DATABASE_URL`: `postgresql://vaultio:vaultio@localhost:5432/vaultio?schema=public`
- `VAULTIO_API_PORT`: `4000`
- `VAULTIO_STORAGE_PROVIDER`: `minio`
- `VAULTIO_STORAGE_BUCKET`: `vaultio-demo`
- `VAULTIO_STORAGE_ENDPOINT`: `http://localhost:9000`
- `VAULTIO_AUTH_ALLOWED_DOMAIN`: sin restriccion por defecto. Si se quiere restringir a TEC, usar `estudiantec.cr`.
- `VAULTIO_ALLOW_DEMO_TOKENS`: solo `true` o `NODE_ENV=test`.

Endpoints implementados:

- `GET /health`
- `POST /auth/register` demo password legacy
- `POST /auth/login` demo password legacy
- `GET /auth/me`
- `GET /catalog/institutions`
- `GET /catalog/careers`
- `GET /catalog/careers/:careerId/courses`
- `GET /catalog/courses`
- `GET /catalog/resource-types`
- `GET /catalog/academic-periods`
- `GET /catalog/professors`
- `GET /resources`
- `GET /resources/:id`
- `POST /resources`
- `POST /resources/:id/download`
- `POST /resources/:id/ratings`
- `POST /resources/:id/save`
- `DELETE /resources/:id/save`
- `GET /resources/:id/comments`
- `POST /resources/:id/comments`
- `POST /storage/uploads`
- `GET /users/me`
- `PATCH /users/me`
- `GET /users/me/stats`
- `GET /users/me/resources`
- `GET /users/me/saved`
- `GET /stats`

## Auth actual

La direccion correcta del proyecto es Firebase Auth como proveedor real. El frontend ya esta armado para Google popup y el backend verifica Firebase ID tokens.

Flujo actual esperado:

1. Usuario presiona `Continuar con Google`.
2. Firebase devuelve usuario/token.
3. `AuthProvider` configura el token provider para `apiFetch`.
4. Front llama `GET /auth/me`.
5. Backend verifica token con Firebase Admin.
6. Backend sincroniza usuario local en `users` e `identities` con `provider_name = firebase`.
7. Si el usuario no tiene carrera (`careerIds.length === 0`), el front redirige a `/register` para completar perfil.
8. `PATCH /users/me` guarda nombre/apellido/bio/carreras.

Inconsistencia pendiente:

- `POST /auth/login` y `POST /auth/register` demo siguen existiendo.
- Esos endpoints devuelven tokens demo, pero `readUserFromAuthorization` no los acepta en dev normal si `VAULTIO_ALLOW_DEMO_TOKENS` no esta en `true`.
- Como el frontend ya no usa login demo, se recomienda decidir: eliminar endpoints demo o documentar `VAULTIO_ALLOW_DEMO_TOKENS=true` para modo demo sin Firebase.

## Frontend actual

Ubicacion: `frontend`.

Stack:

- Vite.
- React.
- React Router.
- Tailwind/shadcn-style components.
- Firebase Web SDK.
- Sonner para toasts.

Scripts:

```txt
npm run dev --prefix frontend
npm run build --prefix frontend
```

Variables locales:

```txt
frontend/.env.local
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:4000  # opcional; default ya apunta a localhost:4000
```

Pendiente pequeno pero importante:

- `AuthProvider` dice "Copia frontend/.env.example...", pero `frontend/.env.example` no existe en el repo principal. Crear un example sin secretos.

Rutas actuales:

- `/`
- `/login`
- `/register`
- `/app`
- `/app/courses`
- `/app/courses/:careerId`
- `/app/courses/:careerId/:courseId`
- `/app/resources`
- `/app/resources/:id`
- `/app/upload`
- `/app/profile`
- `/app/profile/edit`
- `/app/saved`
- `*` -> NotFound

Rutas protegidas:

- Todo bajo `/app` pasa por `RequireAuth`.
- Si no hay `firebaseUser` o perfil local, redirige a `/login`.
- Si hay perfil sin carrera y `requireCompleteProfile=true`, redirige a `/register`.

## Integraciones frontend ya hechas

Usan API real:

- `LoginPage`: login con Firebase via `useAuth.signIn`.
- `RegisterPage`: completa perfil/carrera con `usersApi.updateMe`.
- `Dashboard`: carga carreras, cursos y recursos.
- `CourseNavigation`: carga carreras/cursos.
- `CourseResources`: carga recursos por curso.
- `ResourceListing`: carga lista de recursos.
- `ResourceDetail`: carga detalle del recurso.
- `ResourceCard`: llama save/unsave.
- `UploadResource`: carga catalogos y crea recurso.

Parcial o incompleto:

- `UploadResource` no usa `storageApi.createUploadUrl`; solo manda metadata a `POST /resources`.
- `ResourceDetail` abre `resource.fileUrl` directo; no usa `resourcesApi.download`, por lo tanto no registra descarga real ni obtiene URL firmada.
- `ResourceDetail` muestra comentarios, pero no permite crear comentario.
- `ResourceDetail` muestra rating, pero no permite calificar.
- `SavedResources` sigue hardcodeado con datos mock; no usa `usersApi.saved`.
- `UserProfile` sigue hardcodeado con datos mock; no usa `useAuth`, `usersApi.stats`, `usersApi.uploads`.
- `EditProfile` sigue hardcodeado; no usa `usersApi.updateMe` ni catalogos reales.
- `LandingPage` usa metricas estaticas; podria usar `publicApi.stats`.
- `ResourceListing` ignora query params como `?search=...`; Dashboard navega a `/app/resources?search=...`, pero la pagina lista todo.
- Los filtros/sort de `ResourceListing` son UI estatica; no cambian la consulta.
- `LandingPage` enlaza a `/explore`, pero esa ruta no existe.

Bug probable:

- En `ResourceDetail`, el mapeo de comentarios crea objetos con propiedad `comment`, pero `CommentBlock` espera `content`. Resultado probable: comentarios renderizan vacios. El build no lo detecta porque Vite no hace type-check estricto.

## Storage / MinIO

Backend:

- `StorageService` crea bucket si MinIO esta disponible.
- `POST /storage/uploads` devuelve URL presignada PUT, `storageKey`, `bucket`, `provider`, `publicUrl`.

Frontend:

- `storageApi.createUploadUrl` existe en `frontend/src/app/lib/api.ts`.
- Ninguna pantalla lo usa actualmente.

Trabajo pendiente recomendado:

1. En `UploadResource`, al seleccionar archivo:
   - llamar `storageApi.createUploadUrl({ originalFilename, mimeType })`;
   - hacer `fetch(uploadUrl, { method: "PUT", headers: { "content-type": mimeType }, body: file })`;
   - despues llamar `resourcesApi.create` con metadata real de storage.
2. Ajustar `ResourcesService.create` para aceptar `storageProvider`, `storageBucket`, `storageKey`, `fileUrl`/`publicUrl` generados por `storageApi`, en lugar de crear otra key distinta.
3. Para descarga, decidir si los objetos seran publicos en MinIO o si `POST /resources/:id/download` debe devolver URL firmada GET. Para demo local, URL firmada GET es mas coherente.

## Base de datos / Prisma

Estado:

- `apps/api/prisma/schema.prisma` existe y parece generado desde PostgreSQL.
- `apps/api/prisma.config.ts` apunta al schema y datasource.
- No hay migraciones Prisma formales.
- `backend/database/*.sql` siguen siendo la fuente de arranque del contenedor.

Pendientes:

- Decidir fuente de verdad: SQL manual o Prisma migrations.
- Si se mantiene SQL, documentar flujo de reset/seed y generar Prisma Client despues de cambios.
- Si se migra a Prisma migrations, convertir `schema.sql`, `logic.sql` y `seed.sql` de forma controlada.
- Agregar tests para constraints/triggers importantes.

## Pruebas

Ya existen tests API para:

- health check.
- catalogos.
- login demo + `/auth/me`.
- listado/detalle/descarga de recursos.
- creacion de recursos.

Faltan tests para:

- Firebase auth real o mockeada.
- `GET/PATCH /users/me`.
- `/users/me/stats`, `/users/me/resources`, `/users/me/saved`.
- ratings.
- save/unsave.
- comentarios.
- storage presigned URL.
- errores de dominio auth si se activa `VAULTIO_AUTH_ALLOWED_DOMAIN`.
- frontend components o e2e.

Frontend:

- No hay typecheck real. Agregar `frontend/tsconfig.json` y script `typecheck`.
- Agregar Playwright solo cuando login/storage esten estables.

## Orden recomendado para terminar

1. Crear `frontend/.env.example` sin secretos y actualizar README/docs.
2. Arreglar bugs visibles:
   - `ResourceDetail` -> `CommentBlock` debe recibir `content`.
   - `LandingPage` no debe apuntar a `/explore` inexistente.
   - `ResourceListing` debe leer `search` de URL.
3. Completar flujo de upload real con MinIO:
   - presigned PUT;
   - subir archivo;
   - guardar metadata correcta;
   - descargar con endpoint backend.
4. Conectar pantallas mock:
   - `SavedResources` con `usersApi.saved`.
   - `UserProfile` con `useAuth`, `usersApi.stats`, `usersApi.uploads`.
   - `EditProfile` con `usersApi.updateMe` y carreras reales.
5. Completar interacciones de recurso:
   - crear comentario;
   - calificar;
   - guardar desde detalle;
   - registrar descargas reales.
6. Decidir destino de auth demo:
   - remover endpoints demo del frontend/API final; o
   - dejar modo demo documentado con `VAULTIO_ALLOW_DEMO_TOKENS=true`.
7. Agregar typecheck frontend y tests API faltantes.
8. Formalizar migraciones/seed.
9. Limpiar documentacion antigua que contradice el estado actual.

## Comandos utiles para el siguiente agente

```txt
docker compose up -d
npm install
npm run prisma:generate --workspace apps/api
npm run dev:api
npm run dev:web
npm test
npm run build
```

Para verificar Firebase provider Google por REST sin imprimir secretos:

```txt
node -e "const {GoogleAuth}=require('google-auth-library'); const svc=require('./vaultio-auth-firebase-adminsdk-fbsvc-04da3d9bea.json'); async function main(){ const auth=new GoogleAuth({credentials: svc, scopes:['https://www.googleapis.com/auth/cloud-platform']}); const client=await auth.getClient(); const projectId=svc.project_id; const res=await client.request({url:'https://identitytoolkit.googleapis.com/v2/projects/'+projectId+'/defaultSupportedIdpConfigs/google.com'}); console.log({enabled:res.data.enabled, clientId:res.data.clientId?'present':'missing'}); } main().catch(e=>{ console.error(e.response?.data?.error?.message || e.message); process.exit(1); });"
```

## Archivos clave

- `CONTEXT.md`: contexto de producto.
- `README.md`: instrucciones actuales, pero necesita actualizacion despues del cierre de auth/upload.
- `docs/pendientes.md`: lista anterior de pendientes; ya esta parcialmente desactualizada.
- `docs/plan-tecnico.md`: plan tecnico base.
- `docker-compose.yml`: Postgres + MinIO.
- `backend/database/schema.sql`, `logic.sql`, `seed.sql`: SQL base.
- `apps/api/src/app.module.ts`: modulos/controladores actuales.
- `apps/api/src/auth.service.ts`: verificacion Firebase y sync de usuario.
- `apps/api/src/storage.service.ts`: presigned upload MinIO.
- `apps/api/src/resources.service.ts`: recursos, ratings, comentarios, saved, downloads.
- `apps/api/src/users.service.ts`: perfil, stats, uploads, saved.
- `frontend/src/app/lib/auth-context.tsx`: sesion Firebase + perfil Vaultio.
- `frontend/src/app/lib/api.ts`: cliente API.
- `frontend/src/app/routes.tsx`: rutas reales del frontend.
- `frontend/src/app/pages/resources/UploadResource.tsx`: principal punto pendiente para storage real.
- `frontend/src/app/pages/resources/ResourceDetail.tsx`: principal punto pendiente para comentarios/rating/download/save.
