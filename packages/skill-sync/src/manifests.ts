import path from "node:path";

import type {
  ExternalSource,
  InternalSource,
  LockEntry,
  RepoPaths,
  SkillsLock,
  SourcesManifest,
} from "./types.js";

import { SkillSyncError } from "./errors.js";
import { readJson, writeJson } from "./fs.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: Record<string, unknown>, key: string, context: string): string {
  const field = value[key];
  if (typeof field !== "string" || field.trim() === "") {
    throw new SkillSyncError(`${context}.${key} must be a non-empty string`);
  }
  return field;
}

function readOptionalString(
  value: Record<string, unknown>,
  key: string,
  context: string,
): string | undefined {
  const field = value[key];
  if (field === undefined) {
    return undefined;
  }
  if (typeof field !== "string" || field.trim() === "") {
    throw new SkillSyncError(`${context}.${key} must be a non-empty string`);
  }
  return field;
}

function readOptionalStringArray(
  value: Record<string, unknown>,
  key: string,
  context: string,
): string[] | undefined {
  const field = value[key];
  if (field === undefined) {
    return undefined;
  }
  if (!Array.isArray(field)) {
    throw new SkillSyncError(`${context}.${key} must be an array of strings`);
  }

  const values: string[] = [];
  for (const item of field) {
    if (typeof item !== "string") {
      throw new SkillSyncError(`${context}.${key} must be an array of strings`);
    }
    values.push(item);
  }

  return values;
}

function parseInternalSource(value: unknown, index: number): InternalSource {
  const context = `internal[${index}]`;
  if (!isRecord(value)) {
    throw new SkillSyncError(`${context} must be an object`);
  }

  return {
    id: readString(value, "id", context),
    repo: readString(value, "repo", context),
    ref: readString(value, "ref", context),
    path: readOptionalString(value, "path", context) ?? ".",
  };
}

function parseExternalSource(value: unknown, index: number): ExternalSource {
  const context = `external[${index}]`;
  if (!isRecord(value)) {
    throw new SkillSyncError(`${context} must be an object`);
  }

  const type = readString(value, "type", context);
  if (type !== "git") {
    throw new SkillSyncError(`${context}.type must be "git"`);
  }

  const vendor = value.vendor;
  if (vendor !== undefined && typeof vendor !== "boolean") {
    throw new SkillSyncError(`${context}.vendor must be a boolean`);
  }

  return withExternalOptionals(
    {
      id: readString(value, "id", context),
      type,
      repo: readString(value, "repo", context),
      ref: readString(value, "ref", context),
      path: readOptionalString(value, "path", context) ?? ".",
      vendor: vendor === true,
    },
    value,
    context,
  );
}

function withExternalOptionals(
  source: ExternalSource,
  value: Record<string, unknown>,
  context: string,
): ExternalSource {
  const include = readOptionalStringArray(value, "include", context);
  const license = readOptionalString(value, "license", context);
  const reviewer = readOptionalString(value, "reviewer", context);
  return {
    ...source,
    ...(include === undefined ? {} : { include }),
    ...(license === undefined ? {} : { license }),
    ...(reviewer === undefined ? {} : { reviewer }),
  };
}

function parseSourcesRoot(raw: unknown): { external: unknown[]; internal: unknown[] } {
  if (!isRecord(raw)) {
    throw new SkillSyncError("skills.sources.json must be an object");
  }

  const internal = raw.internal ?? [];
  const external = raw.external ?? [];
  if (!Array.isArray(internal)) {
    throw new SkillSyncError("skills.sources.json.internal must be an array");
  }
  if (!Array.isArray(external)) {
    throw new SkillSyncError("skills.sources.json.external must be an array");
  }

  return { external, internal };
}

export async function readSourcesManifest(paths: RepoPaths): Promise<SourcesManifest> {
  const raw = await readJson(paths.sourcesManifestPath);
  const sources = parseSourcesRoot(raw);

  return {
    internal: sources.internal.map(parseInternalSource),
    external: sources.external.map(parseExternalSource),
  };
}

function parseLockRoot(raw: unknown): unknown[] {
  if (!isRecord(raw)) {
    throw new SkillSyncError("skills.lock.json must be an object");
  }

  if (raw.version !== 1) {
    throw new SkillSyncError("skills.lock.json.version must be 1");
  }
  if (raw.generatedBy !== "skill-sync") {
    throw new SkillSyncError('skills.lock.json.generatedBy must be "skill-sync"');
  }
  if (!Array.isArray(raw.sources)) {
    throw new SkillSyncError("skills.lock.json.sources must be an array");
  }

  return raw.sources;
}

function parseLockEntry(value: unknown, index: number): LockEntry {
  const context = `sources[${index}]`;
  if (!isRecord(value)) {
    throw new SkillSyncError(`${context} must be an object`);
  }

  const kind = readString(value, "kind", context);
  if (kind !== "external" && kind !== "internal") {
    throw new SkillSyncError(`${context}.kind must be internal or external`);
  }

  return {
    id: readString(value, "id", context),
    kind,
    sourceUrl: readString(value, "sourceUrl", context),
    requestedRef: readString(value, "requestedRef", context),
    resolvedRef: readString(value, "resolvedRef", context),
    included: readStringArray(value.included, `${context}.included`),
    integrity: readString(value, "integrity", context),
    updatedAt: readString(value, "updatedAt", context),
    toolVersion: readString(value, "toolVersion", context),
  };
}

function readStringArray(value: unknown, context: string): string[] {
  if (!Array.isArray(value)) {
    throw new SkillSyncError(`${context} must be an array of strings`);
  }
  const included: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      throw new SkillSyncError(`${context} must be an array of strings`);
    }
    included.push(item);
  }
  return included;
}

export async function readLockfile(paths: RepoPaths): Promise<SkillsLock> {
  const sources = parseLockRoot(await readJson(paths.lockfilePath));

  return {
    version: 1,
    generatedBy: "skill-sync",
    sources: sources.map(parseLockEntry),
  };
}

export async function writeLockfile(paths: RepoPaths, lockfile: SkillsLock): Promise<void> {
  await writeJson(paths.lockfilePath, sortLockfile(lockfile));
}

export function sortLockfile(lockfile: SkillsLock): SkillsLock {
  return {
    ...lockfile,
    sources: [...lockfile.sources].sort((a, b) =>
      `${a.kind}:${a.id}`.localeCompare(`${b.kind}:${b.id}`),
    ),
  };
}

export function upsertLockEntry(lockfile: SkillsLock, entry: LockEntry): SkillsLock {
  const sources = lockfile.sources.filter(
    (source) => source.id !== entry.id || source.kind !== entry.kind,
  );
  sources.push(entry);
  return sortLockfile({ ...lockfile, sources });
}

export function sourceDestination(baseDir: string, id: string, sourcePath = "."): string {
  return path.normalize(path.join(baseDir, id, sourcePath));
}
