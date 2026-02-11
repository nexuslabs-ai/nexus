---
description: Generate LinkedIn post about session accomplishments
agent: social-media-manager
---

Generate a LinkedIn post about what was accomplished in this session.

## Instructions

1. Read the linkedin-post skill at `.claude/skills/linkedin-post/SKILL.md`
2. Gather session context:
   - Analyze conversation history (what was built, challenges, outcomes)
   - Check git changes: `git diff --stat HEAD~5` and `git log --oneline -5`
3. Identify the story angle (what's interesting for developers?)
4. Draft a post following principles:
   - Authentic technical voice
   - No buzzwords or hype ("Excited to announce", "game-changer", etc.)
   - Focus on insights, not promotion
   - Show the why, not just the what
5. Self-review against anti-patterns
6. Present draft with 2-3 alternative angles

## Post Structure

- **Hook**: First line that stops the scroll
- **Context**: Brief background
- **Interesting part**: The insight or learning
- **Takeaway**: What readers can apply
- **Engagement prompt**: Question or call to comment

## Output Format

Present the draft, then offer alternative angles. Ask if user wants adjustments to tone, length, or focus.

## Arguments

$ARGUMENTS
