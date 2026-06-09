import { promises as fs } from "node:fs";
import path from "node:path";

import { buildDist, distDigest } from "./skills.js";
import {
  copyDir,
  emptyDir,
  listChildDirs,
  pathExists,
  readJson,
  writeJson
} from "./fs.js";
import { resolveTargetDirs } from "./paths.js";
import type { RepoPaths, TargetName } from "./types.js";

export interface SyncOptions {
  target: TargetName;
  targetDir?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

export interface ManagedMarker {
  installedBy: "skill-sync";
  source: string;
  skillId: string;
  lockfileDigest: string;
  installedAt: string;
}

async function readMarker(skillDir: string): Promise<ManagedMarker | null> {
  const markerPath = path.join(skillDir, ".skill-sync.json");
  if (!(await pathExists(markerPath))) {
    return null;
  }

  try {
    const marker = await readJson<ManagedMarker>(markerPath);
    return marker.installedBy === "skill-sync" ? marker : null;
  } catch {
    return null;
  }
}

export async function syncSkills(
  paths: RepoPaths,
  options: SyncOptions
): Promise<string[]> {
  const messages: string[] = [];
  const skills = await buildDist(paths);
  const digest = await distDigest(paths);
  const targetDirs = resolveTargetDirs(options.target, options.targetDir);
  const installNames = new Set(skills.map((skill) => skill.installName));

  for (const target of targetDirs) {
    messages.push(`Target ${target.name}: ${target.dir}`);

    if (!options.dryRun) {
      await fs.mkdir(target.dir, { recursive: true });
    }

    const existingDirs = await listChildDirs(target.dir);
    for (const existingDir of existingDirs) {
      const marker = await readMarker(existingDir);
      if (marker === null) {
        continue;
      }

      const installName = path.basename(existingDir);
      if (!installNames.has(installName)) {
        messages.push(`Remove managed skill ${installName}`);
        if (!options.dryRun) {
          await fs.rm(existingDir, { recursive: true, force: true });
        }
      }
    }

    for (const skill of skills) {
      const sourceDir = path.join(paths.distSkillsDir, skill.installName);
      const destinationDir = path.join(target.dir, skill.installName);
      messages.push(`Install ${skill.installName}`);

      if (options.dryRun) {
        continue;
      }

      await emptyDir(destinationDir);
      await copyDir(sourceDir, destinationDir);
      await writeJson(path.join(destinationDir, ".skill-sync.json"), {
        installedBy: "skill-sync",
        source: paths.repoRoot,
        skillId: skill.installName,
        lockfileDigest: digest,
        installedAt: new Date().toISOString()
      } satisfies ManagedMarker);
    }
  }

  return options.verbose === true ? messages : messages.slice(0, 1);
}
