# Vaultio

Repositorio academico estructurado para estudiantes del TEC.

## Objetivo actual

El proyecto se desarrollara primero para funcionar de forma local, ya que sera presentado en el curso. La prioridad es tener un flujo de demo estable y reproducible antes de pensar en despliegue cloud.

## Stack recomendado

- Frontend local inicial: Vite, React, TypeScript, Tailwind CSS, shadcn/ui.
- Frontend objetivo si se decide escalar: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui.
- Backend: NestJS, TypeScript, Prisma.
- Base de datos: PostgreSQL local con Docker.
- Auth: Firebase Auth con OAuth; el backend valida tokens con Firebase Admin.
- Archivos: Firebase Storage para la primera etapa; PostgreSQL guarda la metadata logica del recurso.
- Gestion de paquetes local: npm por ahora; pnpm workspaces puede incorporarse cuando se agregue el backend.
- Contenedores: Docker y Docker Compose para levantar servicios locales.

## Ejecucion local esperada

```txt
npm install
npm run dev:api
npm run dev:web
```

El API local de demo queda disponible en `http://localhost:4000` y el frontend Vite en el puerto que indique Vite.

Credenciales de demo:

```txt
maria@estudiantec.cr / demo123
carlos@estudiantec.cr / demo123
```

PostgreSQL tambien puede levantarse con Docker para validar los scripts SQL:

```txt
docker compose up -d
```

El objetivo es que una persona del equipo pueda clonar el repo, ejecutar API/frontend localmente y, si necesita validar la base relacional, levantar PostgreSQL con Docker.

## Comandos utiles

```txt
npm run test:api
npm run build:web
```

## Documentacion

- [Plan tecnico inicial](docs/plan-tecnico.md)
- [Revision inicial de Figma](docs/figma-review.md)
- [Pendientes del proyecto](docs/pendientes.md)

## Estructura objetivo

```txt
frontend/
  src/
    app/
      components/
      pages/
    styles/
apps/
  api/
packages/
  db/
  shared/
backend/
  database/
docs/
```
