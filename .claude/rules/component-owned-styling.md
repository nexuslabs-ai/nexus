# Component-Owned Styling

A component's appearance and behaviour live in its own file. The generated
theme (`packages/tailwind/nexus.css`, emitted by `packages/core/scripts/`)
supplies the vocabulary — tokens and utilities — and never targets a component.

When the theme targets a component, the component has two sources of truth:
its classes say one thing and a selector in another package says another. A
reader of the `.tsx` cannot see the second one, and the two drift the moment
either side changes a variant, state, or slot name.

## What the Theme May Define

- **Tokens** — `@theme` scales, `:root` / `.dark` custom properties, and
  runtime mode blocks keyed on document-level attributes (`[data-borderwidth]`,
  `[data-density]`).
- **Utilities** — `@utility` definitions, static or functional.
- **Document-level base styles** — `color-scheme`, `body` defaults, the global
  default `border-color`. Rules that apply to every page regardless of which
  components render.

## What the Theme Must Not Define

- Selectors that name a component: `[data-slot=…]`, `[data-variant=…]`,
  `[data-size=…]`, or a component's structural hooks (`[data-item-part=…]`).
- Selectors that match class names: `[class~='nx:…']`, `[class*=…]`.
- State or pseudo-class rules for specific elements: `input:autofill`,
  `[data-slot=…]:focus-visible`, `:has([data-slot=…])`.
- Element rules for HTML Nexus does not render: `input[type='checkbox']`,
  `progress`. A consumer styling their own native element uses a utility on it
  (`nx:accent-primary-background`).

## Custom Behaviour Is a Utility

When a component needs something Tailwind does not ship, add a named
`@utility` and apply it in the component, next to the classes it relates to.

```css
/* theme — generic, token-driven, knows nothing about Input */
@utility autofill-bg-* {
  &:autofill {
    box-shadow: inset 0 0 0 1000px --value(--color-*);
  }
}
```

```tsx
// input.tsx — the pairing is visible where the surface is declared
'nx:bg-container nx:autofill-bg-container';
```

- **Name it for what it does, not who uses it.** `autofill-bg-*`, not
  `input-autofill`. A utility that only makes sense on one component is a
  selector in disguise.
- **Take tokens through `--value(--color-*)` / `--theme()`**, so the utility
  resolves exactly like the built-in `bg-*` / `text-*` utilities, dark mode
  included.
- **State goes in the class, not the utility.** The component writes
  `nx:disabled:autofill-bg-disabled`; the utility never checks `:disabled`.
- **Register it with `cn()`** in `packages/react/src/lib/utils.ts`, so a
  consumer override replaces it instead of stacking. `utils.test.ts` fails on an
  unregistered `@utility`.

## Not a Workaround Either

- No arbitrary-property classes as wiring between files: a custom property a
  consumer or another component has to set, such as
  `nx:[--some-var:var(--nx-color-x,var(--color-x))]`. If a component needs a
  value from outside, that is a utility (`surface-*` / `ring-surface`). A
  property a component sets and reads within its own file — DatePicker's
  per-size `--cell-size` — is internal and fine.
- No component-owned `.css` files that re-introduce slot selectors outside the
  theme.

## The Test

Open the component's `.tsx`. If a reviewer cannot tell how it looks in every
variant, size, and state from that file alone, something is living in the
wrong place.

## Enforcement

Review only — there is no automated scan. Reject any `data-slot`,
`data-variant`, `class~=`, or component-element rule added to the
`packages/core/scripts/` emitters or `packages/tailwind/*.css`, and any
arbitrary-property class a consumer or another file is told to set.
