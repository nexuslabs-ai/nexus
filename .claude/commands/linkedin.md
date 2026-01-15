# LinkedIn Post

Generate a LinkedIn post about what was accomplished in this session.

## Agent Used

| Agent                                                     | Skill                                             | Purpose                        |
| --------------------------------------------------------- | ------------------------------------------------- | ------------------------------ |
| [Social Media Manager](../agents/social-media-manager.md) | [linkedin-post](../skills/linkedin-post/SKILL.md) | Session-aware content creation |

## Execution

> **Mode:** CONTINUOUS — Execute all phases without pausing.

1. **Load Social Media Manager agent:**
   - Read `.claude/agents/social-media-manager.md`
   - Read `.claude/skills/linkedin-post/SKILL.md`

2. **Execute linkedin-post skill:**
   - Analyze session context (conversation history, git changes)
   - Identify the story angle
   - Draft post following agent principles
   - Self-review against anti-patterns
   - Present draft with alternatives

3. **Iterate** based on user feedback
