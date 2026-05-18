# Vaultio - Pendientes

## Estado actual

El proyecto ya tiene una primera version funcional para demo local:

- API NestJS en `apps/api`.
- Prisma Client generado desde el esquema PostgreSQL existente.
- Seed inicial idempotente contra PostgreSQL para datos de demo.
- Frontend conectado a la API en login, registro, carreras, cursos, listado, detalle y subida de recursos.
- Pruebas automatizadas basicas del API.
- Build del frontend validado.

La API actual permite avanzar y presentar flujos reales sin credenciales externas. Todavia usa autenticacion demo temporal, pero ya corre sobre PostgreSQL/Prisma y tiene base S3-compatible para MinIO local.

## Pendientes prioritarios

### 1. Consolidar PostgreSQL/Prisma

- Convertir `backend/database/schema.sql`, `logic.sql` y `seed.sql` en migraciones Prisma o en un flujo SQL versionado mas formal.
- Decidir si Prisma sera la fuente declarativa principal del esquema o si los SQL manuales seguiran siendo la fuente primaria.
- Completar los endpoints restantes contra el modelo relacional real.
- Revisar indices/triggers cargados en volumenes existentes; si el volumen ya existia, Docker no vuelve a ejecutar automaticamente los scripts de init.
- Mantener los contratos actuales del frontend para evitar rehacer pantallas.

### 2. Integrar Firebase Auth

- Configurar Google OAuth o proveedor elegido en el proyecto Firebase.
- Configurar variables `VITE_FIREBASE_*` en el frontend local.
- Validar flujo real desde UI con ID tokens de Firebase.
- Revisar si se mantiene restriccion estricta del dominio `estudiantec.cr` en demo.
- Reemplazar el login demo por autenticacion real.
- El backend no debe manejar passwords reales; solo debe verificar tokens de Firebase y sincronizar usuario local.

### 3. Integrar MinIO / storage S3-compatible

- Levantar MinIO local con Docker Compose.
- Subir archivos reales desde el frontend usando URL presignada.
- Guardar metadata en PostgreSQL:
  - `storage_provider`
  - `storage_bucket`
  - `storage_key`
  - `original_filename`
  - `mime_type`
  - `checksum_sha256`
  - `file_size`
  - `upload_status`
- Descargar archivos mediante URL firmada o ruta controlada del backend.
- Validar tamano y tipo de archivo.
- Mantener la capa de storage desacoplada para migrar luego a S3, R2, Supabase Storage u otro proveedor.

### 4. Completar interacciones

- Crear comentarios desde el frontend.
- Crear y actualizar ratings.
- Guardar y quitar recursos guardados.
- Registrar descargas reales.
- Crear reportes de recursos/comentarios.
- Implementar votos en comentarios si se mantiene esa funcionalidad.

### 5. Moderacion minima

- Vista para reportes pendientes.
- Cambio de estado de reportes:
  - `pending`
  - `reviewing`
  - `resolved`
  - `dismissed`
- Desactivar recursos o comentarios reportados.
- Proteger rutas de moderacion por rol.

### 6. Proteger rutas del frontend

- Bloquear `/app/upload` si no hay sesion.
- Bloquear perfil y guardados si no hay sesion.
- Redirigir a `/login` cuando corresponda.
- Agregar logout.
- Manejar expiracion de sesion/token.

### 7. Reemplazar mocks restantes

Pantallas que aun requieren datos reales o integracion completa:

- Dashboard.
- Perfil de usuario.
- Editar perfil.
- Recursos guardados.
- Estadisticas visibles.
- Actividad reciente.

### 8. Accesibilidad y limpieza visual

- Corregir textos con encoding roto heredados del export.
- Revisar labels asociados a inputs/selects.
- Agregar `aria-label` a botones icon-only faltantes.
- Revisar foco visible.
- Evitar interacciones anidadas en tarjetas.
- Agregar pagina 404.
- Mejorar estados de carga, error y vacio en todas las pantallas.

### 9. Pruebas

Ya existen pruebas basicas para:

- Health check.
- Catalogos.
- Login.
- Detalle/listado de recursos.
- Descarga.
- Creacion de recursos.

Faltan pruebas para:

- Registro con casos invalidos.
- Comentarios.
- Ratings.
- Guardados.
- Reportes.
- Permisos por rol.
- Integracion con PostgreSQL.
- Componentes frontend.
- Flujos end-to-end con Playwright.

## Recomendacion de orden

Para una entrega academica rapida:

1. Completar flujos visibles sobre la API actual.
2. Proteger rutas y mejorar errores.
3. Agregar comentarios, ratings y guardados.
4. Pulir accesibilidad/textos.
5. Preparar demo con datos estables.

Para acercarse a la arquitectura final:

1. Formalizar migraciones/seed de PostgreSQL/Prisma.
2. Integrar Firebase Auth.
3. Completar flujo de upload con MinIO.
4. Reforzar pruebas.
5. Agregar moderacion.

## Nota tecnica

La API NestJS actual esta pensada como capa funcional de transicion hacia Firebase Auth y storage S3-compatible. Sus endpoints sirven como contrato inicial entre frontend y backend. Al integrar Firebase Auth y MinIO, conviene conservar esos contratos o cambiarlos de forma controlada para no rehacer el frontend.
