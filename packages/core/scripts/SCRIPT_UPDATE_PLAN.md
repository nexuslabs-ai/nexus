# Script Update Plan

## Overview

Update `generate-css.js` and `generate-modular.js` to support:

1. New nested folder structure
2. New token types (dimension, fontFamily, fontWeight, typography, shadow)
3. Tailwind v4 utilities for typography and shadows
4. Extended CLI arguments

---

## Current vs New Token Structure

### Current (scripts expect)

```
tokens/
├── primitives/*.json     # Flat folder
└── semantic/*.json       # Flat folder
```

### New (scripts need to support)

```
tokens/
├── primitives/
│   ├── color.json
│   ├── size/*.json
│   ├── typography/*.json
│   ├── shadow/*.json
│   ├── radius/*.json
│   └── borderwidth/*.json
├── semantic/
│   ├── base-*-{light|dark}.json
│   ├── brands-*-{light|dark}.json
│   └── spacing.json
└── styles/
    ├── typography.json
    └── shadows.json
```

---

## Phase 1: Recursive Folder Traversal

### Current Code (generate-css.js:130)

```javascript
const files = fs.readdirSync(primitivesDir).filter((f) => f.endsWith('.json'));
```

### New Code

```javascript
function getAllJsonFiles(dir, fileList = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      getAllJsonFiles(fullPath, fileList);
    } else if (item.name.endsWith('.json')) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}
```

### Files Affected

- `generate-css.js` → `processPrimitives()`
- `generate-modular.js` → `processPrimitives()`

---

## Phase 2: Handle Dimension Token Format

### Current Token Format

```json
{
  "size-4": {
    "$value": { "value": 16, "unit": "rem" },
    "$type": "dimension"
  }
}
```

### Required CSS Output

```css
--size-4: 16rem;
```

### New Helper Function

```javascript
function formatTokenValue(value, type) {
  // Handle dimension objects
  if (
    type === 'dimension' &&
    typeof value === 'object' &&
    value.value !== undefined
  ) {
    return `${value.value}${value.unit}`;
  }

  // Handle string values (colors, font families, etc.)
  if (typeof value === 'string') {
    return value;
  }

  // Handle numbers (font weights, etc.)
  if (typeof value === 'number') {
    return String(value);
  }

  return value;
}
```

---

## Phase 3: Comprehensive Primitive Map

### Current Reference Resolution

Only handles color references like `{blue.500}`

### New Reference Types to Support

| Reference Pattern       | Source File            | Example                        |
| ----------------------- | ---------------------- | ------------------------------ |
| `{blue.500}`            | `color.json`           | Color primitives               |
| `{size-4}`              | `size-vega.json`       | Size primitives                |
| `{family.font-sans}`    | `typography-vega.json` | Font family                    |
| `{weight.semibold}`     | `typography-vega.json` | Font weight                    |
| `{size.6xl}`            | `typography-vega.json` | Typography font size           |
| `{line-height.6xl}`     | `typography-vega.json` | Line height                    |
| `{letterspacing.tight}` | `typography-vega.json` | Letter spacing                 |
| `{2xs.layer-1.x}`       | `shadow-vega.json`     | Shadow layer values            |
| `{neutral.100}`         | `color.json`           | Cross-reference (shadow focus) |

### Updated Primitive Map Building

```javascript
function buildPrimitiveMap(primitivesDir, config) {
  const primitiveMap = new Map();

  // Load color primitives (always included)
  loadTokensIntoMap(path.join(primitivesDir, 'color.json'), primitiveMap);

  // Load selected mode primitives
  const modeFiles = [
    `size/size-${config.size}.json`,
    `typography/typography-${config.typography}.json`,
    `shadow/shadow-${config.shadow}.json`,
    `radius/radius-${config.radius}.json`,
    `borderwidth/borderwidth-${config.borderwidth}.json`,
  ];

  for (const file of modeFiles) {
    const filePath = path.join(primitivesDir, file);
    if (fs.existsSync(filePath)) {
      loadTokensIntoMap(filePath, primitiveMap);
    }
  }

  return primitiveMap;
}
```

---

## Phase 4: Typography Utilities

### Source Token (styles/typography.json)

```json
{
  "display": {
    "large": {
      "$type": "typography",
      "$value": {
        "fontFamily": "{family.font-sans}",
        "fontSize": "{size.6xl}",
        "fontWeight": "{weight.light}",
        "lineHeight": "{line-height.6xl}",
        "letterSpacing": "{letterspacing.tight}"
      }
    }
  }
}
```

### Generated CSS

```css
@utility text-display-large {
  font-family: var(--family-font-sans);
  font-size: var(--size-6xl);
  font-weight: var(--weight-light);
  line-height: var(--line-height-6xl);
  letter-spacing: var(--letterspacing-tight);
}
```

### Implementation

```javascript
function generateTypographyUtilities(stylesDir, primitiveMap) {
  const typographyPath = path.join(stylesDir, 'typography.json');
  if (!fs.existsSync(typographyPath)) return '';

  const tokenData = readTokenFile(typographyPath);
  const utilities = [];

  // Extract all typography tokens
  function extractTypography(obj, pathParts = []) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;

      if (value.$type === 'typography') {
        const utilityName = `text-${[...pathParts, key].join('-')}`;
        utilities.push({ name: utilityName, value: value.$value });
      } else if (typeof value === 'object') {
        extractTypography(value, [...pathParts, key]);
      }
    }
  }

  extractTypography(tokenData);

  // Generate CSS
  let css = '/* Typography Utilities */\n\n';

  for (const { name, value } of utilities) {
    css += `@utility ${name} {\n`;

    if (value.fontFamily) {
      css += `  font-family: ${resolveToVar(value.fontFamily, primitiveMap)};\n`;
    }
    if (value.fontSize) {
      css += `  font-size: ${resolveToVar(value.fontSize, primitiveMap)};\n`;
    }
    if (value.fontWeight) {
      css += `  font-weight: ${resolveToVar(value.fontWeight, primitiveMap)};\n`;
    }
    if (value.lineHeight) {
      const lh =
        value.lineHeight === 'auto'
          ? 'auto'
          : resolveToVar(value.lineHeight, primitiveMap);
      css += `  line-height: ${lh};\n`;
    }
    if (value.letterSpacing) {
      css += `  letter-spacing: ${resolveToVar(value.letterSpacing, primitiveMap)};\n`;
    }

    css += `}\n\n`;
  }

  return css;
}
```

### Generated Utility Names

- `text-display-large`, `text-display-medium`
- `text-heading-xlarge`, `text-heading-large`, `text-heading-medium`, `text-heading-small`, `text-heading-xsmall`
- `text-body-large`, `text-body-default`, `text-body-small`
- `text-label-large`, `text-label-default`, `text-label-small`, `text-label-caps`
- `text-code-block`, `text-code-inline`

---

## Phase 5: Shadow Variables

### Source Token (styles/shadows.json)

```json
{
  "sm": {
    "$type": "shadow",
    "$value": [
      { "offsetX": "{sm.layer-2.x}", "offsetY": "{sm.layer-2.y}", "blur": {...}, "spread": "...", "color": "..." },
      { "offsetX": "{sm.layer-1.x}", "offsetY": "{sm.layer-1.y}", "blur": {...}, "spread": "...", "color": "..." }
    ]
  }
}
```

### Generated CSS

```css
@theme inline {
  --shadow-sm: 0 2px 2rem -1px #0000001a, 0 1px 3rem 0 #0000001a;
}
```

### Implementation

```javascript
function formatShadowValue(shadowDef, primitiveMap) {
  const layers = Array.isArray(shadowDef) ? shadowDef : [shadowDef];

  return layers
    .map((layer) => {
      const x = resolveDimension(layer.offsetX, primitiveMap);
      const y = resolveDimension(layer.offsetY, primitiveMap);
      const blur = resolveDimension(layer.blur, primitiveMap);
      const spread = resolveDimension(layer.spread, primitiveMap);
      const color = resolveColor(layer.color, primitiveMap);
      const inset = layer.inset ? 'inset ' : '';

      return `${inset}${x} ${y} ${blur} ${spread} ${color}`;
    })
    .join(', ');
}

function generateShadowVariables(stylesDir, primitiveMap) {
  const shadowsPath = path.join(stylesDir, 'shadows.json');
  if (!fs.existsSync(shadowsPath)) return '';

  const tokenData = readTokenFile(shadowsPath);
  const shadows = [];

  // Extract all shadow tokens
  function extractShadows(obj, pathParts = []) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;

      if (value.$type === 'shadow') {
        const varName = `shadow-${[...pathParts, key].join('-')}`;
        shadows.push({ name: varName, value: value.$value });
      } else if (typeof value === 'object') {
        extractShadows(value, [...pathParts, key]);
      }
    }
  }

  extractShadows(tokenData);

  // Return shadow variables (to be added to @theme inline block)
  return shadows.map(({ name, value }) => ({
    cssName: name,
    cssValue: formatShadowValue(value, primitiveMap),
  }));
}
```

### Generated Shadow Names

- `shadow-2xs`, `shadow-xs`, `shadow-sm`, `shadow-base`, `shadow-lg`, `shadow-xl`, `shadow-2xl`
- `shadow-inner`
- `shadow-focus-default`, `shadow-focus-error`

---

## Phase 6: CLI Arguments

### Current Arguments

```bash
node generate-css.js --base=slate --brand=blue
```

### New Arguments

```bash
node generate-css.js \
  --base=slate \
  --brand=blue \
  --size=vega \
  --typography=vega \
  --shadow=vega \
  --radius=subtle \
  --borderwidth=vega
```

### Defaults

```javascript
const DEFAULT_CONFIG = {
  base: 'slate',
  brand: 'blue',
  size: 'vega',
  typography: 'vega',
  shadow: 'vega',
  radius: 'subtle',
  borderwidth: 'vega',
};
```

### Updated parseArgs()

```javascript
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  args.forEach((arg) => {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key in config) {
        config[key] = value;
      }
    }
  });

  return config;
}
```

---

## Phase 7: Updated Output Structure

### globals.css Structure

```css
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

/* ===== PRIMITIVES ===== */
:root {
  /* Colors */
  --blue-500: #3b82f6;
  --slate-50: #f8fafc;

  /* Sizes (from selected mode) */
  --size-0: 0rem;
  --size-4: 16rem;

  /* Typography primitives */
  --family-font-sans: Inter;
  --family-font-mono: JetBrains Mono;
  --size-xs: 12rem;
  --weight-normal: 400;
  --weight-semibold: 600;
  --line-height-xs: 18rem;
  --letterspacing-tight: -0.4rem;

  /* Radius (from selected personality) */
  --radius-base: 4rem;
  --radius-lg: 8rem;

  /* Border width */
  --borderwidth-default: 1rem;
}

/* ===== SEMANTIC COLORS ===== */
@theme inline {
  --*: initial;

  /* Layout */
  --color-background: var(--slate-50);
  --color-foreground: var(--slate-950);

  /* Brand */
  --color-primary-background: var(--blue-500);

  /* Spacing (semantic, references size primitives) */
  --spacing-0: var(--size-0);
  --spacing-4: var(--size-4);

  /* Shadows */
  --shadow-sm: 0 2px 2rem -1px #0000001a, 0 1px 3rem 0 #0000001a;
  --shadow-lg: ...;
}

/* ===== DARK MODE ===== */
.dark {
  --color-background: var(--slate-950);
  --color-foreground: var(--slate-50);
}

/* ===== TYPOGRAPHY UTILITIES ===== */
@utility text-display-large {
  font-family: var(--family-font-sans);
  font-size: var(--size-6xl);
  font-weight: var(--weight-light);
  line-height: var(--line-height-6xl);
  letter-spacing: var(--letterspacing-tight);
}

@utility text-body-default {
  font-family: var(--family-font-sans);
  font-size: var(--size-base);
  font-weight: var(--weight-normal);
  line-height: var(--line-height-base);
  letter-spacing: var(--letterspacing-normal);
}

/* ... more utilities ... */

/* ===== BASE LAYER ===== */
@layer base {
  *,
  ::before,
  ::after {
    border-color: var(--color-border-default);
  }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
  }
}
```

---

## Phase 7b: Modular Output (Playground)

### Files to Generate

```
dist/modular/
├── primitives/
│   ├── colors.css           # All color scales
│   ├── size-lyra.css        # Size mode
│   ├── size-maia.css
│   ├── size-mira.css
│   ├── size-nova.css
│   ├── size-vega.css
│   ├── typography-lyra.css  # Typography primitives mode
│   ├── typography-maia.css
│   ├── typography-mira.css
│   ├── typography-nova.css
│   ├── typography-vega.css
│   ├── shadow-lyra.css      # Shadow primitives mode
│   ├── shadow-maia.css
│   ├── shadow-mira.css
│   ├── shadow-nova.css
│   ├── shadow-vega.css
│   ├── radius-blunt.css     # Radius personality
│   ├── radius-mellow.css
│   ├── radius-sharp.css
│   ├── radius-smooth.css
│   ├── radius-subtle.css
│   ├── borderwidth-lyra.css # Border width mode
│   ├── borderwidth-maia.css
│   ├── borderwidth-mira.css
│   ├── borderwidth-nova.css
│   └── borderwidth-vega.css
├── semantic/
│   ├── base-gray.css        # Base themes (light + dark)
│   ├── base-neutral.css
│   ├── base-slate.css
│   ├── base-stone.css
│   ├── base-zinc.css
│   ├── brands-blue.css      # Brand themes (light + dark)
│   ├── brands-gray.css
│   ├── brands-neutral.css
│   ├── brands-slate.css
│   └── spacing.css          # Spacing (needs to reference selected size mode)
└── styles/
    ├── typography.css       # Typography utilities (references typography primitives)
    └── shadows.css          # Shadow variables (references shadow primitives)
```

### Playground Theme Switching

```javascript
// Load base theme
await loadCSS('/modular/semantic/base-slate.css');

// Load brand
await loadCSS('/modular/semantic/brands-blue.css');

// Load density mode
await loadCSS('/modular/primitives/size-vega.css');
await loadCSS('/modular/primitives/typography-vega.css');
await loadCSS('/modular/primitives/shadow-vega.css');
await loadCSS('/modular/primitives/borderwidth-vega.css');

// Load shape personality
await loadCSS('/modular/primitives/radius-subtle.css');

// Load styles (these use CSS var() so they adapt to primitives)
await loadCSS('/modular/styles/typography.css');
await loadCSS('/modular/styles/shadows.css');
```

---

## Implementation Order

| Phase | Task                        | Priority | Complexity |
| ----- | --------------------------- | -------- | ---------- |
| 1     | Recursive folder traversal  | High     | Low        |
| 2     | Dimension value formatting  | High     | Low        |
| 3     | Comprehensive primitive map | High     | Medium     |
| 4     | Typography utilities        | High     | Medium     |
| 5     | Shadow variables            | High     | Medium     |
| 6     | CLI arguments               | Medium   | Low        |
| 7     | Modular generation          | Low      | High       |

---

## Notes for Script Update

1. **Reference resolution order matters** - Must load primitives before resolving semantic/style references
2. **Cross-file references** - Shadow focus colors reference `{neutral.100}` from color.json
3. **Spacing references size** - `spacing.json` references `{size-0}`, `{size-4}` etc.
4. **Typography styles reference typography primitives** - Need to load correct mode first
5. **Unit values in dimensions** - Currently `rem` but values seem to be in px (e.g., `16rem` for size-4 should probably be `1rem` or `16px`)
