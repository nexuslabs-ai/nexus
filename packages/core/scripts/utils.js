import fs from 'fs';
import path from 'path';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';

import {
  hexToOklchMechanical,
  hexToOklchPinned,
  isPaletteShadeKey,
} from './lib/perceptual-grid.js';

/**
 * Ensure a directory exists, creating it if necessary
 * @param {string} dir - Directory path
 */
export function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Read and parse a JSON token file
 * @param {string} filePath - Path to JSON file
 * @returns {object} Parsed JSON data
 */
export function readTokenFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Capitalize the first character of a string, leaving the rest unchanged.
 * @param {string} s - Input string
 * @returns {string} String with its first character upper-cased
 */
export function titleCase(s) {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

/**
 * Format a token value to a CSS string. For `$type: "color"` hex values,
 * routes through the OKLCH converters: palette shade tokens (path ending in a
 * shade key like `'500'`) get pinned to the perceptual L grid; everything else
 * (white/black/semantic hex literals with alpha) is converted mechanically.
 * @param {object|string|number} value - Token value
 * @param {string} type - Token type
 * @param {string[]} [tokenPath] - Token path (used to route shade conversions)
 * @returns {string} Formatted CSS value
 * @throws {Error} If value is undefined
 */
export function formatTokenValue(value, type, tokenPath) {
  if (value === undefined) {
    throw new Error(`formatTokenValue: value is undefined (type="${type}")`);
  }

  if (
    type === 'dimension' &&
    typeof value === 'object' &&
    value !== null &&
    'value' in value
  ) {
    // Round to 4 decimals to strip Figma's float-32 export artifacts
    // (e.g. -0.800000011920929 → -0.8).
    const rounded = Math.round(value.value * 10000) / 10000;
    return `${rounded}${value.unit || 'px'}`;
  }

  if (type === 'color' && typeof value === 'string' && value.startsWith('#')) {
    const lastSegment =
      tokenPath && tokenPath.length > 0
        ? tokenPath[tokenPath.length - 1]
        : undefined;

    if (tokenPath && tokenPath.length >= 2 && isPaletteShadeKey(lastSegment)) {
      // The segment before the shade is the palette/hue (e.g. ['blue','500']),
      // which selects the per-hue lightness curve in the grid.
      return hexToOklchPinned(
        value,
        lastSegment,
        tokenPath[tokenPath.length - 2]
      );
    }

    if (isPaletteShadeKey(lastSegment)) {
      console.warn(
        `formatTokenValue: shade-key color "${tokenPath.join('.')}" lacks palette root — falling through to mechanical`
      );
    }

    return hexToOklchMechanical(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return JSON.stringify(value);
}

/**
 * Recursively extract tokens from DTCG format
 * @param {object} obj - Token object
 * @param {string[]} currentPath - Current path in token tree
 * @param {object[]} result - Accumulated results
 * @returns {object[]} Array of { path, value, type, description }
 */
export function extractTokens(obj, currentPath = [], result = []) {
  for (const [key, value] of Object.entries(obj)) {
    // Skip metadata keys
    if (key.startsWith('$')) continue;

    if (value && typeof value === 'object') {
      // Check if this is a token (has $value and $type)
      if (value.$value !== undefined && value.$type !== undefined) {
        result.push({
          path: [...currentPath, key],
          value: value.$value,
          type: value.$type,
          description: value.$description,
        });
      } else {
        // Recurse into group
        extractTokens(value, [...currentPath, key], result);
      }
    }
  }

  return result;
}

/**
 * Convert token path to CSS variable name
 * @param {string[]} tokenPath - Token path array
 * @param {string|null} prefix - Optional prefix (e.g., 'color' for semantic colors)
 * @returns {string} CSS variable name (without --)
 */
export function pathToCssVar(tokenPath, prefix = null) {
  const cssName = tokenPath.join('-');
  return prefix ? `${prefix}-${cssName}` : cssName;
}

/**
 * Convert token path to CSS variable name with optional nx- prefix
 * Used for generating prefixed CSS variables for @nexus_ds/tailwind package
 * @param {string[]} tokenPath - Token path array
 * @param {string|null} categoryPrefix - Optional category prefix (e.g., 'color', 'radius')
 * @param {boolean} useNxPrefix - Whether to add nx- prefix
 * @returns {string} CSS variable name (without --)
 */
export function pathToCssVarPrefixed(
  tokenPath,
  categoryPrefix = null,
  useNxPrefix = false
) {
  const cssName = tokenPath.join('-');
  const base = categoryPrefix ? `${categoryPrefix}-${cssName}` : cssName;
  return useNxPrefix ? `nx-${base}` : base;
}

/**
 * Check if a value is a DTCG reference (e.g., "{blue.500}")
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isReference(value) {
  return (
    typeof value === 'string' && value.startsWith('{') && value.endsWith('}')
  );
}

/**
 * Extract reference path from DTCG reference string
 * @param {string} ref - Reference string like "{blue.500}"
 * @returns {string} Path like "blue.500"
 */
export function extractRefPath(ref) {
  return ref.slice(1, -1);
}

/**
 * Resolve a DTCG reference to CSS var() or raw value
 * @param {*} value - Token value (might be a reference)
 * @param {Map} primitiveMap - Map of primitive token paths to CSS names
 * @returns {string} Resolved CSS value
 */
export function resolveReference(value, primitiveMap) {
  if (!isReference(value)) {
    return value;
  }

  const refPath = extractRefPath(value);
  const primitiveInfo = primitiveMap.get(refPath);

  if (primitiveInfo) {
    return `var(--${primitiveInfo.cssName})`;
  }

  console.warn(`⚠ Reference not found: ${value}`);
  return value;
}

/**
 * Resolve a value that might be a reference or a dimension object
 * @param {*} value - Token value
 * @param {Map} primitiveMap - Map of primitives
 * @param {string} type - Token type
 * @param {string[]} [tokenPath] - Token path for color routing
 * @returns {string} Resolved CSS value
 */
export function resolveValue(value, primitiveMap, type = 'unknown', tokenPath) {
  if (isReference(value)) {
    return resolveReference(value, primitiveMap);
  }

  if (
    type === 'dimension' ||
    (typeof value === 'object' && value !== null && 'value' in value)
  ) {
    return formatTokenValue(value, 'dimension');
  }

  return formatTokenValue(value, type, tokenPath);
}

/**
 * Default configuration for token generation
 */
export const DEFAULT_CONFIG = {
  base: 'stone',
  brand: 'black',
  shadow: 'quiet',
  radius: 'square',
  borderwidth: 'normal',
  motion: 'snappy',
  focus: 'default',
  'chart-categorical': 'default',
  // see CANONICAL_SPACING_DEFAULT_MODE — controls :root cascade only (all 6 modes ship)
  spacingDefault: 'default',
};

// ============================================
// AUTO-DISCOVERY FUNCTIONS
// ============================================

/**
 * Discover all primitive token categories and their modes from file system.
 * Detects categories from:
 * - Root level JSON files (single mode, e.g., color.json)
 * - Subdirectories with {category}-{mode}.json files
 *
 * @param {string} primitivesDir - Path to primitives directory
 * @returns {object} Discovered categories: { category: { modes: string[]|null, files: string[] } }
 */
export function discoverPrimitives(primitivesDir) {
  const result = {};

  if (!fs.existsSync(primitivesDir)) {
    return result;
  }

  const items = fs.readdirSync(primitivesDir, { withFileTypes: true });

  for (const item of items) {
    if (item.name.startsWith('.')) continue; // Skip hidden files

    const fullPath = path.join(primitivesDir, item.name);

    if (item.isDirectory()) {
      // Subdirectory: discover modes from {category}-{mode}.json pattern
      const category = item.name;
      const files = fs.readdirSync(fullPath).filter((f) => f.endsWith('.json'));
      const modes = files
        .map((f) => {
          // Extract mode from {category}-{mode}.json
          const match = f.match(new RegExp(`^${category}-(.+)\\.json$`));
          return match ? match[1] : null;
        })
        .filter(Boolean)
        .sort();

      if (modes.length > 0) {
        result[category] = { modes, files };
      }
    } else if (item.name.endsWith('.json')) {
      // Root level JSON file: single mode category
      const category = item.name.replace('.json', '');
      result[category] = { modes: null, files: [item.name] };
    }
  }

  return result;
}

/**
 * Discover all semantic token themes and standalone files from file system.
 * Detects:
 * - Themed files: {type}-{mode}-{light|dark}.json pattern
 * - Standalone files: {name}.json (no light/dark suffix)
 *
 * @param {string} semanticDir - Path to semantic directory
 * @returns {object} { themed: { type: { mode: { light, dark } } }, standalone: string[], perModeFiles: { category: { mode: filename } } }
 */
export function discoverSemantics(semanticDir) {
  const result = {
    themed: {},
    standalone: [],
    // Bucket for per-mode semantic categories. Keyed by category so a future
    // per-mode category (e.g. per-mode color shading) lands as a sibling key
    // here. Detection of new categories still requires a regex branch below —
    // only `spacing` is wired today.
    perModeFiles: {},
  };

  if (!fs.existsSync(semanticDir)) {
    return result;
  }

  const files = fs.readdirSync(semanticDir).filter((f) => f.endsWith('.json'));

  // Pattern for themed files: {type}-{mode}-{light|dark}.json
  const themedPattern = /^(.+)-(.+)-(light|dark)\.json$/;
  // Pattern for spacing-mode files: spacing-{mode}.json. Their values are
  // direct px (no `{N}` refs) and emit per-mode `[data-density="X"]` blocks via
  // `collectSpacingTokens` — they intentionally bypass the generic
  // standalone-dimension scan, which would otherwise emit each file's keys
  // into `@theme` once per mode and last-write-wins.
  const spacingModePattern = /^spacing-([a-z]+)\.json$/;

  for (const file of files) {
    const spacingMatch = file.match(spacingModePattern);
    if (spacingMatch) {
      const [, mode] = spacingMatch;
      if (!result.perModeFiles.spacing) {
        result.perModeFiles.spacing = {};
      }
      result.perModeFiles.spacing[mode] = file;
      continue;
    }

    const match = file.match(themedPattern);
    if (match) {
      const [, type, mode, variant] = match;

      if (!result.themed[type]) {
        result.themed[type] = {};
      }
      if (!result.themed[type][mode]) {
        result.themed[type][mode] = {};
      }
      result.themed[type][mode][variant] = file;
    } else {
      // Standalone file (no light/dark suffix, not a spacing mode)
      result.standalone.push(file);
    }
  }

  return result;
}

/**
 * Group {base}-light / {base}-dark mode names into pairs; pass others through unchanged.
 * Used by both bundled and modular generators to recognize themed primitive categories.
 *
 * @param {string[]} modes - List of mode names (e.g., ['vega-light', 'vega-dark', 'lyra'])
 * @returns {{ themed: Record<string, { light: string, dark: string }>, plain: string[] }}
 *   themed: base names that have both -light and -dark partners
 *   plain: modes with no themed partner (asymmetric singletons fall here too)
 */
export function partitionThemedModes(modes) {
  const themed = {};
  const plain = [];
  const seen = new Set();

  for (const mode of modes) {
    if (seen.has(mode)) continue;
    const match = mode.match(/^(.+)-(light|dark)$/);
    if (!match) {
      plain.push(mode);
      seen.add(mode);
      continue;
    }
    const [, base, variant] = match;
    const other = variant === 'light' ? `${base}-dark` : `${base}-light`;
    if (modes.includes(other)) {
      themed[base] = {
        light: `${base}-light`,
        dark: `${base}-dark`,
      };
      seen.add(`${base}-light`);
      seen.add(`${base}-dark`);
    } else {
      plain.push(mode);
      seen.add(mode);
    }
  }

  return { themed, plain };
}

/**
 * Return dark tokens whose value diverges from the light token sharing the same
 * cssName. Dark tokens identical to their light counterpart would emit redundant
 * `.dark` (or `html.dark`) overrides; filtering keeps the override block honest.
 */
export function filterDivergentDark(lightTokens, darkTokens) {
  const lightByName = new Map(lightTokens.map((t) => [t.cssName, t.value]));
  return darkTokens.filter((t) => lightByName.get(t.cssName) !== t.value);
}

/**
 * Process a semantic token file and resolve references
 * @param {string} filePath - Full path to semantic file
 * @param {Map} primitiveMap - Primitive map for reference resolution
 * @returns {object[]} Array of { cssName, value, type }
 */
export function processSemanticTokens(filePath, primitiveMap) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Semantic file missing: ${filePath}`);
  }

  const tokenData = readTokenFile(filePath);
  const extracted = extractTokens(tokenData);
  const tokens = [];

  for (const token of extracted) {
    // Add 'nx-color' prefix for color tokens (to match Tailwind prefix(nx) output)
    // No prefix for dimensions (spacing)
    const prefix = token.type === 'color' ? 'nx-color' : null;
    const cssName = pathToCssVar(token.path, prefix);
    const cssValue = resolveValue(
      token.value,
      primitiveMap,
      token.type,
      token.path
    );
    tokens.push({ cssName, value: cssValue, type: token.type });
  }

  return tokens;
}

/**
 * Parse CLI arguments
 * @returns {object} Configuration object
 */
export function parseArgs(
  argv = process.argv.slice(2),
  { allowedKeys = Object.keys(DEFAULT_CONFIG) } = {}
) {
  const config = { ...DEFAULT_CONFIG };
  const validFlags = allowedKeys.map((key) => `--${key}`).join(', ');
  const allowed = new Set(allowedKeys);

  argv.forEach((arg) => {
    if (!arg.startsWith('--')) {
      throw new Error(
        `Unexpected positional argument "${arg}". Use --key=value. Valid flags: ${validFlags}`
      );
    }
    const match = arg.match(/^--([\w-]+)=(.+)$/);
    if (!match) {
      throw new Error(
        `Invalid CLI flag "${arg}". Use --key=value. Valid flags: ${validFlags}`
      );
    }

    const [, key, value] = match;
    if (!allowed.has(key)) {
      throw new Error(
        `Unknown CLI flag "--${key}". Valid flags: ${validFlags}`
      );
    }

    config[key] = value;
  });

  return config;
}

/**
 * Log with emoji prefix
 */
export const log = {
  info: (msg) => console.log(`ℹ ${msg}`),
  success: (msg) => console.log(`✓ ${msg}`),
  warn: (msg) => console.warn(`⚠ ${msg}`),
  error: (msg) => console.error(`✗ ${msg}`),
  file: (msg) => console.log(`  ✓ ${msg}`),
};

// ============================================
// SHADOW COMPOSITE HELPERS
// ============================================

/**
 * Format a shadow property value as a var() reference or literal.
 * References are resolved through the primitive map so the var name matches
 * the actual primitive cssName (e.g. `{color.default}` → `var(--nx-focus-color-default)`
 * when the focus primitive provides it). This means shadow property references
 * can point to any primitive category, not just `--nx-shadow-*`.
 */
function formatShadowPropertyAsVar(value, primitiveMap) {
  if (isReference(value)) {
    return resolveValue(value, primitiveMap);
  }

  if (typeof value === 'object' && value !== null && 'value' in value) {
    return formatTokenValue(value, 'dimension');
  }

  return String(value);
}

function formatShadowLayer(layer, primitiveMap, isInset = false) {
  const x = formatShadowPropertyAsVar(layer.offsetX, primitiveMap);
  const y = formatShadowPropertyAsVar(layer.offsetY, primitiveMap);
  const blur = formatShadowPropertyAsVar(layer.blur, primitiveMap);
  const spread = formatShadowPropertyAsVar(layer.spread, primitiveMap);
  const color = formatShadowPropertyAsVar(layer.color, primitiveMap);
  const inset = isInset || layer.inset ? 'inset ' : '';

  return `${inset}${x} ${y} ${blur} ${spread} ${color}`;
}

/**
 * Format a complete shadow composite (single or multi-layer) to CSS value.
 * `primitiveMap` is required so the resolver can map reference paths to their
 * actual primitive cssNames.
 */
export function formatShadowComposite(value, primitiveMap, isInset = false) {
  const layers = Array.isArray(value) ? value : [value];
  return layers
    .map((layer) => formatShadowLayer(layer, primitiveMap, isInset))
    .join(', ');
}

// ============================================
// GOOGLE FONTS HELPERS
// ============================================

/**
 * Extract Google Fonts information from typography token file
 * Reads font family tokens with $extensions.nx-font-source
 *
 * @param {string} typographyFilePath - Path to typography token file (e.g., typography-default.json)
 * @returns {object[]} Array of { family, weights, styles } for Google Fonts
 */
function extractGoogleFonts(typographyFilePath) {
  if (!fs.existsSync(typographyFilePath)) {
    throw new Error(`Typography file missing: ${typographyFilePath}`);
  }

  const tokenData = readTokenFile(typographyFilePath);
  const googleFonts = [];

  // Look for family tokens with nx-font-source extension
  if (tokenData.family) {
    for (const value of Object.values(tokenData.family)) {
      if (value.$type !== 'fontFamily') continue;

      const fontSource = value.$extensions?.['nx-font-source'];
      if (!fontSource || fontSource.type !== 'google') continue;

      googleFonts.push({
        family: fontSource.family,
        weights: fontSource.weights || [400],
        styles: fontSource.styles || ['normal'],
      });
    }
  }

  return googleFonts;
}

/**
 * Generate Google Fonts @import URL from font specifications
 *
 * @param {object[]} fonts - Array of { family, weights, styles }
 * @returns {string} CSS @import statement or empty string if no fonts
 *
 * @example
 * // Input: [{ family: 'Inter', weights: [400, 700], styles: ['normal'] }]
 * // Output: @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
 */
function generateGoogleFontsImport(fonts) {
  if (!fonts || fonts.length === 0) {
    return '';
  }

  const familyParams = fonts.map((font) => {
    const { family, weights, styles } = font;
    const hasItalic = styles.includes('italic');

    if (hasItalic) {
      // Format: family=Inter:ital,wght@0,400;0,700;1,400;1,700
      const weightVariants = [];
      for (const weight of weights) {
        weightVariants.push(`0,${weight}`); // normal
        weightVariants.push(`1,${weight}`); // italic
      }
      return `family=${family}:ital,wght@${weightVariants.join(';')}`;
    } else {
      // Format: family=Inter:wght@400;700
      return `family=${family}:wght@${weights.join(';')}`;
    }
  });

  const url = `https://fonts.googleapis.com/css2?${familyParams.join('&')}&display=swap`;
  return `@import url('${url}');`;
}

/**
 * Extract Google Fonts and generate @import statement from typography token file
 * Convenience function that combines extractGoogleFonts and generateGoogleFontsImport
 *
 * @param {string} typographyFilePath - Path to typography token file
 * @returns {string} CSS @import statement or empty string if no Google Fonts
 */
export function getGoogleFontsImportFromTokens(typographyFilePath) {
  const fonts = extractGoogleFonts(typographyFilePath);
  return generateGoogleFontsImport(fonts);
}

// ============================================
// TYPOGRAPHY UTILITIES
// ============================================

/**
 * Resolve a typography property value to CSS
 * Handles 'auto' values, references, dimension objects, and raw values
 *
 * @param {*} value - Typography property value
 * @param {Map} primitiveMap - Map of primitives with nx- prefixed cssName
 * @returns {string} Resolved CSS value
 */
function resolveTypographyProperty(value, primitiveMap) {
  // Figma exports `lineHeight: "auto"` for the code-inline typography token,
  // but `line-height: auto` is invalid CSS — browsers ignore it. Map to
  // `normal` (CSS spec default, ~1.2) so the emitted utility is well-formed.
  if (value === 'auto') return 'normal';
  return resolveValue(value, primitiveMap, 'unknown');
}

/**
 * Generate typography utility CSS from token file
 * Creates @utility rules with typography-* prefix for all typography composite tokens
 *
 * @param {string} tokensDir - Path to tokens directory (contains styles/typography.json)
 * @param {Map} primitiveMap - Map of primitives with nx- prefixed cssName
 * @returns {{ css: string, count: number }} Generated CSS and token count
 */
export function generateTypographyUtilitiesCSS(tokensDir, primitiveMap) {
  const typographyPath = path.join(tokensDir, 'styles/typography.json');

  if (!fs.existsSync(typographyPath)) {
    throw new Error(`Typography styles file missing: ${typographyPath}`);
  }

  const tokenData = readTokenFile(typographyPath);
  const tokens = extractTokens(tokenData).filter(
    (t) => t.type === 'typography'
  );

  if (tokens.length === 0) {
    return { css: '', count: 0 };
  }

  let css = `/* Typography Utilities */\n\n`;

  for (const token of tokens) {
    const name = token.path.join('-');
    const value = token.value;

    // Use 'typography-' prefix to avoid tailwind-merge conflicts with Tailwind's
    // text-* utilities (which are used for both color and font-size)
    css += `@utility typography-${name} {\n`;

    if (value.fontFamily) {
      css += `  font-family: ${resolveTypographyProperty(value.fontFamily, primitiveMap)};\n`;
    }
    if (value.fontSize) {
      css += `  font-size: ${resolveTypographyProperty(value.fontSize, primitiveMap)};\n`;
    }
    if (value.fontWeight) {
      css += `  font-weight: ${resolveTypographyProperty(value.fontWeight, primitiveMap)};\n`;
    }
    if (value.lineHeight) {
      css += `  line-height: ${resolveTypographyProperty(value.lineHeight, primitiveMap)};\n`;
    }
    if (value.letterSpacing) {
      css += `  letter-spacing: ${resolveTypographyProperty(value.letterSpacing, primitiveMap)};\n`;
    }

    if (token.path[0] === 'body') {
      // orphan/widow protection for multi-line copy
      css += `  text-wrap: pretty;\n`;
    }

    css += `}\n\n`;
  }

  return { css, count: tokens.length };
}

// ============================================
// BORDER WIDTH UTILITIES
// ============================================

const BORDER_WIDTH_UTILITIES_PER_TOKEN = 14;

/**
 * Generate border width utility CSS from token array.
 * Creates @utility rules with border-{side?}-{name} patterns for all
 * borderwidth tokens, so runtime stroke modes can affect one-sided borders.
 *
 * @param {object[]} tokens - Array of borderwidth tokens with cssName property (e.g., "nx-borderwidth-default")
 * @returns {{ css: string, count: number }} Generated CSS and utility count
 */
export function generateBorderWidthUtilitiesCSS(tokens) {
  if (!tokens || tokens.length === 0) {
    return { css: '', count: 0 };
  }

  let css = `/* Border Width Utilities */\n\n`;

  for (const token of tokens) {
    // Extract the name part (e.g., "default" from "nx-borderwidth-default")
    const name = token.cssName.replace('nx-borderwidth-', '');
    const value = `var(--${token.cssName})`;

    css += `@utility border-${name} {\n`;
    css += `  border-style: var(--tw-border-style, solid);\n`;
    css += `  border-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-x-${name} {\n`;
    css += `  border-inline-style: var(--tw-border-style, solid);\n`;
    css += `  border-inline-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-y-${name} {\n`;
    css += `  border-block-style: var(--tw-border-style, solid);\n`;
    css += `  border-block-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-t-${name} {\n`;
    css += `  border-top-style: var(--tw-border-style, solid);\n`;
    css += `  border-top-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-r-${name} {\n`;
    css += `  border-right-style: var(--tw-border-style, solid);\n`;
    css += `  border-right-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-b-${name} {\n`;
    css += `  border-bottom-style: var(--tw-border-style, solid);\n`;
    css += `  border-bottom-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-l-${name} {\n`;
    css += `  border-left-style: var(--tw-border-style, solid);\n`;
    css += `  border-left-width: ${value};\n`;
    css += `}\n\n`;
  }

  css += `/* Border Width Alias Utilities */\n\n`;

  for (const token of tokens) {
    const name = token.cssName.replace('nx-borderwidth-', '');
    const value = `var(--${token.cssName})`;

    css += `@utility border-width-${name} {\n`;
    css += `  border-style: var(--tw-border-style, solid);\n`;
    css += `  border-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-width-x-${name} {\n`;
    css += `  border-inline-style: var(--tw-border-style, solid);\n`;
    css += `  border-inline-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-width-y-${name} {\n`;
    css += `  border-block-style: var(--tw-border-style, solid);\n`;
    css += `  border-block-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-width-t-${name} {\n`;
    css += `  border-top-style: var(--tw-border-style, solid);\n`;
    css += `  border-top-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-width-r-${name} {\n`;
    css += `  border-right-style: var(--tw-border-style, solid);\n`;
    css += `  border-right-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-width-b-${name} {\n`;
    css += `  border-bottom-style: var(--tw-border-style, solid);\n`;
    css += `  border-bottom-width: ${value};\n`;
    css += `}\n\n`;

    css += `@utility border-width-l-${name} {\n`;
    css += `  border-left-style: var(--tw-border-style, solid);\n`;
    css += `  border-left-width: ${value};\n`;
    css += `}\n\n`;
  }

  return { css, count: tokens.length * BORDER_WIDTH_UTILITIES_PER_TOKEN };
}

const BORDER_COLOR_ALIAS_NAMES = new Set([
  'default',
  'default-alpha',
  'active',
  'disabled',
  'warning',
  'warning-active',
  'success',
  'success-active',
  'error',
  'error-active',
  'information',
  'information-active',
  'primary',
  'primary-active',
]);

function getBorderColorAliasName(cssName) {
  const prefix = 'color-border-';
  if (!cssName.startsWith(prefix)) {
    return null;
  }

  const name = cssName.slice(prefix.length);
  return BORDER_COLOR_ALIAS_NAMES.has(name) ? name : null;
}

/**
 * Generate border color alias utility CSS from semantic color tokens.
 * Creates @utility rules with border-color-{name} patterns for every
 * semantic color token in the border namespace.
 *
 * @param {object[]} tokens - Array of semantic color tokens with cssName property (e.g., "color-border-default")
 * @returns {{ css: string, count: number }} Generated CSS and utility count
 */
export function generateBorderColorAliasUtilitiesCSS(tokens) {
  const borderColorTokens = (tokens ?? [])
    .map((token) => ({ token, name: getBorderColorAliasName(token.cssName) }))
    .filter(({ name }) => name !== null);

  if (borderColorTokens.length === 0) {
    return { css: '', count: 0 };
  }

  let css = `/* Border Color Alias Utilities */\n\n`;

  for (const { token, name } of borderColorTokens) {
    css += `@utility border-color-${name} {\n`;
    css += `  border-color: var(--${token.cssName});\n`;
    css += `}\n\n`;
  }

  return { css, count: borderColorTokens.length };
}

// ============================================
// TOKEN COLLECTION FOR @THEME BLOCKS
// ============================================

/**
 * Canonical spacing codegen baseline. Used by the generators to pick the mode
 * whose numeric subset seeds Tailwind's `@theme` block (the build-time
 * contract for utility codegen and the `VEGA_BASELINE` byte-identity test).
 * Distinct from `config.spacingDefault`, which only moves the runtime `:root`
 * cascade default — all six modes still emit either way.
 */
export const CANONICAL_SPACING_DEFAULT_MODE = 'default';

/**
 * Collect spacing tokens from per-mode `semantic/spacing-{mode}.json` files.
 *
 * Returns a map keyed by mode name; each value is the token list for that
 * mode. Token `cssName` is the JSON path joined with `-` (e.g. `spacing-0`,
 * `container-p`, `layout-section-gap`) — **without**
 * the `nx-` prefix. Callers add the prefix at emit time based on context:
 *
 *  - `@theme` block (numeric subset only) emits unprefixed (`--spacing-0`).
 *    Tailwind v4's `prefix(nx)` rewrites these to `--nx-spacing-0` at
 *    consumer build time, and codegens `nx:p-0` / `nx:m-0` / `nx:gap-0`
 *    utilities from the `--spacing-*` namespace.
 *  - Per-mode override blocks (outside `@theme`) emit the already-prefixed
 *    form (`--nx-spacing-0`) directly, because Tailwind doesn't rewrite
 *    variables outside `@theme`. See `generateSpacingModesCSS`.
 *  - `@utility` role declarations reference the prefixed form
 *    (`var(--nx-container-p)`). See `generateSpacingRoleUtilitiesCSS`.
 *
 * Throws on cssName collisions across paths within a single mode — two paths
 * flattening to the same name (e.g. `layout.section-gap` and
 * `layout.section.gap` both → `layout-section-gap`) would silently lose
 * one declaration.
 *
 * @param {string} semanticDir - Path to semantic directory
 * @returns {Record<string, {cssName: string, path: string[], value: string}[]>}
 *   Modes keyed by name (e.g. `vega`, `lyra`, `maia`, `mira`, `nova`, `luma`, `sera`).
 *   Each token carries the original JSON `path` so downstream emitters
 *   (`generateSpacingRoleUtilitiesCSS`) can derive structure without
 *   reverse-engineering it from `cssName`.
 */
export function collectSpacingTokens(semanticDir) {
  const { perModeFiles } = discoverSemantics(semanticDir);
  const spacingFiles = perModeFiles.spacing ?? {};

  const modeNames = Object.keys(spacingFiles);
  if (modeNames.length === 0) {
    throw new Error(
      `collectSpacingTokens: no semantic/spacing-{mode}.json files found in ${semanticDir}`
    );
  }

  const result = {};

  for (const mode of modeNames) {
    const filePath = path.join(semanticDir, spacingFiles[mode]);
    const tokenData = readTokenFile(filePath);
    const extracted = extractTokens(tokenData);
    const tokens = [];
    const seen = new Set();

    for (const token of extracted) {
      const cssName = token.path.join('-');
      if (seen.has(cssName)) {
        throw new Error(
          `collectSpacingTokens: cssName collision "${cssName}" in ${spacingFiles[mode]} — two JSON paths flatten to the same variable name`
        );
      }
      seen.add(cssName);
      tokens.push({
        cssName,
        path: token.path,
        value: formatTokenValue(token.value, token.type, token.path),
      });
    }

    result[mode] = tokens;
  }

  return result;
}

/**
 * Top-level keys that may appear in `spacing-{mode}.json`. Acts as a closed
 * allowlist for `splitSpacingTokens` so a future accidental top-level key
 * (e.g. `motion`, `border`) throws at partition time — close to the JSON
 * edit — instead of falling through to `deriveRoleUtility` and producing
 * cryptic "unhandled path shape" errors at the emit step.
 */
const SPACING_NUMERIC_ROOTS = new Set(['spacing']);
const SPACING_ROLE_ROOTS = new Set(['container', 'layout']);

/**
 * Split a per-mode token list into `{ numeric, role }` halves. Numeric tokens
 * (path starts with `spacing`) feed `@theme` for Tailwind's `nx:p-*` /
 * `nx:m-*` / `nx:gap-*` / `nx:h-*` / `nx:w-*` utility codegen. Role tokens
 * (`container.*`, `layout.*`) feed only the per-mode
 * `[data-density="X"]` overrides and the `spacing-utilities` `@utility`
 * declarations. Role tokens never enter `@theme`, both because Tailwind v4's
 * `--container-*` namespace would otherwise auto-codegen `nx:w-p` and
 * friends from `--nx-container-p`, and because role tokens don't map onto
 * Tailwind's unified `--spacing-*` namespace cleanly.
 *
 * Partitioning reads `token.path[0]` — `path` is the structured form,
 * `cssName` is the flattened output artifact. Throws when a path's root is
 * outside the two allowlists; extending requires a deliberate edit here.
 */
export function splitSpacingTokens(tokens) {
  const numeric = [];
  const role = [];
  for (const token of tokens) {
    const root = token.path[0];
    if (SPACING_NUMERIC_ROOTS.has(root)) {
      numeric.push(token);
    } else if (SPACING_ROLE_ROOTS.has(root)) {
      role.push(token);
    } else {
      throw new Error(
        `splitSpacingTokens: unknown top-level key "${root}" in path [${token.path.join('.')}] — extend SPACING_NUMERIC_ROOTS / SPACING_ROLE_ROOTS`
      );
    }
  }
  return { numeric, role };
}

/**
 * Emit per-mode `[data-density="X"]` CSS blocks for spacing.
 *
 * The selected default mode is published under `:root, [data-density="<mode>"]`
 * so any document with no `data-density` attribute still resolves to it. The
 * remaining five modes emit in alphabetical order for cross-platform
 * determinism (filesystem order isn't portable; sorting locks it).
 *
 * Each block emits ALL spacing tokens for that mode (numeric + role) — even
 * when a value matches the default. The redundancy is small (~48 lines × 6
 * non-default modes ≈ 300 lines) and the explicitness is the point: a reader
 * sees the full per-mode contract in one place.
 *
 * Variable names are emitted already-prefixed (`--nx-spacing-N`,
 * `--nx-container-p`, …). Tailwind v4's `prefix(nx)` rewrites variables
 * inside `@theme` but does NOT rewrite variables declared in `:root` /
 * attribute-selector blocks, so writing the prefixed form here is what makes
 * mode-switching actually override the utility's `var(--nx-spacing-N)`
 * reference. (Mirrors `prefixDarkVars: true` in the `.dark` block.)
 *
 * @param {Record<string, {cssName: string, value: string}[]>} modesByName
 * @param {object} [opts]
 * @param {string} [opts.defaultMode=CANONICAL_SPACING_DEFAULT_MODE]
 * @param {string} [opts.attrName='data-density']
 * @param {string} [opts.commentLabel='SPACING']
 * @param {string} [opts.duplicateValuePrefix='spacing-']
 * @returns {string} CSS string with all per-mode blocks
 */
export function generateSpacingModesCSS(modesByName, opts = {}) {
  const {
    defaultMode = CANONICAL_SPACING_DEFAULT_MODE,
    attrName = 'data-density',
    commentLabel = 'SPACING',
    duplicateValuePrefix = 'spacing-',
  } = opts;

  const allModes = Object.keys(modesByName);
  if (!allModes.includes(defaultMode)) {
    throw new Error(
      `generateSpacingModesCSS: defaultMode "${defaultMode}" not found among modes [${allModes.join(', ')}]`
    );
  }

  // Intra-mode duplicate-value warning for numeric tokens. Keys off the
  // `spacing-` cssName prefix because the documented input shape is
  // `{cssName, value}[]` — `path` may be absent in some callers/tests.
  for (const mode of allModes) {
    const valueByName = new Map();
    for (const token of modesByName[mode]) {
      if (!duplicateValuePrefix) {
        continue;
      }
      if (!token.cssName.startsWith(duplicateValuePrefix)) {
        continue;
      }
      const collision = valueByName.get(token.value);
      if (collision) {
        log.warn(
          `generateSpacingModesCSS: ${mode} — "${token.cssName}" and "${collision}" both resolve to ${token.value} (intra-mode numeric duplicate)`
        );
      } else {
        valueByName.set(token.value, token.cssName);
      }
    }
  }

  const otherModes = allModes.filter((m) => m !== defaultMode).sort();

  let css = `\n/* ===== PER-MODE ${commentLabel} (mode swap via [${attrName}="X"] on any ancestor) ===== */\n`;

  // Per-mode blocks live OUTSIDE @theme — Tailwind v4's `prefix(nx)` only
  // rewrites variables declared inside @theme, so we add the `nx-` prefix
  // here so the declarations actually override the `var(--nx-spacing-*)` /
  // `var(--nx-container-*)` etc. references in compiled utilities.
  const writeBlock = (selector, tokens) => {
    let block = `${selector} {\n`;
    for (const token of tokens) {
      block += `  --nx-${token.cssName}: ${token.value};\n`;
    }
    block += `}\n`;
    return block;
  };

  css += `\n${writeBlock(`:root,\n[${attrName}="${defaultMode}"]`, modesByName[defaultMode])}`;
  for (const mode of otherModes) {
    css += `\n${writeBlock(`[${attrName}="${mode}"]`, modesByName[mode])}`;
  }

  return css;
}

/**
 * Emit light/dark per-mode CSS blocks for themed primitive families.
 *
 * @param {Record<string, {light: {cssName: string, value: string}[], dark: {cssName: string, value: string}[]}>} modesByName
 * @param {object} opts
 * @param {string} opts.defaultMode
 * @param {string} opts.attrName
 * @param {string} opts.commentLabel
 * @returns {string} CSS string with all per-mode light + dark blocks
 */
export function generateThemedModesCSS(modesByName, opts) {
  const { defaultMode, attrName, commentLabel } = opts;

  const allModes = Object.keys(modesByName);
  if (!allModes.includes(defaultMode)) {
    throw new Error(
      `generateThemedModesCSS: defaultMode "${defaultMode}" not found among modes [${allModes.join(', ')}]`
    );
  }

  const writeBlock = (selector, tokens) => {
    let block = `${selector} {\n`;
    for (const token of tokens) {
      block += `  --nx-${token.cssName}: ${token.value};\n`;
    }
    block += `}\n`;
    return block;
  };

  const otherModes = allModes.filter((m) => m !== defaultMode).sort();

  let css = `\n/* ===== PER-MODE ${commentLabel} (mode swap via [${attrName}="X"] on any ancestor) ===== */\n`;

  css += `\n${writeBlock(`:root,\n[${attrName}="${defaultMode}"]`, modesByName[defaultMode].light)}`;
  css += `\n${writeBlock(`.dark,\n.dark[${attrName}="${defaultMode}"],\n.dark [${attrName}="${defaultMode}"]`, modesByName[defaultMode].dark)}`;

  for (const mode of otherModes) {
    css += `\n${writeBlock(`[${attrName}="${mode}"]`, modesByName[mode].light)}`;
    css += `\n${writeBlock(`.dark[${attrName}="${mode}"],\n.dark [${attrName}="${mode}"]`, modesByName[mode].dark)}`;
  }

  return css;
}

/**
 * Three-segment family registry. Each row defines one CSS-design decision —
 * what utility prefix to emit and which CSS properties to set — for one
 * family segment of a `[role, family, size]` role-token path. The 2-segment
 * paths (`container.p`, `container.gap`, `layout.<x>-gap`) are handled
 * inline in `deriveRoleUtility` and do not go through this map.
 *
 * Adding a new 3-segment family (e.g. `m` → `margin`) means adding one row
 * here. The set of role tokens themselves is JSON-driven — see
 * `generateSpacingRoleUtilitiesCSS`.
 */
const FAMILY_TO_UTILITY = {
  'padding-x': { prefix: 'px', properties: ['padding-left', 'padding-right'] },
  'padding-y': { prefix: 'py', properties: ['padding-top', 'padding-bottom'] },
  gap: { prefix: 'gap', properties: ['gap'] },
};

/**
 * Derive a `{utilityName, properties}` for a role-token path.
 *
 * Naming convention — `<property-shorthand>-<role>[-<size>]`:
 *   `<role>.<family>.<size>`  → utility `<prefix>-<role>-<size>` (3-segment form)
 *   `container.p`             → utility `p-container`,         padding
 *   `container.gap`           → utility `gap-container`,       gap
 *   `layout.section-gap`      → utility `gap-layout-section`,  gap
 *   `layout.stack-gap`        → utility `gap-layout-stack`,    gap
 *
 * Utility-name prefix per property:
 *   padding      → `p-`
 *   padding-x    → `px-`
 *   padding-y    → `py-`
 *   gap          → `gap-`
 *
 * The last path segment selects the property family (and may be a size
 * suffix like `sm/md/lg`, or the family token itself like `gap`); the
 * preceding segments form the role name.
 */
function deriveRoleUtility(tokenPath) {
  // Path forms we handle:
  //   [role, suffix]             — e.g. ['container', 'p'], ['container', 'gap']
  //   [role, family, size]       — 3-segment form (e.g. ['<role>', 'padding-x', 'md'])
  //   [role, 'X-gap']            — e.g. ['layout', 'section-gap'] (composite suffix)
  if (tokenPath.length < 2 || tokenPath.length > 3) {
    throw new Error(
      `deriveRoleUtility: path [${tokenPath.join('.')}] has ${tokenPath.length} segment(s); only 2- or 3-segment role paths are supported`
    );
  }
  const [role, second, third] = tokenPath;

  // Three-segment path: [role, family, size]. family ∈ {padding-x, padding-y, gap}.
  if (third !== undefined) {
    const family = second;
    const size = third;
    const entry = FAMILY_TO_UTILITY[family];
    if (!entry) {
      throw new Error(
        `deriveRoleUtility: unknown family "${family}" in path [${tokenPath.join('.')}] — extend FAMILY_TO_UTILITY`
      );
    }
    return {
      utilityName: `${entry.prefix}-${role}-${size}`,
      properties: entry.properties,
    };
  }

  // Two-segment path: [role, suffix].
  //   suffix === 'gap'         → gap-<role>
  //   suffix === 'p'           → p-<role>
  //   suffix === '<x>-gap'     → gap-<role>-<x>  (e.g. layout.section-gap → gap-layout-section)
  if (second === 'gap') {
    return { utilityName: `gap-${role}`, properties: ['gap'] };
  }
  if (second === 'p') {
    return { utilityName: `p-${role}`, properties: ['padding'] };
  }
  const gapSuffixMatch = second.match(/^(.+)-gap$/);
  if (gapSuffixMatch) {
    const [, qualifier] = gapSuffixMatch;
    return { utilityName: `gap-${role}-${qualifier}`, properties: ['gap'] };
  }

  throw new Error(
    `deriveRoleUtility: unhandled path shape [${tokenPath.join('.')}] — extend deriveRoleUtility cases`
  );
}

/**
 * Generate `@utility` declarations for spacing role tokens.
 *
 * Walks the canonical mode's role tokens, derives each utility name +
 * property set from the token's structured JSON `path`, and emits one
 * `@utility` declaration referencing the already-prefixed CSS variable.
 *
 * Data-driven by design: adding a new role key to the canonical spacing mode (and
 * the other five mode files, per the schema contract) automatically grows the
 * utility set. The Phase 2 drift test asserts utilities ↔ role tokens stay
 * 1:1.
 *
 * @param {{cssName: string, path: string[], value: string}[]} canonicalRoleTokens
 *   Role tokens from the canonical spacing mode. Each carries the original
 *   JSON `path` so the emitter never reverse-engineers structure that
 *   already exists upstream.
 * @returns {{css: string, count: number}}
 */
export function generateSpacingRoleUtilitiesCSS(canonicalRoleTokens) {
  let css = `/* Spacing role utilities — data-driven from canonical mode role tokens. */\n\n`;

  let count = 0;
  for (const token of canonicalRoleTokens) {
    const { utilityName, properties } = deriveRoleUtility(token.path);

    css += `@utility ${utilityName} {\n`;
    for (const prop of properties) {
      // @utility lives in Tailwind's source-pass, so it WILL pick up the
      // `prefix(nx)` rewrite — but the var name we're referencing is in our
      // own per-mode `[data-density="X"]` block, which is already prefixed.
      // Emit the prefixed form directly so both sides match.
      css += `  ${prop}: var(--nx-${token.cssName});\n`;
    }
    css += `}\n\n`;
    count += 1;
  }

  return { css, count };
}

/**
 * Collect z-index token mappings from z-index.json.
 * Returns array of { cssName, value } for the @theme block. Unlike
 * spacing/radius/borderwidth, z-index tokens carry direct unitless values (no
 * primitive layer) — they have no modes and no light/dark variance.
 *
 * @param {string} semanticDir - Path to semantic directory
 * @returns {object[]} Array of { cssName, value }
 */
export function collectZIndexTokens(semanticDir) {
  const filePath = path.join(semanticDir, 'z-index.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Z-index semantic file missing: ${filePath}`);
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  for (const [key, value] of Object.entries(tokenData)) {
    if (key.startsWith('$')) continue;
    if (value.$type !== 'number') {
      throw new Error(
        `Z-index token "${key}" has $type "${value.$type}" but must be "number" (${filePath})`
      );
    }
    if (typeof value.$value !== 'number') {
      throw new Error(
        `Z-index token "${key}" has a non-numeric $value ${JSON.stringify(value.$value)} but must be a number (${filePath})`
      );
    }
    tokens.push({ cssName: key, value: String(value.$value) });
  }

  return tokens;
}

/**
 * Collect breakpoint token mappings from breakpoints.json.
 * Returns array of { cssName, value } for the @theme block. Like z-index,
 * breakpoints are standalone semantics with direct values (no primitive layer,
 * no modes, no light/dark) — but they carry rem dimensions, so the value is
 * formatted from a structured { value, unit } and the unit is required to be
 * rem (a px breakpoint would silently defeat font-size scaling).
 *
 * @param {string} semanticDir - Path to semantic directory
 * @returns {object[]} Array of { cssName, value }
 */
export function collectBreakpointsTokens(semanticDir) {
  const filePath = path.join(semanticDir, 'breakpoints.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Breakpoints semantic file missing: ${filePath}`);
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  for (const [key, value] of Object.entries(tokenData)) {
    if (key.startsWith('$')) continue;
    if (value.$type !== 'dimension') {
      throw new Error(
        `Breakpoint token "${key}" has $type "${value.$type}" but must be "dimension" (${filePath})`
      );
    }
    const dim = value.$value;
    if (
      typeof dim !== 'object' ||
      dim === null ||
      typeof dim.value !== 'number' ||
      dim.unit !== 'rem'
    ) {
      throw new Error(
        `Breakpoint token "${key}" must be a rem dimension { value: number, unit: "rem" } (${filePath})`
      );
    }
    tokens.push({ cssName: key, value: formatTokenValue(dim, 'dimension') });
  }

  return tokens;
}

/**
 * Flatten one primitive mode file into runtime override literals.
 *
 * @param {string} filePath - Primitive token file path
 * @param {string} cssPrefix - CSS variable family prefix, e.g. "radius"
 * @param {string} caller - Function name for error messages
 * @returns {{cssName: string, path: string[], value: string}[]}
 */
function collectPrimitiveModeFile(filePath, cssPrefix, caller) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${caller}: primitive file missing: ${filePath}`);
  }

  const tokenData = readTokenFile(filePath);
  const extracted = extractTokens(tokenData);
  const tokens = [];
  const seen = new Set();

  for (const token of extracted) {
    const cssName = `${cssPrefix}-${token.path.join('-')}`;
    if (seen.has(cssName)) {
      throw new Error(
        `${caller}: cssName collision "${cssName}" in ${filePath} — two JSON paths flatten to the same variable name`
      );
    }
    seen.add(cssName);
    tokens.push({
      cssName,
      path: token.path,
      value: formatTokenValue(token.value, token.type, token.path),
    });
  }

  return tokens;
}

function discoverPrimitiveModeFiles(tokensDir, category, caller) {
  const dir = path.join(tokensDir, 'primitives', category);
  if (!fs.existsSync(dir)) {
    throw new Error(`${caller}: primitive directory missing: ${dir}`);
  }

  const filesByMode = {};
  for (const file of fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))) {
    const match = file.match(new RegExp(`^${category}-(.+)\\.json$`));
    if (!match) continue;
    filesByMode[match[1]] = file;
  }

  const modes = Object.keys(filesByMode);
  if (modes.length === 0) {
    throw new Error(
      `${caller}: no ${category}-{mode}.json files found in ${dir}`
    );
  }

  return { dir, filesByMode, modes };
}

/**
 * Collect all radius primitive modes as runtime override literals.
 *
 * @param {string} tokensDir - Path to tokens directory
 * @returns {Record<string, {cssName: string, path: string[], value: string}[]>}
 */
export function collectRadiusModes(tokensDir) {
  const { dir, filesByMode, modes } = discoverPrimitiveModeFiles(
    tokensDir,
    'radius',
    'collectRadiusModes'
  );
  const result = {};
  for (const mode of modes) {
    result[mode] = collectPrimitiveModeFile(
      path.join(dir, filesByMode[mode]),
      'radius',
      'collectRadiusModes'
    );
  }
  return result;
}

/**
 * Collect all border width primitive modes as runtime override literals.
 *
 * @param {string} tokensDir - Path to tokens directory
 * @returns {Record<string, {cssName: string, path: string[], value: string}[]>}
 */
export function collectBorderwidthModes(tokensDir) {
  const { dir, filesByMode, modes } = discoverPrimitiveModeFiles(
    tokensDir,
    'borderwidth',
    'collectBorderwidthModes'
  );
  const result = {};
  for (const mode of modes) {
    result[mode] = collectPrimitiveModeFile(
      path.join(dir, filesByMode[mode]),
      'borderwidth',
      'collectBorderwidthModes'
    );
  }
  return result;
}

/**
 * Collect all shadow primitive modes as runtime override literals, preserving
 * light/dark partners for the themed shadow primitive files.
 *
 * @param {string} tokensDir - Path to tokens directory
 * @returns {Record<string, {light: {cssName: string, path: string[], value: string}[], dark: {cssName: string, path: string[], value: string}[]}>}
 */
export function collectShadowModes(tokensDir) {
  const dir = path.join(tokensDir, 'primitives', 'shadow');
  if (!fs.existsSync(dir)) {
    throw new Error(`collectShadowModes: primitive directory missing: ${dir}`);
  }

  const filesByMode = {};
  for (const file of fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))) {
    const match = file.match(/^shadow-(.+)-(light|dark)\.json$/);
    if (!match) continue;
    const [, mode, variant] = match;
    filesByMode[mode] ??= {};
    filesByMode[mode][variant] = file;
  }

  const modes = Object.keys(filesByMode);
  if (modes.length === 0) {
    throw new Error(
      `collectShadowModes: no shadow-{mode}-{light|dark}.json files found in ${dir}`
    );
  }

  const result = {};
  for (const mode of modes) {
    const pair = filesByMode[mode];
    if (!pair.light || !pair.dark) {
      throw new Error(
        `collectShadowModes: mode "${mode}" must provide both light and dark primitive files`
      );
    }
    result[mode] = {
      light: collectPrimitiveModeFile(
        path.join(dir, pair.light),
        'shadow',
        'collectShadowModes'
      ),
      dark: collectPrimitiveModeFile(
        path.join(dir, pair.dark),
        'shadow',
        'collectShadowModes'
      ),
    };
  }
  return result;
}

/**
 * Collect radius token mappings from a mode file
 * Returns array of { cssName, varRef } for @theme block
 *
 * @param {string} tokensDir - Path to tokens directory
 * @param {string} mode - Radius mode (e.g., 'subtle')
 * @returns {object[]} Array of { cssName, varRef }
 */
export function collectRadiusTokens(tokensDir, mode) {
  const filePath = path.join(
    tokensDir,
    `primitives/radius/radius-${mode}.json`
  );
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Radius primitive file missing: ${filePath} (mode "${mode}")`
    );
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  for (const key of Object.keys(tokenData)) {
    if (key.startsWith('$')) continue;
    tokens.push({
      cssName: `radius-${key}`,
      varRef: `var(--nx-radius-${key})`,
    });
  }

  return tokens;
}

/**
 * Collect borderwidth token mappings from a mode file
 * Returns array of { cssName, varRef } for @theme block
 *
 * @param {string} tokensDir - Path to tokens directory
 * @param {string} mode - Borderwidth mode (e.g., 'vega')
 * @returns {object[]} Array of { cssName, varRef }
 */
export function collectBorderwidthTokens(tokensDir, mode) {
  const filePath = path.join(
    tokensDir,
    `primitives/borderwidth/borderwidth-${mode}.json`
  );
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Borderwidth primitive file missing: ${filePath} (mode "${mode}")`
    );
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  for (const key of Object.keys(tokenData)) {
    if (key.startsWith('$')) continue;
    tokens.push({
      cssName: `border-${key}`,
      varRef: `var(--nx-borderwidth-${key})`,
    });
  }

  return tokens;
}

/**
 * Collect motion token mappings from a mode file.
 * Returns array of { group, key, cssName, varRef }. The source primitive
 * variables stay namespaced as --nx-motion-*; easing tokens also enter
 * Tailwind's --ease-* namespace, while duration tokens use explicit
 * @utility declarations because Tailwind v4 does not codegen named
 * duration-* utilities from --duration-* theme vars.
 *
 * @param {string} tokensDir - Path to tokens directory
 * @param {string} mode - Motion mode (e.g., 'snappy')
 * @returns {object[]} Array of { cssName, varRef }
 */
export function collectMotionTokens(tokensDir, mode) {
  const filePath = path.join(
    tokensDir,
    `primitives/motion/motion-${mode}.json`
  );
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Motion primitive file missing: ${filePath} (mode "${mode}")`
    );
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  for (const group of ['duration', 'ease']) {
    const groupData = tokenData[group];
    if (!groupData || typeof groupData !== 'object') {
      throw new Error(
        `Motion primitive file ${filePath} must include a "${group}" group`
      );
    }

    for (const key of Object.keys(groupData)) {
      if (key.startsWith('$')) continue;
      tokens.push({
        group,
        key,
        cssName: `${group}-${key}`,
        varRef: `var(--nx-motion-${group}-${key})`,
      });
    }
  }

  return tokens;
}

/**
 * Generate `@utility` declarations for motion duration tokens.
 *
 * Tailwind v4 codegens named easing utilities from --ease-* theme vars, but
 * not named duration utilities from --duration-* vars. Emit duration-* as
 * explicit utilities so classes such as nx:duration-fast are real.
 *
 * @param {{group?: string, key?: string, cssName: string, varRef: string}[]} motionTokens
 * @returns {{css: string, count: number}}
 */
export function generateMotionUtilitiesCSS(motionTokens) {
  const durationTokens = motionTokens.filter(
    (token) => token.group === 'duration'
  );

  if (durationTokens.length === 0) {
    return { css: '', count: 0 };
  }

  let css = `/* Motion duration utilities - data-driven from canonical motion tokens. */\n\n`;

  for (const token of durationTokens) {
    css += `@utility duration-${token.key} {\n`;
    css += `  --tw-duration: ${token.varRef};\n`;
    css += `  transition-duration: ${token.varRef};\n`;
    css += `}\n\n`;
  }

  css += `@keyframes overlay-presence-exit {\n`;
  css += `  from,\n`;
  css += `  to {\n`;
  css += `    opacity: 1;\n`;
  css += `  }\n`;
  css += `}\n\n`;
  css += `@utility animate-overlay-presence-exit {\n`;
  css += `  animation-name: overlay-presence-exit;\n`;
  css += `  animation-duration: var(--tw-duration, var(--nx-motion-duration-fast));\n`;
  css += `  animation-timing-function: linear;\n`;
  css += `}\n\n`;

  return { css, count: durationTokens.length };
}

/**
 * Collect shadow token CSS values with var() references
 * Returns array of { cssName, value } for @theme block
 */
export function collectShadowTokens(tokensDir, primitiveMap) {
  const stylesFile = path.join(tokensDir, 'styles/shadows.json');
  if (!fs.existsSync(stylesFile)) {
    throw new Error(`Shadow styles file missing: ${stylesFile}`);
  }

  const tokenData = readTokenFile(stylesFile);
  const shadows = [];

  for (const [key, value] of Object.entries(tokenData)) {
    if (key.startsWith('$')) continue;

    if (value.$type !== 'shadow') {
      // Handle nested (like focus.default, focus.error)
      if (typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subKey.startsWith('$')) continue;
          if (subValue.$type === 'shadow') {
            const shadowName = `${key}-${subKey}`;
            const cssValue = formatShadowComposite(
              subValue.$value,
              primitiveMap
            );
            shadows.push({ cssName: `shadow-${shadowName}`, value: cssValue });
          }
        }
      }
      continue;
    }

    const isInset = key === 'inner';
    const cssValue = formatShadowComposite(value.$value, primitiveMap, isInset);
    shadows.push({ cssName: `shadow-${key}`, value: cssValue });
  }

  return shadows;
}

/**
 * Collect semantic color tokens from a file with var() references
 * Used for static theming where colors reference --nx-* primitives
 *
 * @param {string} semanticDir - Path to semantic directory
 * @param {string} fileName - Semantic token file name
 * @param {Map} primitiveMap - Map of primitive token values (used for var reference generation)
 * @returns {object[]} Array of { cssName, value }
 */
export function collectSemanticColorTokensVarRef(
  semanticDir,
  fileName,
  primitiveMap
) {
  const filePath = path.join(semanticDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Semantic color file missing: ${filePath}`);
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  function extractPaths(obj, pathParts = []) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;

      const currentPath = [...pathParts, key];

      if (value.$value !== undefined && value.$type === 'color') {
        const cssName = `color-${currentPath.join('-')}`;
        let resolvedValue = value.$value;

        if (isReference(resolvedValue)) {
          const refPath = resolvedValue.slice(1, -1);
          const primitiveInfo = primitiveMap.get(refPath);
          if (primitiveInfo) {
            resolvedValue = `var(--${primitiveInfo.cssName})`;
          }
        } else {
          resolvedValue = formatTokenValue(resolvedValue, 'color', currentPath);
        }

        tokens.push({ cssName, value: resolvedValue });
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        extractPaths(value, currentPath);
      }
    }
  }

  extractPaths(tokenData);
  return tokens;
}

/**
 * Files in `semanticFiles.standalone` that own a dedicated dimension collector.
 * Callers iterating standalone files for the generic `collectSemanticDimensionTokens`
 * scan MUST skip these to avoid duplicate emission of the same `--*` variable
 * from two different code paths.
 *
 *   breakpoints.json → collectBreakpointsTokens (literal {value, unit})
 *   z-index.json     → collectZIndexTokens  ($type: number, not dimension)
 *
 * Spacing files (`spacing-{mode}.json`) are NOT in this list — `discoverSemantics`
 * routes them into the `perModeFiles.spacing` bucket so they never enter
 * `standalone` in the first place.
 */
export const FILES_WITH_DEDICATED_DIMENSION_COLLECTORS = new Set([
  'breakpoints.json',
  'z-index.json',
]);

/**
 * Collect literal-valued `$type: dimension` leaves from a token file and
 * emit them with the path as the CSS-variable name — e.g. `focus.offset` →
 * `--focus-offset`. Mirrors `collectSemanticColorTokensVarRef` but for
 * dimensions, and skips the `color-` prefix so the path drives the variable
 * name directly.
 *
 * Filter behavior:
 * - `$type: dimension` only.
 * - Reference-valued dimensions (`"$value": "{spacing.0}"`) are skipped here;
 *   they are emitted by their owning collector instead.
 * - Literal-valued dimensions in files that ALSO have a dedicated collector
 *   (breakpoints.json's `{value, unit}` literals) are NOT skipped by this
 *   function — that gating is the caller's responsibility via
 *   `FILES_WITH_DEDICATED_DIMENSION_COLLECTORS`.
 *
 * Self-namespacing: because no category prefix is added, top-level keys in the
 * input file must self-namespace their CSS variable name (e.g. `focus.offset`
 * → `--focus-offset` is fine; a bare top-level `offset`/`padding`/`gap` would
 * collide with Tailwind utility namespaces).
 *
 * @param {string} semanticDir - Path to semantic directory
 * @param {string} fileName - Semantic token file name
 * @returns {object[]} Array of { cssName, value }
 */
export function collectSemanticDimensionTokens(semanticDir, fileName) {
  const filePath = path.join(semanticDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Semantic file missing: ${filePath}`);
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  function extractPaths(obj, pathParts = []) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;

      const currentPath = [...pathParts, key];

      if (
        value.$value !== undefined &&
        value.$type === 'dimension' &&
        !isReference(value.$value)
      ) {
        const cssName = currentPath.join('-');
        const resolvedValue = formatTokenValue(value.$value, 'dimension');
        tokens.push({ cssName, value: resolvedValue });
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        extractPaths(value, currentPath);
      }
    }
  }

  extractPaths(tokenData);
  return tokens;
}

// ============================================
// THEME CSS GENERATION
// ============================================

/**
 * Generate @theme CSS block for Tailwind
 * This is the shared function used by both generate-modular.js and generate-tailwind-package.js
 *
 * @param {object} config - Configuration object
 * @param {string} config.header - File header comment
 * @param {string} [config.googleFontsImport] - Google Fonts @import statement
 * @param {string[]} config.imports - CSS imports (e.g., ['tailwindcss', './variables.css'])
 * @param {string} [config.tailwindPrefix='nx'] - Tailwind prefix
 * @param {object[]} config.semanticTokens - Array of { cssName, value } for semantic colours (dimensions emit at :root via generateRootDimensionsCSS)
 * @param {object[]} config.spacingTokens - Array of { cssName, value } for numeric spacing (default baseline; per-mode overrides live outside @theme)
 * @param {object[]} config.radiusTokens - Array of { cssName, varRef } for radius
 * @param {object[]} config.borderwidthTokens - Array of { cssName, varRef } for borderwidth
 * @param {object[]} config.motionTokens - Array of { group, key, cssName, varRef } for duration/ease
 * @param {object[]} config.shadowTokens - Array of { cssName, value } for shadows
 * @param {object[]} [config.darkSemanticTokens] - Array of { cssName, value } for dark mode semantic tokens
 * @param {string} [config.darkSelector='.dark'] - CSS selector for dark mode
 * @param {boolean} [config.prefixDarkVars=false] - Whether to add nx- prefix to dark mode vars
 * @returns {string} Generated CSS content
 */
export function generateThemeCSS(config) {
  const {
    header,
    googleFontsImport,
    imports = [],
    tailwindPrefix = 'nx',
    semanticTokens = [],
    spacingTokens = [],
    radiusTokens = [],
    borderwidthTokens = [],
    motionTokens = [],
    shadowTokens = [],
    zIndexTokens = [],
    breakpointTokens = [],
    darkSemanticTokens = [],
    darkSelector = '.dark',
    prefixDarkVars = false,
  } = config;

  let css = header;

  // Google Fonts import
  if (googleFontsImport) {
    css += `/* Google Fonts - auto-generated from typography tokens */\n`;
    css += `${googleFontsImport}\n\n`;
  }

  // Imports
  for (const imp of imports) {
    if (imp === 'tailwindcss') {
      css += `@import 'tailwindcss' prefix(${tailwindPrefix});\n`;
    } else {
      css += `@import '${imp}';\n`;
    }
  }
  css += `\n@custom-variant dark (&:is(.dark *));\n\n`;

  // @theme block
  css += `@theme {\n`;
  css += `  /* Reset default Tailwind namespaces to enforce semantic tokens only */\n`;
  css += `  --color-*: initial;\n`;
  css += `  --spacing-*: initial;\n`;
  css += `  --text-*: initial;\n`;
  css += `  --radius-*: initial;\n`;
  css += `  --shadow-*: initial;\n`;
  css += `  --breakpoint-*: initial;\n\n`;

  // Spacing tokens (numeric default baseline — see generateSpacingModesCSS for
  // per-mode overrides emitted outside @theme).
  if (spacingTokens.length > 0) {
    css += `\n  /* Spacing tokens */\n`;
    for (const token of spacingTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
  }

  // Radius tokens
  if (radiusTokens.length > 0) {
    css += `\n  /* Radius tokens */\n`;
    for (const token of radiusTokens) {
      css += `  --${token.cssName}: ${token.varRef};\n`;
    }
  }

  // Borderwidth tokens
  if (borderwidthTokens.length > 0) {
    css += `\n  /* Border width tokens */\n`;
    for (const token of borderwidthTokens) {
      css += `  --${token.cssName}: ${token.varRef};\n`;
    }
  }

  // Motion tokens
  if (motionTokens.length > 0) {
    css += `\n  /* Motion tokens */\n`;
    for (const token of motionTokens.filter(
      (motionToken) => motionToken.group === 'ease'
    )) {
      css += `  --${token.cssName}: ${token.varRef};\n`;
    }
  }

  // Shadow tokens
  if (shadowTokens.length > 0) {
    css += `\n  /* Shadow tokens */\n`;
    for (const token of shadowTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
  }

  // Z-index tokens
  if (zIndexTokens.length > 0) {
    css += `\n  /* Z-index tokens */\n`;
    for (const token of zIndexTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
  }

  // Breakpoint tokens
  if (breakpointTokens.length > 0) {
    css += `\n  /* Breakpoint tokens */\n`;
    for (const token of breakpointTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
  }

  css += `}\n`;

  // Semantic colour utilities need their fallback expression inlined into the
  // generated utility, otherwise Tailwind's `prefix(nx)` rewrites the @theme
  // variable to the same `--nx-color-*` name that the runtime provider owns.
  if (semanticTokens.length > 0) {
    css += `\n@theme inline {\n`;
    css += `  /* Semantic tokens */\n`;
    for (const token of semanticTokens) {
      const value = token.cssName.startsWith('color-')
        ? `var(--nx-${token.cssName}, ${token.value})`
        : token.value;
      css += `  --${token.cssName}: ${value};\n`;
    }
    css += `}\n`;

    css += `\n/* ===== RUNTIME COLOR ALIASES ===== */\n`;
    css += `:root {\n`;
    for (const token of semanticTokens.filter((token) =>
      token.cssName.startsWith('color-')
    )) {
      css += `  --${token.cssName}: var(--nx-${token.cssName}, ${token.value});\n`;
    }
    css += `}\n`;
  }

  // Dark mode block (if provided)
  if (darkSemanticTokens.length > 0) {
    css += `\n/* ===== DARK MODE ===== */\n`;
    css += `${darkSelector} {\n`;
    for (const token of darkSemanticTokens) {
      const varName = prefixDarkVars ? `nx-${token.cssName}` : token.cssName;
      css += `  --${varName}: ${token.value};\n`;
    }
    css += `}\n`;
  }

  return css;
}

/**
 * Emit fixed dimension primitives (e.g. --focus-offset) as a `:root {}` block.
 *
 * Kept out of @theme: they're consumed only via arbitrary utilities like
 * `outline-offset-(--focus-offset)`, which Tailwind doesn't track as @theme
 * usage and therefore tree-shakes from the runtime cascade (#506).
 *
 * @param {object[]} dimensionTokens - Array of { cssName, value }
 * @returns {string} CSS `:root {}` block, or '' when empty
 */
export function generateRootDimensionsCSS(dimensionTokens = []) {
  if (dimensionTokens.length === 0) return '';

  let css = `\n/* ===== RUNTIME DIMENSION TOKENS ===== */\n`;
  css += `:root {\n`;
  for (const token of dimensionTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n`;
  return css;
}

export function generateNativeBrowserUIThemeCSS() {
  return `
/* ===== NATIVE BROWSER UI THEME ===== */
@layer base {
  :root {
    color-scheme: light dark;
  }

  :root:not(.dark) {
    color-scheme: light;
  }

  .dark {
    color-scheme: dark;
  }

  :where(input[type='checkbox'], input[type='radio'], input[type='range'], progress) {
    accent-color: var(--color-primary-background);
  }
}
`;
}

/**
 * Generate base layer CSS for body defaults
 *
 * @returns {string} CSS @layer base block
 */
export function generateBaseLayerCSS() {
  return `
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
`;
}

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));

/**
 * Format every `.css` file directly inside `distDir` in place with prettier,
 * using the repo's `.prettierrc`. Resolves the config from the script's own
 * location so callers can write to a temporary dist (e.g. tests) without
 * losing config resolution.
 *
 * Only walks the top level — both dist layouts (`dist/tailwind`,
 * `dist/modular`) are flat today. Throws if a subdirectory appears so a
 * future nested layout cannot silently skip files.
 */
export async function formatDistCssFiles(distDir) {
  const config = await prettier.resolveConfig(SCRIPTS_DIR);
  const entries = fs.readdirSync(distDir, { withFileTypes: true });
  const cssFiles = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      throw new Error(
        `formatDistCssFiles: unexpected subdirectory '${entry.name}' in ${distDir}. ` +
          `Helper assumes a flat layout; update it to walk recursively if nesting is intentional.`
      );
    }
    if (entry.isFile() && entry.name.endsWith('.css')) {
      cssFiles.push(entry.name);
    }
  }

  for (const name of cssFiles) {
    const filePath = path.join(distDir, name);
    const raw = fs.readFileSync(filePath, 'utf8');
    const formatted = await prettier.format(raw, {
      ...config,
      filepath: filePath,
    });
    fs.writeFileSync(filePath, formatted);
  }
}
