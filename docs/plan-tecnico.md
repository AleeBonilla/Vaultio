# Vaultio - Plan tecnico inicial

## Lectura del proyecto

Vaultio es una plataforma web para centralizar recursos academicos del TEC. Los documentos del proyecto describen una necesidad clara: reemplazar el intercambio informal por WhatsApp, Telegram, Discord y Google Drive con una estructura navegable por institucion, carrera, curso, periodo, profesor y tipo de recurso.

La base de datos existente ya modela mas que un CRUD basico. Incluye instituciones, carreras, cursos, profesores, usuarios, identidades, roles, permisos, recursos, comentarios, ratings, guardados, descargas, votos, reportes y auditoria. Esto permite construir un MVP serio sin redisenar el dominio.

## Recomendacion de stack

### Frontend

- **Next.js + React + TypeScript**: rapido para construir pantallas desde Figma, soporta routing, formularios, SSR/SEO y despliegue sencillo.
- **Tailwind CSS + shadcn/ui**: acelera UI consistente sin inventar un design system desde cero.
- **TanStack Query**: manejo ordenado de llamadas al API, cache, estados de carga y revalidacion.
- **React Hook Form + Zod**: formularios rapidos con validacion compartible entre frontend y backend.

### Backend

- **NestJS + TypeScript**: mas estructurado que Express para un proyecto academico que puede crecer. Facilita modulos, controladores, servicios, guards, pipes y pruebas.
- **Prisma**: acelera CRUD y tipado contra PostgreSQL. Puede partir de la BD actual usando introspeccion.
- **Firebase Auth + OAuth**: para el MVP se delega el login real a Firebase Auth. El backend solo verifica ID tokens con Firebase Admin, valida dominio `estudiantec.cr` y sincroniza `users`/`identities`.

### Base de datos y archivos

- **PostgreSQL 16**: ya esta elegido y el esquema aprovecha constraints, indices, triggers y funciones.
- **Docker Compose**: ambiente reproducible para el equipo.
- **MinIO local / S3-compatible storage**: para la demo local se usa MinIO en Docker. PostgreSQL sigue siendo la base logica principal y guarda la metadata; el proveedor definitivo de storage queda desacoplado mediante `storage_provider`, `storage_bucket` y `storage_key`.

### Herramientas

- **pnpm workspaces**: monorepo ligero.
- **ESLint + Prettier**: formato y calidad basica.
- **Vitest/Jest**: pruebas unitarias en servicios criticos.
- **Playwright**: pruebas end-to-end para flujos principales cuando el MVP este estable.

## Estructura recomendada del repo

```txt
Vaultio/
  apps/
    web/                    # Next.js, UI y rutas
    api/                    # NestJS, REST API, auth, reglas de negocio
  packages/
    db/                     # Prisma schema, migrations, seed
    shared/                 # DTOs, tipos compartidos y schemas Zod
  backend/
    database/               # SQL actual como referencia/base inicial
  docs/
    plan-tecnico.md
  docker-compose.yml
  package.json
  pnpm-workspace.yaml
```

## Modulos del backend

- **AuthModule**: verificacion de Firebase ID tokens, perfil de sesion, vinculacion con `identities`, validacion de dominio institucional.
- **UsersModule**: perfil, carrera del usuario, reputacion.
- **CatalogModule**: instituciones, carreras, cursos, profesores, periodos, tipos de recurso.
- **ResourcesModule**: crear, listar, buscar, actualizar, soft-delete y descargar recursos.
- **CommentsModule**: comentarios y respuestas.
- **RatingsModule**: calificaciones y promedio de recursos.
- **SavesModule**: recursos guardados por usuario.
- **ReportsModule**: reportes y moderacion basica.
- **AdminModule**: pantallas/operaciones para catalogos y reportes.

## Pantallas MVP

- **Login / onboarding**: autenticacion y seleccion de carrera.
- **Explorar**: busqueda por texto, carrera, curso y tipo de recurso.
- **Curso**: recursos agrupados por tipo, profesor y periodo.
- **Detalle de recurso**: descripcion, archivo, rating, comentarios, guardar y reportar.
- **Subir recurso**: formulario con curso, tipo, profesor opcional, periodo, tags y archivo.
- **Perfil**: recursos subidos, guardados y actividad.
- **Moderacion simple**: lista de reportes pendientes y acciones basicas.

## MVP recomendado

1. Autenticacion, usuario y carrera.
2. Catalogo navegable de carreras, cursos y tipos de recurso.
3. Listado y busqueda de recursos.
4. Subida de archivo con metadata academica.
5. Detalle de recurso con descarga, rating y comentarios.
6. Guardados del usuario.
7. Reportes y soft-delete para moderacion minima.

## Dejar para fase 2

- Recomendaciones de contenido.
- Integracion con repositorios externos.
- Busqueda full-text avanzada con ranking.
- Sistema de reputacion visible y gamificacion.
- Moderacion compleja con colas, estados y historial detallado.
- Multiinstitucion completa mas alla del modelo de datos.

## Ajustes aplicados a la base de datos

- Se agrego indice full-text sobre `resources.title`, `resources.description` y `tags`.
- Se separo `views_count` de `downloads_count`; las descargas ya no incrementan vistas.
- Se reemplazo la unicidad de carrera por `UNIQUE (institution_id, code, study_plan)`.
- Se agrego metadata de storage a `resources`: `storage_provider`, `storage_bucket`, `storage_key`, `original_filename`, `mime_type`, `checksum_sha256` y `upload_status`. Para la demo, `storage_provider` sera `minio`.
- Se ajusto `identities` para identificar logins externos por `(provider_name, provider_uid)`.
- Se ajusto `reports` para que cada reporte apunte a un unico objetivo: usuario, recurso o comentario.

## Criterio de arquitectura

Para el curso, esta arquitectura permite mostrar separacion de responsabilidades, patrones claros y una base escalable. Para avanzar rapido, no conviene microservicios ni una arquitectura distribuida. Un monolito modular con frontend y backend separados es suficiente y defendible.
