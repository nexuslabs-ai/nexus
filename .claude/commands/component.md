---
description: Scaffold a new component with all required files
argument-hint: [component-name] [figma-url]
---

Scaffold a new component or update an existing one using shadcn as base, adapted to Nexus token system and Figma design.

## Required Input

- **Component name**: $ARGUMENTS (first argument)
- **Figma URL**: (optional, second argument or ask user)

If no name provided, ask the user for the component name (e.g., "Card", "Input", "Badge").

If Figma URL is available, use it to guide implementation. If not provided, ask user if they have a Figma design for this component.

## Mode Detection

Check if component exists at `packages/react/src/components/ui/{name}.tsx`:
- **New component**: Follow full workflow (Phases 1-6)
- **Existing component**: Skip Phase 1, apply modifications to existing files

## Workflow

### Phase 1: Fetch from shadcn Registry

```bash
npx shadcn@latest add {name} --path=packages/react/src/components/ui --no-overwrite
```

If command fails or component doesn't exist in shadcn, create from scratch using template in `.claude/rules/components.md`.

### Phase 2: Analyze Figma Design (if URL provided)

Skip this phase if no Figma URL is available.

**Fetch Figma data using MCP tools:**

Extract `fileKey` and `nodeId` from URL:
- Format: `https://www.figma.com/design/:fileKey/:fileName?node-id=:nodeId`
- Convert node-id: `123-456` → `123:456`

1. **`get_design_context`** - Get component props and structure
2. **`get_variable_defs`** - Get all tokens used (spacing, colors, radius)
3. **`get_screenshot`** - Visual reference

**From Figma, extract:**
- Component props (types, values, defaults)
- Size mappings to spacing tokens
- Color tokens used
- Radius tokens used
- Variant names and states

**Compare with codebase conventions:**
- Read `.claude/rules/figma.md` for token mapping rules
- Verify prop naming follows conventions (abbreviated sizes like `xs`, `sm`, `md`)
- Verify tokens exist in `packages/tailwind/nexus.css`

**Document findings** for use in Phase 3.

### Phase 3: Adapt to Nexus Token System + Figma Design

**Before modifying, read these files to understand current token structure:**
- `packages/tailwind/nexus.css` - semantic tokens in `@theme inline` block
- `packages/tailwind/variables.css` - primitive CSS variables with `--nx-*` prefix

**Required Modifications:**

1. **Add `nx:` prefix** to ALL Tailwind utility classes (critical for coexistence with consumer's Tailwind)
2. Add `data-slot="{name}"` attribute to root element
3. Add `data-variant` and `data-size` attributes if component has those props
4. Replace `forwardRef` pattern with function component pattern (see Button example)
5. Export variants function alongside component: `export { Component, componentVariants }`
6. Update imports to use `@/` alias pattern
7. Replace shadcn tokens with Nexus tokens where different

**If Figma design was analyzed (Phase 2):**

8. **Match Figma props** - Ensure component props match Figma (prop names, types, values)
9. **Map Figma sizes to tokens** - Use the size-to-spacing mapping from Figma (e.g., `md` → `spacing-10` → 40px)
10. **Use Figma variant names** - Match variant naming from Figma design
11. **Verify boolean props** - Use `has*`/`is*` pattern for boolean states per `.claude/rules/figma.md`

**Class Prefix Rule:**
ALL Tailwind classes must use `nx:` prefix, including modifiers:
```tsx
// Correct
'nx:bg-primary nx:text-primary-foreground hover:nx:bg-primary/90'
'nx:border nx:border-border-default'
'focus-visible:nx:ring-2 focus-visible:nx:ring-offset-2'

// Wrong - missing nx: prefix
'bg-primary text-primary-foreground hover:bg-primary/90'
```

**Common Token Mappings (with nx: prefix):**

See `.claude/rules/shadcn-divergences.md` for complete mapping. Key differences:

| shadcn | Nexus |
|--------|-------|
| `bg-primary` | `nx:bg-primary-background` |
| `bg-destructive` | `nx:bg-error-background` |
| `text-destructive` | `nx:text-error-foreground` |
| `border-input` | `nx:border-border-default` |
| `ring-ring` | `nx:ring-primary-background/50` |

**Reference:** [button.tsx](packages/react/src/components/ui/button.tsx) for pattern example.

### Phase 4: Create Storybook

Create `packages/react/src/components/ui/{Name}.stories.tsx`

Use template from `.claude/rules/storybook.md`, adapting stories based on actual component props.

**If Figma design exists:**
- Create stories for each variant/size from Figma
- Use Figma's visual reference to verify stories match design
- Include AllVariants story showing all Figma variants

### Phase 5: Tests via Play Functions

Tests are written as play functions in stories (no separate test files for components).

Use template from `.claude/rules/testing.md`:
- Add play functions to interactive stories
- Test click/keyboard interactions
- Verify data-slot, data-variant, data-size attributes
- Test disabled states

### Phase 6: Finalize

1. **Add export** to `packages/react/src/index.ts`:
   ```ts
   export * from '@/components/ui/{name}';
   ```

2. **Run lint** to check formatting:
   ```bash
   yarn lint
   ```

3. **Run tests** to verify:
   ```bash
   yarn test
   ```

4. **Fix any issues** found in lint or tests

## Checklist

| Phase | Step | Status |
|-------|------|--------|
| 1 | Fetched/created component | |
| 2 | Figma design analyzed (if URL provided) | |
| 2 | Props extracted from Figma | |
| 2 | Token mappings documented | |
| 3 | All classes have `nx:` prefix | |
| 3 | Adapted to Nexus tokens | |
| 3 | Added data-slot attribute | |
| 3 | Added data-variant/size (if applicable) | |
| 3 | Updated to function component pattern | |
| 3 | Props match Figma design (if applicable) | |
| 3 | Sizes use correct spacing tokens | |
| 4 | Storybook created | |
| 4 | Stories cover all Figma variants | |
| 5 | Play function tests added | |
| 6 | Export added to index.ts | |
| 6 | Lint passing | |
| 6 | Tests passing | |

## Summary After Each Phase

After completing each phase:
1. Provide a brief summary of changes
2. Wait for user review and feedback
3. Apply any requested fixes before proceeding to next phase
