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
- Colors, spacing, typography, borders, shadows
- Output: CSS variables with category prefixes
- Example: `--colors-gray-950`, `--spacing-4`

**Semantic** (`tokens/semantic/`)

- Contextual meanings that reference primitives
- Light and dark theme variants
- Output: Tailwind v4 `@theme` blocks
- Example: `--background: var(--colors-white)`

**Component** (future)

- Component-specific tokens
- References semantic tokens

### Color generation

Color tokens don't ship the values stored on disk. Source files hold hex; the build converts to OKLCH, pins each shade to a perceptual lightness grid (so the same step is equally light across every palette), and gates every text/surface pair with APCA contrast in CI. See [Color math](docs/color-math.md) for the full pipeline and its trade-offs.

## Reference Resolution

Semantic tokens use DTCG reference syntax:

```json
{
  "background": {
    "$value": "{white}",
    "$type": "color"
  }
}
```

This resolves to CSS:

```css
--background: var(--colors-white);
```

## Build Process

### Generate CSS

```bash
yarn build:tailwind       # Generate @nexus/tailwind package CSS
yarn build:tokens:modular # Generate modular CSS for playground
```

### Output Files

- `../tailwind/nexus.css` - Main Tailwind theme with `nx:` prefix
- `../tailwind/variables.css` - Primitive CSS variables with `--nx-*` prefix
- `dist/modular/` - Individual theme CSS files for playground

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
3. Run `yarn tokens` to regenerate CSS
4. Tokens automatically copied to React package
