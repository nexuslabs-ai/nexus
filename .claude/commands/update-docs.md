# Update Docs

Update documentation based on codebase changes.

## Agent Used

| Agent                                                   | Skill                                                           | Purpose                         |
| ------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| [Technical Writer](../agents/technical-writer/AGENT.md) | [update-docs](../agents/technical-writer/skills/update-docs.md) | Keep docs accurate and complete |

## Execution

1. **Load Technical Writer agent:**
   - Read `.claude/agents/technical-writer/AGENT.md`
   - Read `.claude/agents/technical-writer/skills/update-docs.md`

2. **Execute update-docs skill:**
   - Analyze recent git changes
   - Identify affected documentation
   - Propose and apply updates

3. **Confirm changes** with user before applying
