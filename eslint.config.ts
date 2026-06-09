import { getEslintConfig } from "eslint-config-setup";

const config = await getEslintConfig({ node: true, oxlint: true });

config.unshift({
  ignores: [
    "**/dist/**",
    "coverage/**",
    "node_modules/**",
    "pnpm-lock.yaml",
    "skills/**",
    "**/*.json",
    "**/*.md",
  ],
});

config.push({
  files: ["packages/skill-sync/src/**/*.ts", "packages/skill-sync/test/**/*.ts"],
  rules: {
    "security/detect-non-literal-fs-filename": "off",
  },
});

export default config;
