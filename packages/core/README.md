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
yarn build:tokens
```

This runs:
1. `scripts/generate-css.js` - Generates primitives.css and theme.css
2. `scripts/copy-to-react.js` - Copies to React package

### Output Files
- `dist/primitives.css` - Base CSS variables
- `dist/theme.css` - Tailwind theme with light/dark
- `packages/react/src/generated/theme.css` - Combined file for React

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
