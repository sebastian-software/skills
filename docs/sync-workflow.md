# Sync Workflow

Use `skill-sync` to build and install the approved skill set locally.

## Daily Sync

```bash
git pull
pnpm install
pnpm skill-sync validate
pnpm skill-sync sync --target all
```

`--target all` installs into both default target folders:

- Codex: `~/.codex/skills`
- Agents: `~/.agents/skills`

## Managed-Only Behavior

`sync` writes `.skill-sync.json` into each installed skill directory. Future
runs update or remove only directories with that marker. Local skills without
the marker are left untouched.

## Dry Runs

```bash
pnpm skill-sync sync --target all --dry-run --verbose
```

Use dry runs before changing a shared workstation or when reviewing generated
changes.

## Custom Targets

```bash
pnpm skill-sync sync --target codex --target-dir /tmp/codex-skills
pnpm skill-sync sync --target all --target-dir /tmp/skill-targets
```

When `--target all` is combined with `--target-dir`, the CLI installs into
`<target-dir>/codex` and `<target-dir>/agents`.

## CI

CI should run:

```bash
pnpm agent:check
```

This validates formatting, linting, type checking, builds, tests, and repository
skill structure.
