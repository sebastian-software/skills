# Design Registers

Choose the design register before making visual decisions. A register is the
interface's job: whether design serves a task, carries a brand impression, or
supports long-form comprehension. The same colour, typography, motion, and
layout choices can be excellent in one register and wrong in another.

## Product Register

Use for apps, dashboards, admin screens, settings, data tables, editors, and
tools where users are trying to complete a task.

**Goal:** earned familiarity. Users should trust the interface immediately and
move through the task without noticing unnecessary design decisions.

**Default choices:**

- Use one well-tuned sans-serif family unless the product already has a
  different system.
- Use a restrained colour system: neutral surfaces, semantic states, and one
  accent for primary actions, current selection, focus, and status.
- Prefer density when users compare, scan, or repeat actions often.
- Keep component vocabulary consistent across screens: same button shapes, same
  form controls, same table affordances, same icon family.
- Use fixed product type scales for controls and dense UI. Reserve fluid
  `clamp()` display sizing for marketing or content-led surfaces.
- Use motion only to explain state change, feedback, progress, or spatial
  continuity.
- Keep product motion short, usually 150-250ms, and avoid page-load choreography
  on task surfaces.
- Place delight at specific earned moments: completion, first success, helpful
  recovery, or a meaningful milestone. The rest of the product should stay
  reliable and quiet.

**Common product failures:**

- Decorating task UI with brand-page gestures.
- Using display fonts for labels, buttons, or data.
- Making inactive states saturated or visually loud.
- Inventing custom affordances for standard controls.
- Opening a modal when inline editing, progressive disclosure, or a dedicated
  page would keep the user's mental model clearer.

## Brand Register

Use for landing pages, marketing pages, campaign pages, portfolios, product
launch pages, and other surfaces where the first impression is the deliverable.

**Goal:** distinctiveness with intent. The design should communicate a specific
position, audience, and atmosphere, not simply look polished.

### Brand Point of View Before Style

Before choosing fonts, colours, imagery, or section shapes, decide what the
brand surface needs to say:

- **Audience:** who should feel directly addressed, and who is intentionally
  less central?
- **Voice:** what should the brand sound and feel like in concrete terms, not
  vague labels like modern, premium, technical, or elegant?
- **Category expectation:** what does this category normally look like, and
  which expectations should be honoured, bent, or rejected?
- **Memorable signal:** what single visual, typographic, spatial, copy, or media
  decision should make the surface recognisable?
- **Evidence:** what real product, person, place, object, screenshot, diagram,
  or outcome can make the brand specific instead of decorative?

A brand surface can be restrained, loud, editorial, playful, severe, warm, or
precise. The important part is that the style follows a point of view, not a
category reflex.

**Default choices:**

- Pick a colour strategy deliberately: restrained, committed, full palette, or
  drenched.
- Choose typography by role and brand voice. A single family is fine when
  chosen deliberately; a second family is useful only when it creates real
  contrast in voice, hierarchy, or reading mode.
- Use real imagery or credible visual evidence when the subject is physical,
  visual, place-based, product-based, or person-led. Avoid replacing the actual
  subject with abstract decoration when users need to understand what is being
  offered.
- Let sections vary in rhythm and composition when the narrative earns it.
- Use motion as art direction when it strengthens the story and still respects
  reduced motion.
- Let delight carry brand voice through copy, imagery, transitions, discovery,
  and details when those choices serve the story.

### Avoid Category Reflexes

Do not derive style directly from the category. The first expected look is often
only a starting point:

- A developer tool does not automatically need a dark terminal aesthetic.
- A finance surface does not automatically need blue, dense tables, and stock
  photography.
- A wellness brand does not automatically need pale neutrals, soft gradients,
  and rounded cards.
- An AI product does not automatically need purple-blue gradients, glowing
  abstract shapes, or synthetic interface mockups.
- A luxury or craft brand does not automatically need high-contrast serifs,
  oversized whitespace, and monochrome art direction.

If the obvious category treatment is right, use it intentionally and sharpen the
details. If it is only familiar, choose a more specific direction from audience,
voice, evidence, and the memorable signal.

**Common brand failures:**

- Building a generic hero, statistic row, and repeated card grid because the
  category suggests it.
- Using a timid neutral palette when the surface needs a point of view.
- Replacing needed imagery with decorative CSS panels or abstract placeholders.
- Repeating tiny labels, numbered markers, or identical section structures as
  scaffolding instead of making specific design choices.

## Content-Heavy Register

Use for documentation, articles, guides, reports, knowledge bases, legal pages,
and technical reference material.

**Goal:** comprehension, trust, and sustained reading.

**Default choices:**

- Prioritise measure, hierarchy, rhythm, and scannability over visual novelty.
- Use generous line height and paragraph spacing for prose.
- Keep navigation, table of contents, anchors, and search predictable.
- Use colour sparingly for links, status, callouts, and code emphasis.
- Prefer real examples, diagrams, tables, and code blocks over decorative
  imagery.

## Choosing Quickly

Ask three questions:

1. Is the user here to complete a repeatable task? Use the product register.
2. Is the user judging the brand, offer, or object itself? Use the brand
   register.
3. Is the user mainly reading, learning, or referencing? Use the content-heavy
   register.

When a surface mixes registers, make the primary job decide the baseline and
allow local exceptions. A product onboarding welcome screen can borrow from
brand. A marketing pricing table can borrow from product. The register prevents
defaulting to one universal look.
