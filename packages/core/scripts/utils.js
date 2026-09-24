import fs from 'fs';
import path from 'path';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';

import {
  formatShadowStyle,
  formatTokenValue,
  formatTypographyDeclarations,
} from '../src/token-source/format.js';
import {
  SPACING_MODE_FILE_PATTERN,
  spacingRoleUtility,
} from '../src/token-source/spacing.js';
import {
  extractTokens,
  pathToCssVarPrefixed,
} from '../src/token-source/tokens.js';
import {
  BORDER_COLOR_ALIAS_NAMES,
  borderColorAliasName,
  borderWidthAliasUtilities,
  durationUtility,
} from '../src/token-source/utilities.js';

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
 * Default configuration for token generation
 */
export const DEFAULT_CONFIG = {
  base: 'stone',
  shadow: 'quiet',
  radius: 'square',
  borderwidth: 'normal',
  motion: 'snappy',
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
 * Find the per-mode spacing files in `semantic/`. Their values are direct px
 * (no `{N}` refs) and emit per-mode `[data-density="X"]` blocks via
 * `collectSpacingTokens`. Every other semantic file is read by a collector
 * that names it directly.
 *
 * @param {string} semanticDir - Path to semantic directory
 * @returns {Record<string, string>} Mode name keyed to its `spacing-{mode}.json` filename
 */
export function discoverSpacingModeFiles(semanticDir) {
  if (!fs.existsSync(semanticDir)) {
    return {};
  }

  const files = {};

  for (const file of fs.readdirSync(semanticDir)) {
    const match = file.match(SPACING_MODE_FILE_PATTERN);
    if (!match) continue;

    files[match[1]] = file;
  }

  return files;
}

/**
 * Group {base}-light / {base}-dark mode names into pairs; pass others through unchanged.
 * Used by the generator to recognize themed primitive categories.
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
    // Use 'typography-' prefix to avoid tailwind-merge conflicts with Tailwind's
    // text-* utilities (which are used for both color and font-size)
    css += `@utility ${pathToCssVarPrefixed(token.path, 'typography')} {\n`;
    for (const declaration of formatTypographyDeclarations(
      token.path,
      token.value,
      primitiveMap
    )) {
      css += `  ${declaration.property}: ${declaration.value};\n`;
    }
    css += `}\n\n`;
  }

  return { css, count: tokens.length };
}

// ============================================
// BORDER WIDTH ALIAS UTILITIES
// ============================================

/**
 * Render one `@utility` rule the way the committed CSS spells it.
 *
 * @param {import('../src/token-source/utilities.js').UtilityRule} rule
 * @returns {string}
 */
function formatUtilityRule({ name, declarations }) {
  let css = `@utility ${name} {\n`;
  for (const { property, value } of declarations) {
    css += `  ${property}: ${value};\n`;
  }
  return `${css}}\n\n`;
}

/**
 * Generate the `border-width-{side?}-{name}` alias utilities for every
 * borderwidth token. The `border-{side?}-{name}` spellings are Tailwind's own
 * border utilities, resolved from the `--border-width-*` theme keys that
 * generateThemeCSS emits.
 *
 * @param {object[]} tokens - Array of borderwidth tokens with cssName property (e.g., "nx-borderwidth-default")
 * @returns {{ css: string, count: number }} Generated CSS and utility count
 */
export function generateBorderWidthUtilitiesCSS(tokens) {
  if (!tokens || tokens.length === 0) {
    return { css: '', count: 0 };
  }

  let css = `/* Border Width Alias Utilities */\n\n`;
  const rules = tokens.flatMap((token) =>
    borderWidthAliasUtilities(token.cssName.replace('nx-borderwidth-', ''))
  );
  css += rules.map(formatUtilityRule).join('');

  return { css, count: rules.length };
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
    .map((token) => ({
      token,
      name: borderColorAliasName(token.cssName.replace(/^color-/, '')),
    }))
    .filter(({ name }) => name !== null)
    .sort(
      (a, b) =>
        BORDER_COLOR_ALIAS_NAMES.indexOf(a.name) -
        BORDER_COLOR_ALIAS_NAMES.indexOf(b.name)
    );

  if (borderColorTokens.length === 0) {
    return { css: '', count: 0 };
  }

  let css = `/* Border Color Alias Utilities */\n\n`;

  for (const { token, name } of borderColorTokens) {
    css += `@utility border-color-${name} {\n`;
    const value = `var(--nx-${token.cssName}, ${token.value})`;
    css += `  border-color: ${value};\n`;
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
  const spacingFiles = discoverSpacingModeFiles(semanticDir);

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

  for (const token of canonicalRoleTokens) {
    css += formatUtilityRule(spacingRoleUtility(token.path));
  }

  return { css, count: canonicalRoleTokens.length };
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
 * Returns array of { key, varRef } for the @theme block, where each value seeds
 * two Tailwind namespaces: `--border-width-{key}` and `--outline-width-{key}`
 * (see generateThemeCSS).
 *
 * @param {string} tokensDir - Path to tokens directory
 * @param {string} mode - Borderwidth mode (e.g., 'vega')
 * @returns {object[]} Array of { key, varRef }
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
      key,
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
 * Generate motion `@utility` declarations.
 *
 * Emits three kinds of motion utility together, since components consume them
 * as one file:
 *
 * 1. Data-driven duration utilities. Tailwind v4 codegens named easing
 *    utilities from --ease-* theme vars, but not named duration utilities from
 *    --duration-* vars, so emit duration-* explicitly (e.g. nx:duration-fast).
 * 2. The two ring-safe colour transitions, `transition-control` and
 *    `transition-field` — Tailwind's own `transition-colors` carries
 *    `outline-color`, which would fade a focus ring in (see the block comment
 *    below).
 * 3. A static, non-token `overlay-presence-exit` keyframe + its
 *    `animate-overlay-presence-exit` utility — the Radix Presence bridge (see
 *    the block comment below). It animates an inert custom property so it fires
 *    `animationend` without overriding the transitioned opacity/scale exit.
 *
 * `count` reports the data-driven duration utilities only.
 *
 * @param {{group?: string, key?: string, cssName: string, varRef: string}[]} motionTokens
 * @returns {{css: string, count: number}}
 */
export function generateMotionUtilitiesCSS(motionTokens) {
  const durationTokens = motionTokens.filter(
    (token) => token.group === 'duration'
  );

  let css = `/* Motion utilities - duration utilities are data-driven from canonical motion tokens; the ring-safe transitions and the presence bridge below are static. */\n\n`;

  for (const token of durationTokens) {
    css += formatUtilityRule(durationUtility(token.key));
  }

  // Tailwind's `transition-colors` expands to a list that includes
  // `outline-color`, and every Nexus focus ring is a real `outline` — so an
  // element carrying both fades its own ring in over the duration instead of
  // landing it with the keypress.
  css += `@utility transition-control {\n`;
  css += `  transition-property: color, background-color, border-color;\n`;
  css += `  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));\n`;
  css += `  transition-duration: var(--tw-duration, var(--default-transition-duration));\n`;
  css += `}\n\n`;
  css += `@utility transition-field {\n`;
  css += `  transition-property: color, background-color;\n`;
  css += `  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));\n`;
  css += `  transition-duration: var(--tw-duration, var(--default-transition-duration));\n`;
  css += `}\n\n`;

  // Static "presence bridge" (not token-derived): a non-visual animation whose only
  // job is to fire `animationend` so Radix Presence — which waits on `animationName`,
  // not `transitionend` — keeps a closing overlay mounted while its opacity/scale/
  // translate TRANSITIONS run the visible exit. It must NOT animate a transitioned
  // property (opacity/scale/translate) or it would override that transition, so it
  // animates an inert, unread custom property instead.
  css += `@keyframes overlay-presence-exit {\n`;
  css += `  from {\n`;
  css += `    --overlay-presence-phase: 0;\n`;
  css += `  }\n`;
  css += `  to {\n`;
  css += `    --overlay-presence-phase: 1;\n`;
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
            const cssValue = formatShadowStyle(
              [key, subKey],
              subValue.$value,
              primitiveMap
            );
            shadows.push({ cssName: `shadow-${shadowName}`, value: cssValue });
          }
        }
      }
      continue;
    }

    const cssValue = formatShadowStyle([key], value.$value, primitiveMap);
    shadows.push({ cssName: `shadow-${key}`, value: cssValue });
  }

  return shadows;
}

/**
 * Generate @theme CSS block for Tailwind
 * This is the shared function used by generate-tailwind-package.js
 *
 * @param {object} config - Configuration object
 * @param {string} config.header - File header comment
 * @param {string} [config.googleFontsImport] - Google Fonts @import statement
 * @param {string[]} config.imports - CSS imports (e.g., ['tailwindcss', './variables.css'])
 * @param {string} [config.tailwindPrefix='nx'] - Tailwind prefix
 * @param {object[]} config.semanticTokens - Array of { cssName, value } for semantic colours
 * @param {object[]} config.spacingTokens - Array of { cssName, value } for numeric spacing (default baseline; per-mode overrides live outside @theme)
 * @param {object[]} config.radiusTokens - Array of { cssName, varRef } for radius
 * @param {object[]} config.borderwidthTokens - Array of { key, varRef } for borderwidth; each one emits both a --border-width-* and an --outline-width-* inline theme key
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

  // Inlined so every border and outline utility reads `--nx-borderwidth-*` on
  // the element itself, where a `[data-borderwidth]` ancestor has set it. A
  // field's focus ring is a `border-default` inner edge plus an
  // `outline-default` outer edge, so both namespaces share each value.
  if (borderwidthTokens.length > 0) {
    css += `\n@theme inline {\n`;
    css += `  /* Border and outline width tokens */\n`;
    for (const token of borderwidthTokens) {
      css += `  --border-width-${token.key}: ${token.varRef};\n`;
    }
    for (const token of borderwidthTokens) {
      css += `  --outline-width-${token.key}: ${token.varRef};\n`;
    }
    css += `}\n`;
  }

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
 * Theme the browser-painted UI Nexus cannot style through utilities: the
 * color-scheme declaration.
 *
 * @returns {string} CSS native browser UI rules
 */
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
}
`;
}

/**
 * Autofill utilities. Browsers paint autofilled fields with `!important`
 * background and text colours that author `bg-*` / `text-*` classes cannot
 * override. A field pairs each of those classes with an `autofill-*` utility of
 * the same token (`nx:bg-container nx:autofill-bg-container`), which repaints
 * the surface as an inset fill shadow and the text through
 * `-webkit-text-fill-color`. The fill is the last, bottom-most layer of
 * Tailwind's shadow stack, so `shadow-*`, `ring-*`, `inset-shadow-*` and
 * `inset-ring-*` on the field survive autofill. The shadow stops at the padding
 * edge, so the browser surface is clipped there too or it shows through a
 * translucent border. `autofill-bg-transparent` clips the browser surface away
 * instead, for controls whose parent owns the surface.
 *
 * @returns {string} CSS @utility declarations
 */
export function generateAutofillUtilitiesCSS() {
  return `
/* ===== AUTOFILL UTILITIES ===== */
@utility autofill-bg-* {
  &:autofill {
    background-clip: padding-box;
    box-shadow:
      var(--tw-inset-shadow, 0 0 #0000),
      var(--tw-inset-ring-shadow, 0 0 #0000),
      var(--tw-ring-offset-shadow, 0 0 #0000),
      var(--tw-ring-shadow, 0 0 #0000),
      var(--tw-shadow, 0 0 #0000),
      inset 0 0 0 1000px --value(--color-*);
  }
}

@utility autofill-bg-transparent {
  &:autofill {
    -webkit-background-clip: text;
    background-clip: text;
  }
}

@utility autofill-text-* {
  &:autofill {
    color: --value(--color-*);
    -webkit-text-fill-color: --value(--color-*);
    caret-color: --value(--color-*);
  }
}
`;
}

/**
 * Surface utilities: a wrapper declares the surface it paints with
 * `surface-*` beside its `bg-*` class (`nx:bg-container nx:surface-container`),
 * and descendants cut themselves out of it with `ring-surface` /
 * `ring-offset-surface`. Without a declared surface the rings fall back to
 * `background`.
 *
 * @returns {string} CSS @utility declarations
 */
export function generateSurfaceUtilitiesCSS() {
  return `
/* ===== SURFACE UTILITIES ===== */
@utility surface-* {
  --nx-surface: --value(--color-*);
}

@utility ring-surface {
  --tw-ring-color: var(--nx-surface, --theme(--color-background));
}

@utility ring-offset-surface {
  --tw-ring-offset-color: var(--nx-surface, --theme(--color-background));
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
 * Only walks the top level. Throws if a subdirectory appears so a future nested
 * layout cannot silently skip files.
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
