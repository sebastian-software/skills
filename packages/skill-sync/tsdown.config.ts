import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
  },
  banner({ fileName }) {
    return fileName === "cli.mjs" ? "#!/usr/bin/env node" : undefined;
  },
  format: "esm",
  platform: "node",
  target: "node24",
});
