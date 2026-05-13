# Vaultio

Repositorio academico estructurado para estudiantes del TEC.

## Objetivo actual

El proyecto se desarrollara primero para funcionar de forma local, ya que sera presentado en el curso. La prioridad es tener un flujo de demo estable y reproducible antes de pensar en despliegue cloud.

## Stack recomendado

- Frontend local inicial: Vite, React, TypeScript, Tailwind CSS, shadcn/ui.
- Frontend objetivo si se decide escalar: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui.
- Backend: NestJS, TypeScript, Prisma.
- Base de datos: PostgreSQL local con Docker.
- Archivos: carpeta local `uploads/` servida por el backend.
- Gestion de paquetes local: npm por ahora; pnpm workspaces puede incorporarse cuando se agregue el backend.
- Contenedores: Docker y Docker Compose para levantar servicios locales.

## Ejecucion local esperada

```txt
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

El objetivo es que una persona del equipo pueda clonar el repo, levantar PostgreSQL con Docker, cargar datos iniciales y ejecutar frontend/backend localmente.

## Documentacion

- [Plan tecnico inicial](docs/plan-tecnico.md)
- [Revision inicial de Figma](docs/figma-review.md)

## Estructura objetivo

```txt
frontend/
  src/
    app/
    styles/
apps/
  api/
    uploads/
packages/
  db/
  shared/
backend/
  database/
docs/
```
