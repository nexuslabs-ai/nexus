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
4. **`get_metadata`** - Frame names and layer hierarchy

From `get_design_context`, extract:
- Component props (types and values)
- Default values
- Variant combinations

From `get_variable_defs`, extract:
- Spacing tokens used
- Color tokens used
- Radius tokens used
- Typography tokens used

From `get_metadata`, extract:
- All frame names in the component
- Layer hierarchy (parent-child relationships)
- Identify the component type (e.g., Accordion, Dialog, Button)

### Phase 2: Fetch shadcn Reference

Based on the component type identified in Phase 1, fetch the shadcn source code:

**Registry URL Pattern:**
```
https://ui.shadcn.com/registry/styles/new-york/{component-name}.json
```

Common component names:
| Component Type | Registry Name |
|----------------|---------------|
| Accordion | `accordion` |
| Dialog | `dialog` |
| Tabs | `tabs` |
| Select | `select` |
| DropdownMenu | `dropdown-menu` |
| Button | `button` |
| Input | `input` |
| Card | `card` |
| Alert | `alert` |
| Avatar | `avatar` |
| Badge | `badge` |
| Checkbox | `checkbox` |
| Popover | `popover` |
| Tooltip | `tooltip` |

Use `WebFetch` to get the registry JSON, then extract:

**From shadcn source code:**
- All exported component parts (e.g., `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`)
- Props for each part
- Default prop values
- Composition structure (which parts are required vs optional)
- Radix primitive being wrapped (if any)

**Example extraction for Accordion:**
```typescript
// Parts found in shadcn source:
exports: ['Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent']

// Radix primitives used:
radixImport: '@radix-ui/react-accordion'

// Required composition:
Accordion > AccordionItem > [AccordionTrigger, AccordionContent]
```

### Phase 3: Understand Codebase Conventions

Read these files to understand current patterns dynamically:

| File | What to Learn |
|------|---------------|
| `packages/react/src/components/ui/button.tsx` | Component structure, prop patterns, CVA usage |
| `packages/tailwind/nexus.css` | Semantic token names in `@theme` block |
| `packages/tailwind/variables.css` | Primitive token names (`--nx-*` prefix) |
| `.claude/rules/figma.md` | Token mapping conventions, compound component naming |
| `.claude/rules/components.md` | Component patterns and requirements |
| `.claude/rules/shadcn-divergences.md` | Nexus vs shadcn differences (token naming, prefix, etc.) |

From button.tsx, identify:
- How variants are structured in CVA
- Prop naming patterns (lowercase, abbreviated)
- Data attributes used (`data-slot`, `data-variant`, etc.)
- Export patterns

From CSS files, build a mental map of:
- Primitive → Semantic → Utility token flow
- Available semantic tokens for colors, spacing, radius
- Typography utility classes

### Phase 4: Compare & Analyze

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

**shadcn Parity Analysis (NEW):**
Compare Figma frames against shadcn source from Phase 2:

| Check | How to Verify |
|-------|---------------|
| Part Names | Do Figma frame names match shadcn exports? |
| Part Count | Are all shadcn parts represented in Figma? |
| Composition | Does Figma hierarchy match shadcn composition? |
| Props Match | Do Figma props align with shadcn component props? |

For each shadcn export, check:
```
shadcn export: AccordionTrigger
├── Figma frame exists? → AccordionTrigger ✅ or Trigger ❌
├── Frame is PascalCase? → AccordionTrigger ✅ or accordion-trigger ❌
├── Correct parent? → Inside AccordionItem ✅ or floating ❌
└── data-slot mapped? → accordion-trigger
```

**Icon Analysis:**
For icons found in Figma:
- Do instance names match code import pattern? (`IconChevronDown` not `chevron-down`)
- Are icons from the same icon library used in codebase?

### Phase 5: Generate Report

Provide a structured analysis:

```markdown
## Figma Analysis: {ComponentName}

### Component Overview
- **Description**: [from Figma]
- **Type**: Simple | Compound
- **shadcn Reference**: [link to shadcn docs if applicable]
- **Radix Primitive**: [e.g., @radix-ui/react-accordion]

### Props from Figma

| Prop | Type | Values | Default |
|------|------|--------|---------|
| ... | ... | ... | ... |

### shadcn Parity (Compound Components)

**Expected Parts from shadcn:**
| shadcn Export | Figma Frame | Status | Notes |
|---------------|-------------|--------|-------|
| `Accordion` | `Accordion` | ✅/❌ | ... |
| `AccordionItem` | `AccordionItem` | ✅/❌ | ... |
| `AccordionTrigger` | `AccordionTrigger` | ✅/❌ | ... |
| `AccordionContent` | `AccordionContent` | ✅/❌ | ... |

**Composition Hierarchy:**
```
Expected (from shadcn):        Actual (from Figma):
Accordion                      [Figma hierarchy]
├── AccordionItem              ├── ...
│   ├── AccordionTrigger       │   ├── ...
│   └── AccordionContent       │   └── ...
```

### Frame Naming Check

| Figma Frame | Convention | Status | Fix |
|-------------|------------|--------|-----|
| `Trigger` | Should be `AccordionTrigger` | ❌ | Add component prefix |
| `AccordionTrigger` | PascalCase, prefixed | ✅ | - |
| `accordion-content` | Should be PascalCase | ❌ | Use `AccordionContent` |

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
| Frame names match shadcn | ✅/❌ | ... |
| Hierarchy matches shadcn | ✅/❌ | ... |
| Icons use PascalCase | ✅/❌ | ... |

### Recommendations

**Figma Updates Needed** (if any):
- Frame naming: ...
- Hierarchy: ...
- Tokens: ...
- Props: ...

**Code Adaptations Needed** (if any):
- ...

### Implementation Readiness

- [ ] Props aligned with code conventions
- [ ] Tokens exist in codebase
- [ ] Structure matches component patterns
- [ ] Frame names match shadcn exports
- [ ] Composition hierarchy matches shadcn
- [ ] Icons use correct naming convention
```

## Key Principles

1. **Don't assume** - Always read the actual codebase files to understand current patterns
2. **Compare dynamically** - Token names and patterns may evolve; compare against actual files, not hardcoded expectations
3. **Reference rules** - Use `.claude/rules/figma.md` as the source of truth for conventions
4. **Be specific** - Report exactly what matches and what doesn't, with actionable fixes
5. **shadcn as source of truth** - For compound components, shadcn source defines the expected parts and composition
6. **Frame names = Code exports** - Figma frame names should exactly match what will be exported in code
