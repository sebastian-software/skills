import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { buildCommand, validateCommand } from "../src/index.js";
import { createRepoRoot, writeSkill } from "./helpers.js";

describe("validateCommand", () => {
  it("validates a repository with one internal skill", async () => {
    const repoRoot = await createRepoRoot();
    await writeSkill(path.join(repoRoot, "skills", "internal", "alpha"), "alpha");

    const result = await validateCommand(repoRoot);

    expect(result).toMatchObject({ ok: true, errors: [] });
  });

  it("fails on duplicate flattened skill names", async () => {
    const repoRoot = await createRepoRoot();
    await writeSkill(path.join(repoRoot, "skills", "internal", "one"), "same");
    await writeSkill(path.join(repoRoot, "skills", "vendor", "two"), "same");
    await fs.writeFile(path.join(repoRoot, "skills", "vendor", "two", "SOURCE.md"), "# Source\n");

    const result = await validateCommand(repoRoot);

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("Duplicate skill name");
  });

  it("builds a flat dist skills tree", async () => {
    const repoRoot = await createRepoRoot();
    await writeSkill(path.join(repoRoot, "skills", "internal", "alpha"), "alpha");

    const built = await buildCommand(repoRoot);

    expect(built).toStrictEqual(["alpha"]);
    await expect(
      fs.stat(path.join(repoRoot, "dist", "skills", "alpha", "SKILL.md")),
    ).resolves.toBeDefined();
  });
});
