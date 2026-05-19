# Reporte de limpieza y mejoras

## Archivos o carpetas candidatos a eliminar

- `apps/api/dist/`: salida generada por `npm run build:api`. No deberia versionarse.
- `apps/web/dist/`: salida generada por Vite. No deberia usarse como fuente de assets.
- `frontend/dist/`: build viejo de una app anterior. Parece obsoleto frente a `apps/web`.
- `apps/web/tsconfig.tsbuildinfo`: cache local de TypeScript.
- `apps/api/data/db.json`: dato local/demo heredado; la fuente actual es Postgres.
- `apps/web/public/vaultio_platform_preview.png` y `apps/web/public/vaultio_platform_preview_light.png`: previews anteriores. Si la nueva `vaultio_app_preview.png` se valida, pueden eliminarse.

`.gitignore` ya fue ajustado para evitar que nuevos artefactos de build y cache entren al repo.

## Riesgos encontrados

- `database/seed.sql` tiene texto con problemas de encoding. Conviene normalizarlo a UTF-8 antes de seguir ampliando seeds.
- El soporte a `storage_provider = external` se corrige en `database/schema.sql`, pero tambien hay un ajuste runtime en el API para bases locales ya levantadas. Debe convertirse en migracion formal.
- Hay duplicacion de logica de filtros entre biblioteca general y recursos de curso.
- Los listados aun no tienen paginacion desde DB; con muchos recursos el API cargara demasiado en memoria.
- Algunos labels del frontend tienen mojibake por encoding historico. No rompe compilacion, pero afecta calidad visual.

## Mejoras de estructura del repo

- Crear `database/migrations/` o adoptar Prisma Migrate para cambios versionados.
- Mover documentacion tecnica estable a `docs/` y dejar `CONTEXT.md` como contexto de producto.
- Mantener solo assets fuente en `apps/web/public/`; nunca usar `dist/` como lugar de trabajo.
- Separar DTOs/validadores del API para evitar depender de `any` en controllers/services.
- Centralizar tipos compartidos o generar cliente OpenAPI para reducir drift entre API y web.

## Mejoras del sistema

- Agregar paginacion, ordenamiento DB-side y busqueda full-text en Postgres.
- Agregar moderacion real de reportes: estados, asignacion, resolucion, auditoria.
- Agregar antivirus/validacion MIME para archivos subidos.
- Agregar cuotas por usuario y limites de tipo/tamano por rol.
- Agregar thumbnails o previews para imagenes/PDFs.
- Agregar observabilidad minima: logs estructurados, request id, metricas de errores.
- Agregar pruebas end-to-end de flujos criticos con navegador.
- Definir estrategia de storage productiva: S3, GCS, MinIO gestionado u otro compatible.
