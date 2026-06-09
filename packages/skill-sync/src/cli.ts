#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";

import {
  buildCommand,
  doctorCommand,
  importInternalCommand,
  syncCommand,
  updateExternalCommand,
  validateCommand
} from "./index.js";
import { SkillSyncError } from "./errors.js";
import type { TargetName } from "./types.js";

const program = new Command();

function printList(prefix: string, items: string[]): void {
  if (items.length === 0) {
    console.log(`${prefix}: none`);
    return;
  }

  console.log(`${prefix}:`);
  for (const item of items) {
    console.log(`  - ${item}`);
  }
}

async function runCli(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    const message =
      error instanceof SkillSyncError || error instanceof Error
        ? error.message
        : String(error);
    console.error(pc.red(message));
    process.exitCode = 1;
  }
}

function parseTarget(value: string): TargetName {
  if (value === "codex" || value === "agents" || value === "all") {
    return value;
  }
  throw new SkillSyncError("--target must be codex, agents, or all");
}

program
  .name("skill-sync")
  .description("Synchronize shared agent skills for Codex and Agents")
  .version("0.0.0-alpha.0");

program
  .command("validate")
  .description("Validate manifests, lockfile, and skill structure")
  .action(() =>
    runCli(async () => {
      const result = await validateCommand();
      if (!result.ok) {
        for (const error of result.errors) {
          console.error(pc.red(error));
        }
        process.exitCode = 1;
        return;
      }

      for (const warning of result.warnings) {
        console.warn(pc.yellow(warning));
      }
      console.log(pc.green("Skill repository is valid."));
    })
  );

program
  .command("build")
  .description("Build the flat dist/skills tree")
  .action(() =>
    runCli(async () => {
      const skills = await buildCommand();
      printList("Built skills", skills);
    })
  );

program
  .command("sync")
  .description("Install managed skills into local agent targets")
  .requiredOption("--target <target>", "codex, agents, or all", parseTarget)
  .option("--target-dir <path>", "custom target directory")
  .option("--dry-run", "show changes without writing")
  .option("--verbose", "print every sync operation")
  .action(
    (options: {
      target: TargetName;
      targetDir?: string;
      dryRun?: boolean;
      verbose?: boolean;
    }) =>
      runCli(async () => {
        const messages = await syncCommand(options);
        for (const message of messages) {
          console.log(message);
        }
      })
  );

program
  .command("import-internal")
  .description("Import configured Sebastian Software skill repositories")
  .action(() =>
    runCli(async () => {
      const imported = await importInternalCommand();
      printList("Imported internal skills", imported);
    })
  );

program
  .command("update-external")
  .description("Resolve and optionally vendor configured external skills")
  .action(() =>
    runCli(async () => {
      const updated = await updateExternalCommand();
      printList("Updated external skills", updated);
    })
  );

program
  .command("doctor")
  .description("Report local environment and repository health")
  .action(() =>
    runCli(async () => {
      const lines = await doctorCommand();
      for (const line of lines) {
        console.log(line);
      }
    })
  );

await program.parseAsync();
