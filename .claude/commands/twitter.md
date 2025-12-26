---
description: Generate Twitter/X post from this session
argument-hint: [single | thread | hot-take | build-log]
---

Create a tweet about what was built in this session.

Format: $ARGUMENTS

## Formats

| Format | Description |
|--------|-------------|
| single | One punchy tweet (< 280 chars) |
| thread | 3-5 connected tweets |
| hot-take | Opinionated single tweet |
| build-log | "Today I built X" style |

If no format provided, ask the user to pick one.

## Vibe Levels

| Level | Style |
|-------|-------|
| 1 | Informative, helpful |
| 2 | Casual, conversational |
| 3 | Excited, sharing a win |
| 4 | Opinionated, spicy |
| 5 | Controversial, debate-starter |

## Guidelines

- Keep it short and punchy
- Singles must be under 280 characters
- Specific, not vague
- 3-5 hashtags max
- 0-2 emojis max

## Output

- Format neatly in markdown for easy copy-paste
- Provide 1-2 options with character count (for singles)
