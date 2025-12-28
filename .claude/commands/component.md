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
1. Add `data-slot="{name}"` attribute to root element
2. Add `data-variant` and `data-size` attributes if component has those props
3. Replace `forwardRef` pattern with function component pattern (see Button example)
4. Export variants function alongside component: `export { Component, componentVariants }`
5. Update imports to use `@/` alias pattern
6. Replace shadcn tokens with Nexus tokens where different

**Common Token Differences:**
- `bg-primary` → `bg-primary-background` (Nexus uses explicit background/foreground)
- `bg-destructive` → `bg-error-background` (Nexus uses "error" not "destructive")
- `text-destructive` → `text-error-text`
- `border-input` → `border-border-default`
- `ring-ring` → `ring-primary-background/50`

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
