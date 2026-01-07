import fs from 'fs';
import path from 'path';

/**
 * Recursively get all JSON files from a directory and its subdirectories
 * @param {string} dir - Directory to search
 * @param {string[]} fileList - Accumulated file list (internal)
 * @returns {string[]} Array of absolute file paths
 */
export function getAllJsonFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

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
 * Format a dimension value object to CSS string
 * @param {object|string|number} value - Token value
 * @param {string} type - Token type
 * @returns {string} Formatted CSS value
 */
export function formatTokenValue(value, type) {
  // Handle dimension objects: { value: 16, unit: "rem" } → "16rem"
  if (
    type === 'dimension' &&
    typeof value === 'object' &&
    value !== null &&
    'value' in value
  ) {
    return `${value.value}${value.unit || 'px'}`;
  }

  // Handle string values (colors, font families, etc.)
  if (typeof value === 'string') {
    return value;
  }

  // Handle numbers (font weights, opacity, etc.)
  if (typeof value === 'number') {
    return String(value);
  }

  // Fallback for complex objects (shouldn't happen for primitives)
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
export function pathToCssVarPrefixed(tokenPath, categoryPrefix = null, useNxPrefix = false) {
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
 * Resolve a DTCG reference to CSS var() with nx- prefix
 * Used for generating @nexus/tailwind package where primitives have --nx-* prefix
 * @param {*} value - Token value (might be a reference)
 * @param {Map} primitiveMap - Map of primitive token paths to CSS names (with nx- prefix)
 * @returns {string} Resolved CSS value with var(--nx-*)
 */
export function resolveReferenceWithNxPrefix(value, primitiveMap) {
  if (!isReference(value)) {
    return value;
  }

  const refPath = extractRefPath(value);
  const primitiveInfo = primitiveMap.get(refPath);

  if (primitiveInfo) {
    // primitiveInfo.cssName already contains nx- prefix if useNxPrefix was true
    return `var(--${primitiveInfo.cssName})`;
  }

  console.warn(`⚠ Reference not found: ${value}`);
  return value;
}

/**
 * Resolve value for @nexus/tailwind package (references use --nx-* variables)
 * @param {*} value - Token value
 * @param {Map} primitiveMap - Map of primitives with nx- prefixed cssName
 * @param {string} type - Token type
 * @returns {string} Resolved CSS value
 */
export function resolveValueWithNxPrefix(value, primitiveMap, type = 'unknown') {
  // If it's a reference, resolve it with nx prefix
  if (isReference(value)) {
    return resolveReferenceWithNxPrefix(value, primitiveMap);
  }

  // If it's a dimension object, format it
  if (
    type === 'dimension' ||
    (typeof value === 'object' && value !== null && 'value' in value)
  ) {
    return formatTokenValue(value, 'dimension');
  }

  // Otherwise return as-is (formatted)
  return formatTokenValue(value, type);
}

/**
 * Resolve a value that might be a reference or a dimension object
 * @param {*} value - Token value
 * @param {Map} primitiveMap - Map of primitives
 * @param {string} type - Token type
 * @returns {string} Resolved CSS value
 */
export function resolveValue(value, primitiveMap, type = 'unknown') {
  // If it's a reference, resolve it
  if (isReference(value)) {
    return resolveReference(value, primitiveMap);
  }

  // If it's a dimension object, format it
  if (
    type === 'dimension' ||
    (typeof value === 'object' && value !== null && 'value' in value)
  ) {
    return formatTokenValue(value, 'dimension');
  }

  // Otherwise return as-is (formatted)
  return formatTokenValue(value, type);
}

/**
 * Default configuration for token generation
 */
export const DEFAULT_CONFIG = {
  base: 'slate',
  brand: 'blue',
  size: 'vega',
  typography: 'vega',
  shadow: 'vega',
  radius: 'subtle',
  borderwidth: 'vega',
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
 * Get all available modes for a discovered primitive category
 * @param {object} discovered - Result from discoverPrimitives()
 * @param {string} category - Category name
 * @returns {string[]|null} Array of modes or null if single-mode
 */
export function getModes(discovered, category) {
  return discovered[category]?.modes || null;
}

/**
 * Process a semantic token file and resolve references
 * @param {string} filePath - Full path to semantic file
 * @param {Map} primitiveMap - Primitive map for reference resolution
 * @returns {object[]} Array of { cssName, value, type }
 */
export function processSemanticTokens(filePath, primitiveMap) {
  if (!fs.existsSync(filePath)) {
    log.warn(`Semantic file not found: ${filePath}`);
    return [];
  }

  const tokenData = readTokenFile(filePath);
  const extracted = extractTokens(tokenData);
  const tokens = [];

  for (const token of extracted) {
    // Add 'nx-color' prefix for color tokens (to match Tailwind prefix(nx) output)
    // No prefix for dimensions (spacing)
    const prefix = token.type === 'color' ? 'nx-color' : null;
    const cssName = pathToCssVar(token.path, prefix);
    const cssValue = resolveValue(token.value, primitiveMap, token.type);
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
 * Convert a shadow reference path to a CSS var() reference
 * @param {string} refPath - Reference path like "2xs.layer-1.x"
 * @returns {string} CSS var() reference like "var(--shadow-2xs-layer-1-x)"
 */
export function shadowRefToVar(refPath) {
  const cssName = refPath.replace(/\./g, '-');
  return `var(--shadow-${cssName})`;
}

/**
 * Format a shadow property value as a var() reference or literal
 * @param {*} value - Property value (reference or dimension object)
 * @returns {string} CSS var() reference or literal value
 */
export function formatShadowPropertyAsVar(value) {
  // Handle references like {2xs.layer-1.x} -> var(--shadow-2xs-layer-1-x)
  if (isReference(value)) {
    const refPath = extractRefPath(value);
    return shadowRefToVar(refPath);
  }

  // Handle dimension objects like { value: 3, unit: "px" }
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return formatTokenValue(value, 'dimension');
  }

  // Return as-is for other values
  return String(value);
}

/**
 * Format a single shadow layer to CSS box-shadow value using var() references
 * @param {object} layer - Shadow layer definition
 * @param {boolean} isInset - Whether this is an inset shadow
 * @returns {string} CSS box-shadow value for this layer
 */
export function formatShadowLayer(layer, isInset = false) {
  const x = formatShadowPropertyAsVar(layer.offsetX);
  const y = formatShadowPropertyAsVar(layer.offsetY);
  const blur = formatShadowPropertyAsVar(layer.blur);
  const spread = formatShadowPropertyAsVar(layer.spread);
  const color = formatShadowPropertyAsVar(layer.color);
  const inset = isInset || layer.inset ? 'inset ' : '';

  return `${inset}${x} ${y} ${blur} ${spread} ${color}`;
}

/**
 * Format a complete shadow composite (single or multi-layer) to CSS value
 * @param {object|object[]} value - Shadow value (single layer or array of layers)
 * @param {boolean} isInset - Whether this is an inset shadow
 * @returns {string} CSS box-shadow value
 */
export function formatShadowComposite(value, isInset = false) {
  const layers = Array.isArray(value) ? value : [value];
  return layers.map((layer) => formatShadowLayer(layer, isInset)).join(', ');
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
export function extractGoogleFonts(typographyFilePath) {
  if (!fs.existsSync(typographyFilePath)) {
    log.warn(`Typography file not found: ${typographyFilePath}`);
    return [];
  }

  const tokenData = readTokenFile(typographyFilePath);
  const googleFonts = [];

  // Look for family tokens with nx-font-source extension
  if (tokenData.family) {
    for (const [_key, value] of Object.entries(tokenData.family)) {
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
export function generateGoogleFontsImport(fonts) {
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
