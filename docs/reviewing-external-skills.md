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
- imported ref,
- resolved commit or version,
- import date,
- license,
- reviewer,
- local modification status.

Do not install an external update directly on developer machines. Update the
manifest or vendor snapshot, review the diff, then merge through the normal PR
workflow.
