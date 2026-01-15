# Figma Analyze

Analyze a Figma component design for code implementation readiness.

## Agent Used

| Agent                                   | Skill                                                       | Purpose                        |
| --------------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| [Designer](../agents/designer/AGENT.md) | [figma-analyze](../agents/designer/skills/figma-analyze.md) | Design-to-code parity analysis |

## Required Input

- **Figma URL**: $ARGUMENTS (e.g., `https://www.figma.com/design/abc123/File?node-id=1-2`)

If no URL provided, ask the user for the Figma component URL.

## Execution

> **Mode:** CONTINUOUS — Execute all phases without pausing.

1. **Load Designer agent:**
   - Read `.claude/agents/designer/AGENT.md`
   - Read `.claude/agents/designer/skills/figma-analyze.md`

2. **Execute figma-analyze skill:**
   - Follow the workflow defined in the skill file
   - Apply Designer persona and principles throughout

3. **Output analysis report** as defined in the skill

## Error Handling

| Error                  | Action                                      |
| ---------------------- | ------------------------------------------- |
| Invalid Figma URL      | Ask user to provide valid URL               |
| Figma access denied    | Check MCP connection, ask user to verify    |
| Component not found    | Ask user to verify node-id                  |
| Missing tokens in code | Flag in report as "Code Adaptations Needed" |
