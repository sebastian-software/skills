import { execFile } from "node:child_process";

export async function run(
  command: string,
  args: string[],
  options: { cwd?: string } = {},
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      {
        cwd: options.cwd,
        maxBuffer: 1024 * 1024 * 32,
      },
      (error, stdout, stderr) => {
        if (error !== null) {
          reject(error instanceof Error ? error : new Error("Command failed", { cause: error }));
          return;
        }

        resolve({ stdout, stderr });
      },
    );
  });
}
