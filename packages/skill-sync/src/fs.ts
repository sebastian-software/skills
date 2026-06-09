import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T>(filePath: string): Promise<T> {
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text) as T;
}

export async function writeJson(
  filePath: string,
  value: unknown
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function emptyDir(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

export async function copyDir(
  source: string,
  destination: string,
  options: { exclude?: (relativePath: string) => boolean } = {}
): Promise<void> {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    const relativePath = path.relative(source, sourcePath);

    if (options.exclude?.(relativePath) === true) {
      continue;
    }

    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      await copyDir(sourcePath, destinationPath, options);
    } else if (entry.isSymbolicLink()) {
      const link = await fs.readlink(sourcePath);
      await fs.symlink(link, destinationPath);
    } else if (entry.isFile()) {
      await fs.copyFile(sourcePath, destinationPath);
    }
  }
}

export async function listChildDirs(dir: string): Promise<string[]> {
  if (!(await pathExists(dir))) {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

export async function hashDirectory(dir: string): Promise<string> {
  const hash = createHash("sha256");

  async function visit(current: string): Promise<void> {
    const entries = (await fs.readdir(current, { withFileTypes: true })).sort(
      (a, b) => a.name.localeCompare(b.name)
    );

    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }

      const fullPath = path.join(current, entry.name);
      const relative = path.relative(dir, fullPath);
      hash.update(relative);

      if (entry.isDirectory()) {
        await visit(fullPath);
      } else if (entry.isFile()) {
        hash.update(await fs.readFile(fullPath));
      } else if (entry.isSymbolicLink()) {
        hash.update(await fs.readlink(fullPath));
      }
    }
  }

  await visit(dir);
  return `sha256-${hash.digest("hex")}`;
}

export async function fileSha256(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  hash.update(await fs.readFile(filePath));
  return `sha256-${hash.digest("hex")}`;
}
