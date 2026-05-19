# Arquitectura

## Resumen

Vaultio esta organizado como monorepo npm con dos aplicaciones principales:

- `apps/api`: API NestJS. Expone auth, catalogos, usuarios, recursos, comentarios, ratings, storage y estadisticas.
- `apps/web`: app React/Vite. Consume el API y delega autenticacion a Firebase Auth.

La base logica del producto es Postgres. Firebase no almacena metadata de negocio; solo autentica usuarios. MinIO almacena archivos para la demo local mediante una interfaz S3-compatible.

## Flujo de autenticacion

1. El usuario inicia sesion en el frontend con Firebase Auth.
2. Firebase entrega un ID token.
3. El frontend envia `Authorization: Bearer <token>` al API.
4. El API valida el token con Firebase Admin.
5. El API crea o sincroniza el usuario local en Postgres cuando corresponde.

## Flujo de subida de archivo

1. El usuario selecciona un archivo.
2. El frontend solicita `POST /storage/uploads`.
3. El API genera una URL firmada contra MinIO.
4. El frontend sube el archivo directo a MinIO con `PUT`.
5. El frontend crea el recurso con `POST /resources` y metadata del objeto.
6. Postgres conserva la relacion entre usuario, curso, tipo, profesor, periodo y storage key.

## Flujo de recurso tipo link

1. El usuario elige origen `Link`.
2. El frontend valida URL y envia `externalUrl`.
3. El API registra el recurso con `storage_provider = external`.
4. Al abrir/descargar, el API devuelve la URL externa y contabiliza la accion.

## Dominios principales

- Catalogo: instituciones, carreras, cursos, tipos, profesores, periodos.
- Usuarios: perfil, foto, carreras, cursos actuales, actividad, reportes.
- Recursos: metadata, archivo/link, ratings, comentarios, guardados, descargas.
- Storage: URLs firmadas y proxy publico para objetos que se deben mostrar en UI.

## Decisiones vigentes

- Firebase Auth se mantiene para demo y reduce complejidad de login.
- Postgres es la fuente de verdad de negocio.
- MinIO se usa para demo local porque evita acoplar el producto a Firebase Storage.
- La eliminacion de recursos y comentarios es logica para preservar trazabilidad.

## Pendientes tecnicos importantes

- Reemplazar ajustes SQL runtime por migraciones versionadas.
- Formalizar roles de moderacion y flujo de reportes.
- Definir proveedor definitivo de storage para produccion.
- Agregar paginacion real a listados grandes.
- Agregar auditoria para acciones sensibles.
