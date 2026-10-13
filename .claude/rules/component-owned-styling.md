# Component-Owned Styling

A component's appearance and behaviour live in its own file. The generated
theme (`packages/tailwind/nexus.css`, emitted by `packages/core/scripts/`)
supplies the vocabulary — tokens and utilities — and never targets a component.

## What the Theme May Define

- **Tokens** — `@theme` scales, `:root` / `.dark` custom properties, and
  runtime mode blocks keyed on document-level attributes (`[data-density]`).
- **Utilities** — `@utility` definitions, named for what they do, not who uses
  them (`autofill-bg-*`, not `input-autofill`). State lives in the component's
  class (`nx:disabled:autofill-bg-disabled`), not inside the utility.
- **`.dark { color-scheme: dark }`** — the one real property, under the `.dark`
  switch Nexus shares with its host.

Everything else the theme emits is an `nx:` utility or an `--nx-*` variable.
That is what lets Nexus sit inside any app without restyling it.

The provider's preference CSS follows the same rule, with one exception: the
reduce motion, pointer cursor and font smoothing toggles apply to the whole
page when the user turns them on. They are app-wide settings Nexus offers its
host, and while one is on the host cannot opt a single element out of it.

## What the Theme Must Not Define

- Selectors that name a component: `[data-slot=…]`, `[data-variant=…]`,
  `[data-size=…]`, or a component's structural hooks.
- Selectors that match class names: `[class~='nx:…']`, `[class*=…]`.
- State or pseudo-class rules for specific elements: `input:autofill`,
  `:has([data-slot=…])`.
- Element or universal rules: `*`, `html`, `body`, `button`, `code`. They reach
  the host app's elements too.
- Tailwind's Preflight. The host brings its own reset; Nexus needs only
  `box-sizing: border-box` from it.
- Unprefixed variables: `--color-*`, `--spacing-*`. A host may declare the same
  names.
- Unprefixed keyframe names. Name Nexus keyframes `nx-*`.

Components must not work around this either: no arbitrary-property class that a
consumer or another file has to set, and no component `.css` file that
re-introduces slot selectors. A value that has to cross files is a utility.

A component that renders a native element neutralizes that element's browser
defaults in its own classes, because no reset is guaranteed: `nx:m-0` on
`<p>` / `<h*>`, `nx:list-none nx:m-0 nx:p-0` on `<ul>` / `<ol>`, a background,
border, padding and colour on `<button>` (`nx:text-inherit` where it should
match its parent), and `nx:no-underline` plus a colour on `<a>`. Storybook
loads no Preflight, so a missing reset shows in the stories.

## Enforcement

`packages/core/src/lib/generated-css-scope.test.ts` compiles the Install page's
entry (`nexus.css`, `tw-animate-css` and `progress.css`) with every `nx:` class
the components use, and fails on any rule that selects outside
`nx:` classes and variable scopes, any global declaration that is not `--nx-*`,
or an unprefixed keyframe other than Tailwind's and tw-animate-css's own. `touches the host page only for the toggles the user
turns on` in `packages/core/src/lib/appearance-model.test.ts` guards the
appearance preference CSS. Review the rest: reject any `data-slot`, `data-variant` or
`class~=` selector in the `packages/core/scripts/` emitters. Separately, `registers every emitted custom utility`
in `packages/react/src/lib/utils.test.ts` fails when a new `@utility` is not
registered with `cn()`.
