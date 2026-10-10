import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC_ROOT = resolve(__dirname, "..");

function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (entry.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

function extractImports(source: string): string[] {
  const specifiers: string[] = [];
  const staticImport =
    /(?:^|\n)\s*(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["'`]([^"'`]+)["'`]/g;
  let match: RegExpExecArray | null;
  while ((match = staticImport.exec(source)) !== null) {
    specifiers.push(match[1]);
  }
  const dynamicImport = /\bimport\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
  while ((match = dynamicImport.exec(source)) !== null) {
    specifiers.push(match[1]);
  }
  return specifiers;
}

/** Normalize to forward slashes so every consumer can compare consistently. */
function toPosix(p: string): string {
  return p.replace(/\\/g, "/");
}

function relativePath(absPath: string): string {
  return toPosix(relative(resolve(__dirname, "..", ".."), absPath));
}

describe("architecture boundaries", () => {
  it("TasksModule must not import LabelsRepository directly", () => {
    const tasksRoot = toPosix(join(SRC_ROOT, "modules", "tasks"));
    const files = collectTsFiles(join(SRC_ROOT, "modules", "tasks"));

    const violations: Array<{ file: string; specifier: string }> = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const specifier of extractImports(source)) {
        if (specifier.includes("labels.repository")) {
          violations.push({ file: relativePath(file), specifier });
        }
      }
    }

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  it("non-infrastructure code must not import @prisma/client", () => {
    const allowedRoots = [toPosix(join(SRC_ROOT, "infrastructure"))];
    const files = collectTsFiles(SRC_ROOT);

    const violations: Array<{ file: string; specifier: string }> = [];
    for (const file of files) {
      const posixFile = toPosix(file);
      if (file.endsWith(".spec.ts")) continue;
      if (
        allowedRoots.some(
          (root) => posixFile === root || posixFile.startsWith(root + "/"),
        )
      ) {
        continue;
      }

      const source = readFileSync(file, "utf8");
      for (const specifier of extractImports(source)) {
        if (specifier === "@prisma/client" || specifier.startsWith("@prisma/client/")) {
          violations.push({ file: relativePath(file), specifier });
        }
      }
    }

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
});
