# Component Rules

> Architectural guidelines for Nexus React components.
> For token mappings from shadcn/ui, see [shadcn-divergences.md](shadcn-divergences.md).
> For the Tier-A completion bar, see [polish.md](polish.md).

## Core Principles

| Principle                 | Why                                                              |
| ------------------------- | ---------------------------------------------------------------- |
| **Semantic tokens only**  | Enables theming; primitives are implementation details           |
| **Data attributes**       | Enable CSS hooks for testing, styling, and state inspection      |
| **CVA for enum variants** | Clear variant-to-class mapping; boolean logic stays in component |
| **Named interfaces**      | Self-documenting; enables JSDoc; better IDE experience           |

## File Structure

Each component under `packages/react/src/components/` lives in its own
kebab-case folder holding the component, its stories, and a barrel:

```
{name}/
├── {name}.tsx          # Component (kebab-case)
├── {Name}.stories.tsx  # Stories + Tests (PascalCase, play functions)
└── index.ts            # Barrel: export * from './{name}'
```

The folder is kebab-case (`dropdown-menu/`); the stories file stays PascalCase
(`DropdownMenu.stories.tsx`). The per-folder `index.ts` is what keeps every
import site stable — `@/components/{name}` resolves to the folder barrel, so
`src/index.ts` and cross-component imports never reference the nested file.

**No separate `*.test.tsx` files.** Tests are play functions in stories.

## Component Template

Structure: `cva()` for enum variants; a named `ComponentProps` interface extending `React.ComponentProps<'element'>` + `VariantProps<typeof componentVariants>`; `asChild` via Radix `Slot`; `data-slot` / `data-variant` / `data-size` attributes; `cn()` to merge `className`. Export the component, its props type, and its `cva` variants function, re-export them from the folder's `index.ts` (`export * from './{name}'`), then add the barrel `export * from '@/components/{name}'` to `src/index.ts`. See `button/button.tsx` and `badge/badge.tsx` for the canonical implementations.

## Data Attributes

`data-slot` is always set (component identification); `data-variant` / `data-size` are set when the component has those props. Additional `data-*` (e.g. `data-loading`, `data-fill`) are fine for component-specific state. These are the CSS / test / state-inspection hooks.

## Props Pattern

Define props as a named interface above the function, extending `React.ComponentProps<'element'>` and/or `VariantProps<typeof componentVariants>`. Custom (non-inherited) props get JSDoc with a description, `@default`, and an `@example` for non-obvious usage. Handle boolean props with ternaries in the component body, **not** CVA variants — keeps CVA focused on enum-style variants and makes the boolean logic explicit.

## Class Naming

### nx: Prefix Rule

All Tailwind utilities use the `nx:` prefix, and it comes BEFORE every modifier — pseudo-class, arbitrary selector, or responsive prefix. So `nx:hover:bg-primary-background-hover`, `nx:[&>svg]:text-foreground`, `nx:md:flex` — never `hover:nx:…`, `[&>svg]:nx:…`, `md:nx:…`, and never an unprefixed utility (`bg-primary-background`).

### Semantic Token Paths

Use full semantic token paths, never incomplete or primitive ones: `nx:bg-primary-background` (not `nx:bg-primary`, not the primitive `nx:bg-blue-500`). There is no `accent` token in Nexus. See `packages/tailwind/nexus.css` for the available tokens.

### Adaptive-by-Default Semantic Tokens

Semantic color tokens adapt to theme automatically. Do not write `dark:` modifiers on tokens that already have a semantic name — the underlying CSS variable is already overridden under the `.dark` selector at emit time, so the modifier is a no-op.

| Pattern                         | Correct? | Notes                                                   |
| ------------------------------- | -------- | ------------------------------------------------------- |
| `nx:bg-primary-background`      | Yes      | Semantic token — adapts across light/dark automatically |
| `nx:text-foreground`            | Yes      | Same — `foreground` already carries its dark-mode value |
| `nx:dark:bg-primary-background` | No       | `dark:` is a no-op; the token already adapts            |

**Rule of thumb:** any class referencing a semantic colour token (Layout, Control, Brand, Status, Borders, Navigation, Focus, Data viz) adapts — don't add `dark:`. The `dark:` modifier is reserved for raw primitives, which should be rare in component code.

**Primitive edge case.** Raw primitive utilities (`nx:bg-blue-500 nx:dark:bg-blue-900`) _are_ non-adaptive, so `dark:` is the only mechanism for varying them by theme. But primitives in component code are themselves an anti-pattern (see § Semantic Token Paths above), so this case should almost never come up — if you find yourself reaching for one, prefer adding the missing semantic token instead.

## Sizing Convention

This table records component surfaces with an explicit sizing contract. It is
not a complete component inventory. For an unlisted component or surface,
inspect its source and define or update its contract in the same PR before
changing sizing.

| Component surface             | Visual box                                                                                                                                        | Inline spacing                                                                         | Width contract                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `Button` text sizes           | `sm/default/lg`: `nx:h-8` / `nx:h-10` / `nx:h-12`                                                                                                 | `nx:px-2.5` / `nx:px-3` / `nx:px-3.5`, `nx:gap-1`                                      | Content-width; no base `min-w-*` floor                                        |
| `Button` icon sizes           | `icon-sm/icon/icon-lg`: `nx:size-8` / `nx:size-10` / `nx:size-12`                                                                                 | `nx:p-0`, `nx:gap-0`                                                                   | Square visual box                                                             |
| `Input`                       | `sm/default/lg`: `nx:h-8` / `nx:h-10` / `nx:h-12`                                                                                                 | `nx:px-2.5` / `nx:px-3` / `nx:px-3.5`, `nx:py-0`                                       | Layout-controlled `nx:w-full`                                                 |
| `SelectTrigger`               | default only: `nx:h-10`                                                                                                                           | `nx:px-3`, `nx:py-0`, `nx:gap-2`                                                       | Layout-controlled `nx:w-full`                                                 |
| `ButtonGroupText`             | `sm/default/lg`: `nx:h-8` / `nx:h-10` / `nx:h-12`                                                                                                 | `nx:px-2.5` / `nx:px-3` / `nx:px-3.5`, `nx:gap-2`                                      | Content-width addon                                                           |
| `Button` inside `ButtonGroup` | Inherits the `Button` row through `ButtonGroupSizeContext`                                                                                        | Inherits the `Button` row                                                              | Same as the `Button` row                                                      |
| `Textarea`                    | `nx:min-h-16`                                                                                                                                     | `nx:px-3`, `nx:py-2`                                                                   | Layout-controlled `nx:w-full`; rows may expand                                |
| `Slider`                      | root `nx:h-8`; rail `standard`: `nx:h-4` / `nx:w-4`, `comfortable`: `nx:h-8` / `nx:w-8`; thumb hit box `nx:size-5` with slim caret pseudo-element | rail inset `nx:p-0.5`; coarse pointer thumb overlay `nx:pointer-coarse:after:-inset-3` | Layout-controlled `nx:w-full`; vertical uses parent height with `nx:min-h-44` |

Button minimum widths are intentionally not part of the base variant contract.
If a future product surface needs a minimum labeled action width, add a
component-specific class or API at that surface so the width cannot leak onto
icon-only or composed Buttons.

**Touch targets (mobile-first):** interactive components must clear a **~44px
minimum tap-target**. A visual box may be denser on pointer-fine surfaces; for
touch, use padding where it fits or a coarse-pointer hit-area overlay such as an
`::after` inset. See [responsive.md § Touch targets](responsive.md#touch-targets).

## Responsive behaviour

Component-internal responsive behaviour should use `@container` queries, not viewport breakpoints — a component adapts to its parent's width, not the viewport, so it renders consistently whether it lands in a sidebar or a hero. Viewport prefixes (`nx:lg:`, etc.) are reserved for page-shell decisions; full-viewport overlays (e.g. Dialog) are the documented exception, since their trigger is position relative to the viewport.

See [responsive.md](responsive.md) for the decision tree, the display-class table, and the `<Show>` / `<Hide>` primitives.

## Compound Variants

Use `compoundVariants` when styling depends on multiple prop combinations (e.g. `variant` + `fill`). Live example: `badge.tsx`.

## asChild Pattern

The `asChild` prop enables composition via Radix `Slot` — include it for interactive components so a `<Button asChild>` can render an `<a href>` with button styles. Live example: `button.tsx`.

## State Patterns

Components may implement additional state patterns like loading, disabled, or error states. When doing so:

- Combine states appropriately (e.g., `disabled || loading`)
- Include accessibility attributes (`aria-busy`, `aria-disabled`)
- Use `data-*` attributes for styling hooks

**Live example:** See `button.tsx` for loading state implementation.

### Active / press states on container & popover

No shipped component needs this yet — it's the rule for the first one that does, not a pattern to retrofit. When a component renders on `container` or `popover` and needs a visible press cue, do **not** rely on `*-active` fill changes — those tokens collapse to the rest shade in dark mode (and in light mode for popover) by design. Apply the press cue at the component layer, on the `:active` / `[data-state="active"]` selector:

- `nx:active:shadow-inner` — `inset` shadow primitive, additive on top of the existing fill.
- `nx:active:border-border-active` — emphasised border, useful when the component already has a border.

## Focus States

Use the design-system focus token with the canonical outline utilities and the tokenised offset (`--focus-offset`, currently `2px`). The generated theme turns those utilities into a hard focus treatment in normal rendering and keeps the real outline as the forced-colors fallback:

```
nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)
```

Not every component takes this ring — see [§ Surface exception map](#surface-exception-map) for which component types use the ring, a background-tint `:focus`, or no focus treatment at all.

For invalid fields, wire both an always-on error border and an error-coloured focus treatment:

```
nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error
```

Live consumer: `packages/react/src/components/input/input.tsx`.

### Why outline utilities plus focus CSS

The component API stays outline-based even though normal rendering uses box-shadow paint:

- **One component contract.** Components keep using `outline-focus-default` / `outline-focus-error`, so the design-system CSS can change the look globally without per-component rewrites.
- **Windows High Contrast Mode survives.** `forced-colors: active` strips box-shadows, so the generated CSS restores the outline in the user's system focus colour.
- **Notion-style focus.** Inputs, textareas, selects, OTP slots, and input groups use their own 2px focused border as the focus edge, with no extra outside edge. Buttons get a 2px surface gap plus a 2px outer primary ring. Other keyboard-focusable controls get a hard 2px primary ring.

### Uniform primary focus across variants

Every focusable control — primary / secondary / outline / ghost / destructive, Input, Switch, Tabs, Accordion, Select, Dialog close — uses the **same** `focus-default` colour. There is no per-variant focus colour and no destructive→grey swap. Reason: focus is a system signal ("you are here"), not a per-control variant or status signal. One colour reduces the cognitive load and matches the practice of Linear, Stripe, Geist, and Tailwind's own focus convention.

The default focus colour is the active `primary.subtle-foreground` token. It follows the selected brand / runtime appearance while staying behind the stable `focus-default` utility, so component code does not need brand-specific focus classes. Error-state focus remains separate and uses `focus-error`.

### Surface exception map

Not every focusable thing takes the outline ring, and not everything that shows a `:focus` state is a keyboard control. Which treatment a component gets is decided by its **input modality**, not its visual elevation:

| Component type                                                                                                                               | Pattern                                                                                                                                      | Rationale                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Interactive controls** — Button, Input, Select trigger, Switch, Tabs trigger, Accordion trigger, Dialog close                              | the canonical ring — see [§ Focus States](#focus-states)                                                                                     | Keyboard-only ring. The real `outline` survives Windows High Contrast Mode and stays legible on every surface.                                                                                                                                                                                                        |
| **Error-state inputs**                                                                                                                       | the canonical ring **plus** the `aria-invalid` error border + ring (see [§ Focus States](#focus-states))                                     | Always-on error border + red focus ring signal an invalid value. Live consumer: `input.tsx`.                                                                                                                                                                                                                          |
| **Menu / overlay rows** — DropdownMenuItem, ContextMenuItem, Menubar overlay items, SelectItem, CommandItem, and NavigationMenu flyout links | `nx:focus:bg-popover-hover nx:focus:text-popover-foreground` or the component's selected/open equivalent — popover-surface tint, **no ring** | Radix roving focus moves DOM focus to the item under the pointer, so `:focus` fires on mouse-hover too. A `:focus-visible` ring would flash for pointer users while giving them no steady indicator — wrong UX. The tint stays within the elevated popover surface and reads correctly for both keyboard and pointer. |
| **Destructive menu items**                                                                                                                   | `nx:focus:bg-error-background nx:focus:text-error-foreground`                                                                                | Same roving-focus tint; the red fill signals a destructive action.                                                                                                                                                                                                                                                    |
| **Non-focusable elevated surfaces** — Card, Dialog body, popover / menu container                                                            | none on the surface itself                                                                                                                   | The ring lives on focusable children (DialogClose, controls inside a Card), not the container. See [§ No shadow on focusable elements](#no-shadow-on-focusable-elements).                                                                                                                                             |
| **Canvas / direct-manipulation surfaces** (consumer-built)                                                                                   | custom cursor / selection model, no ring                                                                                                     | A direct-manipulation surface already shows position through its cursor and selection; a focus ring would be redundant.                                                                                                                                                                                               |

The dividing line is modality and surface: anything a keyboard user reaches with Tab gets the ring; anything Radix's roving focus moves to on pointer-hover gets a background tint from the surface it lives on. Overlay rows use `popover-hover`; ordinary page controls use `background-hover`.

### Popover / menu surface policy

Popover-layer containers — Popover, DropdownMenu, ContextMenu, HoverCard, Menubar floating content, NavigationMenu flyouts, Select content, and equivalent first-party floating surfaces — use the shared translucent + blurred recipe by default: `popoverSurfaceClassName` (`nx:bg-popover-alpha` at `a700`, `nx:backdrop-blur-lg`, `nx:text-popover-foreground`, `nx:border-border-default`, `nx:shadow-lg`, rounded radius). The conservative alpha is guarded by the worst-case APCA test in `packages/core/src/lib/derive-theme.test.ts`, and `tone-parity.test.ts` keeps the static token JSON and runtime `deriveTheme` value in step.

Tooltip is the exception: it uses `tooltipSurfaceClassName` (`nx:bg-popover`, no blur) because its small, brief text appears over arbitrary page content. Under `prefers-reduced-transparency: reduce`, translucent popover-family surfaces revert to the solid `nx:bg-popover` fill. Row hover/active states stay solid `popover-hover` / `popover-active`; `audit:contrast` remains a solid-surface regression check, while translucent readability is proven by the APCA gate and the Storybook comparison story.

### No shadow on focusable elements

Do not add `nx:shadow-*` utilities to focusable elements — the structural separation still holds:

- **Non-focusable elevated surfaces** — Card (`shadow-sm`), Dialog (`shadow-lg`) — keep their elevation. Their focus rings appear on focusable children (DialogClose, controls inside Card), not on the surface itself.
- **Focusable controls** — Input, Switch — do not use shadow elevation. They rely on border/background for visual depth.

## Layering model

Nexus ships a 6-token z-index scale for stacking overlays. The tokens are semantic and theme-agnostic (no `.dark` variants) — stacking order is structural, not appearance-driven.

**Mental model:** shadow communicates _perceived elevation_; z-index controls _actual paint order_. They are independent axes — a higher z-index does not imply a larger shadow, and the elevation shadows never set stacking. Reach for a z-index token only when two positioned layers can overlap.

### Token scale

Six tokens, low → high: `overlay` (10), `sticky` (30), `modal` (50), `popover` (70), `toast` (100), `max` (9999) — values canonical in `z-index.json`, utilities (`nx:z-modal`, …) generated on demand from the `--z-index-*` theme keys. `nx:z-modal`, `nx:z-popover`, `nx:z-sticky`, and `nx:z-toast` are used by shipped components; `nx:z-overlay` (low-level scrims) and `nx:z-max` (host system UI) are reserved for consumers.

**Popover sits _above_ modal (70 > 50) by design.** A DropdownMenu, Select, or Tooltip opened _inside_ a Dialog must paint above the dialog to stay usable — so the floating-layer token outranks the modal layer. This is the deliberate, non-obvious ordering; do not "fix" it by dropping popover below modal.

**`nx:z-overlay` is not `nx:bg-overlay`.** `nx:z-overlay` is the stacking token (value 10); `nx:bg-overlay` is the scrim _color_ token (see [`shadcn-divergences.md`](shadcn-divergences.md#overlay-token)). A Dialog backdrop uses both `nx:bg-overlay` (tint) and `nx:z-modal` (stacking) — it rides at the modal layer (50), not the `overlay` layer (10), so it stays grouped with the dialog it dims.

### Radix Portal behaviour

Radix appends portal content to `document.body`. For a **single** overlay open by itself (a Dialog with nothing else floating), z-index is largely redundant — the body-appended node already paints above page content in DOM order. The layer tokens become load-bearing when:

- **Two overlays of different types stack** — a DropdownMenu or Select opened inside a Dialog. `nx:z-popover` (70) keeps the menu above the dialog's `nx:z-modal` (50).
- **A consumer ships a fixed/sticky element** — a navbar or sticky table header competing for stacking. Use `nx:z-sticky` (30): above page content, below modals.
- **A consumer ships custom, non-Radix overlays** that must interleave with Nexus layers.

### Consumer override

The utilities reference the prefixed runtime CSS variable (`nx:z-sticky` → `z-index: var(--nx-z-index-sticky)` — the `nx` prefix lands on the runtime variable even though the `@theme` source key is unprefixed), so a consumer re-points a whole layer by overriding it — no component changes:

```css
/* In the consumer's stylesheet, loaded after Nexus */
:root {
  --nx-z-index-sticky: 35; /* raise the app shell's sticky chrome above the default 30 */
}
```
