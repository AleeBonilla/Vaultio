# Revision inicial de Figma

## Estado

La carpeta `figma/` contiene un prototipo funcional generado como app Vite + React. Tiene rutas, paginas, componentes reutilizables y estilos base. Sirve como referencia visual y como fuente inicial de componentes, pero no debe copiarse completo sin refactor.

## Pantallas detectadas

- Landing
- Login
- Registro
- Dashboard
- Navegacion por carreras/cursos
- Recursos por curso
- Listado general de recursos
- Detalle de recurso
- Subir recurso
- Perfil
- Editar perfil
- Recursos guardados

Estas pantallas cubren bien el MVP local de Vaultio.

## Problemas a corregir antes de integrarlo

- Hay textos con encoding roto o mojibake en palabras como Codigo, Calificacion y Sesion.
- El layout principal usa sidebar fijo de `w-64`, `ml-64` y `h-screen`; falta version responsive real para mobile.
- Muchos botones icon-only no tienen `aria-label`.
- Los inputs del componente `Input` renderizan un `<label>` sin `htmlFor`, por lo que no queda asociado al campo.
- Errores de formulario no usan `aria-invalid`, `aria-describedby` ni regiones anunciables.
- Hay selects sin `id` ni label asociado semanticamente.
- El upload por drag and drop no tiene input de archivo accesible ni alternativa clara por teclado.
- `RatingStars` usa iconos clickeables, pero no botones/radio buttons accesibles para lectores de pantalla.
- Las tarjetas de recurso envuelven toda la tarjeta en un link y adentro tienen un boton de guardar; eso crea interacciones anidadas problematicas.
- Falta enlace de "Saltar al contenido principal".
- No hay landmarks claros en varias paginas aparte del `main` del layout.
- El estado activo de navegacion se comunica visualmente, pero falta `aria-current="page"`.

## Recomendacion de organizacion

Al migrarlo al frontend real, usar la estructura:

```txt
apps/web/
  src/
    app/
      (auth)/
        login/
        register/
      (app)/
        dashboard/
        courses/
        resources/
        upload/
        profile/
        saved/
    components/
      layout/
      resources/
      courses/
      forms/
      ui/
    data/
      mock/
    lib/
      accessibility/
      routes.ts
```

## Criterios de accesibilidad obligatorios

- Navegacion completa por teclado.
- Foco visible en botones, links, inputs, selects, tabs y controles personalizados.
- Labels asociados con `htmlFor`/`id`.
- `aria-label` en botones icon-only.
- `aria-current="page"` para navegacion activa.
- Mensajes de error vinculados con `aria-describedby`.
- `aria-live` para resultados de busqueda, subida exitosa y errores globales.
- Contraste minimo WCAG AA.
- No depender solo del color para estados.
- Rating implementado como radio group o botones con nombre accesible.
- Upload implementado con `<input type="file">` visible para lector de pantalla y operable por teclado.

## Decision

Usar Figma como base visual y de flujos, pero construir el frontend final con componentes accesibles desde el inicio. Conviene migrar pagina por pagina, empezando por layout, login, listado de recursos, detalle y subida.

## Migracion inicial

Se creo `frontend/` a partir del prototipo de `figma/`. La carpeta `figma/` queda como referencia del export original; el trabajo de implementacion debe continuar en `frontend/`.

La primera reorganizacion agrupo paginas por dominio (`auth`, `courses`, `home`, `library`, `profile`, `resources`) y componentes por responsabilidad (`layout`, `resources`, `filters`, `comments`, `ui`).
