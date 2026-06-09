import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { SkillSyncError } from "./errors.js";
import { run } from "./exec.js";

export async function resolveGitRef(repo: string, ref: string): Promise<string> {
  const direct = await run("git", ["ls-remote", repo, ref]);
  const directLine = direct.stdout.split("\n").find((line) => line.trim() !== "");

  if (directLine !== undefined) {
    const [commit] = directLine.split(/\s+/);
    if (commit !== undefined && commit !== "") {
      return commit;
    }
  }

  const heads = await run("git", ["ls-remote", repo, `refs/heads/${ref}`]);
  const headLine = heads.stdout.split("\n").find((line) => line.trim() !== "");
  if (headLine !== undefined) {
    const [commit] = headLine.split(/\s+/);
    if (commit !== undefined && commit !== "") {
      return commit;
    }
  }

  throw new SkillSyncError(`Could not resolve ${repo}#${ref}`);
}

export async function cloneGitRef(
  repo: string,
  ref: string,
): Promise<{ dir: string; resolvedRef: string; cleanup: () => Promise<void> }> {
  const dir = await fs.mkdtemp(path.join(tmpdir(), "skill-sync-"));
  await run("git", ["clone", "--quiet", repo, dir]);
  await run("git", ["checkout", "--quiet", ref], { cwd: dir });
  const rev = await run("git", ["rev-parse", "HEAD"], { cwd: dir });
  const resolvedRef = rev.stdout.trim();

  return {
    dir,
    resolvedRef,
    async cleanup() {
      await fs.rm(dir, { recursive: true, force: true });
    },
  };
}
