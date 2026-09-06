import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "packages/client/src/index.ts");
const targetDir = resolve(root, "packages/client/dist");

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, resolve(targetDir, "index.ts"));
console.log("Published @elwarsha/api-client 0.1.0 snapshot");
