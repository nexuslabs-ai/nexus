# Component Rules

> Architectural guidelines for Nexus React components.
> For token mappings from shadcn/ui, see [shadcn-divergences.md](shadcn-divergences.md).

## Core Principles

| Principle                 | Why                                                              |
| ------------------------- | ---------------------------------------------------------------- |
| **Semantic tokens only**  | Enables theming; primitives are implementation details           |
| **Padding-based sizing**  | Fixed heights break in flex layouts                              |
| **Data attributes**       | Enable CSS hooks for testing, styling, and state inspection      |
| **CVA for enum variants** | Clear variant-to-class mapping; boolean logic stays in component |
| **Named interfaces**      | Self-documenting; enables JSDoc; better IDE experience           |

## File Structure

Every component in `packages/react/src/components/ui/` needs 2 files:

```
{name}.tsx           # Component (kebab-case)
{Name}.stories.tsx   # Stories + Tests (PascalCase, play functions)
```

**No separate `*.test.tsx` files.** Tests are play functions in stories.

## Component Template

This is a minimal template showing required structure. Adapt variants and props to your component's needs.

```tsx
import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const componentVariants = cva(
  // Base classes - nx: prefix BEFORE pseudo-classes
  'nx:inline-flex nx:items-center nx:transition-colors',
  {
    variants: {
      variant: {
        /* enum-style variants */
      },
      size: {
        /* padding-based sizing */
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ComponentProps
  extends
    React.ComponentProps<'element'>,
    VariantProps<typeof componentVariants> {
  asChild?: boolean;
}

function Component({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps) {
  const Comp = asChild ? Slot : 'element';

  return (
    <Comp
      data-slot="component-name"
      data-variant={variant}
      data-size={size}
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Component, type ComponentProps, componentVariants };
```

**Live examples:** See `button.tsx`, `badge.tsx` for full implementations.

## Data Attributes

| Attribute      | Purpose                  | Required?                   |
| -------------- | ------------------------ | --------------------------- |
| `data-slot`    | Component identification | Always                      |
| `data-variant` | Current variant value    | When component has variants |
| `data-size`    | Current size value       | When component has sizes    |

Additional `data-*` attributes are acceptable for component-specific state (e.g., `data-loading`, `data-fill`).

## Props Pattern

### Interface Definition

Define props as a named interface above the function. Extend from:

- `React.ComponentProps<'element'>` for native element props
- `VariantProps<typeof componentVariants>` for CVA-generated variant props

### JSDoc Requirements

All custom props (not inherited) must have JSDoc with:

- Description of what the prop does
- `@default` value if applicable
- `@example` for non-obvious usage

```tsx
interface ComponentProps extends React.ComponentProps<'button'> {
  /**
   * Brief description of what this does.
   * @default false
   */
  customProp?: boolean;
}
```

### Boolean Props

Handle boolean props with ternary operators in component code, not CVA:

```tsx
// In component body, not CVA variants
className={cn(
  componentVariants({ variant, size }),
  isCompact ? 'nx:p-2' : 'nx:p-4',
)}
```

**Why:** Keeps CVA focused on enum-style variants; makes boolean logic explicit.

## Class Naming

### nx: Prefix Rule

All Tailwind utilities must use `nx:` prefix. The prefix comes BEFORE all modifiers (pseudo-classes, arbitrary selectors, responsive prefixes):

| Pattern                                | Correct?            |
| -------------------------------------- | ------------------- |
| `nx:hover:bg-primary-background-hover` | Yes                 |
| `hover:nx:bg-primary-background-hover` | No                  |
| `nx:focus-visible:ring-2`              | Yes                 |
| `nx:[&>svg]:text-foreground`           | Yes                 |
| `[&>svg]:nx:text-foreground`           | No                  |
| `nx:[&_p]:leading-relaxed`             | Yes                 |
| `[&_p]:nx:leading-relaxed`             | No                  |
| `nx:md:flex`                           | Yes                 |
| `md:nx:flex`                           | No                  |
| `bg-primary-background`                | No (missing prefix) |

**Rule:** `nx:` always comes first, then any modifier (pseudo-class, arbitrary selector, responsive), then the utility.

### Semantic Token Paths

Use full semantic token paths, not incomplete or primitive values:

| Pattern                        | Correct? | Notes                           |
| ------------------------------ | -------- | ------------------------------- |
| `nx:bg-primary-background`     | Yes      | Full path                       |
| `nx:bg-primary`                | No       | Incomplete                      |
| `nx:bg-blue-500`               | No       | Primitive color                 |
| `nx:hover:bg-background-hover` | Yes      | Hover state token               |
| `nx:hover:bg-accent`           | No       | `accent` doesn't exist in Nexus |

**Reference:** See `packages/tailwind/nexus.css` for available tokens.

### Adaptive-by-Default Semantic Tokens

Semantic color tokens adapt to theme automatically. Do not write `dark:` modifiers on tokens that already have a semantic name — the underlying CSS variable is already overridden under the `.dark` selector at emit time, so the modifier is a no-op.

| Pattern                         | Correct? | Notes                                                   |
| ------------------------------- | -------- | ------------------------------------------------------- |
| `nx:bg-primary-background`      | Yes      | Semantic token — adapts across light/dark automatically |
| `nx:text-foreground`            | Yes      | Same — `foreground` already carries its dark-mode value |
| `nx:dark:bg-primary-background` | No       | `dark:` is a no-op; the token already adapts            |

**Rule of thumb:** any class referencing a token from [`tokens.md` § Semantic Token Categories](tokens.md#semantic-token-categories) (Layout, Brand, Status, Borders, Navigation, Data viz) adapts — don't add `dark:`. The `dark:` modifier is reserved for raw primitives, which should be rare in component code.

**Primitive edge case.** Raw primitive utilities (`nx:bg-blue-500 nx:dark:bg-blue-900`) _are_ non-adaptive, so `dark:` is the only mechanism for varying them by theme. But primitives in component code are themselves an anti-pattern (see § Semantic Token Paths above), so this case should almost never come up — if you find yourself reaching for one, prefer adding the missing semantic token instead.

See [`tokens.md` § Light/Dark Theme Tokens](tokens.md#lightdark-theme-tokens) for how the `.dark` selector emit makes this work.

## Sizing Convention

Use padding for sizing, not fixed heights:

```tsx
// Padding-based (correct)
size: {
  default: 'nx:px-4 nx:py-2',
  sm: 'nx:px-3 nx:py-1.5',
  lg: 'nx:px-8 nx:py-3',
}

// Fixed heights (avoid)
size: {
  default: 'nx:h-10 nx:px-4',
}
```

**Exceptions:** Avatars, progress bars, modals may need fixed dimensions.

## Export Pattern

Always export component, props type, and variants function:

```tsx
export { Component, type ComponentProps, componentVariants };
```

## Import Order

ESLint auto-sorts, but the expected order is:

1. React
2. External packages (Radix, CVA)
3. Internal aliases (`@/lib/*`)
4. Relative imports

## Compound Variants

Use `compoundVariants` when styling depends on multiple prop combinations (e.g., `variant` + `fill`):

```tsx
compoundVariants: [
  { variant: 'default', fill: 'solid', className: '...' },
  { variant: 'default', fill: 'light', className: '...' },
],
```

**Live example:** See `badge.tsx` for a full compound variants implementation.

## asChild Pattern

The `asChild` prop enables composition via Radix Slot. Include for interactive components:

```tsx
// Renders as button
<Button>Click</Button>

// Renders as anchor with button styles
<Button asChild>
  <a href="/link">Link</a>
</Button>
```

## State Patterns

Components may implement additional state patterns like loading, disabled, or error states. When doing so:

- Combine states appropriately (e.g., `disabled || loading`)
- Include accessibility attributes (`aria-busy`, `aria-disabled`)
- Use `data-*` attributes for styling hooks

**Live example:** See `button.tsx` for loading state implementation.

### Active / press states on container & popover

When a component renders on `container` or `popover` and needs a visible press cue, do **not** rely on `*-active` fill changes — those tokens collapse to the rest shade in dark mode (and in light mode for popover) by design. The press cue lives at the component layer, applied to the `:active` / `[data-state="active"]` selector:

- `nx:active:shadow-inner` — `inset` shadow primitive, additive on top of the existing fill.
- `nx:active:border-border-active` — emphasised border, useful when the component already has a border.

See [`surfaces.md` Rule 6](surfaces.md#rules) and [`surfaces.md` § Known overlaps](surfaces.md#known-overlaps) for why these surfaces don't get a distinct active fill.

## Focus States

Use the design-system focus token with a real `outline` and the tokenised offset (`--focus-offset`, currently `2px`), not Tailwind `ring-*` utilities and not box-shadow:

```
nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)
```

Not every component takes this ring — see [§ Surface exception map](#surface-exception-map) for which component types use the ring, a background-tint `:focus`, or no focus treatment at all.

For invalid fields, wire both an always-on error border and an error-coloured focus ring:

```
nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error
```

Live consumer: `packages/react/src/components/ui/input.tsx`.

### Why outline, not box-shadow

The ring is a real `outline` (not `box-shadow`) for two reasons:

- **WCAG 2.4.7 + technique C40 compliance.** A 2px offset puts the ring on the surface _next to_ the control, so even on a same-coloured fill (primary button on a near-blue canvas) the ring stays legible against the background — without the system needing to detect the surrounding fill.
- **Windows High Contrast Mode survives.** `forced-colors: active` strips backgrounds and box-shadows but preserves outlines. A box-shadow ring disappears entirely under WHCM; an outline ring renders in the user's system focus colour.

### Uniform brand-blue across variants

Every focusable control — primary / secondary / outline / ghost / destructive, Input, Switch, Tabs, Accordion, Select, Dialog close — uses the **same** `focus-default` colour. There is no per-variant focus colour and no destructive→grey swap. Reason: focus is a system signal ("you are here"), not a brand or status signal. One colour reduces the cognitive load and matches the practice of Linear, Stripe, Geist, and Tailwind's own focus convention.

The focus colour is a **dedicated, theme-split blue** (`#1e3a8a` light / `#9dc1ee` dark), tuned to clear APCA Lc ≥ 45 on every shipped surface (background / container / popover) and on nav chrome (nav-background / nav-item-{hover,active} / nav-border) in both themes — even when the surrounding fill is the primary brand colour or a tinted sidebar row. It is not derived from `primary.*`, so swapping the brand palette does not move the focus colour.

### Surface exception map

Not every focusable thing takes the outline ring, and not everything that shows a `:focus` state is a keyboard control. Which treatment a component gets is decided by its **input modality**, not its visual elevation:

| Component type                                                                                                             | Pattern                                                                                                                                   | Rationale                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Interactive controls** — Button, Input, Select trigger, Switch, Tabs trigger, Accordion trigger, Dialog close            | `nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)` — the canonical ring | Keyboard-only ring. The real `outline` survives Windows High Contrast Mode and stays legible on every surface.                                                                                                                                                                   |
| **Error-state inputs**                                                                                                     | the canonical ring **plus** `nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error`                       | Always-on error border + red focus ring signal an invalid value. Live consumer: `input.tsx`.                                                                                                                                                                                     |
| **Menu items** — DropdownMenuItem, SelectItem, and the DropdownMenu checkbox / radio items (Radix roving-focus menu items) | `nx:focus:bg-background-hover nx:focus:text-foreground` — background tint, **no ring**                                                    | Radix roving focus moves DOM focus to the item under the pointer, so `:focus` fires on mouse-hover too. A `:focus-visible` ring would flash for pointer users while giving them no steady indicator — wrong UX. A background tint reads correctly for both keyboard and pointer. |
| **Destructive menu items**                                                                                                 | `nx:focus:bg-error-background nx:focus:text-error-foreground`                                                                             | Same roving-focus tint; the red fill signals a destructive action.                                                                                                                                                                                                               |
| **Non-focusable elevated surfaces** — Card, Dialog body, popover / menu container                                          | none on the surface itself                                                                                                                | The ring lives on focusable children (DialogClose, controls inside a Card), not the container. See [§ No shadow on focusable elements](#no-shadow-on-focusable-elements).                                                                                                        |
| **Canvas / direct-manipulation surfaces** (consumer-built)                                                                 | custom cursor / selection model, no ring                                                                                                  | A direct-manipulation surface already shows position through its cursor and selection; a focus ring would be redundant.                                                                                                                                                          |

The dividing line is modality: anything a keyboard user reaches with Tab gets the ring; anything Radix's roving focus moves to on pointer-hover gets the background tint. The tint pattern is live in `dropdown-menu.tsx` and `select.tsx`.

The `focus-default` colour is a dedicated brand-blue tuned to clear [APCA Lc ≥ 45](tokens.md#apca-contrast-gate) on every surface it lands on — see [§ Uniform brand-blue across variants](#uniform-brand-blue-across-variants) for the per-theme values and the surfaces it was validated against.

### No shadow on focusable elements

Do not add `nx:shadow-*` utilities to focusable elements — the structural separation still holds:

- **Non-focusable elevated surfaces** — Card (`shadow-sm`), Dialog (`shadow-lg`) — keep their elevation. Their focus rings appear on focusable children (DialogClose, controls inside Card), not on the surface itself.
- **Focusable controls** — Input, Switch — do not use shadow elevation. They rely on border/background for visual depth.

## Layering model

Nexus ships a 6-token z-index scale for stacking overlays. The tokens are semantic and theme-agnostic (no `.dark` variants) — stacking order is structural, not appearance-driven.

**Mental model:** shadow communicates _perceived elevation_; z-index controls _actual paint order_. They are independent axes — a higher z-index does not imply a larger shadow, and the elevation shadows in [`surfaces.md`](surfaces.md) never set stacking. Reach for a z-index token only when two positioned layers can overlap.

### Token scale

| CSS variable        | Utility        | Value | Role                                                             | Nexus usage                   |
| ------------------- | -------------- | ----- | ---------------------------------------------------------------- | ----------------------------- |
| `--z-index-overlay` | `nx:z-overlay` | 10    | Low-level backdrops / scrims (e.g. under a non-modal side panel) | reserved — consumer use       |
| `--z-index-sticky`  | `nx:z-sticky`  | 30    | Sticky chrome (headers, toolbars) — above content, below dialogs | reserved — consumer use       |
| `--z-index-modal`   | `nx:z-modal`   | 50    | Modal dialogs and their backdrop                                 | Dialog                        |
| `--z-index-popover` | `nx:z-popover` | 70    | Tooltips, dropdowns, selects, popovers                           | DropdownMenu, Select, Tooltip |
| `--z-index-toast`   | `nx:z-toast`   | 100   | Toasts / notifications                                           | (not yet shipped)             |
| `--z-index-max`     | `nx:z-max`     | 9999  | Host-application system UI (AI agent overlays, debug, a11y)      | reserved — consumer-only      |

The `nx:z-*` utilities are generated on demand by the consumer's Tailwind build from these `--z-index-*` theme keys (Tailwind's `z` utility reads the `--z-index-*` namespace), so all six are usable even though only `nx:z-modal` and `nx:z-popover` are referenced by shipped components.

**Popover sits _above_ modal (70 > 50) by design.** A DropdownMenu, Select, or Tooltip opened _inside_ a Dialog must paint above the dialog to stay usable — so the floating-layer token outranks the modal layer. This is the deliberate, non-obvious ordering; do not "fix" it by dropping popover below modal.

**`nx:z-overlay` is not `nx:bg-overlay`.** `nx:z-overlay` is the stacking token (value 10); `nx:bg-overlay` is the scrim _color_ token (see [`shadcn-divergences.md`](shadcn-divergences.md#overlay-token)). A Dialog backdrop uses both `nx:bg-overlay` (tint) and `nx:z-modal` (stacking) — it rides at the modal layer (50), not the `overlay` layer (10), so it stays grouped with the dialog it dims.

### Radix Portal behaviour

Radix appends portal content to `document.body`. For a **single** overlay open by itself (a Dialog with nothing else floating), z-index is largely redundant — the body-appended node already paints above page content in DOM order. The layer tokens become load-bearing when:

- **Two overlays of different types stack** — a DropdownMenu or Select opened inside a Dialog. `nx:z-popover` (70) keeps the menu above the dialog's `nx:z-modal` (50).
- **A consumer ships a fixed/sticky element** — a navbar or sticky table header competing for stacking. Use `nx:z-sticky` (30): above page content, below modals.
- **A consumer ships custom, non-Radix overlays** that must interleave with Nexus layers.

### Consumer override

The utilities reference the CSS variable (`nx:z-sticky` → `z-index: var(--z-index-sticky)`), so a consumer re-points a whole layer by overriding the variable — no component changes:

```css
/* In the consumer's stylesheet, loaded after Nexus */
:root {
  --z-index-sticky: 35; /* raise the app shell's sticky chrome above the default 30 */
}
```

### Reserved layers

No shipped Nexus component uses these — they exist for the consumer:

- `--z-index-max` (9999) — host-application system UI: AI agent overlays, accessibility tooling, debug surfaces.
- `--z-index-sticky` (30) — consumer-owned fixed/sticky chrome.
- `--z-index-overlay` (10) — low-level scrims/backdrops beneath floating layers (a modal's own backdrop rides at `--z-index-modal`, not this).

### Which layer to use

| Surface                                | Utility        |
| -------------------------------------- | -------------- |
| Popover, Tooltip, DropdownMenu, Select | `nx:z-popover` |
| Modal Dialog                           | `nx:z-modal`   |
| Toast / Sonner-style notification      | `nx:z-toast`   |
| Backdrop / scrim under a side panel    | `nx:z-overlay` |
| Consumer fixed/sticky header           | `nx:z-sticky`  |

## Adding to Exports

After creating a component, add to `src/index.ts`:

```tsx
export * from '@/components/ui/new-component';
```

## Checklist

Before submitting a component:

- [ ] `nx:` prefix on all utility classes
- [ ] Prefix before ALL modifiers (`nx:hover:`, `nx:[&>svg]:`, `nx:md:` — not `hover:nx:`, `[&>svg]:nx:`)
- [ ] Full semantic token paths (not incomplete like `nx:bg-primary`)
- [ ] No `dark:` modifiers on semantic tokens (they adapt automatically)
- [ ] `data-slot` attribute present
- [ ] Padding-based sizing (no fixed heights unless necessary)
- [ ] Named interface with JSDoc for custom props
- [ ] Exports include component, props type, and variants function
- [ ] `asChild` support for interactive components
- [ ] Focus uses `nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)` (not `nx:ring-*`, not `nx:shadow-focus-*`)
