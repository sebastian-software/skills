# Sebastian Software Skills

Canonical repository for Sebastian Software agent skills.

This repo provides a TypeScript CLI, `skill-sync`, that imports, validates,
builds, and installs shared skills for Codex and Agents. Internal skills are
maintained as first-party source here. External skills are treated like
dependencies: sourced, locked, reviewed, and updated intentionally.

## Quickstart

```bash
pnpm install
pnpm build
pnpm skill-sync validate
pnpm skill-sync sync --target all
```

## Daily Workflow

Use `pnpm skill-sync doctor` to inspect the local environment, `pnpm skill-sync
build` to generate the flat `dist/skills` tree, and `pnpm skill-sync sync
--target all` to install managed skills into both local targets.

`sync` is managed-only by default. It updates directories that contain a valid
`.skill-sync.json` marker and preserves unrelated local skills.

## Skill Sources

- Internal Sebastian Software skill repositories are configured in
  `manifests/skills.sources.json` and imported into `skills/internal`.
- External skill sources are configured separately and locked in
  `manifests/skills.lock.json`.
- Vendored external snapshots live in `skills/vendor` only after review.

See `docs/authoring-skills.md`, `docs/sync-workflow.md`,
`docs/reviewing-external-skills.md`, and `docs/publishing-skill-sync.md` for the
full developer workflow.
