# Effective LinkedIn Posts Skill

A [Claude Code](https://claude.com/claude-code) skill that helps you create engaging LinkedIn content. It includes a database of 300 proven content ideas across 11 categories, along with writing principles, format guidelines, and engagement strategies.

## Installation

```bash
npx skills add sebastian-software/effective-linkedin-posts
```

Or install manually:

```bash
git clone https://github.com/sebastian-software/effective-linkedin-posts.git ~/.claude/skills/effective-linkedin-posts
```

## What It Does

- **Find content ideas** from 300 categorized templates with sample posts
- **Write LinkedIn posts** with effective hooks, structure, and CTAs
- **Plan content calendars** with the right mix of formats and topics
- **Get engagement tips** tailored to each post type

## Categories

| Category                       | Ideas |
| ------------------------------ | ----: |
| Engagement & Interaction       |    43 |
| Professional Development       |    42 |
| Industry Insights              |    39 |
| Company & Project Updates      |    33 |
| Personal Stories & Reflections |    32 |
| Educational Content            |    27 |
| Networking & Community         |    22 |
| Tools & Resources              |    20 |
| Recognition & Appreciation     |    17 |
| Job & Career Opportunities     |    13 |
| Lifestyle                      |    12 |

## Usage

The skill activates automatically when you mention LinkedIn content in Claude Code:

- "Give me LinkedIn post ideas about leadership"
- "Write a LinkedIn post about our product launch"
- "Create a content calendar for next week"
- "Help me write an engaging poll for LinkedIn"

## How It Works

The skill uses a token-efficient architecture:

- **SKILL.md** contains writing principles, format guidelines, and a routing table
- **11 reference files** hold the content ideas in a compact pipe-delimited format
- Only the relevant category file gets loaded per request, keeping context usage minimal

## Works Well With

- [copywriting](https://skills.sh/anthropics/skills/copywriting) - Marketing copy principles
- [copy-editing](https://skills.sh/anthropics/skills/copy-editing) - Polish your drafts
- [humanizer](https://skills.sh/blader/humanizer/humanizer) - Remove AI-sounding patterns
- [marketing-psychology](https://skills.sh/anthropics/skills/marketing-psychology) - Psychological engagement principles

## License

MIT
