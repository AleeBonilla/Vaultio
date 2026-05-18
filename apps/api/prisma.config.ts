import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://vaultio:vaultio@localhost:5432/vaultio?schema=public",
  },
});
