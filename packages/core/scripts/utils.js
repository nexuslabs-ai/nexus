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
