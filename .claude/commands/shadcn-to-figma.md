# shadcn to Figma

Generate a Figma architecture blueprint from shadcn component code and usage patterns.

## Agent Used

| Agent                             | Skill                                                 | Purpose                              |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------ |
| [Designer](../agents/designer.md) | [shadcn-to-figma](../skills/shadcn-to-figma/SKILL.md) | Code-to-design architecture guidance |

## Required Input

- **Component name**: $ARGUMENTS (e.g., `Button`, `Accordion`, `DropdownMenu`)

Accepts:

- PascalCase: `Button`, `DropdownMenu`
- lowercase: `button`, `dropdown-menu`
- shadcn URL: `https://ui.shadcn.com/docs/components/button`

If no component provided, ask the user which component to analyze.

## Execution

> **Mode:** CONTINUOUS — Execute all phases without pausing.

1. **Load Designer agent:**
   - Read `.claude/agents/designer.md`
   - Read `.claude/skills/shadcn-to-figma/SKILL.md`

2. **Execute shadcn-to-figma skill:**
   - Follow the workflow defined in the skill file
   - Apply Designer persona and principles throughout

3. **Output Figma blueprint** as defined in the skill

## Example Usage

```bash
/shadcn-to-figma Button
/shadcn-to-figma Accordion
/shadcn-to-figma dropdown-menu
/shadcn-to-figma https://ui.shadcn.com/docs/components/dialog
```

## Error Handling

| Error                            | Action                                     |
| -------------------------------- | ------------------------------------------ |
| Component not in shadcn registry | Ask user to verify name, suggest similar   |
| Registry fetch failed            | Retry once, then ask user to check network |
| No Nexus implementation exists   | Note in output, use shadcn as reference    |
| Ambiguous component name         | Ask user to clarify                        |
