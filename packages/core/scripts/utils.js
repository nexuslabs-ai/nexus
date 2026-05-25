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
      return hexToOklchPinned(value, lastSegment);
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
 * Used for generating prefixed CSS variables for @nexus/tailwind package
 * @param {string[]} tokenPath - Token path array
 * @param {string|null} categoryPrefix - Optional category prefix (e.g., 'color', 'size')
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
  brand: 'neutral',
  size: 'vega',
  typography: 'vega',
  shadow: 'vega',
  radius: 'sharp',
  borderwidth: 'vega',
  focus: 'default',
  'chart-categorical': 'default',
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
 * @returns {object} { themed: { type: { mode: { light, dark } } }, standalone: string[] }
 */
export function discoverSemantics(semanticDir) {
  const result = {
    themed: {},
    standalone: [],
  };

  if (!fs.existsSync(semanticDir)) {
    return result;
  }

  const files = fs.readdirSync(semanticDir).filter((f) => f.endsWith('.json'));

  // Pattern for themed files: {type}-{mode}-{light|dark}.json
  const themedPattern = /^(.+)-(.+)-(light|dark)\.json$/;

  for (const file of files) {
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
      // Standalone file (no light/dark suffix)
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
export function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  args.forEach((arg) => {
    const match = arg.match(/^--([\w-]+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key in config) {
        config[key] = value;
      }
    }
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
 * @param {string} typographyFilePath - Path to typography token file (e.g., typography-vega.json)
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

    // opsz axis on variable fonts (Inter); no-op on fonts without it
    css += `  font-optical-sizing: auto;\n`;
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

/**
 * Generate border width utility CSS from token array
 * Creates @utility rules with border-{name} pattern for all borderwidth tokens
 *
 * @param {object[]} tokens - Array of borderwidth tokens with cssName property (e.g., "nx-borderwidth-default")
 * @returns {{ css: string, count: number }} Generated CSS and token count
 */
export function generateBorderWidthUtilitiesCSS(tokens) {
  if (!tokens || tokens.length === 0) {
    return { css: '', count: 0 };
  }

  let css = `/* Border Width Utilities */\n\n`;

  for (const token of tokens) {
    // Extract the name part (e.g., "default" from "nx-borderwidth-default")
    const name = token.cssName.replace('nx-borderwidth-', '');

    css += `@utility border-${name} {\n`;
    css += `  border-style: var(--tw-border-style, solid);\n`;
    css += `  border-width: var(--${token.cssName});\n`;
    css += `}\n\n`;
  }

  return { css, count: tokens.length };
}

// ============================================
// TOKEN COLLECTION FOR @THEME BLOCKS
// ============================================

/**
 * Collect spacing token mappings from spacing.json
 * Returns array of { cssName, varRef } for @theme block
 *
 * @param {string} semanticDir - Path to semantic directory
 * @returns {object[]} Array of { cssName, varRef }
 */
export function collectSpacingTokens(semanticDir) {
  const filePath = path.join(semanticDir, 'spacing.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Spacing semantic file missing: ${filePath}`);
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  for (const [key, value] of Object.entries(tokenData)) {
    if (key.startsWith('$')) continue;
    if (value.$type !== 'dimension') continue;

    const match = value.$value.match(/\{(.+)\}/);
    if (match) {
      const sizeKey = match[1];
      tokens.push({
        cssName: key,
        varRef: `var(--nx-size-${sizeKey})`,
      });
    }
  }

  return tokens;
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
 * @param {object[]} config.colorTokens - Array of { cssName, value } for colors
 * @param {object[]} config.spacingTokens - Array of { cssName, varRef } for spacing
 * @param {object[]} config.radiusTokens - Array of { cssName, varRef } for radius
 * @param {object[]} config.borderwidthTokens - Array of { cssName, varRef } for borderwidth
 * @param {object[]} config.shadowTokens - Array of { cssName, value } for shadows
 * @param {object[]} [config.darkColorTokens] - Array of { cssName, value } for dark mode colors
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
    colorTokens = [],
    spacingTokens = [],
    radiusTokens = [],
    borderwidthTokens = [],
    shadowTokens = [],
    zIndexTokens = [],
    breakpointTokens = [],
    darkColorTokens = [],
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
  css += `  --radius-*: initial;\n`;
  css += `  --shadow-*: initial;\n`;
  css += `  --breakpoint-*: initial;\n\n`;

  // Color tokens
  if (colorTokens.length > 0) {
    css += `  /* Semantic color tokens */\n`;
    for (const token of colorTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
  }

  // Spacing tokens
  if (spacingTokens.length > 0) {
    css += `\n  /* Spacing tokens */\n`;
    for (const token of spacingTokens) {
      css += `  --${token.cssName}: ${token.varRef};\n`;
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

  // Dark mode block (if provided)
  if (darkColorTokens.length > 0) {
    css += `\n/* ===== DARK MODE ===== */\n`;
    css += `${darkSelector} {\n`;
    for (const token of darkColorTokens) {
      const varName = prefixDarkVars ? `nx-${token.cssName}` : token.cssName;
      css += `  --${varName}: ${token.value};\n`;
    }
    css += `}\n`;
  }

  return css;
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
