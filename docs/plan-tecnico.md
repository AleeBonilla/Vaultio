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
- **JWT + Google OAuth / correo institucional**: para el MVP se puede autenticar con Google y validar dominio `estudiantec.cr`. A futuro se puede extender con mas proveedores.

### Base de datos y archivos

- **PostgreSQL 16**: ya esta elegido y el esquema aprovecha constraints, indices, triggers y funciones.
- **Docker Compose**: ambiente reproducible para el equipo.
- **Storage S3-compatible**: para archivos de recursos. En desarrollo puede usarse almacenamiento local o MinIO; en produccion, Supabase Storage, Cloudflare R2, AWS S3 o equivalente.

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

- **AuthModule**: login, perfil de sesion, vinculacion con `identities`, validacion de dominio institucional.
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

## Ajustes sugeridos a la base de datos

- Agregar indice full-text sobre `resources.title`, `resources.description` y `tags`.
- Separar `views_count` de descargas; actualmente el trigger incrementa vistas cuando se registra una descarga.
- Revisar `uq_careers_plan_per_institution`: si una institucion tiene varias carreras con el mismo plan anual, esta restriccion puede bloquear datos validos. Probablemente deberia ser `UNIQUE (institution_id, code, study_plan)`.
- Agregar `mime_type`, `storage_key` y `checksum` a `resources` para gestionar archivos de forma mas segura que solo `file_url`.
- Definir si `users` representa usuario de aplicacion y `identities` representa login externo. Esa separacion esta bien, pero debe quedar clara en el backend.

## Criterio de arquitectura

Para el curso, esta arquitectura permite mostrar separacion de responsabilidades, patrones claros y una base escalable. Para avanzar rapido, no conviene microservicios ni una arquitectura distribuida. Un monolito modular con frontend y backend separados es suficiente y defendible.
