---
description: Scaffold a new component with all required files
argument-hint: [component-name]
---

Scaffold a new component using shadcn as base, adapted to Nexus token system.

## Required Input

Component name: $ARGUMENTS

If no name provided, ask the user for the component name (e.g., "Card", "Input", "Badge").

## Workflow

### Phase 1: Fetch from shadcn Registry

```bash
npx shadcn@latest add {name} --path=packages/react/src/components/ui --no-overwrite
```

If command fails or component doesn't exist in shadcn, create from scratch using template in `.claude/rules/components.md`.

### Phase 2: Adapt to Nexus Token System

**Before modifying, read `packages/react/src/generated/globals.css` to understand current token structure.**

**Required Modifications:**
1. **Add `nx:` prefix** to ALL Tailwind utility classes (critical for coexistence with consumer's Tailwind)
2. Add `data-slot="{name}"` attribute to root element
3. Add `data-variant` and `data-size` attributes if component has those props
4. Replace `forwardRef` pattern with function component pattern (see Button example)
5. Export variants function alongside component: `export { Component, componentVariants }`
6. Update imports to use `@/` alias pattern
7. Replace shadcn tokens with Nexus tokens where different

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
| shadcn | Nexus |
|--------|-------|
| `bg-primary` | `nx:bg-primary` (or `nx:bg-primary-background` for explicit) |
| `bg-destructive` | `nx:bg-error-background` |
| `text-destructive` | `nx:text-error-text` |
| `border-input` | `nx:border-border-default` |
| `ring-ring` | `nx:ring-primary-background/50` |

**Reference:** [button.tsx](packages/react/src/components/ui/button.tsx) for pattern example.

### Phase 3: Create Storybook

Create `packages/react/src/components/ui/{Name}.stories.tsx`

Use template from `.claude/rules/storybook.md`, adapting stories based on actual component props.

### Phase 4: Create Tests

Create `packages/react/src/components/ui/{name}.test.tsx`

Use template from `.claude/rules/testing.md`, adapting tests based on actual component behavior.

### Phase 5: Finalize

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
| 2 | All classes have `nx:` prefix | |
| 2 | Adapted to Nexus tokens | |
| 2 | Added data-slot attribute | |
| 2 | Added data-variant/size (if applicable) | |
| 2 | Updated to function component pattern | |
| 3 | Storybook created | |
| 4 | Tests created | |
| 5 | Export added to index.ts | |
| 5 | Lint passing | |
| 5 | Tests passing | |

## Summary After Each Phase

After completing each phase:
1. Provide a brief summary of changes
2. Wait for user review and feedback
3. Apply any requested fixes before proceeding to next phase
