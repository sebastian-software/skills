import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

import type { RepoPaths, TargetName } from "./types.js";

import { SkillSyncError } from "./errors.js";

export function findRepoRoot(start = process.cwd()): string {
  let current = path.resolve(start);

  for (;;) {
    if (existsSync(path.join(current, "manifests", "skills.sources.json"))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new SkillSyncError(`Could not find repository root from ${path.resolve(start)}`);
    }

    current = parent;
  }
}

export function getRepoPaths(repoRoot = findRepoRoot()): RepoPaths {
  return {
    repoRoot,
    manifestsDir: path.join(repoRoot, "manifests"),
    sourcesManifestPath: path.join(repoRoot, "manifests", "skills.sources.json"),
    lockfilePath: path.join(repoRoot, "manifests", "skills.lock.json"),
    skillsDir: path.join(repoRoot, "skills"),
    internalSkillsDir: path.join(repoRoot, "skills", "internal"),
    vendorSkillsDir: path.join(repoRoot, "skills", "vendor"),
    distSkillsDir: path.join(repoRoot, "dist", "skills"),
  };
}

export function defaultTargetDir(target: Exclude<TargetName, "all">): string {
  switch (target) {
    case "codex":
      return path.join(homedir(), ".codex", "skills");
    case "agents":
      return path.join(homedir(), ".agents", "skills");
  }
}

export function resolveTargetDirs(
  target: TargetName,
  customTargetDir?: string,
): Array<{ name: Exclude<TargetName, "all">; dir: string }> {
  if (customTargetDir !== undefined) {
    const resolved = path.resolve(customTargetDir);
    if (target === "all") {
      return [
        { name: "codex", dir: path.join(resolved, "codex") },
        { name: "agents", dir: path.join(resolved, "agents") },
      ];
    }

    return [{ name: target, dir: resolved }];
  }

  if (target === "all") {
    return [
      { name: "codex", dir: defaultTargetDir("codex") },
      { name: "agents", dir: defaultTargetDir("agents") },
    ];
  }

  return [{ name: target, dir: defaultTargetDir(target) }];
}

export function assertInside(parent: string, child: string): void {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new SkillSyncError(`${child} escapes ${parent}`);
  }
}
