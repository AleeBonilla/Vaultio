import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..", "..");

export const config = {
  port: Number(process.env.VAULTIO_API_PORT || 4000),
  repoRoot,
  dataFile: path.resolve(repoRoot, process.env.VAULTIO_DATA_FILE || "apps/api/data/db.json"),
};
