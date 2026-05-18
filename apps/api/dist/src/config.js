"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
function findRepoRoot(start) {
    let current = start;
    while (current !== node_path_1.default.dirname(current)) {
        if (node_fs_1.default.existsSync(node_path_1.default.join(current, "docker-compose.yml")) &&
            node_fs_1.default.existsSync(node_path_1.default.join(current, "package.json"))) {
            return current;
        }
        current = node_path_1.default.dirname(current);
    }
    return process.cwd();
}
const repoRoot = findRepoRoot(__dirname);
exports.config = {
    port: Number(process.env.VAULTIO_API_PORT || 4000),
    publicUrl: process.env.VAULTIO_API_PUBLIC_URL || `http://localhost:${process.env.VAULTIO_API_PORT || 4000}`,
    databaseUrl: process.env.DATABASE_URL || "postgresql://vaultio:vaultio@localhost:5432/vaultio?schema=public",
    repoRoot,
    auth: {
        provider: process.env.VAULTIO_AUTH_PROVIDER || "firebase",
        allowedEmailDomain: (process.env.VAULTIO_AUTH_ALLOWED_DOMAIN || "").trim().toLowerCase() || null,
        firebaseServiceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS ||
            node_path_1.default.resolve(repoRoot, "vaultio-auth-firebase-adminsdk-fbsvc-04da3d9bea.json"),
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
