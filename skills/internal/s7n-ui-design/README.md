# S7N UI Design

You've seen it happen: your AI agent generates a form with thin gray text, buttons that all look the same, and spacing that feels random. You fix it, move on, and next time it happens again.

This [Agent Skill](https://agentskills.io/) stops that cycle. Install it once, and every UI task follows professional design guidelines automatically. No reminding, no repeating yourself.

Works with Claude Code, Cursor, GitHub Copilot, Windsurf, Gemini CLI, and any other agent that supports the [Agent Skills format](https://agentskills.io/specification).

## Relationship to Anthropic frontend-design and Impeccable

This skill is inspired by Anthropic's
[frontend-design](https://skills.sh/anthropics/skills/frontend-design) skill.
That skill's most important contribution is not a particular font, palette, or
visual taste. It pushes agents to commit to a specific direction and avoid
generic AI-looking output.

It also stands on strong shoulders from Paul Bakaus'
[Impeccable](https://github.com/pbakaus/impeccable), which expands frontend
design skills into a richer language for shaping, auditing, polishing, adapting,
and hardening real interfaces. Impeccable is especially valuable as a vocabulary
and workflow system for live iteration in production codebases.

S7N UI Design keeps that ambition, but changes the operating model. The goal is
not to make every interface louder, bolder, or more surprising after the fact.
The goal is to make the first serious implementation more exact: correct
register, clear primary action, realistic states, accessible interaction,
coherent system usage, and a visual point of view that fits the product.

It is a Sebastian Software successor in the sense of design philosophy and
implementation coverage, not an official continuation or vendored copy.

| Kept from the inspirations | Changed in this skill | Extended here |
|---|---|---|
| Avoid generic generated UI | Define the right register before styling | Product, brand, and content-heavy design registers |
| Commit to a point of view | Make the point of view serve the user's task | Compact design briefs before implementation |
| Use design vocabulary to direct agents | Prefer upfront decisions over repeated command-driven polishing | Specificity checks, generic-output gates, and brief-driven implementation |
| Use modern CSS deliberately | Prefer system fit over one-off spectacle | OKLCH, `light-dark()`, container queries, subgrid, popover, `inert`, View Transitions |
| Treat typography, colour, space, motion, and copy as design decisions | Choose by role, audience, state, and context rather than taste labels | Detailed references for typography, colour, layout, forms, loading states, navigation, tables, i18n, SEO, and quality gates |
| Reject obvious AI-output fingerprints | Diagnose whether the issue is register, hierarchy, media, density, or interaction model | Generic-output gates without numeric scores or polishing loops |

In short: Anthropic's skill is strongest as a creative prompt against generic
output. Impeccable shows how much leverage a design vocabulary can give agents
inside real projects. This skill turns those inspirations into a fuller
design-and-implementation system for agents that should build the right
interface earlier, not merely improve a weak first draft.

## Design stance

The key question is not "how can this be polished?" It is:

> What decision would make this interface impossible to confuse with a generic
> category template, while still making the user's job easier?

For product UI, the answer may be a clearer flow, denser comparison surface,
better empty state, or more reliable interaction model. For brand UI, it may be
a memorable visual signal, real imagery, typography with voice, or a committed
palette. For content-heavy UI, it may be measure, rhythm, navigation, examples,
and trust.

Distinctiveness is useful only when it follows the brief. Decoration that
arrives after the structure is wrong is not design quality.

## The problem

AI agents have no design opinion. Without guidance they default to:

- Text that fails WCAG contrast requirements
- Buttons with no visual hierarchy (everything looks equally important)
- Forms with no validation feedback or sensible field sizing
- Arbitrary spacing with no system behind it
- No consideration for dark mode, reduced motion, or screen readers

You can fix this per-prompt, but that gets old after the third time.

## What this changes

The skill loads focused reference files covering the decisions you'd otherwise make by hand:

| Topic | What it handles |
|-------|----------------|
| [Fundamentals](references/01-fundamentals.md) | Interaction cost, cognitive load, affordance, animation, reduced motion, semantic HTML |
| [Less is more](references/02-less-is-more.md) | Progressive disclosure, mobile-first, when to remove rather than add |
| [Colour](references/03-colour.md) | OKLCH palettes, contrast ratios (WCAG 2.1 AA), dark mode, `light-dark()`, relative color syntax |
| [Layout & spacing](references/04-layout-spacing.md) | 8pt grid, container queries, subgrid, responsive images, safe areas, intrinsic layouts |
| [Typography](references/05-typography.md) | Type scale, fluid sizing with `clamp()`, OpenType features, vertical rhythm |
| [Web fonts](references/05b-webfonts.md) | `font-display`, preloading, variable fonts, fallback matching |
| [Copywriting](references/06-copywriting.md) | Concise text, sentence case, error messages, empty states |
| [Buttons](references/07-buttons.md) | Primary/secondary/tertiary weights, destructive actions, undo over confirmation |
| [Forms](references/08-forms.md) | Single column layout, validation with `:user-valid`/`:user-invalid`, dropdowns vs alternatives |
| [SEO](references/09-seo.md) | Meta tags, structured data (JSON-LD), Core Web Vitals, internal linking |

Built on 20+ years of shipping web interfaces. Updated for modern CSS (Baseline 2023-2025) and current accessibility standards.

## What it doesn't do

This isn't a component library or a CSS framework. It doesn't pick your aesthetic direction or choose fonts for you. It's the technical layer underneath: the spacing, contrast, accessibility, and patterns that need to be right regardless of how the interface looks.

## Install

This skill is maintained in the Sebastian Software skills monorepo and installs
as `s7n-ui-design`.

```bash
pnpm skill-sync sync --target all
```

The skill activates automatically whenever the agent works on frontend tasks. Nothing to configure.

## License

MIT — see [LICENSE](LICENSE) for details.

Copyright (c) 2026 [Sebastian Software GmbH](https://sebastian-software.de), Mainz, Germany.
