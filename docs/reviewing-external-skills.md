# Reviewing External Skills

External skills are dependency-like inputs. Review them before vendoring or
locking an update.

## Checklist

1. Confirm the source is trustworthy.
2. Confirm the license is compatible with Sebastian Software usage.
3. Look for risky or overriding agent instructions.
4. Review executable scripts and their dependencies.
5. Check for network access and external service calls.
6. Check for secret or environment variable access.
7. Check for local filesystem reads or writes outside the skill directory.
8. Confirm the skill is relevant to actual Sebastian Software workflows.

## Source Metadata

Vendored external skills must include `SOURCE.md` with:

- original source URL,
- source type,
- source id,
- upstream skill path,
- upstream skill name,
- installed skill name,
- rename policy,
- imported ref,
- resolved commit or version,
- import date,
- license,
- reviewer,
- local modification status.

Do not install an external update directly on developer machines. Update the
manifest or vendor snapshot, review the diff, then merge through the normal PR
workflow.

## Multi-Skill Sources

Treat an external repository as the source boundary, even when it contains many
skills. Track the repository once and select only the skill paths that are
approved for Sebastian Software usage.

Use structured `include` entries for multi-skill repositories:

```json
{
  "id": "marketingskills",
  "type": "git",
  "repo": "https://github.com/coreyhaines31/marketingskills.git",
  "ref": "main",
  "vendor": true,
  "include": [
    {
      "path": "skills/copywriting",
      "name": "copywriting",
      "installName": "marketingskills-copywriting",
      "rename": "source-prefix"
    }
  ]
}
```

`name` is the upstream frontmatter name and must match the imported skill.
`installName` is the local installed name. If it differs from `name`, `rename`
must be set. Use `source-prefix` for generic external names that could collide
with other sources, such as `copywriting`, `audit`, or `polish`.

Do not use the `s7n-*` prefix for external skills. `s7n-*` is reserved for
first-party Sebastian Software skills.

## Current Marketing Source

The initial `coreyhaines31/marketingskills` import vendors these upstream skills
under source-prefixed names:

- `copy-editing` -> `marketingskills-copy-editing`
- `copywriting` -> `marketingskills-copywriting`
- `product-marketing` -> `marketingskills-product-marketing`
- `marketing-plan` -> `marketingskills-marketing-plan`
- `launch` -> `marketingskills-launch`
- `pricing` -> `marketingskills-pricing`
- `customer-research` -> `marketingskills-customer-research`
- `competitor-profiling` -> `marketingskills-competitor-profiling`
- `competitors` -> `marketingskills-competitors`
- `content-strategy` -> `marketingskills-content-strategy`
- `analytics` -> `marketingskills-analytics`
- `cro` -> `marketingskills-cro`
- `seo-audit` -> `marketingskills-seo-audit`
- `ai-seo` -> `marketingskills-ai-seo`
- `marketing-ideas` -> `marketingskills-marketing-ideas`
- `marketing-psychology` -> `marketingskills-marketing-psychology`

`social-content` was installed locally in the past, but it is no longer present
in the current upstream repository. Keep it out of the reproducible vendor set
unless a reviewed historical ref is intentionally pinned.
