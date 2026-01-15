# Update Docs

Update documentation based on codebase changes.

## Agent Used

| Agent                                             | Skill                                         | Purpose                         |
| ------------------------------------------------- | --------------------------------------------- | ------------------------------- |
| [Technical Writer](../agents/technical-writer.md) | [update-docs](../skills/update-docs/SKILL.md) | Keep docs accurate and complete |

## Execution

1. **Load Technical Writer agent:**
   - Read `.claude/agents/technical-writer.md`
   - Read `.claude/skills/update-docs/SKILL.md`

2. **Execute update-docs skill:**
   - Analyze recent git changes
   - Identify affected documentation
   - Propose and apply updates

3. **Confirm changes** with user before applying
