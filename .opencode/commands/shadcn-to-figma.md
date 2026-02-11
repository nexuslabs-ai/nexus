---
description: Generate Figma architecture blueprint from shadcn component code
agent: designer
---

Generate a Figma architecture blueprint from shadcn component code and usage patterns.

## Required Input

- **Component Name**: $ARGUMENTS (e.g., `Button`, `Accordion`, `DropdownMenu`)

Accepts:

- PascalCase: `Button`, `DropdownMenu`
- lowercase: `button`, `dropdown-menu`
- shadcn URL: `https://ui.shadcn.com/docs/components/button`

If no component provided, ask the user which component to analyze.

## Instructions

1. Read the shadcn-to-figma skill at `.claude/skills/shadcn-to-figma/SKILL.md`
2. Read the figma rules at `.claude/rules/figma.md`
3. Fetch shadcn source:
   - Registry: https://ui.shadcn.com/registry/styles/default/{component}.json
   - Docs: https://ui.shadcn.com/docs/components/{component}
4. Check if Nexus has existing implementation:
   - `packages/react/src/components/ui/{component}.tsx`
5. Analyze:
   - Props and their types
   - Variants from CVA
   - Composition patterns (compound components)
   - Radix primitives used
6. Generate Figma blueprint with:
   - Component structure
   - Properties mapping
   - Variants matrix
   - Layer naming
   - Token bindings

## Arguments

$ARGUMENTS
