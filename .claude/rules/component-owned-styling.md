# Component-Owned Styling

A component's appearance and behaviour live in its own file. The generated
theme (`packages/tailwind/nexus.css`, emitted by `packages/core/scripts/`)
supplies the vocabulary — tokens and utilities — and never targets a component.

## What the Theme May Define

- **Tokens** — `@theme` scales, custom properties on the Nexus root
  (`[data-nexus-root]`, dark on `[data-nx-mode='dark']`), and runtime mode
  blocks keyed on the root's attributes (`[data-nx-density]`).
- **Utilities** — `@utility` definitions, named for what they do, not who uses
  them (`autofill-bg-*`, not `input-autofill`). State lives in the component's
  class (`nx:disabled:autofill-bg-disabled`), not inside the utility.
- **Root-level base styles** — `color-scheme`, the root's text colour and
  font, and the default `border-color` inside the root. Nothing targets
  `:root`, `html`, `body` or the host page: Nexus applies only inside a root.

## What the Theme Must Not Define

- Selectors that name a component: `[data-slot=…]`, `[data-variant=…]`,
  `[data-size=…]`, or a component's structural hooks.
- Selectors that match class names: `[class~='nx:…']`, `[class*=…]`.
- State or pseudo-class rules for specific elements: `input:autofill`,
  `:has([data-slot=…])`.
- Element rules for HTML Nexus does not render: `input[type='checkbox']`,
  `progress`.

Components must not work around this either: no arbitrary-property class that a
consumer or another file has to set, and no component `.css` file that
re-introduces slot selectors. A value that has to cross files is a utility.

## Enforcement

Review only: reject any `data-slot`, `data-variant`, `class~=`, or
component-element rule added to the `packages/core/scripts/` emitters or
`packages/tailwind/*.css`. Separately, `registers every emitted custom utility`
in `packages/react/src/lib/utils.test.ts` fails when a new `@utility` is not
registered with `cn()`.
