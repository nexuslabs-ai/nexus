# @nexus_ds/eslint-plugin

## 0.3.0

### Minor Changes

- 15c901b: Paint field boundaries and focus rings with real `border` and `outline` instead
  of generated `box-shadow`.
  - Removed `tokens/semantic/focus.json` and the `--focus-offset` root dimension
    it emitted. `outline-offset`'s initial value is already `0`, so the token was
    a no-op everywhere except `Button`, which now writes the `2px` literal.
  - Added `--outline-width-{thin,default,thick}` to the `@theme` block, mirroring
    the existing `--border-*` keys off the same borderwidth primitives. A field's
    focus ring is a `border-default` inner edge plus an `outline-default` outer
    edge, so both halves follow a `[data-borderwidth]` mode swap together.
  - Added the `transition-control` / `transition-field` utilities to
    `motion-utilities.css`. Tailwind's `transition-colors` carries
    `outline-color`, so an element painting a real ring would fade it in instead
    of landing it with the keypress; these name the properties a surface actually
    wants. The split follows the focus recipe: a control's border is its own
    decoration and may fade, while a field's border is the ring's inner half.
  - `@nexus_ds/nx-class-conventions` gained a `ringFadingTransition` check that
    fails `nx:transition-colors` sharing a scope with a ring-painting
    `focus-visible:outline-*` class. A scope is one class string, one `cva` /
    `cn` / `clsx` / `cx` call — base, array elements and `variants` values read
    together — or one `[…].join(' ')`, which collapses an array literal into a
    single attribute. That over-approximates the class attribute: sibling
    `variants` values of one key never share an element and are reported anyway,
    which is the safe direction. Only a width or a colour paints a ring, so
    `outline-none`, `outline-hidden`, `outline-0`, `outline-offset-*` and the
    `outline-solid` / `dashed` / `dotted` / `double` style keywords are exempt.

- 3ed37ed: Add the `shadow-md` tier to the emitted Tailwind theme; its primitives already
  existed in every shadow mode, so `nx:shadow-md` now renders instead of emitting
  nothing. Emit `--default-transition-duration` and
  `--default-transition-timing-function` from `--nx-motion-duration-default` and
  `--nx-motion-ease-enter`, and point `transition-control` / `transition-field` at
  them: every `nx:transition-*` utility now shares one default (200ms, enter
  easing) instead of Tailwind's 150ms, and the two ring-safe transitions are no
  longer instant without an explicit `duration-*` class.

  `@nexus_ds/eslint-plugin`: `nx-class-conventions` drops its `deadTypography`
  check. Its replacement is the new `nexusTailwindClassesConfig({ files,
entryPoint })` helper in the new `@nexus_ds/eslint-plugin/tailwind` subpath, which wires
  `eslint-plugin-better-tailwindcss`'s `no-unknown-classes` (an optional peer
  dependency, needed only for that subpath) against your stylesheet: it reports any class that emits no CSS,
  including a missing `nx:` prefix.

  `@nexus_ds/react`: NavigationMenu content now slides 1.5rem on enter and exit;
  it previously computed its offset from an undefined `--spacing` and did not
  slide. Its transform origin is now `top` (was the invalid `top-center`).

## 0.2.0

### Minor Changes

- 1d27496: Add design tokens and typography tiers, and recalibrate the `fine` stroke mode.

  **Tokens**
  - New `thin` border-width rung (0.5px hairline; 1px in the `strong` mode), emitted across every stroke mode and as the full `border-thin` / `border-{side}-thin` utility set.
  - New `xxs` (11px) typography size step.
  - New `font-heading` family primitive, defaulting to the same stack as `font-sans` so headings can be branded at runtime without changing the fallback.
  - New `muted-extralight` surface token — a perceptual surface-ladder rung sitting 40% of the way from `background` toward `muted`, derived by the engine across every tone and light/dark mode.

  **Typography composites**
  - Headings now use `font-heading`, `bold`, and tighter tracking; a new `heading-xxsmall` tier is added and `label-caps` moves to the `xxs` size with `wide` tracking.

  **Stroke recalibration**
  - The `fine` stroke mode's `default` is lowered from 1px to 0.5px so its common borders read as hairline.

  **ESLint plugin**
  - `heading-xxsmall` is added to the `nx-class-conventions` live-typography allowlist.

## 0.1.0

### Minor Changes

- c455b16: First public release under the `@nexus_ds` scope. Publishes the framework-agnostic runtime engine (`@nexus_ds/core`: appearance model, runtime theme derivation, OKLCH/APCA utilities) and the lint guardrails (`@nexus_ds/eslint-plugin`) to public npm. Copied component code binds to core's runtime contract, so this begins core's semver-stable surface.
