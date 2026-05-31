import path from "node:path";
import fs from "node:fs";
import os from "node:os";

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

/**
 * Materializa el contenido JSON de la env var FIREBASE_SERVICE_ACCOUNT_JSON
 * a un archivo temporal para que Firebase Admin SDK pueda leerlo.
 * Retorna la ruta al archivo creado, o null si la env var no existe.
 */
function materializeFirebaseJsonEnvVar(): string | null {
  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return null;
  try {
    // Validar que sea JSON válido antes de escribirlo
    JSON.parse(jsonStr);
    const tmpPath = path.join(os.tmpdir(), "vaultio-firebase-sa.json");
    fs.writeFileSync(tmpPath, jsonStr, { mode: 0o600 });
    return tmpPath;
  } catch {
    console.warn("FIREBASE_SERVICE_ACCOUNT_JSON contiene JSON inválido, se ignorará.");
    return null;
  }
}

function findFirebaseServiceAccount(repoRoot: string) {
  // 1. Path explícito vía GOOGLE_APPLICATION_CREDENTIALS
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  // 2. JSON inline como env var (para cloud providers como Render, Railway, etc.)
  const materializedPath = materializeFirebaseJsonEnvVar();
  if (materializedPath) {
    return materializedPath;
  }
  // 3. Path relativo configurable
  if (process.env.VAULTIO_FIREBASE_SERVICE_ACCOUNT) {
    return path.resolve(repoRoot, process.env.VAULTIO_FIREBASE_SERVICE_ACCOUNT);
  }
  // 4. Fallback local: secrets/vaultio-auth-service-account.json
  const localSecretPath = path.resolve(repoRoot, "secrets/vaultio-auth-service-account.json");
  if (fs.existsSync(localSecretPath)) {
    return localSecretPath;
  }
  // 5. Buscar archivo con patrón firebase-adminsdk en la raíz
  try {
    const match = fs.readdirSync(repoRoot).find((name) => /-firebase-adminsdk-.*\.json$/i.test(name));
    if (match) return path.resolve(repoRoot, match);
  } catch {
    /* repo root not readable */
  }
  return path.resolve(repoRoot, "firebase-service-account.json");
}

const repoRoot = findRepoRoot(__dirname);

function parseOrigins(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const corsOrigins = parseOrigins(
  // Vercel agrega dominios por ambiente, por eso se permite configurar varios orígenes separados por coma.
  process.env.VAULTIO_CORS_ORIGINS || "http://localhost:5173,http://localhost:4173",
);

const storageProvider = process.env.VAULTIO_STORAGE_PROVIDER || "minio";
const storagePublicIncludesBucket =
  process.env.VAULTIO_STORAGE_PUBLIC_INCLUDE_BUCKET === undefined
    ? storageProvider !== "r2"
    : process.env.VAULTIO_STORAGE_PUBLIC_INCLUDE_BUCKET !== "false";
const storageAutoCreateBucket =
  process.env.VAULTIO_STORAGE_AUTO_CREATE_BUCKET === undefined
    ? storageProvider !== "r2"
    : process.env.VAULTIO_STORAGE_AUTO_CREATE_BUCKET === "true";

export const config = {
  port: Number(process.env.PORT || process.env.VAULTIO_API_PORT || 4000),
  publicUrl:
    process.env.VAULTIO_API_PUBLIC_URL ||
    (process.env.RENDER_EXTERNAL_HOSTNAME
      ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
      : `http://localhost:${process.env.PORT || process.env.VAULTIO_API_PORT || 4000}`),
  databaseUrl:
    process.env.DATABASE_URL || "postgresql://vaultio:vaultio@localhost:5432/vaultio?schema=public",
  repoRoot,
  env: process.env.NODE_ENV || "development",
  cors: {
    origins: corsOrigins,
    allowAny: corsOrigins.includes("*"),
  },
  throttle: {
    ttlMs: Number(process.env.VAULTIO_THROTTLE_TTL_MS || 60_000),
    limit: Number(process.env.VAULTIO_THROTTLE_LIMIT || 120),
  },
  auth: {
    provider: process.env.VAULTIO_AUTH_PROVIDER || "firebase",
    allowedEmailDomain: (process.env.VAULTIO_AUTH_ALLOWED_DOMAIN || "").trim().toLowerCase() || null,
    firebaseServiceAccountPath: findFirebaseServiceAccount(repoRoot),
    allowDemoTokens: process.env.VAULTIO_ALLOW_DEMO_TOKENS === "true" || process.env.NODE_ENV === "test",
  },
  storage: {
    provider: storageProvider,
    bucket: process.env.VAULTIO_STORAGE_BUCKET || "vaultio-demo",
    region: process.env.VAULTIO_STORAGE_REGION || (storageProvider === "r2" ? "auto" : "us-east-1"),
    endpoint: process.env.VAULTIO_STORAGE_ENDPOINT || "http://localhost:9000",
    publicEndpoint: process.env.VAULTIO_STORAGE_PUBLIC_ENDPOINT || "http://localhost:9000",
    accessKeyId: process.env.VAULTIO_STORAGE_ACCESS_KEY_ID || "vaultio",
    secretAccessKey: process.env.VAULTIO_STORAGE_SECRET_ACCESS_KEY || "vaultio-demo-secret",
    forcePathStyle: process.env.VAULTIO_STORAGE_FORCE_PATH_STYLE !== "false",
    publicIncludeBucket: storagePublicIncludesBucket,
    autoCreateBucket: storageAutoCreateBucket,
  },
};
