import fs from "node:fs/promises";
import path from "node:path";
import { createSeedData } from "./seed.js";

export class Store {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = null;
  }

  async load() {
    if (this.data) return this.data;

    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      this.data = JSON.parse(raw);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      this.data = createSeedData();
      await this.save();
    }

    return this.data;
  }

  async save() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, `${JSON.stringify(this.data, null, 2)}\n`, "utf8");
  }

  async reset() {
    this.data = createSeedData();
    await this.save();
    return this.data;
  }
}
