import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const DIST_DIR = path.join(__dirname, '../dist');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

/**
 * Read and parse a DTCG format token file
 */
function readTokenFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Recursively extract tokens from DTCG format
 * Returns array of { path, value, type, description }
 */
function extractTokens(obj, currentPath = [], result = []) {
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
 * Get namespace prefix based on token path first key
 */
function getNamespacePrefix(firstKey) {
  const mapping = {
    'spacing': 'spacing',
    'space': 'spacing',
    'fontSize': 'text',
    'textSize': 'text',
    'radius': 'radius',
    'borderRadius': 'radius',
    'shadow': 'shadow',
    'boxShadow': 'shadow',
    'colors': null, // Strip colors prefix
    'color': null,
    'lineHeight': 'leading',
    'letterSpacing': 'tracking',
    'fontWeight': 'font-weight',
  };

  return mapping[firstKey] !== undefined ? mapping[firstKey] : firstKey;
}

/**
 * Convert token path to CSS variable name
 * @param {string[]} tokenPath - Token path array
 * @param {boolean} isSemanticColor - Whether this is a semantic color token
 * @param {boolean} isPrimitiveColor - Whether this is a primitive color token
 * @returns {string} CSS variable name (without --)
 */
function pathToCSSVar(tokenPath, isSemanticColor = false, isPrimitiveColor = false) {
  const firstKey = tokenPath[0];
  const prefix = getNamespacePrefix(firstKey);

  // For primitive colors (files like color-light.json without nested "colors" group),
  // just join the path directly
  if (isPrimitiveColor && prefix !== null && prefix === firstKey) {
    return tokenPath.join('-');
  }

  // For tokens with explicit namespace (colors/color prefix that should be stripped)
  if (prefix === null) {
    // Strip the first part (colors/color) and join the rest
    return tokenPath.slice(1).join('-');
  }

  // If this is a semantic color token, add "color-" prefix
  if (isSemanticColor) {
    return `color-${tokenPath.join('-')}`;
  }

  // Build the CSS variable name with namespace prefix
  // For namespaced tokens like spacing, fontSize, etc.
  if (prefix && prefix !== firstKey) {
    return `${prefix}-${tokenPath.join('-')}`;
  }

  // Fallback: just join the path
  return tokenPath.join('-');
}

/**
 * Resolve DTCG reference to CSS var()
 * @param {string} value - Token value (might be a reference like {primary.600})
 * @param {Map} primitiveMap - Map of primitive token paths to CSS names
 * @returns {string} Resolved value
 */
function resolveReference(value, primitiveMap) {
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    const refPath = value.slice(1, -1); // Remove { and }
    const primitiveCssName = primitiveMap.get(refPath);

    if (primitiveCssName) {
      return `var(--${primitiveCssName})`;
    }

    console.warn(`⚠ Reference not found: ${value}`);
    return value;
  }
  return value;
}

/**
 * Determine file category based on filename
 */
function getFileCategory(fileName) {
  // Check for light/dark color files
  if (fileName.includes('light') && (fileName.includes('color') || fileName.includes('colour'))) {
    return 'color-light';
  }
  if (fileName.includes('dark') && (fileName.includes('color') || fileName.includes('colour'))) {
    return 'color-dark';
  }

  // Static tokens (spacing, radius, shadow, typography)
  return 'static';
}

/**
 * Default theme configuration
 * Specifies which semantic token files to include
 */
const DEFAULT_THEME = {
  base: 'base-slate.json',
  brand: 'brands-blue.json',
};

/**
 * Generate globals.css with Tailwind v4 structure
 */
function generateGlobalsCSS() {
  const primitivesDir = path.join(TOKENS_DIR, 'primitives');
  const semanticDir = path.join(TOKENS_DIR, 'semantic');

  // Read all primitive files
  const primitivesFiles = fs.existsSync(primitivesDir)
    ? fs.readdirSync(primitivesDir).filter(f => f.endsWith('.json'))
    : [];

  // Only read specified semantic files for the default theme
  const semanticFiles = [DEFAULT_THEME.base, DEFAULT_THEME.brand].filter(f =>
    fs.existsSync(path.join(semanticDir, f))
  );

  // Storage for different token types
  const lightColors = [];
  const darkColors = [];
  const staticTokens = []; // spacing, fontSize, radius, shadow
  const semanticTokens = [];

  // Build primitive map for reference resolution
  const primitiveMap = new Map();

  // Process primitive files
  for (const file of primitivesFiles) {
    const filePath = path.join(primitivesDir, file);
    const tokenData = readTokenFile(filePath);
    const tokens = extractTokens(tokenData);
    const fileName = path.basename(file, '.json');
    const category = getFileCategory(fileName);

    for (const token of tokens) {
      const isPrimitiveColor = category === 'color-light' || category === 'color-dark';
      const cssName = pathToCSSVar(token.path, false, isPrimitiveColor);

      // Add to primitive map for reference resolution
      // Use the original path (without namespace prefix) as key
      primitiveMap.set(token.path.join('.'), cssName);

      // Categorize by file type
      if (category === 'color-light') {
        lightColors.push({ cssName, value: token.value });
      } else if (category === 'color-dark') {
        darkColors.push({ cssName, value: token.value });
      } else {
        // Static tokens (spacing, radius, shadow, fontSize, etc.)
        staticTokens.push({ cssName, value: token.value });
      }
    }
  }

  // Process semantic files
  for (const file of semanticFiles) {
    const filePath = path.join(semanticDir, file);
    const tokenData = readTokenFile(filePath);
    const tokens = extractTokens(tokenData);

    for (const token of tokens) {
      // Strip "semantic" prefix if present
      const tokenPath = token.path[0] === 'semantic' ? token.path.slice(1) : token.path;

      // Check if this is a color token (add --color- prefix)
      const isColor = token.type === 'color';
      const cssName = isColor ? `color-${tokenPath.join('-')}` : pathToCSSVar(tokenPath, false);

      // Resolve reference to var()
      const cssValue = resolveReference(token.value, primitiveMap);

      semanticTokens.push({ cssName, value: cssValue });
    }
  }

  // Generate CSS
  let css = `@import "tailwindcss";\n\n`;
  css += `@custom-variant dark (&:is(.dark *));\n\n`;

  // @theme - Static tokens (spacing, fontSize, radius, shadow, etc.)
  if (staticTokens.length > 0) {
    css += `@theme {\n`;
    for (const token of staticTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
    css += `}\n\n`;
  }

  // :root - Light colors
  if (lightColors.length > 0) {
    css += `:root {\n`;
    for (const token of lightColors) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
    css += `}\n\n`;
  }

  // .dark - Dark colors
  if (darkColors.length > 0) {
    css += `.dark {\n`;
    for (const token of darkColors) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
    css += `}\n\n`;
  }

  // @theme inline - Semantic tokens with var() references
  if (semanticTokens.length > 0) {
    css += `@theme inline {\n`;
    css += `  --*: initial;\n`;
    for (const token of semanticTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
    css += `}\n\n`;
  }

  // @layer base - Default styles using CSS variables
  css += `@layer base {\n`;
  css += `  *,\n`;
  css += `  ::before,\n`;
  css += `  ::after {\n`;
  css += `    border-color: var(--color-border-default);\n`;
  css += `  }\n`;
  css += `\n`;
  css += `  body {\n`;
  css += `    background-color: var(--color-background);\n`;
  css += `    color: var(--color-foreground);\n`;
  css += `  }\n`;
  css += `}\n`;

  fs.writeFileSync(path.join(DIST_DIR, 'globals.css'), css);
  console.log('✓ Generated globals.css');

  // Log summary
  console.log(`  - Light colors: ${lightColors.length} tokens`);
  console.log(`  - Dark colors: ${darkColors.length} tokens`);
  console.log(`  - Static tokens: ${staticTokens.length} tokens`);
  console.log(`  - Semantic tokens: ${semanticTokens.length} tokens`);
}

/**
 * Main execution
 */
console.log('🎨 Generating Tailwind v4 CSS from DTCG tokens...\n');

generateGlobalsCSS();

console.log('\n✨ Token generation complete!');
