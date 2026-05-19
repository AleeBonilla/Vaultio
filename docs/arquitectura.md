# Arquitectura

## Topología

```
┌──────────────────┐         ┌─────────────────────────────┐
│  Navegador       │         │   apps/api (NestJS:4000)    │
│  apps/web        │  HTTP   │                             │
│  (Vite SPA)      ├────────►│  AuthService                │
│                  │         │   ├─ verifyIdToken          │
│  Firebase Web    │         │   └─ sync users/identities  │
│  SDK (Auth)      │         │                             │
└────────┬─────────┘         │  ResourcesService           │
         │ ID token          │  UsersService               │
         ▼                   │  CatalogService             │
┌──────────────────┐         │  StorageService             │
│  Firebase Auth   │◄────────┤   ├─ presigned PUT          │
│  (Google + Pwd)  │         │   └─ presigned GET          │
└──────────────────┘         │                             │
                             │  Prisma + adapter-pg        │
                             └────────┬────────────────────┘
                                      │
                          ┌───────────┴──────────┐
                          ▼                      ▼
                  ┌──────────────┐       ┌──────────────┐
                  │  Postgres 16 │       │   MinIO      │
                  │  (negocio)   │       │   (objetos)  │
                  └──────────────┘       └──────────────┘
```

- **Frontend (apps/web)**: SPA Vite + React. Maneja sesión con Firebase y consume el API.
- **API (apps/api)**: NestJS modular. Verifica tokens, lee/escribe en Postgres y firma URLs contra MinIO.
- **Firebase Auth**: emisor de identidad. No guarda metadata del producto.
- **Postgres**: fuente de verdad para todo el dominio.
- **MinIO**: storage S3-compatible para archivos subidos. Intercambiable por S3/GCS sin tocar lógica.

---

## Decisiones clave

### Auth fuera de la DB

Firebase emite y revoca identidades. El backend solo verifica y mantiene una tabla `identities` que relaciona `(provider_name, provider_uid)` con el `users.id` interno.

Ventajas:

- Soporta múltiples proveedores (Google, Email/Password, más a futuro) sin lock-in del schema.
- Recuperación de contraseñas, MFA y políticas las maneja Firebase.

### Storage desacoplado

Cada `resource` guarda `storage_provider`, `storage_bucket`, `storage_key` y `file_url`. El campo `storage_provider` permite distinguir:

- `minio` (o `s3`, `gcs`): archivo real, descarga con URL firmada.
- `external`: enlace a un host externo (Google Drive, GitHub, etc.).

Cambiar el proveedor para producción es solo configurar `VAULTIO_STORAGE_*`.

### Eliminación lógica

Recursos y comentarios usan `is_active = false` en lugar de borrar. Mantiene trazabilidad y permite restaurar.

---

## Flujos

### 1. Login

```
[Web] signInWithEmail/Password o signInWithGoogle
        │
        ▼
[Firebase] devuelve User + ID token
        │
        ▼
[Web auth-context] guarda referencia, dispara GET /auth/me con Bearer token
        │
        ▼
[API auth.service] verifyIdToken con firebase-admin
        │
        ▼
[API] busca identity por (provider="firebase", provider_uid=uid)
        │   o por email (link automático si el usuario existía con otro provider)
        │   o crea un user nuevo
        ▼
[API] responde { user }
        │
        ▼
[Web] guarda el perfil en AuthContext; RequireAuth redirige según completitud
```

### 2. Upload de archivo

```
[Web Upload UI] usuario selecciona archivo + completa metadata
        │
        ▼
[Web] POST /storage/uploads { originalFilename, mimeType }
        │
        ▼
[API storage] firma PUT URL contra MinIO (10 min)
        │   devuelve { uploadUrl, storageKey, bucket, publicUrl }
        ▼
[Web] PUT directo a uploadUrl con el archivo (no pasa por el API)
        │
        ▼
[Web] POST /resources con metadata + storageProvider/Bucket/Key/publicUrl
        │
        ▼
[API resources] crea registro en Postgres
        │
        ▼
[Web] redirige a /app/resources/:id
```

### 3. Recurso tipo link

```
[Web Upload UI] usuario marca origen = Link, pega URL
        │
        ▼
[Web] POST /resources con { externalUrl, ...metadata }
        │
        ▼
[API resources] valida URL y crea registro con storage_provider = "external"
        │
        ▼
[Web] redirige a /app/resources/:id
```

### 4. Descarga

```
[Web] click "Descargar"
        │
        ▼
[Web] POST /resources/:id/download (con Bearer token)
        │
        ▼
[API resources] registra en user_downloads, incrementa contador
        │
        ▼
[API storage] firma GET URL (5 min) — o devuelve externalUrl si es link
        │
        ▼
[Web] window.open(url) — descarga directa
```

---

## Modelo de datos (resumen)

Lo central. Schema completo en `apps/api/prisma/schema.prisma` y `database/schema.sql`.

```
institutions ─┬─ careers ─┬─ course_careers ─── courses ─┬─ resources ─┬─ ratings
              │           │                              │             ├─ comments ─── comment_votes
              └─ academic_periods                        ├─ professor_courses ── professors
                                                         └─ user_downloads
users ─┬─ identities (provider, uid, email)
       ├─ user_careers
       ├─ user_courses
       ├─ user_roles ─── roles ─── role_permissions ─── permissions
       ├─ saved_resources
       ├─ ratings
       ├─ comments
       ├─ comment_votes
       ├─ user_downloads
       └─ reports
```

---

## Capas del API

```
apps/api/src/
├── main.ts                    # bootstrap
├── app.module.ts              # composición
├── config.ts                  # lectura de env
├── common/
│   ├── errors.ts              # helpers badRequest/notFound/unauthorized
│   ├── http-exception.filter.ts  # serializa { error: { message, details } }
│   └── serializers.ts         # snake_case → camelCase y reglas de visibilidad
├── prisma/
│   └── prisma.service.ts      # PrismaClient con lifecycle Nest
├── firebase/
│   └── firebase-admin.service.ts  # verifyIdToken
├── auth/                      # autenticación
├── catalog/                   # lecturas de catálogos
├── resources/                 # CRUD, ratings, save, comments, download
├── users/                     # perfil propio y público
├── storage/                   # MinIO presigned URLs
├── stats/                     # /stats públicos
├── health/                    # /health
└── seed/                      # bootstrap de catálogos + demo users
```

Cada módulo es **autocontenido**: la única dependencia transversal es `prisma`, `firebase`, `auth` y `common`.

---

## Capas del frontend

```
apps/web/src/app/
├── App.tsx              # AuthProvider + Router + Toaster
├── routes.tsx           # rutas y RequireAuth
├── lib/
│   ├── firebase.ts      # Firebase Web SDK
│   ├── auth-context.tsx # sesión + perfil
│   ├── RequireAuth.tsx  # guard
│   └── api.ts           # cliente HTTP tipado
├── components/          # layout, comments, filters, resources, ui
└── pages/               # auth, courses, home, library, profile, resources
```

`api.ts` inyecta automáticamente el ID token de Firebase en cada request usando un `tokenProvider` que el `AuthProvider` setea al inicializarse.

---

## Pendientes técnicos

Listados en detalle en [MEJORAS.md](../MEJORAS.md). Principales:

- Migraciones formales con Prisma Migrate.
- DTOs con validación (Zod o class-validator).
- Paginación DB-side.
- Moderación real de reportes.
- Observabilidad (logs estructurados, métricas).
- CI/CD.
