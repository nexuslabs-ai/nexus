# shadcn to Figma

Generate a Figma architecture blueprint from shadcn component code and usage patterns using the Designer agent.

## Agent Used

| Agent                             | Skill                                                 | Purpose                              |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------ |
| [Designer](../agents/designer.md) | [shadcn-to-figma](../skills/shadcn-to-figma/SKILL.md) | Code-to-design architecture guidance |

## Required Input

- **$ARGUMENTS**: Component name (e.g., `Button`, `Accordion`, `DropdownMenu`)

Accepts:

- PascalCase: `Button`, `DropdownMenu`
- lowercase: `button`, `dropdown-menu`
- shadcn URL: `https://ui.shadcn.com/docs/components/button`

If no component provided, ask the user which component to analyze.

## Flow

```
┌─────────────────────────────────────────┐
│      /shadcn-to-figma {component}       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Validate Input                │
│  • Normalize component name             │
│  • Check if valid shadcn component      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        Spawn Designer Agent             │
│  • Use Task tool with subagent_type     │
│  • Pass component name in prompt        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Designer Executes shadcn-to-figma skill │
│  • Fetch shadcn registry                │
│  • Read Nexus implementation (if any)   │
│  • Analyze props, variants, composition │
│  • Generate Figma blueprint             │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Validate Input

1. **Parse arguments:**

   ```
   If component name provided → Normalize to PascalCase
   If shadcn URL provided → Extract component name
   If no input → Ask user which component
   ```

2. **Normalize component name:**
   - `button` → `Button`
   - `dropdown-menu` → `DropdownMenu`

### Phase 2: Spawn Designer Agent

**IMPORTANT: You MUST use the Task tool to spawn the Designer agent. Do NOT execute the skill yourself.**

```
Task(
  subagent_type: "designer",
  description: "Generate Figma blueprint for component",
  prompt: """
  Generate a Figma architecture blueprint for the {component_name} component.

  ## Component
  {component_name}

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
  6. Generate Figma blueprint following skill format
  """
)
```

### Phase 3: Output Blueprint

The Designer agent will output:

```markdown
## Figma Blueprint: {ComponentName}

### Component Structure

{How to organize in Figma}

### Properties

| Property   | Type    | Values       | Figma Implementation |
| ---------- | ------- | ------------ | -------------------- |
| `variant`  | Enum    | primary, ... | Variant property     |
| `size`     | Enum    | sm, md, lg   | Variant property     |
| `disabled` | Boolean | true/false   | Boolean property     |

### Variants Matrix

{What variants to create}

### Layer Naming

| Layer Purpose | Figma Name | Code Mapping |
| ------------- | ---------- | ------------ |
| ...           | ...        | ...          |

### Token Bindings

| Element    | Property | Token              |
| ---------- | -------- | ------------------ |
| Background | Fill     | primary/background |
| Text       | Fill     | primary/foreground |

### Compound Components (if applicable)

{For components like Accordion, Dialog, etc.}

### Notes

{Implementation considerations}
```

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
