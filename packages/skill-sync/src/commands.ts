import { promises as fs } from "node:fs";
import path from "node:path";
import pc from "picocolors";

import type {
  CommandResult,
  ExternalSource,
  InternalSource,
  LockEntry,
  RepoPaths,
  SkillsLock,
} from "./types.js";

import { SkillSyncError } from "./errors.js";
import { run } from "./exec.js";
import { updateExternalSource } from "./external.js";
import { parseSkillFrontmatter } from "./frontmatter.js";
import { copyDir, emptyDir, hashDirectory, pathExists } from "./fs.js";
import { cloneGitRef } from "./git.js";
import { readLockfile, readSourcesManifest, upsertLockEntry, writeLockfile } from "./manifests.js";
import { getRepoPaths } from "./paths.js";
import {
  buildDist,
  discoverSkills,
  ensureVendorSourceFiles,
  referencedPathsExist,
} from "./skills.js";
import { type SyncOptions, syncSkills } from "./sync.js";

const TOOL_VERSION = "0.0.0-alpha.0";

interface LockEntryInput {
  included: string[];
  integrity: string;
  kind: LockEntry["kind"];
  resolvedRef: string;
  source: ExternalSource | InternalSource;
}

function ok(warnings: string[] = []): CommandResult {
  return { ok: true, errors: [], warnings };
}

function failure(error: unknown): CommandResult {
  return {
    ok: false,
    errors: [error instanceof Error ? error.message : String(error)],
    warnings: [],
  };
}

function sourcePathIsSafe(sourcePath: string): boolean {
  return (
    sourcePath !== "" && !path.isAbsolute(sourcePath) && !sourcePath.split(/[\\/]/).includes("..")
  );
}

function installNameIsSafe(installName: string): boolean {
  return (
    installName !== "" &&
    !path.isAbsolute(installName) &&
    !installName.includes("/") &&
    !installName.includes("\\") &&
    installName !== ".."
  );
}

function validateSourceRootPaths(sources: {
  internal: InternalSource[];
  external: ExternalSource[];
}): void {
  for (const source of [...sources.internal, ...sources.external]) {
    const sourcePath = source.path ?? ".";
    if (!sourcePathIsSafe(sourcePath)) {
      throw new SkillSyncError(
        `${source.id}.path must be relative and stay inside the source repo`,
      );
    }
  }
}

function validateExternalIncludes(sources: ExternalSource[]): void {
  for (const source of sources) {
    for (const include of source.include ?? []) {
      if (!sourcePathIsSafe(include.path)) {
        throw new SkillSyncError(
          `${source.id}.include path must be relative and stay inside the source repo`,
        );
      }

      if (!installNameIsSafe(include.installName)) {
        throw new SkillSyncError(`${source.id}.include installName must be a directory name`);
      }
    }
  }
}

function validateSourcePaths(sources: {
  internal: InternalSource[];
  external: ExternalSource[];
}): void {
  validateSourceRootPaths(sources);
  validateExternalIncludes(sources.external);
}

async function validateSkills(paths: RepoPaths): Promise<void> {
  const skills = await discoverSkills(paths);
  const seen = new Map<string, string>();
  for (const skill of skills) {
    const previous = seen.get(skill.installName);
    if (previous !== undefined) {
      throw new SkillSyncError(
        `Duplicate skill name "${skill.installName}" in ${previous} and ${skill.root}`,
      );
    }
    seen.set(skill.installName, skill.root);
    await referencedPathsExist(skill);
  }
}

async function validateRepository(repoRoot?: string): Promise<void> {
  const paths = getRepoPaths(repoRoot);
  const sources = await readSourcesManifest(paths);
  validateSourcePaths(sources);
  await readLockfile(paths);
  await ensureVendorSourceFiles(paths);
  await validateSkills(paths);
}

export async function validateCommand(repoRoot?: string): Promise<CommandResult> {
  try {
    await validateRepository(repoRoot);
    return ok();
  } catch (error) {
    return failure(error);
  }
}

export async function buildCommand(repoRoot?: string): Promise<string[]> {
  const paths = getRepoPaths(repoRoot);
  const skills = await buildDist(paths);
  return skills.map((skill) => skill.installName);
}

export async function syncCommand(options: { repoRoot?: string } & SyncOptions): Promise<string[]> {
  const paths = getRepoPaths(options.repoRoot);
  return syncSkills(paths, options);
}

function lockEntryForImport(input: LockEntryInput): LockEntry {
  return {
    id: input.source.id,
    kind: input.kind,
    sourceUrl: input.source.repo,
    requestedRef: input.source.ref,
    resolvedRef: input.resolvedRef,
    included: input.included,
    integrity: input.integrity,
    updatedAt: new Date().toISOString(),
    toolVersion: TOOL_VERSION,
  };
}

async function copySkillSource(sourceRoot: string, destination: string): Promise<string[]> {
  await fs.rm(destination, { recursive: true, force: true });
  await copyDir(sourceRoot, destination);

  if (!(await pathExists(path.join(destination, "SKILL.md")))) {
    throw new SkillSyncError(`${sourceRoot} does not contain SKILL.md`);
  }

  const frontmatter = await parseSkillFrontmatter(destination);
  return [frontmatter.name];
}

async function importInternalSource(
  paths: RepoPaths,
  lockfile: SkillsLock,
  source: InternalSource,
): Promise<SkillsLock> {
  const checkout = await cloneGitRef(source.repo, source.ref);
  try {
    const sourceRoot = path.join(checkout.dir, source.path ?? ".");
    const destination = path.join(paths.internalSkillsDir, source.id);
    const included = await copySkillSource(sourceRoot, destination);
    const integrity = await hashDirectory(destination);
    return upsertLockEntry(
      lockfile,
      lockEntryForImport({
        included,
        integrity,
        kind: "internal",
        resolvedRef: checkout.resolvedRef,
        source,
      }),
    );
  } finally {
    await checkout.cleanup();
  }
}

export async function importInternalCommand(repoRoot?: string): Promise<string[]> {
  const paths = getRepoPaths(repoRoot);
  const sources = await readSourcesManifest(paths);
  let lockfile = await readLockfile(paths);
  const imported: string[] = [];

  await fs.mkdir(paths.internalSkillsDir, { recursive: true });

  for (const source of sources.internal) {
    lockfile = await importInternalSource(paths, lockfile, source);
    imported.push(source.id);
  }

  await writeLockfile(paths, lockfile);
  return imported;
}

export async function updateExternalCommand(repoRoot?: string): Promise<string[]> {
  const paths = getRepoPaths(repoRoot);
  const sources = await readSourcesManifest(paths);
  let lockfile = await readLockfile(paths);
  const updated: string[] = [];

  await fs.mkdir(paths.vendorSkillsDir, { recursive: true });

  for (const source of sources.external) {
    lockfile = await updateExternalSource(paths, lockfile, source);
    updated.push(source.id);
  }

  await writeLockfile(paths, lockfile);
  return updated;
}

async function commandAvailable(command: string): Promise<boolean> {
  try {
    await run(command, ["--version"]);
    return true;
  } catch {
    return false;
  }
}

async function npmStatusLine(): Promise<string> {
  try {
    const npmUser = await run("npm", ["whoami"]);
    return `${pc.bold("npm")}: authenticated as ${npmUser.stdout.trim()}`;
  } catch {
    return `${pc.bold("npm")}: not authenticated`;
  }
}

async function validationStatusLines(paths: RepoPaths): Promise<string[]> {
  const validation = await validateCommand(paths.repoRoot);
  return [
    `${pc.bold("manifests")}: ${validation.ok ? "ok" : "invalid"}`,
    ...validation.errors.map((error) => `  - ${error}`),
  ];
}

export async function doctorCommand(repoRoot?: string): Promise<string[]> {
  const paths = getRepoPaths(repoRoot);
  return [
    `${pc.bold("Repository")}: ${paths.repoRoot}`,
    `${pc.bold("Node")}: ${process.version}`,
    `${pc.bold("pnpm")}: ${(await commandAvailable("pnpm")) ? "ok" : "missing"}`,
    `${pc.bold("git")}: ${(await commandAvailable("git")) ? "ok" : "missing"}`,
    await npmStatusLine(),
    ...(await validationStatusLines(paths)),
  ];
}

export async function cleanDistCommand(repoRoot?: string): Promise<void> {
  const paths = getRepoPaths(repoRoot);
  await emptyDir(paths.distSkillsDir);
}
