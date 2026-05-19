# Vaultio

Vaultio es una plataforma web para organizar, buscar y compartir recursos academicos dentro de una comunidad estudiantil. La demo actual esta pensada para el TEC, pero la estructura permite crecer a otras carreras, instituciones y proveedores de storage.

El sistema usa Firebase Auth para autenticacion, Postgres como base logica principal, MinIO como storage S3-compatible para la demo local, y una API NestJS que centraliza reglas de negocio, perfiles, recursos, comentarios, ratings y reportes.

## Stack

| Capa | Tecnologia |
| --- | --- |
| Frontend | Vite, React 18, TypeScript, Tailwind CSS |
| Routing | React Router 7 |
| Auth | Firebase Authentication |
| API | NestJS 11, TypeScript |
| ORM | Prisma 7 con `@prisma/adapter-pg` |
| DB | PostgreSQL 16 |
| Storage demo | MinIO S3-compatible |
| UI | lucide-react, sonner |

## Estructura

```text
.
|-- apps/
|   |-- api/                   # API NestJS
|   |   |-- prisma/            # Prisma schema
|   |   |-- src/               # modulos auth, catalog, resources, users, storage
|   |   `-- test/              # tests de API
|   `-- web/                   # App React/Vite
|       |-- public/            # assets publicos
|       `-- src/app/           # componentes, paginas, rutas y clientes API
|-- database/                  # SQL inicial para Postgres local
|-- docs/                      # documentacion tecnica auxiliar
|-- docker-compose.yml         # Postgres + MinIO
|-- CONTEXT.md                 # contexto funcional del proyecto
`-- README.md
```

## Requisitos

- Node.js 20+
- npm 10+
- Docker y Docker Compose
- Proyecto Firebase con Authentication habilitado

## Configuracion local

1. Instalar dependencias:

```bash
npm install
```

2. Levantar Postgres y MinIO:

```bash
docker compose up -d
```

Servicios locales:

- Postgres: `localhost:5432`, DB `vaultio`, usuario `vaultio`, password `vaultio`.
- MinIO API: `localhost:9000`.
- MinIO consola: `localhost:9001`, usuario `vaultio`, password `vaultio-demo-secret`.

3. Configurar Firebase web:

Copiar `apps/web/.env.example` a `apps/web/.env.local` y completar:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:4000
```

En Firebase Console habilitar los proveedores necesarios en Authentication. Para esta demo se espera Google y, si se quiere login con correo/contrasena, Email/Password.

4. Configurar Firebase Admin para el API:

Guardar el service account JSON en la raiz con un nombre tipo:

```text
vaultio-auth-firebase-adminsdk-xxxxx.json
```

Tambien se puede usar `GOOGLE_APPLICATION_CREDENTIALS` apuntando al archivo. El patron del service account esta en `.gitignore`; no debe commitearse.

5. Generar Prisma Client:

```bash
npm run prisma:generate
```

6. Arrancar desarrollo:

```bash
npm run dev:api
npm run dev:web
```

URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:4000`

## Comandos

```bash
npm run build          # build API + web
npm run build:api      # compila NestJS
npm run build:web      # typecheck + build Vite
npm run typecheck:web  # typecheck frontend
npm run test:api       # tests de API
npm run prisma:generate
```

## Funcionalidades actuales

- Login con Firebase Auth.
- Perfil propio con foto, bio, carreras y cursos actuales.
- Perfil publico de otros usuarios.
- Reporte de usuarios.
- Subida de archivos a MinIO mediante URL firmada.
- Creacion de recursos tipo link externo.
- Busqueda y filtros por carrera, curso, profesor, semestre, tipo, origen y rating minimo.
- Iconos por tipo de archivo, incluyendo imagenes.
- Rating 1 a 5 con posibilidad de quitar la calificacion clicando la misma estrella.
- Comentarios, respuestas, likes/dislikes y eliminacion logica como `[comentario eliminado]`.
- Recursos guardados.
- Edicion y eliminacion logica de recursos propios desde el perfil.
- Actividad reciente en perfil.

## Documentacion

- [Arquitectura](docs/arquitectura.md)
- [Desarrollo local](docs/desarrollo-local.md)
- [Reporte de limpieza y mejoras](docs/reporte-limpieza-y-mejoras.md)
- [Plan tecnico](docs/plan-tecnico.md)

## Notas de seguridad

- Firebase Auth emite el ID token; el API lo verifica con Firebase Admin.
- Postgres es la fuente de verdad para usuarios, recursos, metadata, comentarios, ratings, guardados y reportes.
- MinIO solo almacena objetos de la demo local.
- No commitear `.env`, `.env.local`, service accounts ni credenciales.
- Para produccion se requiere HTTPS, rotacion de secretos, migraciones formales y politicas de moderacion/reportes.