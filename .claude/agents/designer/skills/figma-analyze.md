# Figma Analyze Skill

## Purpose

Analyze a Figma component design against codebase conventions to ensure design-to-code parity and implementation readiness.

## Task-Specific Rules

| Context            | Rules to Load                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Always             | [figma.md](../../../rules/figma.md), [tokens.md](../../../rules/tokens.md)                                   |
| Component analysis | [components.md](../../../rules/components.md), [shadcn-divergences.md](../../../rules/shadcn-divergences.md) |

## Workflow

### Phase 1: Fetch Figma Design

1. **Extract identifiers** from Figma URL:
   - Format: `https://www.figma.com/design/:fileKey/:fileName?node-id=:nodeId`
   - Convert node-id: `123-456` → `123:456`

2. **Gather design context** using MCP tools:
   - `get_design_context` — Component structure, props, generated code
   - `get_variable_defs` — All tokens/variables used
   - `get_screenshot` — Visual reference
   - `get_metadata` — Frame names, layer hierarchy

3. **Extract from results:**
   - Props (types, values, defaults)
   - Token usage (spacing, colors, radius, typography)
   - Frame names and hierarchy
   - Component type identification

### Phase 2: Fetch Reference Documentation

1. **Identify component type** (e.g., Accordion, Button, Dialog)

2. **Fetch shadcn reference** if applicable:
   - URL: `https://ui.shadcn.com/docs/components/{component-name}`
   - Extract: variants, props, composition pattern, Radix primitive

3. **Document expected structure** for compound components

### Phase 3: Understand Codebase Conventions

1. **Read current patterns** from actual code:
   - `packages/react/src/components/ui/button.tsx` — Component patterns
   - `packages/tailwind/nexus.css` — Semantic tokens
   - `packages/tailwind/variables.css` — Primitive tokens

2. **Build token map:**
   - Primitive → Semantic → Utility flow
   - Available semantic tokens

3. **Note conventions:**
   - CVA variant structure
   - Prop naming patterns
   - Data attributes used
   - Export patterns

### Phase 4: Compare & Analyze

1. **Token Analysis:**
   - Does each Figma token exist in code?
   - Are values correct?
   - Is naming consistent?

2. **Prop Analysis:**
   - Are values lowercase and abbreviated (xs, sm, md)?
   - Do booleans use `has*`/`is*` pattern?
   - Are variant names consistent?

3. **Structure Analysis:**
   - Does Figma follow same pattern as existing components?
   - Are frame names correct for compound components?

4. **shadcn Parity** (for compound components):
   - Do frame names match exports?
   - Does hierarchy match composition?

### Phase 5: Generate Report

Output structured analysis using this format:

```markdown
## 🎨 Figma Analysis: {ComponentName}

### Component Overview

- **Type**: Simple | Compound
- **shadcn Reference**: {link if applicable}
- **Radix Primitive**: {if applicable}

### Props from Figma

| Prop | Type | Values | Default | Convention Check |
| ---- | ---- | ------ | ------- | ---------------- |
| ...  | ...  | ...    | ...     | ✅/❌            |

### Token Usage

| Category | Figma Token | Code Equivalent | Status |
| -------- | ----------- | --------------- | ------ |
| Spacing  | ...         | ...             | ✅/⚠️  |
| Colors   | ...         | ...             | ✅/⚠️  |
| Radius   | ...         | ...             | ✅/⚠️  |

### Frame Naming (Compound Components)

| Figma Frame | Expected Name | Status |
| ----------- | ------------- | ------ |
| ...         | ...           | ✅/❌  |

### Convention Check

| Check                    | Status | Notes |
| ------------------------ | ------ | ----- |
| Size values abbreviated  | ✅/❌  | ...   |
| Lowercase prop values    | ✅/❌  | ...   |
| Boolean vs enum states   | ✅/❌  | ...   |
| Frame names match shadcn | ✅/❌  | ...   |

### Recommendations

**Figma Updates Needed:**

- {list if any}

**Code Adaptations Needed:**

- {list if any}

### Implementation Readiness

- [ ] Props aligned with conventions
- [ ] Tokens exist in codebase
- [ ] Structure matches patterns
- [ ] Ready for implementation
```

## Output Format

The analysis report should be:

- Actionable — clear next steps for both design and code
- Specific — exact token names, frame names, values
- Prioritized — blocking issues vs nice-to-haves
