# Design Tokens - W3C DTCG Format

This directory contains design tokens in the **W3C Design Tokens Community Group (DTCG)** format.

## Format Specification

All tokens follow the DTCG specification (v2025.10):

```json
{
  "tokenName": {
    "$value": "actual-value",
    "$type": "color|dimension|fontWeight|shadow|etc",
    "$description": "Optional description",
    "$extensions": {
      "custom": "Optional custom metadata"
    }
  }
}
```

## Directory Structure

### `primitives/`
**Low-level, context-independent tokens** - foundation colors and values

- **colors.json** - Color scales (primary, gray, red, white, black)
- **spacing.json** - Spacing scale using rem units
- **border-radius.json** - Border radius values
- **typography.json** - Font sizes and weights
- **shadow.json** - Box shadow values for depth/elevation

### `semantic/`
**Contextual tokens** - meaningful names mapped to primitives

- **colors-light.json** - Light theme semantic colors (background, foreground, primary, etc.)
- **colors-dark.json** - Dark theme semantic colors

### `component/`
**Component-specific tokens** - for future use when components need dedicated tokens

## Token Types

| Type | Description | Example |
|------|-------------|---------|
| `color` | Color values | `#3b82f6`, `rgb(59 130 246)` |
| `dimension` | Sizes, spacing, radii | `0.5rem`, `16px` |
| `fontWeight` | Font weight values | `400`, `700` |
| `shadow` | Box shadow values | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |

## Usage

### Generating CSS

Run the generation script to convert tokens to CSS variables:

```bash
# From root
yarn tokens

# From core package
yarn build:tokens
```

Output: `packages/react/src/generated/theme.css`

### Adding New Tokens

1. Choose the appropriate tier (primitives/semantic/component)
2. Add to the relevant JSON file using DTCG format:

```json
{
  "newToken": {
    "$value": "value-here",
    "$type": "dimension",
    "$description": "What this token is for"
  }
}
```

3. Run `yarn tokens` to regenerate CSS
4. Rebuild packages: `yarn build`

### Naming Conventions

**Primitives**: Descriptive, scale-based names
- Colors: `primary-500`, `gray-100`
- Spacing: `0_5`, `1`, `2` (note: dots converted to underscores for CSS)
- Typography: `fontSize-sm`, `fontWeight-bold`

**Semantic**: Context-based, meaningful names
- `background`, `foreground`
- `primary`, `secondary`, `destructive`
- `border`, `input`, `ring`

## Key Differences from Old Format

### Before (Custom Format)
```json
{
  "spacing": {
    "0.5": "0.125rem"
  },
  "fontSize": {
    "sm": ["0.875rem", { "lineHeight": "1.25rem" }]
  }
}
```

### After (DTCG Format)
```json
{
  "spacing": {
    "0_5": {
      "$value": "0.125rem",
      "$type": "dimension",
      "$description": "2px - Extra small spacing"
    }
  },
  "fontSize": {
    "sm": {
      "$value": "0.875rem",
      "$type": "dimension",
      "$description": "14px - Small text",
      "$extensions": {
        "lineHeight": "1.25rem"
      }
    }
  }
}
```

## Validation

A JSON schema is provided at `packages/core/tokens.schema.json` for validating token structure.

## References

- [W3C DTCG Specification](https://design-tokens.github.io/community-group/format/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Supports DTCG format
- [Tokens Studio](https://tokens.studio/) - Design tool integration
