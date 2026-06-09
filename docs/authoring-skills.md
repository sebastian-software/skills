# Authoring Skills

Skills are small, focused instruction packages. Each skill must be understandable
from its `SKILL.md` without loading every bundled resource into context.

## Required Structure

```txt
skill-name/
  SKILL.md
  references/
  scripts/
  assets/
  examples/
```

Only `SKILL.md` is required. Add the other directories when they serve a clear
purpose.

## `SKILL.md` Frontmatter

Every skill must start with YAML frontmatter containing at least:

```yaml
---
name: effective-ui-design
description: Use when designing or reviewing frontend interfaces.
---
```

The `name` field is the install name used in the flat `dist/skills` output. It
must be unique across internal and vendor skills.

## Resource Directories

- Use `references/` for detailed guidance that should be loaded only when
  needed.
- Use `scripts/` for deterministic helpers that agents can run instead of
  rewriting repeatedly.
- Use `assets/` for templates, images, fonts, or other output resources.
- Use `examples/` for complete examples that clarify expected usage.

Keep `SKILL.md` lean. Move long tables, examples, policy text, and API details
into references so the agent can load only what the current task needs.

## Internal Skills

Internal skills live under `skills/internal`. They are first-party Sebastian
Software source after import. Update them through pull requests in this
repository.

## Vendor Skills

Vendor skills live under `skills/vendor`. Every vendor skill must include
`SOURCE.md` documenting where it came from, the reviewed ref, the license, and
whether local modifications exist.
