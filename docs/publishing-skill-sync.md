# Publishing `skill-sync`

The `skill-sync` package is intended to be published as an unscoped npm CLI.

Registry status checked on June 9, 2026:

- `npm whoami` succeeds as `swernerx`.
- `npm view skill-sync` returns 404, so the package name appears available.

## First Publish Checklist

```bash
pnpm install
pnpm agent:check
pnpm --filter skill-sync pack
pnpm --filter skill-sync publish --dry-run
pnpm --filter skill-sync publish --tag alpha
```

The first real publish should be a reviewed alpha release, for example
`0.0.0-alpha.0`.

Before publishing:

- verify the package tarball includes only intended files,
- verify the `skill-sync` binary points to `dist/cli.js`,
- verify no local unpublished secrets or internal-only docs are included,
- verify the package name is still available.

Do not publish from an unreviewed dirty worktree.
