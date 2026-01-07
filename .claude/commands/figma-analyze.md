---
description: Analyze Figma component design for code parity
argument-hint: [figma-url]
---

Analyze a Figma component design against Nexus Design System conventions to ensure Figma-to-code parity.

> **EXECUTION MODE: CONTINUOUS**
>
> This command runs ALL phases without pausing for confirmation.
> Do NOT stop between phases. Execute the entire workflow end-to-end.
> This overrides the default "wait after each phase" behavior from root CLAUDE.md.

## Required Input

Figma URL: $ARGUMENTS

If no URL provided, ask the user for the Figma component URL.

## Workflow

### Phase 1: Fetch Figma Design

Extract `fileKey` and `nodeId` from the Figma URL:
- Format: `https://www.figma.com/design/:fileKey/:fileName?node-id=:nodeId`
- Convert node-id: `123-456` → `123:456`

Use MCP tools to gather complete design context:

1. **`get_design_context`** - Component structure, props, and generated code
2. **`get_variable_defs`** - All tokens/variables used in the component
3. **`get_screenshot`** - Visual reference for the component

From `get_design_context`, extract:
- Component props (types and values)
- Default values
- Variant combinations

From `get_variable_defs`, extract:
- Spacing tokens used
- Color tokens used
- Radius tokens used
- Typography tokens used

### Phase 2: Understand Codebase Conventions

Read these files to understand current patterns dynamically:

| File | What to Learn |
|------|---------------|
| `packages/react/src/components/ui/button.tsx` | Component structure, prop patterns, CVA usage |
| `packages/tailwind/nexus.css` | Semantic token names in `@theme` block |
| `packages/tailwind/variables.css` | Primitive token names (`--nx-*` prefix) |
| `.claude/rules/figma.md` | Token mapping conventions |
| `.claude/rules/components.md` | Component patterns and requirements |

From button.tsx, identify:
- How variants are structured in CVA
- Prop naming patterns (lowercase, abbreviated)
- Data attributes used (`data-slot`, `data-variant`, etc.)
- Export patterns

From CSS files, build a mental map of:
- Primitive → Semantic → Utility token flow
- Available semantic tokens for colors, spacing, radius
- Typography utility classes

### Phase 3: Compare & Analyze

**Token Analysis:**
For each token found in Figma (`get_variable_defs`), verify:
- Does it exist in the codebase?
- Is the value correct?
- Is the naming consistent?

**Prop Analysis:**
For each prop found in Figma (`get_design_context`), check:
- Are values lowercase and abbreviated where appropriate?
- Do boolean props use `has*`/`is*` pattern instead of enum states?
- Are variant names consistent with existing components?

**Structure Analysis:**
Compare Figma component structure with codebase patterns:
- Does it follow the same variant/size pattern as Button?
- Are there props that need different handling in code vs Figma?

### Phase 4: Generate Report

Provide a structured analysis:

```markdown
## Figma Analysis: {ComponentName}

### Component Overview
- **Description**: [from Figma]
- **Variants**: [list all variant props]
- **Sizes**: [if applicable]

### Props from Figma

| Prop | Type | Values | Default |
|------|------|--------|---------|
| ... | ... | ... | ... |

### Token Usage

| Category | Figma Tokens | Code Equivalent | Status |
|----------|--------------|-----------------|--------|
| Spacing | ... | ... | ✅/⚠️ |
| Radius | ... | ... | ✅/⚠️ |
| Colors | ... | ... | ✅/⚠️ |
| Typography | ... | ... | ✅/⚠️ |

### Convention Check

| Check | Status | Notes |
|-------|--------|-------|
| Size values abbreviated | ✅/❌ | ... |
| Lowercase prop values | ✅/❌ | ... |
| Boolean vs enum states | ✅/❌ | ... |
| Token names match code | ✅/❌ | ... |

### Recommendations

**Figma Updates Needed** (if any):
- ...

**Code Adaptations Needed** (if any):
- ...

### Implementation Readiness

- [ ] Props aligned with code conventions
- [ ] Tokens exist in codebase
- [ ] Structure matches component patterns
```

## Key Principles

1. **Don't assume** - Always read the actual codebase files to understand current patterns
2. **Compare dynamically** - Token names and patterns may evolve; compare against actual files, not hardcoded expectations
3. **Reference rules** - Use `.claude/rules/figma.md` as the source of truth for conventions
4. **Be specific** - Report exactly what matches and what doesn't, with actionable fixes
