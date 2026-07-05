# shadcn/ui Adaptation Guide

> Comprehensive reference for adapting shadcn/ui components to Nexus conventions.
> This file is the source of truth for token mapping between shadcn and Nexus.

## Quick Reference

| Category           | shadcn/ui             | Nexus                                  |
| ------------------ | --------------------- | -------------------------------------- |
| CSS Prefix         | none                  | `nx:`                                  |
| Token path         | `bg-primary`          | `nx:bg-primary-background`             |
| Destructive naming | `destructive`         | `error`                                |
| Hover states       | `hover:bg-primary/90` | `nx:hover:bg-primary-background-hover` |
| Accent (hover)     | `hover:bg-accent`     | `nx:hover:bg-background-hover`         |
| Card/container     | `bg-card`             | `nx:bg-container`                      |
| Border input       | `border-input`        | `nx:border-border-default`             |
| Focus ring         | `ring-ring`           | `nx:outline-focus-default`             |
| Overlay            | `bg-black/80`         | `nx:bg-overlay`                        |
| Data attributes    | Optional              | Required                               |

## Token Architecture

Nexus uses a 3-layer token system:

```
Primitives (--nx-*)  →  Semantic (--color-*)  →  Tailwind (nx:bg-*)
```

shadcn references tokens directly. Nexus adds explicit suffixes for clarity:

| shadcn Pattern | Nexus Pattern                                            | Suffix Added     |
| -------------- | -------------------------------------------------------- | ---------------- |
| `primary`      | `primary-background`                                     | `-background`    |
| `secondary`    | `secondary-background`                                   | `-background`    |
| `destructive`  | `error-background`                                       | `-background`    |
| `accent`       | `background-hover` / `popover-hover` / `container-hover` | context-specific |
| `card`         | `container`                                              | renamed          |

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

| shadcn                   | Nexus                          | Notes                                                   |
| ------------------------ | ------------------------------ | ------------------------------------------------------- |
| `bg-accent`              | `nx:bg-background-hover`       | Use `-hover` variant of container                       |
| `text-accent-foreground` | `nx:text-foreground`           | Use standard foreground                                 |
| `hover:bg-accent`        | `nx:hover:bg-background-hover` | Or `container-hover` / `popover-hover` based on surface |

**Context-specific mapping:**

| Context              | shadcn            | Nexus                          |
| -------------------- | ----------------- | ------------------------------ |
| Ghost button hover   | `hover:bg-accent` | `nx:hover:bg-background-hover` |
| Dropdown item hover  | `hover:bg-accent` | `nx:hover:bg-popover-hover`    |
| List item hover      | `hover:bg-accent` | `nx:hover:bg-container-hover`  |
| Neutral control rail | `bg-accent`       | `nx:bg-control-background`     |
| General subtle hover | `bg-accent`       | `nx:bg-background-hover`       |

### Muted Colors

| shadcn                  | Nexus                             | Notes                                                                                                                                                                             |
| ----------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bg-muted`              | `nx:bg-muted`                     | Same                                                                                                                                                                              |
| `text-muted-foreground` | `nx:text-muted-foreground`        | Same                                                                                                                                                                              |
| —                       | `nx:text-muted-foreground-subtle` | Nexus tertiary text tier (below `muted-foreground`). Paired with `muted` surface. Light mode adds a real third tier; dark mode collapses to the same shade as `muted-foreground`. |

Use `nx:bg-control-background` / `nx:hover:bg-control-background-hover`
instead of `muted` for interactive neutral rails, tracks, and selected toggle
fills. Keep `muted` for passive low-emphasis surfaces.

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

### Navigation (Nexus-Only)

shadcn 2024+ ships a `sidebar-*` namespace; Nexus uses `nav-*` for the equivalent fixed chrome (sidebar, topbar). Nav is treated as one namespace — `nav-border` is flat (not nested under `border.*`) so the tokens travel as a unit.

| Token                          | CSS Variable                   |
| ------------------------------ | ------------------------------ |
| `nx:bg-nav-background`         | `--color-nav-background`       |
| `nx:text-nav-foreground`       | `--color-nav-foreground`       |
| `nx:text-nav-muted-foreground` | `--color-nav-muted-foreground` |
| `nx:hover:bg-nav-item-hover`   | `--color-nav-item-hover`       |
| `nx:active:bg-nav-item-active` | `--color-nav-item-active`      |
| `nx:border-nav-border`         | `--color-nav-border`           |

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

| shadcn                   | Nexus                                              | Notes                                                          |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------- |
| `ring-ring`              | `nx:outline-focus-default`                         | Focus halo colour hook (current primary accent)                |
| `ring-offset-background` | `nx:focus-visible:outline-offset-(--focus-offset)` | Forced-colors outline offset (tokenised `--focus-offset`, 2px) |
| `focus-visible:ring-2`   | `nx:focus-visible:outline-2`                       | Forced-colors outline width                                    |
| —                        | `nx:focus-visible:outline-focus-error`             | Error halo colour hook (invalid inputs)                        |

**Example transformation:**

```tsx
// shadcn
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

// Nexus (uniform primary-accent focus halo)
'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)';
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

Use [components.md § Sizing Convention](components.md#sizing-convention) for
surfaces with an explicit sizing contract. The examples below are translations
for listed surfaces, not general defaults for every adapted component.

| shadcn             | Nexus                       | Applies to                                 |
| ------------------ | --------------------------- | ------------------------------------------ |
| `h-10 px-4 py-2`   | `nx:h-10 nx:px-3 nx:py-0`   | Default `Button`, `Input`, `SelectTrigger` |
| `h-9 px-3`         | `nx:h-8 nx:px-2.5 nx:py-0`  | Compact `Button` and `Input`               |
| `h-11 px-8`        | `nx:h-12 nx:px-3.5 nx:py-0` | Large `Button` and `Input`                 |
| `h-10 w-10` (icon) | `nx:size-10 nx:p-0`         | Default icon-only `Button`                 |

For any adapted component not listed there, do not copy a row by analogy.
Inspect the component, choose the contract explicitly, and update the table in
the same PR.

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

- [ ] Match sizing to `components.md` § Sizing Convention; add a row there before introducing a new sizing contract
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
| Token architecture  | `packages/core/README.md`         |
| Token format        | `packages/core/README.md`         |
| Actual token values | `packages/tailwind/nexus.css`     |
| Primitive values    | `packages/tailwind/variables.css` |
