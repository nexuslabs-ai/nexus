# Design Token Rules

## Token Format (W3C DTCG)

All tokens MUST follow the W3C Design Tokens Community Group format:

```json
{
  "tokenName": {
    "$value": "value-here",
    "$type": "color|dimension|fontWeight|shadow|etc",
    "$description": "Optional description"
  }
}
```

Required properties: `$value`, `$type`
Optional properties: `$description`, `$extensions`

## File Naming

| Directory | Pattern | Example |
|-----------|---------|---------|
| primitives | `color-{theme}.json` | `color-light.json`, `color-dark.json` |
| semantic | `base-{palette}.json`, `brands-{name}.json` | `base-slate.json`, `brands-blue.json` |
| component | `{component}.json` | `button.json` (future) |

## Reference Syntax

Semantic tokens reference primitives using curly brace syntax:

```json
{
  "primary": {
    "$value": "{blue.500}",
    "$type": "color"
  }
}
```

The reference path matches the JSON structure: `{colorName.shade}`

## Color Scale Convention

Primitive colors use Tailwind's shade scale (50-950):

```
50   - Lightest (backgrounds)
100  - Very light
200  - Light
300  - Light-medium
400  - Medium-light
500  - Base/default
600  - Medium-dark
700  - Dark
800  - Very dark
900  - Darker
950  - Darkest (text on light bg)
```

## Semantic Token Naming

| Pattern | Usage | Example |
|---------|-------|---------|
| `{name}` | Main color | `primary`, `background` |
| `{name}-foreground` | Text on that color | `primary-foreground` |
| `{name}-hover` | Hover state | `primary-hover` |
| `{name}-active` | Active/pressed state | `primary-active` |
| `{name}-disabled` | Disabled state | `primary-disabled` |
| `border-{context}` | Border colors | `border-default`, `border-error` |

## Light/Dark Theme Tokens

- Primitive colors go in separate files: `color-light.json` and `color-dark.json`
- Semantic tokens reference primitives - same semantic file works for both themes
- The CSS generator outputs `:root` for light and `.dark` for dark primitives

## Validation

Token files are validated against `packages/core/tokens.schema.json`

Valid `$type` values:
- `color` - Color values (#hex, rgb, hsl)
- `dimension` - Sizes with units (rem, px)
- `fontFamily` - Font stack
- `fontWeight` - Weight values (400, 700)
- `duration` - Time values (ms, s)
- `shadow` - Box shadow definitions
- `number` - Unitless numbers

## Generation Workflow

After editing token files:

```bash
yarn tokens           # From root
# OR
yarn build:tokens     # From packages/core
```

This generates `globals.css` and copies it to the React package.

## Do Not

- Edit files in `dist/` or `packages/react/src/generated/`
- Use raw hex values in semantic tokens (use references)
- Mix light/dark values in the same primitive file
- Add tokens without `$type` property
