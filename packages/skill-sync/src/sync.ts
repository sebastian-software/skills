import { promises as fs } from "node:fs";
import path from "node:path";

import type { RepoPaths, TargetName } from "./types.js";
import type { SkillDefinition } from "./types.js";

import { copyDir, emptyDir, listChildDirs, pathExists, readJson, writeJson } from "./fs.js";
import { resolveTargetDirs } from "./paths.js";
import { buildDist, distDigest } from "./skills.js";

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

function isManagedMarker(value: unknown): value is ManagedMarker {
  if (typeof value !== "object" || value === null || !("installedBy" in value)) {
    return false;
  }

  const marker = value as Partial<Record<keyof ManagedMarker, unknown>>;
  return (
    marker.installedBy === "skill-sync" &&
    typeof marker.source === "string" &&
    typeof marker.skillId === "string" &&
    typeof marker.lockfileDigest === "string" &&
    typeof marker.installedAt === "string"
  );
}

async function readMarker(skillDir: string): Promise<ManagedMarker | null> {
  const markerPath = path.join(skillDir, ".skill-sync.json");
  if (!(await pathExists(markerPath))) {
    return null;
  }

  try {
    const marker = await readJson(markerPath);
    return isManagedMarker(marker) ? marker : null;
  } catch {
    return null;
  }
}

async function removeObsoleteManagedSkills(input: {
  dryRun: boolean;
  installNames: Set<string>;
  messages: string[];
  targetDir: string;
}): Promise<void> {
  const existingDirs = await listChildDirs(input.targetDir);
  for (const existingDir of existingDirs) {
    const marker = await readMarker(existingDir);
    const installName = path.basename(existingDir);
    if (marker === null || input.installNames.has(installName)) {
      continue;
    }

    input.messages.push(`Remove managed skill ${installName}`);
    if (!input.dryRun) {
      await fs.rm(existingDir, { recursive: true, force: true });
    }
  }
}

async function installManagedSkill(input: {
  digest: string;
  dryRun: boolean;
  messages: string[];
  paths: RepoPaths;
  skill: SkillDefinition;
  targetDir: string;
}): Promise<void> {
  input.messages.push(`Install ${input.skill.installName}`);

  if (input.dryRun) {
    return;
  }

  const sourceDir = path.join(input.paths.distSkillsDir, input.skill.installName);
  const destinationDir = path.join(input.targetDir, input.skill.installName);
  await emptyDir(destinationDir);
  await copyDir(sourceDir, destinationDir);
  await writeJson(path.join(destinationDir, ".skill-sync.json"), {
    installedBy: "skill-sync",
    source: input.paths.repoRoot,
    skillId: input.skill.installName,
    lockfileDigest: input.digest,
    installedAt: new Date().toISOString(),
  } satisfies ManagedMarker);
}

async function syncTarget(input: {
  digest: string;
  dryRun: boolean;
  installNames: Set<string>;
  messages: string[];
  name: Exclude<TargetName, "all">;
  paths: RepoPaths;
  skills: SkillDefinition[];
  targetDir: string;
}): Promise<void> {
  input.messages.push(`Target ${input.name}: ${input.targetDir}`);

  if (!input.dryRun) {
    await fs.mkdir(input.targetDir, { recursive: true });
  }

  await removeObsoleteManagedSkills(input);
  for (const skill of input.skills) {
    await installManagedSkill({ ...input, skill });
  }
}

export async function syncSkills(paths: RepoPaths, options: SyncOptions): Promise<string[]> {
  const messages: string[] = [];
  const skills = await buildDist(paths);
  const digest = await distDigest(paths);
  const installNames = new Set(skills.map((skill) => skill.installName));

  for (const target of resolveTargetDirs(options.target, options.targetDir)) {
    await syncTarget({
      digest,
      dryRun: options.dryRun === true,
      installNames,
      messages,
      name: target.name,
      paths,
      skills,
      targetDir: target.dir,
    });
  }

  return options.verbose === true ? messages : messages.slice(0, 1);
}
