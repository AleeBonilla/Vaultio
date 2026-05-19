# ---- Stage 1: deps -----------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /repo

# Copia los manifests para aprovechar la cache de npm
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/

# Instala todas las deps de los workspaces (devDeps incluidas para build)
RUN npm ci --workspaces --include-workspace-root

# ---- Stage 2: build ----------------------------------------------------------
FROM deps AS build
WORKDIR /repo
COPY apps/api apps/api
RUN npm run prisma:generate --workspace @vaultio/api
RUN npm run build:api

# ---- Stage 3: runtime --------------------------------------------------------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copia package.json para que npm pueda resolver workspaces
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/

# Instala solo runtime deps
RUN npm ci --workspaces --omit=dev && npm cache clean --force

# Copia el código compilado y los artefactos de Prisma
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /repo/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
