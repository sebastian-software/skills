# Effective German Typography Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An [Agent Skill](https://agentskills.io/) that applies correct German typography rules when writing or reviewing German text.

## The Problem

Without guidance, AI agents typically produce German text with:

- Straight quotes instead of „Anführungszeichen"
- Hyphens where en dashes belong (2020-2025 vs 2020–2025)
- Missing spaces between numbers and units (50kg vs 50 kg)
- Three periods instead of ellipsis character (... vs …)
- ASCII apostrophes instead of typographic ones
- Incorrect spacing around punctuation

## What This Skill Provides

This skill teaches Claude the complete German typography ruleset:

- **Quotation marks**: „German" and «Swiss» styles with proper nesting
- **Dashes**: Hyphen, en dash (ranges and Gedankenstrich), minus sign
- **Spacing**: Non-breaking and thin spaces for units, percentages, abbreviations
- **Special characters**: Ellipsis, multiplication sign, prime marks, capital Eszett
- **Regional variants**: Germany, Austria, and Switzerland conventions
- **Format awareness**: Handles Markdown, HTML, JSX, and plain text appropriately

## Installation

### Using the Skills CLI

```bash
npx skills add sebastian-software/effective-german-typography-skill
```

### Manual Installation

Clone or download this repository to your skills directory:

```bash
cd ~/<your skills folder>
git clone https://github.com/sebastian-software/effective-german-typography-skill.git
```

## Usage

The skill activates automatically when you:

- Ask to "fix typography" or "review typography" in German text
- Write or edit German content in Markdown, HTML, JSX, or plain text
- Request German text that should follow typographic conventions

### Example Prompts

- "Fix the typography in this German article"
- "Review this text for typography issues"
- "Write a German product description" (skill applies rules automatically)

## Related Skills

For print/PDF output, combine with [effective-print-design](https://github.com/sebastian-software/effective-print-design) which provides CSS print stylesheets, page layout, and typography for paged media. German-specific print rules (hyphenation, DIN 5008 margins) are included in this skill's [references/PRINT.md](references/PRINT.md).

## Scope

This skill focuses on **typography rules**, not:

- Grammar or spelling correction
- Translation
- Content writing style
- Layout or design

## License

[MIT](LICENSE) - Copyright (c) 2026 Sebastian Software GmbH, Mainz, Germany
