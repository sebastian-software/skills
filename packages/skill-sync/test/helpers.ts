import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function makeTempDir(
  prefix = "skill-sync-test-"
): Promise<string> {
  return fs.mkdtemp(path.join(tmpdir(), prefix));
}

export async function writeJson(
  filePath: string,
  value: unknown
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function writeSkill(
  root: string,
  name: string,
  description = "Test skill"
): Promise<void> {
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(
    path.join(root, "SKILL.md"),
    `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n`
  );
}

export async function createRepoRoot(): Promise<string> {
  const repoRoot = await makeTempDir();
  await fs.mkdir(path.join(repoRoot, "skills", "internal"), {
    recursive: true
  });
  await fs.mkdir(path.join(repoRoot, "skills", "vendor"), { recursive: true });
  await fs.mkdir(path.join(repoRoot, "manifests"), { recursive: true });
  await writeJson(path.join(repoRoot, "manifests", "skills.sources.json"), {
    internal: [],
    external: []
  });
  await writeJson(path.join(repoRoot, "manifests", "skills.lock.json"), {
    version: 1,
    generatedBy: "skill-sync",
    sources: []
  });
  return repoRoot;
}

export async function createGitSkillRepo(skillName: string): Promise<string> {
  const repoRoot = await makeTempDir("skill-sync-source-");
  await writeSkill(repoRoot, skillName);
  await execFileAsync("git", ["init", "--initial-branch=main"], {
    cwd: repoRoot
  });
  await execFileAsync("git", ["add", "."], { cwd: repoRoot });
  await execFileAsync(
    "git",
    [
      "-c",
      "user.email=test@example.com",
      "-c",
      "user.name=Test User",
      "commit",
      "-m",
      "initial"
    ],
    { cwd: repoRoot }
  );
  return repoRoot;
}
