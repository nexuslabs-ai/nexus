# shadcn/ui Divergences

> This documents intentional differences between Nexus and shadcn/ui.
> When adapting shadcn components or comparing with Figma, apply these mappings.

## Quick Reference

| Category | shadcn/ui | Nexus | Notes |
|----------|-----------|-------|-------|
| CSS Prefix | none | `nx:` | All utilities require prefix |
| Destructive tokens | `destructive` | `error-*` | Token names, not variant names |
| Token structure | CSS vars | 3-layer system | primitive → semantic → utility |
| Component sizing | Fixed heights | Padding-based | Flex-friendly approach |
| Data attributes | Optional | Required | `data-slot`, `data-variant`, `data-size` |

## Token Naming

### Status Colors

shadcn uses `destructive` for error states. Nexus uses semantic `error-*` tokens:

| shadcn Token | Nexus Token |
|--------------|-------------|
| `--destructive` | `--color-error-background` |
| `--destructive-foreground` | `--color-error-foreground` |
| N/A | `--color-error-hover` |
| N/A | `--color-error-active` |
| N/A | `--color-error-disabled` |
| N/A | `--color-error-text` |
| N/A | `--color-error-surface` |

Nexus extends the pattern with additional states (hover, active, disabled, text, surface).

### Full Status Token Set

Nexus has consistent token groups for all status types:

| Status | Token Pattern |
|--------|---------------|
| Error | `--color-error-{state}` |
| Success | `--color-success-{state}` |
| Warning | `--color-warning-{state}` |
| Information | `--color-information-{state}` |

Where `{state}` is: `background`, `foreground`, `hover`, `active`, `disabled`, `text`, `surface`

## CSS Utility Prefix

All Tailwind utilities MUST use `nx:` prefix:

```tsx
// shadcn
className="bg-primary text-primary-foreground hover:bg-primary/90"

// Nexus
className="nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-hover"
```

**Prefix position:** `nx:` comes BEFORE pseudo-classes:

```tsx
// Correct
"nx:hover:bg-primary-hover"
"nx:focus-visible:ring-2"

// Incorrect
"hover:nx:bg-primary-hover"
```

## Token Path Differences

Nexus uses full semantic paths:

| shadcn | Nexus |
|--------|-------|
| `bg-primary` | `nx:bg-primary-background` |
| `bg-secondary` | `nx:bg-secondary-background` |
| `bg-destructive` | `nx:bg-error-background` |
| `text-primary` | `nx:text-primary-foreground` |
| `border-input` | `nx:border-border-default` |

## Component Sizing

shadcn uses fixed heights. Nexus uses padding for flex compatibility:

```tsx
// shadcn
size: {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
}

// Nexus
size: {
  default: "nx:px-4 nx:py-2",
  sm: "nx:px-3 nx:py-1.5 nx:text-xs",
  lg: "nx:px-8 nx:py-3",
}
```

## Required Data Attributes

Nexus requires data attributes on all components:

```tsx
// shadcn (optional)
<button className={cn(buttonVariants({ variant, size }))}>

// Nexus (required)
<button
  data-slot="button"
  data-variant={variant}
  data-size={size}
  className={cn(buttonVariants({ variant, size }))}
>
```

| Attribute | Purpose |
|-----------|---------|
| `data-slot` | Component identification |
| `data-variant` | Current variant for styling hooks |
| `data-size` | Current size for styling hooks |

## Variant Names (Components)

Component variant prop values remain the same as shadcn:

```tsx
// Both shadcn and Nexus use these variant names
variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
```

The `destructive` variant name is kept for API compatibility, but it maps to `error-*` tokens internally.

## When Adapting shadcn Code

1. Add `nx:` prefix to all utility classes
2. Replace token references:
   - `bg-destructive` → `nx:bg-error-background`
   - `text-destructive` → `nx:text-error-foreground`
   - `bg-primary` → `nx:bg-primary-background`
3. Remove fixed heights, use padding
4. Add required data attributes
5. Keep variant prop names unchanged

## When Comparing Figma to Code

If Figma uses `error` in naming:
- Map to `destructive` variant in component API
- Map to `error-*` tokens in styling

If Figma uses `destructive`:
- Clarify with design team (prefer `error` for consistency)
