# Figma Analyze

Analyze an existing Figma component for convention compliance and code implementation readiness.

## Agent Used

| Agent                             | Skill                                             | Purpose                        |
| --------------------------------- | ------------------------------------------------- | ------------------------------ |
| [Designer](../agents/designer.md) | [figma-analyze](../skills/figma-analyze/SKILL.md) | Design-to-code parity analysis |

## What It Checks

| Category                 | Checks                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **AI Readability**       | Property names match code, child layer names standardized, component descriptions present |
| **Token Usage**          | Spacing, colors, radius use Figma variables linked to design tokens                       |
| **State Implementation** | Hover/focus use Interactive Components, disabled/loading use boolean props                |
| **Compound Structure**   | Frame names PascalCase matching exports, hierarchy mirrors React composition              |
| **Custom Additions**     | New props/variants/slots follow naming conventions                                        |

## Required Input

- **Figma URL**: $ARGUMENTS (e.g., `https://www.figma.com/design/abc123/File?node-id=1-2`)

If no URL provided, ask the user for the Figma component URL.

## Execution

> **Mode:** CONTINUOUS — Execute all phases without pausing.

1. **Load Designer agent:**
   - Read `.claude/agents/designer.md`
   - Read `.claude/skills/figma-analyze/SKILL.md`

2. **Execute figma-analyze skill:**
   - Follow the workflow defined in the skill file
   - Apply Designer persona and principles throughout

3. **Output analysis report** with:
   - AI Readability assessment
   - Token usage validation
   - State implementation check
   - Custom additions review
   - Blocking vs nice-to-have recommendations
   - Implementation readiness verdict

## Example Usage

```bash
/figma-analyze https://www.figma.com/design/abc123/Nexus-DS?node-id=100-200
```

## Output Summary Format

The report categorizes issues by severity:

| Severity          | Meaning                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| 🔴 **Blocking**   | Must fix before code implementation (property names, missing descriptions) |
| 🟡 **Should Fix** | Important for consistency (layer names, hardcoded values)                  |
| 🟢 **Approved**   | Custom additions that follow conventions                                   |

## Error Handling

| Error                  | Action                                          |
| ---------------------- | ----------------------------------------------- |
| Invalid Figma URL      | Ask user to provide valid URL                   |
| Figma access denied    | Check MCP connection, ask user to verify        |
| Component not found    | Ask user to verify node-id                      |
| Unknown base component | Analyze as fully custom, check conventions only |
| No Figma variables     | Flag as blocking — must use token variables     |
