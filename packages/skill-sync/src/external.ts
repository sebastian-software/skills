import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { ExternalInclude, ExternalSource, LockEntry, RepoPaths, SkillsLock } from "./types.js";

import { SkillSyncError } from "./errors.js";
import { parseSkillFrontmatter } from "./frontmatter.js";
import { copyDir, hashDirectory, pathExists } from "./fs.js";
import { cloneGitRef, resolveGitRef } from "./git.js";
import { upsertLockEntry } from "./manifests.js";

const TOOL_VERSION = "0.0.0-alpha.0";

interface VendorExternalInput {
  checkoutDir: string;
  include: ExternalInclude;
  paths: RepoPaths;
  resolvedRef: string;
  source: ExternalSource;
}

function sourceMarkdown(
  source: ExternalSource,
  include: ExternalInclude,
  resolvedRef: string,
): string {
  const localModifications =
    include.installName === include.name ? "no" : "frontmatter name rewritten by rename policy";

  return `# Source

Original source: ${source.repo}
Source type: ${source.type}
Source id: ${source.id}
Skill path: ${include.path}
Upstream name: ${include.name}
Install name: ${include.installName}
Rename policy: ${include.rename ?? "none"}
Imported at: ${new Date().toISOString()}
Imported ref: ${source.ref}
Resolved ref: ${resolvedRef}
Reviewed by: ${source.reviewer ?? "unreviewed"}
Local modifications: ${localModifications}
License: ${source.license ?? "unknown"}
`;
}

async function rewriteSkillName(skillRoot: string, name: string): Promise<void> {
  const skillFile = path.join(skillRoot, "SKILL.md");
  const text = await fs.readFile(skillFile, "utf8");
  const lines = text.split("\n");
  const end = lines.findIndex((line, index) => index > 0 && line === "---");
  if (lines[0] !== "---" || end === -1) {
    throw new SkillSyncError(`${skillFile} has invalid frontmatter`);
  }

  const nameLine = lines.findIndex(
    (line, index) => index > 0 && index < end && line.startsWith("name:"),
  );
  if (nameLine === -1) {
    throw new SkillSyncError(`${skillFile} is missing frontmatter field: name`);
  }

  lines[nameLine] = `name: ${name}`;
  await fs.writeFile(skillFile, lines.join("\n"));
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

async function vendorExternalSource(
  input: VendorExternalInput,
): Promise<{ installName: string; integrity: string }> {
  const sourceRoot = path.join(input.checkoutDir, input.include.path);
  const destination = path.join(input.paths.vendorSkillsDir, input.include.installName);
  const included = await copySkillSource(sourceRoot, destination);
  const upstreamName = included[0];
  if (upstreamName !== input.include.name) {
    throw new SkillSyncError(
      `${sourceRoot} has skill name "${upstreamName}", expected "${input.include.name}"`,
    );
  }

  if (input.include.installName !== input.include.name) {
    await rewriteSkillName(destination, input.include.installName);
  }

  await fs.writeFile(
    path.join(destination, "SOURCE.md"),
    sourceMarkdown(input.source, input.include, input.resolvedRef),
  );
  const integrity = await hashDirectory(destination);
  return { installName: input.include.installName, integrity };
}

function defaultExternalInclude(source: ExternalSource): ExternalInclude {
  return {
    installName: source.id,
    name: source.id,
    path: source.path ?? ".",
  };
}

function includedExternalNames(source: ExternalSource): string[] {
  return (source.include ?? [defaultExternalInclude(source)]).map((include) => include.installName);
}

function combinedIntegrity(entries: Array<{ installName: string; integrity: string }>): string {
  const hash = createHash("sha256");
  for (const entry of entries.toSorted((a, b) => a.installName.localeCompare(b.installName))) {
    hash.update(entry.installName);
    hash.update(entry.integrity);
  }
  return `sha256-${hash.digest("hex")}`;
}

function lockEntryForExternal(input: {
  included: string[];
  integrity: string;
  resolvedRef: string;
  source: ExternalSource;
}): LockEntry {
  return {
    id: input.source.id,
    kind: "external",
    sourceUrl: input.source.repo,
    requestedRef: input.source.ref,
    resolvedRef: input.resolvedRef,
    included: input.included,
    integrity: input.integrity,
    updatedAt: new Date().toISOString(),
    toolVersion: TOOL_VERSION,
  };
}

async function updateVendoredExternalSource(
  paths: RepoPaths,
  lockfile: SkillsLock,
  source: ExternalSource,
): Promise<SkillsLock> {
  const checkout = await cloneGitRef(source.repo, source.ref);
  try {
    const vendored: Array<{ installName: string; integrity: string }> = [];
    for (const include of source.include ?? [defaultExternalInclude(source)]) {
      vendored.push(
        await vendorExternalSource({
          checkoutDir: checkout.dir,
          include,
          paths,
          source,
          resolvedRef: checkout.resolvedRef,
        }),
      );
    }
    return upsertLockEntry(
      lockfile,
      lockEntryForExternal({
        included: vendored.map((entry) => entry.installName),
        integrity: combinedIntegrity(vendored),
        resolvedRef: checkout.resolvedRef,
        source,
      }),
    );
  } finally {
    await checkout.cleanup();
  }
}

export async function updateExternalSource(
  paths: RepoPaths,
  lockfile: SkillsLock,
  source: ExternalSource,
): Promise<SkillsLock> {
  if (source.vendor === true) {
    return updateVendoredExternalSource(paths, lockfile, source);
  }

  const resolvedRef = await resolveGitRef(source.repo, source.ref);
  return upsertLockEntry(
    lockfile,
    lockEntryForExternal({
      included: includedExternalNames(source),
      integrity: `git-${resolvedRef}`,
      resolvedRef,
      source,
    }),
  );
}
