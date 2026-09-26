# @nexus_ds/core

## 0.5.0

### Minor Changes

- 7aa577c: Theme autofilled fields and surface-matching rings through utilities instead of
  generated component selectors.
  - Added `autofill-bg-*`, `autofill-bg-transparent` and `autofill-text-*`. A
    field pairs them with its own `bg-*` / `text-*` classes
    (`nx:bg-container nx:autofill-bg-container`) so the browser's `!important`
    autofill paint cannot override the Nexus surface or text colour.
    `autofill-bg-transparent` clips the browser surface away for controls whose
    parent owns the surface.
  - Added `surface-*`, `ring-surface` and `ring-offset-surface`. A wrapper
    declares the surface it paints (`nx:bg-container nx:surface-container`) and
    descendant rings take that colour, falling back to `background`.
  - Removed the `accent-color` base rule on native checkbox, radio, range and
    progress elements. Nexus renders none of them; style a native control with
    `nx:accent-*` on the element instead.

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

- e54ef4b: Add `BRAND_COLOR_PRESETS` and `findBrandColorPreset` to `@nexus_ds/core`, seeded from the authored palettes, and a reusable preset/custom color field in Appearance settings. Preserve saved brand colors and the existing theme derivation. Keep controls usable in narrow layouts and make native color-picker keyboard focus visible.
- 416a7a0: Add the `4xl` runtime radius step across every corner mode and the `xxs`
  typography line-height primitive.
- 5a3ea89: Map the `label.caps` typography composite to the 12px `line-height-xxs`
  primitive, retaining its existing font size, weight, and letter spacing. This
  tightens the computed line box for every `typography-label-caps` consumer.
- 716c029: Border widths now come from Tailwind's own `--border-width-*` theme namespace,
  emitted inline next to `--outline-width-*`. Every Tailwind border side —
  including the logical `border-{s,e,bs,be}-{thin,default,thick}` and
  `divide-{x,y}-*` — reads the borderwidth tokens, so the generated
  `border-{side}-*` utilities are gone. The `border-width-*` aliases gain the
  `s`, `e`, `bs`, and `be` sides.
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

- 48f0bc6: Change `NexusAppearancePrefs.reduceMotion` from `'system' | 'on' | 'off'` to a
  `boolean` that defaults to `false`. The removed `'system'` value followed the OS
  `prefers-reduced-motion` setting, which Nexus no longer reads. Any stored string
  value now sanitizes to `false`.
- a4fde03: Add a browser-safe `@nexus_ds/core/palette` entry that looks up authored palette shades (`getPaletteShade`, `getPaletteRamp`, `PRIMITIVE_PALETTE_NAMES`, `SHADES`) with the same conversion token generation uses. Resolve status, secondary, chart, and primary endpoint colors from authored palette references while preserving existing theme outputs.
- 8f9cbfa: Export the surface ladder from `@nexus_ds/core/catalogue`: `SURFACE_TOKENS`, `LIGHT_SURFACE_LADDER`, `DARK_SURFACE_LADDER`, and the `ShadeAnchor` type. Each ladder maps every opaque surface token to the anchor or raw step the theme engine derives it from. The main entry adds the `SemanticColorName` type, the literal union of every `SEMANTIC_TOKEN_REGISTRY` name, which now types `SemanticTokenMeta.name`.
- 2b3f20c: Add `measureThemeContrast` to `@nexus_ds/core`. It reports the measured APCA Lc, tier floor, and pass state for every registered foreground/background pair of a derived theme in both modes, naming each token by its `--nx-color-*` CSS variable. The `Mode` and `Tier` types are now exported from the root entry.
- 48cec83: Add the browser-safe `@nexus_ds/core/catalogue` entry. `createTokenCatalogue()` describes every token family (colour, typography, spacing, radius, border width, shadow, motion, z-index, and breakpoints): each has its `--nx-*` name, aliases, values per theme mode and preset as the generated CSS declares them, and the authored source leaf. Runtime colours are derived from `DEFAULT_NEXUS_APPEARANCE` in explicit light and dark modes. `SemanticTokenMeta` no longer has a `description` field; those descriptions are now part of the catalogue.

## 0.4.0

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

## 0.3.0

### Minor Changes

- 249ef8e: Expose the full shipped density, corner, and elevation modes through the public appearance model unions, option tables, and sanitizers.
- a4d4a57: White light canvas with calibrated surface support tiers, contrast-responsive dark nav/sidebar surfaces, regenerated Tailwind theme output, and component surface adoption for field-like controls.

  Breaking (`@nexus_ds/react`): the `Form` react-hook-form wrapper is removed and `react-hook-form` is dropped as a peer dependency. Consumers own their react-hook-form binding directly against the library-agnostic `Field` primitive.

- 958c764: Split the appearance `contrast` control into independent `lightContrast` and `darkContrast` scalars. Theme derivation applies each mode's contrast to that mode's tokens only, so the dark theme can be tuned without moving the light theme. Snapshot version bumped to 4; stale snapshots reset to `60/60` defaults (pre-production, no migration).
- 1d55de3: Add token-engine instrumentation exports for the semantic color cutover: public APCA contrast access, semantic token registry metadata, the public surface-token type, and the frozen engine matrix snapshot fixture.
- 748e08c: Adjudicate semantic color token values for the token engine by aligning runtime producers with the reviewed semantic JSON values for chart series 2, warning fills, default focus, black-brand primary states, and foreground ink tiers. Set the default dark structural contrast to `0` and refresh the reviewed engine snapshot matrix.

## 0.2.0

### Minor Changes

- 58c79bc: Primary color now derives from the brand seed's own lightness instead of a fixed mid-tone shade, so the primary button _is_ the chosen color (deep navy stays navy; black renders black in light and white in dark). Fill legibility is APCA-guarded and the dark-mode lift is continuous at the honor boundary.

  Fixed `pinnedOklch` so a fully-neutral seed (chroma 0) stays neutral instead of taking the fallback hue at full cusp chroma — this was rendering an achromatic (black/grey) brand's disabled, subtle, and border shades as pink.

  Removed the static brand menu: the twelve `brands-*.json` token files are consolidated into a single `theme-default-{light,dark}.json` (primary + secondary + border-primary), and the `--brand` build flag / `DEFAULT_CONFIG.brand` are gone. Custom brand colors are now chosen at runtime rather than from a fixed set of pre-built brand stylesheets.

## 0.1.0

### Minor Changes

- c455b16: First public release under the `@nexus_ds` scope. Publishes the framework-agnostic runtime engine (`@nexus_ds/core`: appearance model, runtime theme derivation, OKLCH/APCA utilities) and the lint guardrails (`@nexus_ds/eslint-plugin`) to public npm. Copied component code binds to core's runtime contract, so this begins core's semver-stable surface.
