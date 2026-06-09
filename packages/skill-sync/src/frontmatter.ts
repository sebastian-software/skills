import { promises as fs } from "node:fs";
import path from "node:path";

import type { SkillFrontmatter } from "./types.js";
import { SkillSyncError } from "./errors.js";

function cleanScalar(value: string): string {
  return value.trim().replace(/^['"]/, "").replace(/['"]$/, "");
}

export async function parseSkillFrontmatter(
  skillRoot: string
): Promise<SkillFrontmatter> {
  const skillFile = path.join(skillRoot, "SKILL.md");
  const text = await fs.readFile(skillFile, "utf8");

  if (!text.startsWith("---\n")) {
    throw new SkillSyncError(`${skillFile} must start with YAML frontmatter`);
  }

  const end = text.indexOf("\n---", 4);
  if (end === -1) {
    throw new SkillSyncError(`${skillFile} has unterminated frontmatter`);
  }

  const metadata: Record<string, string> = {};
  const frontmatter = text.slice(4, end);

  for (const line of frontmatter.split("\n")) {
    if (line.trim() === "" || line.startsWith(" ") || line.startsWith("-")) {
      continue;
    }

    const match = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (match === null) {
      continue;
    }

    const [, key, value = ""] = match;
    if (key !== undefined) {
      metadata[key] = cleanScalar(value);
    }
  }

  if (metadata.name === undefined || metadata.name === "") {
    throw new SkillSyncError(`${skillFile} is missing frontmatter field: name`);
  }

  if (metadata.description === undefined || metadata.description === "") {
    throw new SkillSyncError(
      `${skillFile} is missing frontmatter field: description`
    );
  }

  return {
    name: metadata.name,
    description: metadata.description,
    metadata
  };
}
