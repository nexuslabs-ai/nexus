# @nexus_ds/core

The framework-agnostic engine behind Nexus Appearance: appearance model, runtime theme derivation, and first-paint snapshots. Use it directly for non-React targets like Electron, React Native, or native shells, or via `@nexus_ds/react/appearance` in React apps. It also contains the design tokens in DTCG format and CSS generation documented below.

## Install

```bash
pnpm add @nexus_ds/core
```

## Primary Exports

- `DEFAULT_NEXUS_APPEARANCE`, `sanitizeNexusAppearance`, `NexusAppearanceState`: the appearance model.
- `BRAND_COLOR_PRESETS`, `BrandColorPreset`, `findBrandColorPreset`, `DEFAULT_BRAND_COLOR`: brand color choices for appearance editors. Default is `DEFAULT_BRAND_COLOR`; Indigo, Blue, Violet, Rose, Orange, Amber, Green, and Teal use each family's authored 600 hex. Assign a preset's `color` to `brandColor`; `findBrandColorPreset(brandColor)` returns the preset an opaque saved color matches in any CSS notation the engine parses (`#4F46E5`, `4f46e5`, `rgb(79 70 229)`), ignoring surrounding whitespace, or `undefined` for a custom or unparseable color.
- `createNexusThemeContract`, `deriveTheme`, `themeToCss`: derive a full token set from appearance state and render it to CSS.
- `measureThemeContrast`, `ThemeContrastCheck`, `Mode`, `Tier`: measure a derived theme against every registered APCA pair. See [Contrast report](#contrast-report).
- `createNexusAppearanceSnapshotFromState`, `createNexusAppearanceBootstrapScript`, `resolveFirstPaint`, `DEFAULT_STORAGE_KEY`: first-paint, no-flash bootstrap.

## Advanced / Engine Exports

`adjustContrast`, `PALETTE_KEYS`, `TIER_THRESHOLDS`, `isColor`: low-level palette and contrast utilities. Stability is not guaranteed pre-1.0.

See the Nexus docs, Theming -> Appearance, for setup recipes.

## Contrast report

`measureThemeContrast(theme)` measures a derived theme after derivation. It returns one `ThemeContrastCheck` per registered foreground/background pair in each mode:

```ts
import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  deriveTheme,
  measureThemeContrast,
} from '@nexus_ds/core';

const checks = measureThemeContrast(
  deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE))
);
const failing = checks.filter((check) => !check.pass);
```

Each check has `mode`, the `fg` and `bg` CSS variable names (such as `--nx-color-foreground`), an optional `backdrop` (a CSS variable name or hex color), `tier`, the measured absolute APCA `lc`, the tier `floor`, and `pass` (`lc >= floor`). Translucent colors are composited over their backdrop before measurement.

## Authored palette lookup

The browser-safe `@nexus_ds/core/palette` entry resolves the same authored palettes used by CSS generation:

```ts
import { getPaletteRamp, getPaletteShade } from '@nexus_ds/core/palette';

getPaletteShade('green', '600'); // oklch(0.62 0.2233 140.055)
const neutral = getPaletteRamp('neutral'); // Frozen, readonly shade map
```

`PRIMITIVE_PALETTE_NAMES` lists the 22 shade families typed by `PrimitivePaletteName`; `SHADES` lists 50 through 950, typed by `Shade`. White and Black are singleton colors, not ramps. `PALETTE_KEYS` identifies only the five surface-tone families. Lookups resolve on first use and cache immutable values; importing the engine does not convert palettes.

The engine starts from authored palettes: Success uses Green, Warning Orange, Error Red, and Information Blue. Secondary colors and near-black/near-white primary interaction endpoints use Neutral. The contrast solver can adjust these starting colors before emission.

Under deuteranopia the Success (Green) and Warning (Orange) 600 shades are hard to tell apart, so status UI must pair color with an icon and label. The color-vision audit reports this pair as its one accepted limitation.

Custom brand ramps and raw surface-tone references retain their separate algorithms. A palette's processed 600 shade is not interchangeable with its authored hex as a brand seed.

## Non-React Shell Example

Use the engine directly when a host shell owns DOM or native styling.

```ts
import {
  createNexusAppearanceSnapshotFromState,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  deriveTheme,
  resolveFirstPaint,
  themeToCss,
} from '@nexus_ds/core';

const state = {
  ...DEFAULT_NEXUS_APPEARANCE,
  brandColor: '#2563eb',
  surfaceTone: 'slate',
};
const snapshot = createNexusAppearanceSnapshotFromState(state);
const firstPaint = resolveFirstPaint(snapshot, false);
const themeStyle =
  document.querySelector<HTMLStyleElement>('style[data-theme]') ??
  document.head.appendChild(document.createElement('style'));
themeStyle.dataset.theme = '';

document.documentElement.classList.toggle(
  'dark',
  firstPaint.className === 'dark'
);
document.documentElement.style.colorScheme = firstPaint.colorScheme;
themeStyle.textContent = themeToCss(
  deriveTheme(createNexusThemeContract(snapshot.state))
);
```

## Token Architecture

### DTCG Format (W3C Standard)

All tokens follow the [Design Tokens Community Group](https://tr.designtokens.org/) specification:

```json
{
  "token-name": {
    "$value": "#ffffff",
    "$type": "color",
    "$description": "Optional description"
  }
}
```

### Token Hierarchy

**Primitives** (`tokens/primitives/`)

- Context-independent base values
- Color, radius, border-width, shadow, typography, motion
- Output: CSS variables with the `--nx-*` prefix
- Example: `--nx-color-gray-950`, `--nx-radius-md`
- Motion primitives also promote named Tailwind utilities such as `nx:duration-fast` and `nx:ease-enter`: durations are emitted as explicit `@utility` rules, while easing uses Tailwind's `@theme` namespace. Existing Tailwind numeric duration/ease defaults remain available until the repo-wide migration lands.

**Semantic** (`tokens/semantic/`)

- Contextual meanings that reference primitives (and per-mode direct values for spacing)
- Semantic **color** is engine-derived (`deriveTheme`), not authored here; `tokens/semantic/` now holds only spacing, breakpoints, and z-index
- Output: Tailwind v4 `@theme` block (semantic color via `@theme inline`, accepting runtime `--nx-color-*` overrides) + per-mode `[data-density="X"]` blocks
- Example: `--color-background: var(--nx-color-background, oklch(1 0 0))` (engine color floor), `--nx-spacing-4: 16px`

> **Spacing is two-tier, not three.** Unlike color/radius/shadow/typography, spacing has no `--nx-size-*` primitive layer — `semantic/spacing-{mode}.json` files carry direct px values, and the build emits per-mode `[data-density="X"]` blocks plus role utilities (`nx:p-container`, `nx:gap-layout-section`, …). Mode swap is runtime via the `data-density` attribute on `<html>`.

**Component** (future)

- Component-specific tokens
- References semantic tokens

### Color generation

Color tokens don't ship the values stored on disk. Source files hold hex. Build and runtime share authored-palette conversion: chromatic families use their hue-specific lightness curves and P3 cusp chroma; neutral families use the flat lightness grid and source chroma. Both preserve each authored shade's hue. Runtime semantic text/surface pairs are checked against the registered APCA constraints in CI.

Generated global CSS sets the native browser UI policy alongside the tokens: `:root` advertises light/dark support, `.dark` pins native controls and scrollbars to dark, and the light root stays light when `.dark` is absent. Native checkbox, radio, range, and progress controls use the primary semantic token for `accent-color`; custom Nexus components remain fully token-styled.

## Reference Resolution

Semantic **color** is produced by the engine (`deriveTheme`), not authored as
JSON. The build bakes each derived value into `nexus.css` as a `@theme inline`
fallback that still accepts a runtime override:

```css
--color-background: var(--nx-color-background, oklch(1 0 0));
```

The `--color-*` name is the Tailwind v4 `@theme` key that generates the utility
(`nx:bg-background`); the `--nx-color-*` fallback is the runtime override the
appearance provider injects. Non-color families (spacing, radius, shadow,
borderwidth, …) still use DTCG `{reference}` syntax, resolved to `var(--nx-*)`
at build time.

## Build Process

### Generate CSS

```bash
pnpm tokens:tailwind      # From the repo root: build core and generate @nexus_ds/tailwind CSS
```

### Output Files

- `../tailwind/nexus.css` - Main Tailwind theme with `nx:` prefix
- `../tailwind/variables.css` - Primitive CSS variables with `--nx-*` prefix

## Future Platform Support

Tokens are in DTCG format, making them portable to:

- iOS (Swift)
- Android (Kotlin/XML)
- React Native
- Any tool supporting DTCG standard

When multi-platform support is needed, tools like Style Dictionary can be added to generate platform-specific outputs from the same DTCG token files.

## Adding New Tokens

- **Color** is engine-owned: edit the derivation in `src/lib/surface-ladder.ts` / `src/lib/derive-theme.ts` (color primitives live in `tokens/primitives/color.json`).
- **Non-color** (spacing, radius, shadow, borderwidth, motion, typography): edit the DTCG token files in `tokens/` (`$value`, `$type`, `$description`).

Then run `make tokens` (or `pnpm tokens:tailwind`) to regenerate CSS; the output is copied into the `@nexus_ds/tailwind` package.
