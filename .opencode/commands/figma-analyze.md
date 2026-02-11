---
description: Analyze Figma component for convention compliance and implementation readiness
agent: designer
---

Analyze an existing Figma component for convention compliance and code implementation readiness.

## Required Input

- **Figma URL**: $ARGUMENTS (e.g., `https://www.figma.com/design/abc123/File?node-id=1-2`)

If no URL provided, ask the user for the Figma component URL.

## Instructions

1. Read the figma-analyze skill at `.claude/skills/figma-analyze/SKILL.md`
2. Read the figma rules at `.claude/rules/figma.md`
3. Use MCP tools to fetch design context:
   - `mcp__figma__get_design_context` for component data
   - `mcp__figma__get_variable_defs` for token usage
   - `mcp__figma__get_screenshot` if visual reference needed
4. Analyze:
   - **AI Readability**: Property names, layer names, descriptions
   - **Token Usage**: Spacing, colors, radius using Figma variables
   - **State Implementation**: Hover, focus, disabled patterns
   - **Compound Structure**: Frame names, hierarchy matching code
5. Output analysis report with blocking vs nice-to-have recommendations

## Output Format

Report should include:

- AI Readability checks
- Token Usage checks
- Blocking issues (🔴)
- Should fix issues (🟡)
- Approved items (🟢)
- Implementation Readiness verdict

## Arguments

$ARGUMENTS
