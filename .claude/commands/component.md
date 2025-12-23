---
description: Scaffold a new component with all required files
argument-hint: [component-name]
---

Scaffold a new component with all required files.

## Required Input

Component name: $ARGUMENTS

If no name provided, ask the user for the component name (e.g., "Card", "Input", "Badge").

## Files to Create

For a component named `{Name}`:

### 1. Component File: `packages/react/src/components/ui/{name}.tsx`

Use the component template from `.claude/rules/components.md`

### 2. Test File: `packages/react/src/components/ui/{name}.test.tsx`

Use the test template from `.claude/rules/testing.md`

### 3. Story File: `packages/react/src/components/ui/{Name}.stories.tsx`

Use the story template from `.claude/rules/storybook.md`

## After Creating Files

1. **Add export** to `packages/react/src/index.ts`:
   ```ts
   export * from '@/components/ui/{name}';
   ```

2. **Run tests** to verify:
   ```bash
   yarn test
   ```

3. **Run lint** to check formatting:
   ```bash
   yarn lint
   ```

## Checklist

| Item | Status |
|------|--------|
| Component file created | |
| Test file created | |
| Story file created | |
| Export added to index.ts | |
| Tests passing | |
| Lint passing | |
