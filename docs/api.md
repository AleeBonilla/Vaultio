# API HTTP — referencia

Todos los endpoints son **JSON**. Los que requieren autenticación esperan `Authorization: Bearer <firebaseIdToken>` (excepto en tests, donde se permite token demo con `VAULTIO_ALLOW_DEMO_TOKENS=true`).

Base URL por defecto: `http://localhost:4000`.

---

## Convenciones

- Respuestas exitosas: objetos planos (`{ user }`, `{ item }`, `{ items }`) o arrays directos.
- Respuestas de error:

  ```json
  { "error": { "message": "Texto legible", "details": null } }
  ```

- `404 Not Found`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict` se usan según corresponde.
- `id` de usuarios y recursos: UUID. Catálogos (carreras, cursos, profesores, tipos, períodos): enteros.

---

## Health

### `GET /health`

```json
{ "status": "ok", "service": "vaultio-api" }
```

### `GET /stats`

Conteos públicos para landing.

```json
{ "users": 3, "resources": 2, "courses": 7, "careers": 5 }
```

---

## Auth

### `GET /auth/me`

Verifica el ID token Firebase, sincroniza el usuario local y devuelve el perfil.

```json
{ "user": { "id": "uuid", "email": "...", "firstName": "...", ... } }
```

### Endpoints demo (solo `VAULTIO_ALLOW_DEMO_TOKENS=true`)

- `POST /auth/register` — registra usuario demo password.
- `POST /auth/login` — login demo password (devuelve token base64 propio).

Estos endpoints son **solo** para la suite de tests integral. En producción/dev devuelven 404.

---

## Catálogos

Lectura pública.

- `GET /catalog/institutions`
- `GET /catalog/careers`
- `GET /catalog/careers/:careerId/courses`
- `GET /catalog/courses`
- `GET /catalog/resource-types`
- `GET /catalog/academic-periods`
- `GET /catalog/professors?courseId=:id` (opcional)

Cada uno devuelve `{ items: [...] }`.

---

## Usuario autenticado (`/users/me`)

### `GET /users/me`

Equivalente a `GET /auth/me`.

### `PATCH /users/me`

Body:

```json
{
  "firstName": "Maria",
  "lastName": "Gonzalez",
  "bio": "Texto opcional",
  "username": "mgonzalez",
  "careerIds": [1, 5]
}
```

Todos los campos son opcionales. Devuelve `{ user }` actualizado.

### `GET /users/me/stats`

```json
{
  "uploads": 3,
  "saved": 5,
  "ratingsGiven": 7,
  "ratingsReceived": 12,
  "avgRatingReceived": 4.3,
  "totalDownloads": 89,
  "totalViews": 412
}
```

### `GET /users/me/resources`

Recursos subidos por el usuario actual (incluyendo borrados lógicos si aplica).

### `GET /users/me/saved`

Recursos guardados por el usuario actual.

### `GET /users/me/activity`

Línea de tiempo: ratings dados, comentarios hechos, recursos subidos, guardados.

### `GET /users/me/courses` / `PATCH /users/me/courses`

Cursos actuales del usuario (los que está cursando este semestre).

Body de PATCH: `{ "courseIds": [1, 3, 6] }`.

---

## Perfil público (`/users/:id`)

### `GET /users/:id`

Perfil público de cualquier usuario.

### `GET /users/:id/resources`

Recursos subidos por ese usuario.

### `POST /users/:id/report`

Reporta a un usuario. Body:

```json
{ "reason": "Spam", "details": "Texto opcional" }
```

Devuelve `{ reportId, status: "pending" }`.

---

## Recursos (`/resources`)

### `GET /resources`

Lectura pública con filtros opcionales por query string:

- `search` — busca en título, descripción y tags.
- `careerId` — filtra por carrera.
- `courseId` — filtra por curso.
- `typeId` — filtra por tipo de recurso.
- `professorId` — filtra por profesor.
- `periodId` — filtra por período académico.
- `provider` — `minio` o `external`.
- `minRating` — `1..5`.

Devuelve `{ items: ResourceSummary[] }`.

### `GET /resources/:id`

Detalle. Si el header `Authorization` viene, la respuesta incluye `saved: boolean` y `userRating: number | null` para el usuario actual.

### `POST /resources`

Crea recurso. Body para archivo:

```json
{
  "title": "Examen final 2025",
  "description": "Resuelto",
  "courseId": 6,
  "resourceTypeId": 3,
  "academicPeriodId": 3,
  "professorId": 1,
  "tags": ["final", "diseno"],
  "storageProvider": "minio",
  "storageBucket": "vaultio-demo",
  "storageKey": "resources/<userId>/<resourceId>/<filename>",
  "originalFilename": "examen.pdf",
  "mimeType": "application/pdf",
  "fileSize": 123456
}
```

Body para enlace externo:

```json
{
  "title": "Repositorio de apoyo",
  "description": "Material complementario",
  "courseId": 6,
  "resourceTypeId": 1,
  "tags": ["link", "repo"],
  "externalUrl": "https://github.com/..."
}
```

### `PATCH /resources/:id`

Edita un recurso (solo el dueño). Acepta los mismos campos que `POST`.

### `DELETE /resources/:id`

Baja lógica (`is_active = false`). Solo el dueño.

### `POST /resources/:id/download`

Registra descarga. Devuelve `{ url, downloads }`:

- `url` — URL firmada GET hacia MinIO (5 min), o la `externalUrl` si es link.
- `downloads` — contador actualizado.

### `POST /resources/:id/ratings`

Body: `{ "stars": 1..5 }`. Upsert. Devuelve `{ item, rating, ratingsCount }`.

Para **quitar** la calificación: enviar `{ "stars": 0 }` o llamar al endpoint con el mismo valor previo (el frontend interpreta el clic como toggle).

### `POST /resources/:id/save` / `DELETE /resources/:id/save`

Guardar / desmarcar. Devuelve `{ saved: boolean }`.

---

## Comentarios

### `GET /resources/:id/comments`

Lista de comentarios anidados.

### `POST /resources/:id/comments`

Body:

```json
{ "content": "Texto", "parentId": "uuid o null" }
```

### `POST /resources/:id/comments/:commentId/vote`

Body: `{ "value": 1 | -1 }`.

### `DELETE /resources/:id/comments/:commentId/vote`

Retira el voto del usuario.

### `DELETE /resources/:id/comments/:commentId`

Borrado lógico. El contenido aparece como `[comentario eliminado]` en GET.

---

## Storage

### `POST /storage/uploads`

Requiere autenticación. Body:

```json
{
  "originalFilename": "examen.pdf",
  "mimeType": "application/pdf",
  "resourceId": "uuid opcional"
}
```

Devuelve:

```json
{
  "provider": "minio",
  "bucket": "vaultio-demo",
  "storageKey": "resources/<userId>/<resourceId>/<safe-name>",
  "uploadUrl": "https://...",
  "expiresIn": 600,
  "publicUrl": "http://localhost:9000/vaultio-demo/..."
}
```

El frontend hace `PUT` directo a `uploadUrl` con el archivo y luego llama a `POST /resources` con la metadata.

---

## Errores comunes

| Código | Significado                                                   |
| ------ | ------------------------------------------------------------- |
| 400    | Body inválido o falta de campos requeridos.                   |
| 401    | Token ausente o inválido. Refrescar sesión.                   |
| 403    | El usuario no es dueño del recurso/comentario.                |
| 404    | El recurso no existe o fue dado de baja lógicamente.          |
| 409    | Constraint único (ej. username repetido).                     |
| 500    | Error no manejado del servidor. Revisar logs.                 |
