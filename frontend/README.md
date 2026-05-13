# Vaultio Frontend

Frontend local de Vaultio basado en el prototipo de Figma y adaptado para el MVP academico.

## Ejecutar

```bash
npm install
npm run dev
```

## Accesibilidad

Este frontend debe cumplir como minimo:

- Navegacion por teclado.
- Foco visible.
- Labels asociados a campos.
- Botones icon-only con nombre accesible.
- Estados anunciables para errores y acciones importantes.
- Contraste WCAG AA.

## Estructura

```txt
src/app/
  components/
    comments/     # Comentarios y reseñas
    filters/      # Paneles y controles de filtrado
    layout/       # Sidebar, top nav y layout principal
    resources/    # Tarjetas y componentes de recursos
    ui/           # Componentes base compartidos
  pages/
    auth/         # Login y registro
    courses/      # Carreras, cursos y recursos por curso
    home/         # Landing y dashboard
    library/      # Guardados
    profile/      # Perfil y edicion
    resources/    # Listado, detalle y subida de recursos
```
