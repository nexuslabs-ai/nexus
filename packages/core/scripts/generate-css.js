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
 * Parse CLI arguments
 * Usage: node generate-css.js --base=slate --brand=blue
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    base: 'slate',
    brand: 'blue',
  };

  args.forEach((arg) => {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'base') config.base = value;
      if (key === 'brand') config.brand = value;
    }
  });

  return config;
}

/**
 * Get semantic file paths based on base and brand selection
 */
function getSemanticFiles(base, brand) {
  return {
    baseLight: `base-${base}-light.json`,
    baseDark: `base-${base}-dark.json`,
    brandLight: `brands-${brand}-light.json`,
    brandDark: `brands-${brand}-dark.json`,
  };
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
 * Convert token path to CSS variable name
 * For primitives: ['blue', '500'] → 'blue-500'
 * For semantic colors: ['primary', 'background'] → 'color-primary-background'
 */
function pathToCSSVar(tokenPath, isSemanticColor = false) {
  const cssName = tokenPath.join('-');
  return isSemanticColor ? `color-${cssName}` : cssName;
}

/**
 * Resolve DTCG reference to CSS var()
 * @param {string} value - Token value (might be a reference like {blue.500})
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
 * Process all primitive token files
 * Returns { tokens: [], primitiveMap: Map }
 */
function processPrimitives() {
  const primitivesDir = path.join(TOKENS_DIR, 'primitives');
  const primitiveTokens = [];
  const primitiveMap = new Map();

  if (!fs.existsSync(primitivesDir)) {
    console.warn('⚠ Primitives directory not found');
    return { tokens: primitiveTokens, primitiveMap };
  }

  const files = fs.readdirSync(primitivesDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(primitivesDir, file);
    const tokenData = readTokenFile(filePath);
    const tokens = extractTokens(tokenData);

    for (const token of tokens) {
      const cssName = pathToCSSVar(token.path, false);

      // Add to primitive map for reference resolution
      primitiveMap.set(token.path.join('.'), cssName);

      primitiveTokens.push({
        cssName,
        value: token.value,
      });
    }
  }

  return { tokens: primitiveTokens, primitiveMap };
}

/**
 * Process a semantic token file
 * Returns array of { cssName, value }
 */
function processSemanticFile(fileName, primitiveMap) {
  const semanticDir = path.join(TOKENS_DIR, 'semantic');
  const filePath = path.join(semanticDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Semantic file not found: ${fileName}`);
    return [];
  }

  const tokenData = readTokenFile(filePath);
  const tokens = extractTokens(tokenData);
  const result = [];

  for (const token of tokens) {
    const isColor = token.type === 'color';
    const cssName = pathToCSSVar(token.path, isColor);
    const cssValue = resolveReference(token.value, primitiveMap);

    result.push({ cssName, value: cssValue });
  }

  return result;
}

/**
 * Generate globals.css with Tailwind v4 structure
 */
function generateGlobalsCSS(config) {
  const { base, brand } = config;
  const semanticFiles = getSemanticFiles(base, brand);

  console.log(`📦 Theme: base=${base}, brand=${brand}`);

  // Process primitives (theme-agnostic)
  const { tokens: primitiveTokens, primitiveMap } = processPrimitives();

  // Process semantic files
  const lightBaseTokens = processSemanticFile(semanticFiles.baseLight, primitiveMap);
  const lightBrandTokens = processSemanticFile(semanticFiles.brandLight, primitiveMap);
  const darkBaseTokens = processSemanticFile(semanticFiles.baseDark, primitiveMap);
  const darkBrandTokens = processSemanticFile(semanticFiles.brandDark, primitiveMap);

  const lightTokens = [...lightBaseTokens, ...lightBrandTokens];
  const darkTokens = [...darkBaseTokens, ...darkBrandTokens];

  // Generate CSS
  let css = `@import "tailwindcss";\n\n`;
  css += `@custom-variant dark (&:is(.dark *));\n\n`;

  // :root - Primitives (all color scales, theme-agnostic)
  if (primitiveTokens.length > 0) {
    css += `:root {\n`;
    for (const token of primitiveTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
    css += `}\n\n`;
  }

  // @theme inline - Light mode semantic tokens
  if (lightTokens.length > 0) {
    css += `@theme inline {\n`;
    css += `  --*: initial;\n`;
    for (const token of lightTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
    css += `}\n\n`;
  }

  // .dark - Dark mode semantic overrides
  if (darkTokens.length > 0) {
    css += `.dark {\n`;
    for (const token of darkTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
    css += `}\n\n`;
  }

  // @layer base - Default styles
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
  console.log(`  - Primitives: ${primitiveTokens.length} tokens`);
  console.log(`  - Light semantic: ${lightTokens.length} tokens`);
  console.log(`  - Dark semantic: ${darkTokens.length} tokens`);
}

/**
 * Main execution
 */
console.log('🎨 Generating Tailwind v4 CSS from DTCG tokens...\n');

const config = parseArgs();
generateGlobalsCSS(config);

console.log('\n✨ Token generation complete!');
