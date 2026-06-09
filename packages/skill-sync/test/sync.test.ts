import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { syncCommand } from "../src/index.js";
import {
  createRepoRoot,
  makeTempDir,
  writeJson,
  writeSkill
} from "./helpers.js";

describe("syncCommand", () => {
  it("installs managed skills and preserves unmanaged local skills", async () => {
    const repoRoot = await createRepoRoot();
    const targetDir = await makeTempDir("skill-sync-target-");
    await writeSkill(
      path.join(repoRoot, "skills", "internal", "alpha"),
      "alpha"
    );
    await fs.mkdir(path.join(targetDir, "manual-skill"), { recursive: true });
    await fs.writeFile(
      path.join(targetDir, "manual-skill", "SKILL.md"),
      "# Manual\n"
    );

    await syncCommand({ repoRoot, target: "codex", targetDir, verbose: true });

    await expect(
      fs.stat(path.join(targetDir, "alpha", ".skill-sync.json"))
    ).resolves.toBeDefined();
    await expect(
      fs.stat(path.join(targetDir, "manual-skill", "SKILL.md"))
    ).resolves.toBeDefined();
  });

  it("removes obsolete managed skills only", async () => {
    const repoRoot = await createRepoRoot();
    const targetDir = await makeTempDir("skill-sync-target-");
    await writeSkill(
      path.join(repoRoot, "skills", "internal", "alpha"),
      "alpha"
    );
    await fs.mkdir(path.join(targetDir, "old-managed"), { recursive: true });
    await writeJson(path.join(targetDir, "old-managed", ".skill-sync.json"), {
      installedBy: "skill-sync",
      source: repoRoot,
      skillId: "old-managed",
      lockfileDigest: "sha256-old",
      installedAt: "2026-06-09T00:00:00.000Z"
    });

    await syncCommand({ repoRoot, target: "codex", targetDir, verbose: true });

    await expect(
      fs.stat(path.join(targetDir, "old-managed"))
    ).rejects.toThrow();
    await expect(fs.stat(path.join(targetDir, "alpha"))).resolves.toBeDefined();
  });

  it("uses codex and agents subdirectories for custom all-target installs", async () => {
    const repoRoot = await createRepoRoot();
    const targetDir = await makeTempDir("skill-sync-target-");
    await writeSkill(
      path.join(repoRoot, "skills", "internal", "alpha"),
      "alpha"
    );

    await syncCommand({ repoRoot, target: "all", targetDir, verbose: true });

    await expect(
      fs.stat(path.join(targetDir, "codex", "alpha", ".skill-sync.json"))
    ).resolves.toBeDefined();
    await expect(
      fs.stat(path.join(targetDir, "agents", "alpha", ".skill-sync.json"))
    ).resolves.toBeDefined();
  });
});
