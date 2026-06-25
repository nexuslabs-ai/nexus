# @nexus/core - Design Tokens

Internal package containing design tokens in W3C DTCG format and custom CSS generation.

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
- Color, radius, border-width, shadow, typography, focus, motion
- Output: CSS variables with the `--nx-*` prefix
- Example: `--nx-color-gray-950`, `--nx-radius-md`
- Motion primitives also promote named Tailwind utilities such as `nx:duration-fast` and `nx:ease-enter` through `@theme`, while existing Tailwind numeric duration/ease defaults remain available until the repo-wide migration lands.

**Semantic** (`tokens/semantic/`)

- Contextual meanings that reference primitives (and per-mode direct values for spacing)
- Light and dark theme variants for color; per-mode files for spacing
- Output: Tailwind v4 `@theme` block + per-mode `[data-style="X"]` blocks
- Example: `--color-background: var(--nx-color-white-base)`, `--nx-spacing-4: 16px`

> **Spacing is two-tier, not three.** Unlike color/radius/shadow/typography, spacing has no `--nx-size-*` primitive layer — `semantic/spacing-{mode}.json` files carry direct px values, and the build emits per-mode `[data-style="X"]` blocks plus role utilities (`nx:p-container`, `nx:gap-layout-section`, …). Mode swap is runtime via the `data-style` attribute on `<html>`.

**Component** (future)

- Component-specific tokens
- References semantic tokens

### Color generation

Color tokens don't ship the values stored on disk. Source files hold hex; the build converts to OKLCH, pins each shade to a perceptual lightness grid (so the same step is equally light across every palette), and gates every text/surface pair with APCA contrast in CI.

Generated global CSS sets the native browser UI policy alongside the tokens: `:root` advertises light/dark support, `.dark` pins native controls and scrollbars to dark, and the light root stays light when `.dark` is absent. Native checkbox, radio, range, and progress controls use the primary semantic token for `accent-color`; custom Nexus components remain fully token-styled.

## Reference Resolution

Semantic tokens use DTCG reference syntax:

```json
{
  "background": {
    "$value": "{white.base}",
    "$type": "color"
  }
}
```

This resolves to CSS:

```css
--color-background: var(--nx-color-white-base);
```

## Build Process

### Generate CSS

```bash
pnpm build:tailwind       # Generate @nexus/tailwind package CSS
pnpm build:tokens:modular # Generate modular CSS (console + docs apps)
```

### Output Files

- `../tailwind/nexus.css` - Main Tailwind theme with `nx:` prefix
- `../tailwind/variables.css` - Primitive CSS variables with `--nx-*` prefix
- `dist/modular/` - Individual theme CSS files for the console & docs apps

## Future Platform Support

Tokens are in DTCG format, making them portable to:

- iOS (Swift)
- Android (Kotlin/XML)
- React Native
- Any tool supporting DTCG standard

When multi-platform support is needed, tools like Style Dictionary can be added to generate platform-specific outputs from the same DTCG token files.

## Adding New Tokens

1. Edit token files in `tokens/`
2. Follow DTCG format with `$value`, `$type`, `$description`
3. Run `make tokens` to regenerate CSS
4. Tokens automatically copied to React package
