import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  getRepoPaths,
  importInternalCommand,
  readLockfile,
  updateExternalCommand,
} from "../src/index.js";
import { createGitSkillRepo, createRepoRoot, writeJson } from "./helpers.js";

describe("source import and update commands", () => {
  it("imports internal git skill sources and writes lock entries", async () => {
    const repoRoot = await createRepoRoot();
    const sourceRepo = await createGitSkillRepo("internal-source");
    await writeJson(path.join(repoRoot, "manifests", "skills.sources.json"), {
      internal: [
        {
          id: "internal-source",
          repo: sourceRepo,
          ref: "main",
          path: ".",
        },
      ],
      external: [],
    });

    const imported = await importInternalCommand(repoRoot);
    const lockfile = await readLockfile(getRepoPaths(repoRoot));

    expect(imported).toStrictEqual(["internal-source"]);
    await expect(
      fs.stat(path.join(repoRoot, "skills", "internal", "internal-source", "SKILL.md")),
    ).resolves.toBeDefined();
    expect(lockfile.sources).toContainEqual(
      expect.objectContaining({ id: "internal-source", kind: "internal" }),
    );
  });

  it("updates external git refs without vendoring by default", async () => {
    const repoRoot = await createRepoRoot();
    const sourceRepo = await createGitSkillRepo("external-source");
    await writeJson(path.join(repoRoot, "manifests", "skills.sources.json"), {
      internal: [],
      external: [
        {
          id: "external-source",
          type: "git",
          repo: sourceRepo,
          ref: "main",
          include: ["external-source"],
        },
      ],
    });

    const updated = await updateExternalCommand(repoRoot);
    const lockfile = await readLockfile(getRepoPaths(repoRoot));
    const entry = lockfile.sources.find((source) => source.id === "external-source");

    expect(updated).toStrictEqual(["external-source"]);
    expect(entry).toBeDefined();
    expect(entry?.kind).toBe("external");
    expect(entry?.integrity).toMatch(/^git-/);
    await expect(
      fs.stat(path.join(repoRoot, "skills", "vendor", "external-source")),
    ).rejects.toThrow();
  });
});
