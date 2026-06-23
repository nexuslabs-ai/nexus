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

Each component under `packages/react/src/components/ui/` lives in its own
kebab-case folder holding the component, its stories, and a barrel:

```
ui/{name}/
├── {name}.tsx          # Component (kebab-case)
├── {Name}.stories.tsx  # Stories + Tests (PascalCase, play functions)
└── index.ts            # Barrel: export * from './{name}'
```

The folder is kebab-case (`dropdown-menu/`); the stories file stays PascalCase
(`DropdownMenu.stories.tsx`). The per-folder `index.ts` is what keeps every
import site stable — `@/components/ui/{name}` resolves to the folder barrel, so
`src/index.ts` and cross-component imports never reference the nested file.

**No separate `*.test.tsx` files.** Tests are play functions in stories.

> `primitives/` stays flat (`{name}.tsx` directly under the subdir) because
> Show/Hide share `responsive-visibility.ts` at the subdir root. The tooling
> (`scripts/component-paths.mjs`) tracks which subdirs are nested.

## Component Template

Structure: `cva()` for enum variants; a named `ComponentProps` interface extending `React.ComponentProps<'element'>` + `VariantProps<typeof componentVariants>`; `asChild` via Radix `Slot`; `data-slot` / `data-variant` / `data-size` attributes; `cn()` to merge `className`. Export the component, its props type, and its `cva` variants function, re-export them from the folder's `index.ts` (`export * from './{name}'`), then add the barrel `export * from '@/components/ui/{name}'` to `src/index.ts`. See `button/button.tsx` and `badge/badge.tsx` for the canonical implementations.

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

Use padding for sizing, not fixed heights (`nx:px-4 nx:py-2`, not `nx:h-10 nx:px-4`) — fixed heights break in flex layouts. **Exceptions:** avatars, progress bars, modals may need fixed dimensions.

**Touch targets (mobile-first):** interactive controls must clear a **~44px minimum tap-target** — tune `nx:p-*` so the rendered hit area meets it (or extend it with an `::after` overlay), not by shrinking the control. See [responsive.md § Touch targets](responsive.md#touch-targets).

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

The focus colour is a **dedicated, theme-split blue** (`#1e3a8a` light / `#9dc1ee` dark; canonical values in `focus-default-{light,dark}.json`), tuned to clear APCA Lc ≥ 45 on every shipped surface (background / container / popover) and on nav chrome (nav-background / nav-item-{hover,active} / nav-border) in both themes — even when the surrounding fill is the primary brand colour or a tinted sidebar row. It is not derived from `primary.*`, so swapping the brand palette does not move the focus colour.

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

### No shadow on focusable elements

Do not add `nx:shadow-*` utilities to focusable elements — the structural separation still holds:

- **Non-focusable elevated surfaces** — Card (`shadow-sm`), Dialog (`shadow-lg`) — keep their elevation. Their focus rings appear on focusable children (DialogClose, controls inside Card), not on the surface itself.
- **Focusable controls** — Input, Switch — do not use shadow elevation. They rely on border/background for visual depth.

## Layering model

Nexus ships a 6-token z-index scale for stacking overlays. The tokens are semantic and theme-agnostic (no `.dark` variants) — stacking order is structural, not appearance-driven.

**Mental model:** shadow communicates _perceived elevation_; z-index controls _actual paint order_. They are independent axes — a higher z-index does not imply a larger shadow, and the elevation shadows never set stacking. Reach for a z-index token only when two positioned layers can overlap.

### Token scale

Six tokens, low → high: `overlay` (10), `sticky` (30), `modal` (50), `popover` (70), `toast` (100), `max` (9999) — values canonical in `z-index.json`, utilities (`nx:z-modal`, …) generated on demand from the `--z-index-*` theme keys. Only `nx:z-modal` and `nx:z-popover` are used by shipped components (Dialog; DropdownMenu / Select / Tooltip); the rest are reserved for consumers (`sticky` for app-shell chrome, `max` for host system UI, `overlay` for low-level scrims).

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
