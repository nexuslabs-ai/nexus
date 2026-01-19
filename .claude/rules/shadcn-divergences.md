# shadcn/ui Adaptation Guide

> Comprehensive reference for adapting shadcn/ui components to Nexus conventions.
> This file is the source of truth for token mapping between shadcn and Nexus.

## Quick Reference

| Category           | shadcn/ui              | Nexus                                  |
| ------------------ | ---------------------- | -------------------------------------- |
| CSS Prefix         | none                   | `nx:`                                  |
| Token path         | `bg-primary`           | `nx:bg-primary-background`             |
| Destructive naming | `destructive`          | `error`                                |
| Hover states       | `hover:bg-primary/90`  | `nx:hover:bg-primary-background-hover` |
| Accent (hover)     | `hover:bg-accent`      | `nx:hover:bg-background-hover`         |
| Card/container     | `bg-card`              | `nx:bg-container`                      |
| Border input       | `border-input`         | `nx:border-border-default`             |
| Focus ring         | `ring-ring`            | `nx:shadow-focus-default`              |
| Overlay            | `bg-black/80`          | `nx:bg-overlay`                        |
| Component sizing   | Fixed heights (`h-10`) | Padding-based (`px-4 py-2`)            |
| Data attributes    | Optional               | Required                               |

## Token Architecture

Nexus uses a 3-layer token system:

```
Primitives (--nx-*)  →  Semantic (--color-*)  →  Tailwind (nx:bg-*)
```

shadcn references tokens directly. Nexus adds explicit suffixes for clarity:

| shadcn Pattern | Nexus Pattern                 | Suffix Added  |
| -------------- | ----------------------------- | ------------- |
| `primary`      | `primary-background`          | `-background` |
| `secondary`    | `secondary-background`        | `-background` |
| `destructive`  | `error-background`            | `-background` |
| `accent`       | `muted` or `background-hover` | varies        |
| `card`         | `container`                   | renamed       |

---

## Color Token Mapping

### Primary Colors

| shadcn                      | Nexus                                    | Notes                  |
| --------------------------- | ---------------------------------------- | ---------------------- |
| `bg-primary`                | `nx:bg-primary-background`               | Explicit `-background` |
| `text-primary-foreground`   | `nx:text-primary-foreground`             | Same                   |
| `hover:bg-primary/90`       | `nx:hover:bg-primary-background-hover`   | Semantic token         |
| —                           | `nx:active:bg-primary-background-active` | Nexus adds active      |
| —                           | `nx:bg-primary-disabled`                 | Nexus adds disabled    |
| `text-primary` (link color) | `nx:text-primary-subtle-foreground`      | For link text color    |

### Secondary Colors

| shadcn                      | Nexus                                      | Notes                  |
| --------------------------- | ------------------------------------------ | ---------------------- |
| `bg-secondary`              | `nx:bg-secondary-background`               | Explicit `-background` |
| `text-secondary-foreground` | `nx:text-secondary-foreground`             | Same                   |
| `hover:bg-secondary/80`     | `nx:hover:bg-secondary-background-hover`   | Semantic token         |
| —                           | `nx:active:bg-secondary-background-active` | Nexus adds active      |
| —                           | `nx:bg-secondary-disabled`                 | Nexus adds disabled    |

### Destructive → Error

shadcn uses `destructive`, Nexus uses `error`:

| shadcn                        | Nexus                                  | Notes               |
| ----------------------------- | -------------------------------------- | ------------------- |
| `bg-destructive`              | `nx:bg-error-background`               | Renamed to `error`  |
| `text-destructive-foreground` | `nx:text-error-foreground`             | Renamed             |
| `hover:bg-destructive/90`     | `nx:hover:bg-error-background-hover`   | Semantic token      |
| `border-destructive/50`       | `nx:border-border-error`               | Border variant      |
| —                             | `nx:active:bg-error-background-active` | Nexus adds active   |
| —                             | `nx:bg-error-disabled`                 | Nexus adds disabled |

**Important:** The variant prop value remains `destructive` for API compatibility:

```tsx
// Component API stays the same
<Button variant="destructive">Delete</Button>;

// Internal styling uses error-* tokens
('nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-background-hover');
```

### Accent Colors (Removed in Nexus)

**Important:** Nexus does NOT have `accent` tokens. shadcn uses `accent` primarily for hover states, so map to the appropriate `-hover` token based on context.

| shadcn                   | Nexus                          | Notes                              |
| ------------------------ | ------------------------------ | ---------------------------------- |
| `bg-accent`              | `nx:bg-background-hover`       | Use `-hover` variant of container  |
| `text-accent-foreground` | `nx:text-foreground`           | Use standard foreground            |
| `hover:bg-accent`        | `nx:hover:bg-background-hover` | Or `container-hover`, `muted` etc. |

**Context-specific mapping:**

| Context              | shadcn            | Nexus                          |
| -------------------- | ----------------- | ------------------------------ |
| Ghost button hover   | `hover:bg-accent` | `nx:hover:bg-background-hover` |
| Dropdown item hover  | `hover:bg-accent` | `nx:hover:bg-popover-hover`    |
| List item hover      | `hover:bg-accent` | `nx:hover:bg-container-hover`  |
| General subtle hover | `bg-accent`       | `nx:bg-muted`                  |

### Muted Colors

| shadcn                  | Nexus                            | Notes              |
| ----------------------- | -------------------------------- | ------------------ |
| `bg-muted`              | `nx:bg-muted`                    | Same               |
| `text-muted-foreground` | `nx:text-muted-foreground`       | Same               |
| —                       | `nx:bg-muted-light`              | Nexus adds lighter |
| —                       | `nx:text-muted-light-foreground` | Nexus adds lighter |

### Layout Colors

| shadcn            | Nexus                            | Notes                    |
| ----------------- | -------------------------------- | ------------------------ |
| `bg-background`   | `nx:bg-background`               | Same                     |
| `text-foreground` | `nx:text-foreground`             | Same                     |
| —                 | `nx:hover:bg-background-hover`   | Nexus adds hover         |
| —                 | `nx:active:bg-background-active` | Nexus adds active        |
| —                 | `nx:bg-disabled`                 | Nexus adds disabled bg   |
| —                 | `nx:text-disabled-foreground`    | Nexus adds disabled text |

### Card → Container

| shadcn                 | Nexus                           | Notes             |
| ---------------------- | ------------------------------- | ----------------- |
| `bg-card`              | `nx:bg-container`               | Renamed           |
| `text-card-foreground` | `nx:text-container-foreground`  | Renamed           |
| —                      | `nx:hover:bg-container-hover`   | Nexus adds hover  |
| —                      | `nx:active:bg-container-active` | Nexus adds active |

### Popover Colors

| shadcn                    | Nexus                         | Notes             |
| ------------------------- | ----------------------------- | ----------------- |
| `bg-popover`              | `nx:bg-popover`               | Same              |
| `text-popover-foreground` | `nx:text-popover-foreground`  | Same              |
| —                         | `nx:hover:bg-popover-hover`   | Nexus adds hover  |
| —                         | `nx:active:bg-popover-active` | Nexus adds active |

---

## Hover/Active State Patterns

**Key Divergence:** shadcn uses opacity modifiers, Nexus uses semantic tokens.

| shadcn Pattern            | Nexus Pattern                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `hover:bg-primary/90`     | `nx:hover:bg-primary-background-hover`                                                  |
| `hover:bg-primary/80`     | `nx:hover:bg-primary-background-hover`                                                  |
| `hover:bg-secondary/80`   | `nx:hover:bg-secondary-background-hover`                                                |
| `hover:bg-destructive/90` | `nx:hover:bg-error-background-hover`                                                    |
| `hover:bg-accent`         | `nx:hover:bg-background-hover` (or `container-hover`, `popover-hover` based on context) |

**Active states** (Nexus adds these, shadcn doesn't have them):

| Nexus Token                                | Use Case                    |
| ------------------------------------------ | --------------------------- |
| `nx:active:bg-primary-background-active`   | Pressed state for primary   |
| `nx:active:bg-secondary-background-active` | Pressed state for secondary |
| `nx:active:bg-error-background-active`     | Pressed state for error     |

---

## Subtle Variants (Nexus-Only)

Nexus provides subtle (soft/light) variants not available in shadcn:

| Token                       | Use Case                 |
| --------------------------- | ------------------------ |
| `primary-subtle`            | Light primary background |
| `primary-subtle-foreground` | Text on subtle primary   |
| `primary-subtle-hover`      | Hover state for subtle   |
| `primary-subtle-active`     | Active state for subtle  |

Available for all status colors:

- `primary-subtle-*`
- `secondary-subtle-*`
- `error-subtle-*`
- `success-subtle-*`
- `warning-subtle-*`
- `information-subtle-*`

**Example usage:**

```tsx
// Soft/outline button variant using subtle tokens
'nx:bg-primary-subtle nx:text-primary-subtle-foreground nx:hover:bg-primary-subtle-hover';
```

---

## Additional Status Colors (Nexus-Only)

Nexus provides status colors beyond shadcn's destructive:

### Success

| Token                                  | CSS Variable                       |
| -------------------------------------- | ---------------------------------- |
| `nx:bg-success-background`             | `--color-success-background`       |
| `nx:text-success-foreground`           | `--color-success-foreground`       |
| `nx:hover:bg-success-background-hover` | `--color-success-background-hover` |
| `nx:bg-success-subtle`                 | `--color-success-subtle`           |

### Warning

| Token                                  | CSS Variable                       |
| -------------------------------------- | ---------------------------------- |
| `nx:bg-warning-background`             | `--color-warning-background`       |
| `nx:text-warning-foreground`           | `--color-warning-foreground`       |
| `nx:hover:bg-warning-background-hover` | `--color-warning-background-hover` |
| `nx:bg-warning-subtle`                 | `--color-warning-subtle`           |

### Information

| Token                                      | CSS Variable                           |
| ------------------------------------------ | -------------------------------------- |
| `nx:bg-information-background`             | `--color-information-background`       |
| `nx:text-information-foreground`           | `--color-information-foreground`       |
| `nx:hover:bg-information-background-hover` | `--color-information-background-hover` |
| `nx:bg-information-subtle`                 | `--color-information-subtle`           |

---

## Border Tokens

| shadcn               | Nexus                          | Notes                 |
| -------------------- | ------------------------------ | --------------------- |
| `border-input`       | `nx:border-border-default`     | Default border        |
| `border`             | `nx:border-border-default`     | Same                  |
| `border-destructive` | `nx:border-border-error`       | Error border          |
| —                    | `nx:border-border-active`      | Active/focus border   |
| —                    | `nx:border-border-disabled`    | Disabled border       |
| —                    | `nx:border-border-primary`     | Primary accent border |
| —                    | `nx:border-border-success`     | Success border        |
| —                    | `nx:border-border-warning`     | Warning border        |
| —                    | `nx:border-border-information` | Information border    |

---

## Focus Ring Tokens

| shadcn                   | Nexus                                   | Notes             |
| ------------------------ | --------------------------------------- | ----------------- |
| `ring-ring`              | `nx:shadow-focus-default`               | Focus shadow      |
| `ring-offset-background` | (handled by shadow)                     | Built into shadow |
| `focus-visible:ring-2`   | `nx:focus-visible:shadow-focus-default` | Shadow-based      |
| —                        | `nx:shadow-focus-error`                 | Error focus ring  |

**Example transformation:**

```tsx
// shadcn
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

// Nexus
'nx:focus-visible:outline-none nx:focus-visible:ring-2 nx:focus-visible:ring-primary-background/50 nx:focus-visible:ring-offset-2';
```

---

## Overlay Token

| shadcn        | Nexus           | Notes                       |
| ------------- | --------------- | --------------------------- |
| `bg-black/80` | `nx:bg-overlay` | Semantic token with opacity |

The Nexus `overlay` token has built-in opacity appropriate for modal overlays.

---

## Component Conventions

### Sizing

| shadcn             | Nexus               | Notes                |
| ------------------ | ------------------- | -------------------- |
| `h-10 px-4 py-2`   | `nx:px-4 nx:py-2`   | Remove fixed heights |
| `h-9 px-3`         | `nx:px-3 nx:py-1.5` | Padding-based        |
| `h-11 px-8`        | `nx:px-8 nx:py-3`   | Padding-based        |
| `h-10 w-10` (icon) | `nx:p-2.5`          | Square padding       |

**Why:** Fixed heights break in flex layouts. Padding-based sizing is more robust.

### Data Attributes (Required)

Nexus components must include:

```tsx
data-slot="button"        // Component identification
data-variant={variant}    // Current variant value
data-size={size}          // Current size value
```

### Typography

| shadcn                   | Nexus                          |
| ------------------------ | ------------------------------ |
| `text-sm font-medium`    | `nx:typography-label-default`  |
| `text-xs font-medium`    | `nx:typography-label-small`    |
| `text-sm`                | `nx:typography-body-small`     |
| `text-base`              | `nx:typography-body-default`   |
| `text-2xl font-semibold` | `nx:typography-heading-medium` |

---

## Complete Adaptation Checklist

When adapting shadcn components:

### Prefix & Naming

- [ ] Add `nx:` prefix to ALL utility classes
- [ ] Prefix comes BEFORE pseudo-classes: `nx:hover:bg-*` (not `hover:nx:bg-*`)

### Color Tokens

- [ ] `bg-primary` → `nx:bg-primary-background`
- [ ] `bg-secondary` → `nx:bg-secondary-background`
- [ ] `bg-destructive` → `nx:bg-error-background`
- [ ] `bg-card` → `nx:bg-container`
- [ ] `border-input` → `nx:border-border-default`
- [ ] `bg-black/80` → `nx:bg-overlay`

### Hover States

- [ ] `hover:bg-primary/90` → `nx:hover:bg-primary-background-hover`
- [ ] `hover:bg-secondary/80` → `nx:hover:bg-secondary-background-hover`
- [ ] `hover:bg-destructive/90` → `nx:hover:bg-error-background-hover`
- [ ] `hover:bg-accent` → `nx:hover:bg-background-hover` (or `container-hover`, `popover-hover` based on context)

### Component Structure

- [ ] Remove fixed heights (`h-10`, `h-9`, `h-11`), use padding
- [ ] Add `data-slot`, `data-variant`, `data-size` attributes
- [ ] Keep variant prop names unchanged (`destructive` not `error`)

### Typography

- [ ] Replace raw font classes with `nx:typography-*` utilities

---

## Figma ↔ Code Mapping

In Figma designs:

- Designers use `error` naming for destructive elements
- Map to `destructive` variant in component API
- Use `error-*` tokens in internal styling

| Figma Token          | Component Prop          | CSS Token            |
| -------------------- | ----------------------- | -------------------- |
| `error/background`   | `variant="destructive"` | `error-background`   |
| `success/background` | (custom variant)        | `success-background` |
| `warning/background` | (custom variant)        | `warning-background` |

---

## Source Files

| Topic               | Authoritative Source              |
| ------------------- | --------------------------------- |
| Component patterns  | [components.md](components.md)    |
| Token architecture  | [figma.md](figma.md)              |
| Token format        | [tokens.md](tokens.md)            |
| Actual token values | `packages/tailwind/nexus.css`     |
| Primitive values    | `packages/tailwind/variables.css` |
