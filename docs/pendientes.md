# Vaultio - Pendientes

## Estado actual

El proyecto ya tiene una primera version funcional para demo local:

- API local en `apps/api`.
- Seed inicial en memoria/persistencia JSON local.
- Frontend conectado a la API en login, registro, carreras, cursos, listado, detalle y subida de recursos.
- Pruebas automatizadas basicas del API.
- Build del frontend validado.

La API actual permite avanzar y presentar flujos reales sin configurar Firebase, Prisma ni credenciales externas. No reemplaza la arquitectura final propuesta.

## Pendientes prioritarios

### 1. Conectar API a PostgreSQL

- Reemplazar la persistencia JSON local por PostgreSQL.
- Definir si se usara Prisma o consultas SQL directas.
- Convertir `backend/database/schema.sql`, `logic.sql` y `seed.sql` en un flujo reproducible de migraciones/seed.
- Mapear los endpoints actuales contra el modelo relacional real.
- Mantener los contratos actuales del frontend para evitar rehacer pantallas.

### 2. Integrar Firebase Auth

- Crear proyecto Firebase.
- Configurar Google OAuth o proveedor elegido.
- Validar ID tokens en el backend.
- Vincular usuarios Firebase con `users` e `identities`.
- Validar dominio institucional `estudiantec.cr`.
- Reemplazar el login demo por autenticacion real.

### 3. Integrar Firebase Storage

- Subir archivos reales desde el frontend.
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

1. Migrar API a PostgreSQL/Prisma.
2. Integrar Firebase Auth.
3. Integrar Firebase Storage.
4. Reforzar pruebas.
5. Agregar moderacion.

## Nota tecnica

La API local actual esta pensada como capa funcional de transicion. Sus endpoints sirven como contrato inicial entre frontend y backend. Al migrar a NestJS/Prisma/Firebase, conviene conservar esos contratos o cambiarlos de forma controlada para no rehacer el frontend.
