# @nexus_ds/core

The framework-agnostic engine behind Nexus Appearance: appearance model, runtime theme derivation, and first-paint snapshots. Use it directly for non-React targets like Electron, React Native, or native shells, or via `@nexus_ds/react/appearance` in React apps. It also contains the design tokens in DTCG format and CSS generation documented below.

## Install

```bash
pnpm add @nexus_ds/core
```

## Primary Exports

- `DEFAULT_NEXUS_APPEARANCE`, `sanitizeNexusAppearance`, `NexusAppearanceState`: the appearance model.
- `createNexusThemeContract`, `deriveTheme`, `themeToCss`: derive a full token set from appearance state and render it to CSS.
- `createNexusAppearanceSnapshotFromState`, `createNexusAppearanceBootstrapScript`, `resolveFirstPaint`, `DEFAULT_STORAGE_KEY`: first-paint, no-flash bootstrap.

## Advanced / Engine Exports

`adjustContrast`, `PALETTE_KEYS`, `TIER_THRESHOLDS`, `isColor`: low-level palette and contrast utilities. Stability is not guaranteed pre-1.0.

See the Nexus docs, Theming -> Appearance, for setup recipes.

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
- Semantic **color** is engine-derived (`deriveTheme`), not authored here; `tokens/semantic/` now holds only spacing, breakpoints, focus offset, and z-index
- Output: Tailwind v4 `@theme` block (semantic color via `@theme inline`, accepting runtime `--nx-color-*` overrides) + per-mode `[data-density="X"]` blocks
- Example: `--color-background: var(--nx-color-background, oklch(1 0 0))` (engine color floor), `--nx-spacing-4: 16px`

> **Spacing is two-tier, not three.** Unlike color/radius/shadow/typography, spacing has no `--nx-size-*` primitive layer — `semantic/spacing-{mode}.json` files carry direct px values, and the build emits per-mode `[data-density="X"]` blocks plus role utilities (`nx:p-container`, `nx:gap-layout-section`, …). Mode swap is runtime via the `data-density` attribute on `<html>`.

**Component** (future)

- Component-specific tokens
- References semantic tokens

### Color generation

Color tokens don't ship the values stored on disk. Source files hold hex; the build converts to OKLCH, pins each shade to a perceptual lightness grid (so the same step is equally light across every palette), and gates every text/surface pair with APCA contrast in CI.

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
pnpm build:tailwind       # Generate @nexus_ds/tailwind package CSS
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

Then run `make tokens` (or `pnpm build:tailwind`) to regenerate CSS; the output is copied into the `@nexus_ds/tailwind` package.
