import path from "node:path";
import fs from "node:fs";

function findRepoRoot(start: string) {
  let current = start;
  while (current !== path.dirname(current)) {
    if (
      fs.existsSync(path.join(current, "docker-compose.yml")) &&
      fs.existsSync(path.join(current, "package.json"))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  return process.cwd();
}

const repoRoot = findRepoRoot(__dirname);

export const config = {
  port: Number(process.env.VAULTIO_API_PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || "postgresql://vaultio:vaultio@localhost:5432/vaultio?schema=public",
  repoRoot,
  auth: {
    provider: process.env.VAULTIO_AUTH_PROVIDER || "firebase",
    allowedEmailDomain: (process.env.VAULTIO_AUTH_ALLOWED_DOMAIN || "").trim().toLowerCase() || null,
    firebaseServiceAccountPath:
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.resolve(repoRoot, "vaultio-auth-firebase-adminsdk-fbsvc-04da3d9bea.json"),
    allowDemoTokens: process.env.VAULTIO_ALLOW_DEMO_TOKENS === "true" || process.env.NODE_ENV === "test",
  },
  storage: {
    provider: process.env.VAULTIO_STORAGE_PROVIDER || "minio",
    bucket: process.env.VAULTIO_STORAGE_BUCKET || "vaultio-demo",
    region: process.env.VAULTIO_STORAGE_REGION || "us-east-1",
    endpoint: process.env.VAULTIO_STORAGE_ENDPOINT || "http://localhost:9000",
    publicEndpoint: process.env.VAULTIO_STORAGE_PUBLIC_ENDPOINT || "http://localhost:9000",
    accessKeyId: process.env.VAULTIO_STORAGE_ACCESS_KEY_ID || "vaultio",
    secretAccessKey: process.env.VAULTIO_STORAGE_SECRET_ACCESS_KEY || "vaultio-demo-secret",
    forcePathStyle: process.env.VAULTIO_STORAGE_FORCE_PATH_STYLE !== "false",
  },
};
