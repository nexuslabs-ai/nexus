# shadcn/ui Adaptation Guide

> Quick reference for adapting shadcn/ui components to Nexus conventions.
> For detailed rules, see the linked source files.

## Quick Reference

| Category           | shadcn/ui     | Nexus                      | Details In                     |
| ------------------ | ------------- | -------------------------- | ------------------------------ |
| CSS Prefix         | none          | `nx:`                      | [components.md](components.md) |
| Destructive tokens | `destructive` | `error-*`                  | [figma.md](figma.md)           |
| Token structure    | CSS vars      | 3-layer system             | [figma.md](figma.md)           |
| Component sizing   | Fixed heights | Padding-based              | [components.md](components.md) |
| Data attributes    | Optional      | Required                   | [components.md](components.md) |
| Token paths        | `bg-primary`  | `nx:bg-primary-background` | [figma.md](figma.md)           |

## Token Mapping

### Status Colors

shadcn uses `destructive`, Nexus uses semantic `error-*` tokens:

| shadcn                     | Nexus                      |
| -------------------------- | -------------------------- |
| `--destructive`            | `--color-error-background` |
| `--destructive-foreground` | `--color-error-foreground` |

Nexus extends with: `hover`, `active`, `disabled`, `text`, `surface` states.

### Variant Names

Component variant prop values stay the same for API compatibility:

```tsx
// Both use these variant names
variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
```

The `destructive` variant maps to `error-*` tokens internally.

## Adaptation Checklist

When adapting shadcn components:

- [ ] Add `nx:` prefix to all utility classes
- [ ] Replace `bg-destructive` → `nx:bg-error-background`
- [ ] Replace `bg-primary` → `nx:bg-primary-background`
- [ ] Remove fixed heights (`h-10`), use padding instead
- [ ] Add required data attributes (`data-slot`, `data-variant`, `data-size`)
- [ ] Keep variant prop names unchanged

## Figma Comparison

When Figma uses `error` naming → map to `destructive` variant in component API, `error-*` tokens in styling.

## Source Files

| Topic                                       | Authoritative Source           |
| ------------------------------------------- | ------------------------------ |
| Component patterns, sizing, data attributes | [components.md](components.md) |
| Token architecture, Figma mapping           | [figma.md](figma.md)           |
| Token format and naming                     | [tokens.md](tokens.md)         |
