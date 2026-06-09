import { promises as fs } from "node:fs";
import path from "node:path";

import type { RepoPaths, SkillDefinition, SourceKind } from "./types.js";

import { SkillSyncError } from "./errors.js";
import { parseSkillFrontmatter } from "./frontmatter.js";
import { copyDir, emptyDir, hashDirectory, listChildDirs, pathExists } from "./fs.js";

async function discoverSkillDir(root: string, kind: SourceKind): Promise<null | SkillDefinition> {
  const skillFile = path.join(root, "SKILL.md");
  if (!(await pathExists(skillFile))) {
    return null;
  }

  const frontmatter = await parseSkillFrontmatter(root);
  return {
    id: path.basename(root),
    installName: frontmatter.name,
    kind,
    root,
    frontmatter,
  };
}

export async function discoverSkills(paths: RepoPaths): Promise<SkillDefinition[]> {
  const internalDirs = await listChildDirs(paths.internalSkillsDir);
  const vendorDirs = await listChildDirs(paths.vendorSkillsDir);
  const skills: SkillDefinition[] = [];

  for (const dir of internalDirs) {
    const skill = await discoverSkillDir(dir, "internal");
    if (skill === null) {
      throw new SkillSyncError(`${dir} is missing SKILL.md`);
    }
    skills.push(skill);
  }

  for (const dir of vendorDirs) {
    const skill = await discoverSkillDir(dir, "external");
    if (skill === null) {
      throw new SkillSyncError(`${dir} is missing SKILL.md`);
    }
    skills.push(skill);
  }

  return skills.sort((a, b) => a.installName.localeCompare(b.installName));
}

export function assertUniqueInstallNames(skills: SkillDefinition[]): void {
  const seen = new Map<string, string>();

  for (const skill of skills) {
    const previous = seen.get(skill.installName);
    if (previous !== undefined) {
      throw new SkillSyncError(
        `Duplicate skill name "${skill.installName}" in ${previous} and ${skill.root}`,
      );
    }
    seen.set(skill.installName, skill.root);
  }
}

export async function buildDist(paths: RepoPaths): Promise<SkillDefinition[]> {
  const skills = await discoverSkills(paths);
  assertUniqueInstallNames(skills);
  await emptyDir(paths.distSkillsDir);

  for (const skill of skills) {
    await copyDir(skill.root, path.join(paths.distSkillsDir, skill.installName), {
      exclude(relativePath) {
        return relativePath === ".gitkeep";
      },
    });
  }

  return skills;
}

export async function distDigest(paths: RepoPaths): Promise<string> {
  if (!(await pathExists(paths.distSkillsDir))) {
    return "sha256-empty";
  }

  return hashDirectory(paths.distSkillsDir);
}

export async function ensureVendorSourceFiles(paths: RepoPaths): Promise<void> {
  const vendorDirs = await listChildDirs(paths.vendorSkillsDir);
  for (const dir of vendorDirs) {
    if (!(await pathExists(path.join(dir, "SOURCE.md")))) {
      throw new SkillSyncError(`${dir} is missing SOURCE.md`);
    }
  }
}

export async function referencedPathsExist(skill: SkillDefinition): Promise<void> {
  for (const dirname of ["references", "scripts", "assets", "examples"]) {
    const fullPath = path.join(skill.root, dirname);
    if (await pathExists(fullPath)) {
      const stat = await fs.stat(fullPath);
      if (!stat.isDirectory()) {
        throw new SkillSyncError(`${fullPath} must be a directory`);
      }
    }
  }
}
