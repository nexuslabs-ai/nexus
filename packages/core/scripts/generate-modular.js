import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const MODULAR_DIR = path.join(__dirname, '../dist/modular');

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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
    if (key.startsWith('$')) continue;

    if (value && typeof value === 'object') {
      if (value.$value !== undefined && value.$type !== undefined) {
        result.push({
          path: [...currentPath, key],
          value: value.$value,
          type: value.$type,
          description: value.$description,
        });
      } else {
        extractTokens(value, [...currentPath, key], result);
      }
    }
  }

  return result;
}

/**
 * Convert token path to CSS variable name
 */
function pathToCSSVar(tokenPath, isSemanticColor = false) {
  const cssName = tokenPath.join('-');
  return isSemanticColor ? `color-${cssName}` : cssName;
}

/**
 * Resolve DTCG reference to CSS var()
 */
function resolveReference(value, primitiveMap) {
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    const refPath = value.slice(1, -1);
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
      primitiveMap.set(token.path.join('.'), cssName);
      primitiveTokens.push({ cssName, value: token.value });
    }
  }

  return { tokens: primitiveTokens, primitiveMap };
}

/**
 * Process a semantic token file
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
 * Discover available base and brand themes from semantic directory
 */
function discoverThemes() {
  const semanticDir = path.join(TOKENS_DIR, 'semantic');

  if (!fs.existsSync(semanticDir)) {
    return { bases: [], brands: [] };
  }

  const files = fs.readdirSync(semanticDir);
  const bases = new Set();
  const brands = new Set();

  files.forEach((file) => {
    const baseMatch = file.match(/^base-(\w+)-(light|dark)\.json$/);
    if (baseMatch) bases.add(baseMatch[1]);

    const brandMatch = file.match(/^brands-(\w+)-(light|dark)\.json$/);
    if (brandMatch) brands.add(brandMatch[1]);
  });

  return {
    bases: Array.from(bases).sort(),
    brands: Array.from(brands).sort(),
  };
}

/**
 * Write CSS file to modular directory
 */
function writeModularFile(fileName, content) {
  const filePath = path.join(MODULAR_DIR, fileName);
  fs.writeFileSync(filePath, content);
  console.log(`  ✓ ${fileName}`);
}

/**
 * Generate primitives.css with all color scales
 */
function generatePrimitivesCSS(primitiveTokens) {
  let css = `/* Primitives - All color scales */\n\n`;
  css += `:root {\n`;

  for (const token of primitiveTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }

  css += `}\n`;

  writeModularFile('primitives.css', css);
}

/**
 * Generate base-{palette}.css with light and dark modes
 * Uses html[data-theme] for higher specificity to override Tailwind's @theme :root rules
 */
function generateBaseCSS(baseName, primitiveMap) {
  const lightTokens = processSemanticFile(`base-${baseName}-light.json`, primitiveMap);
  const darkTokens = processSemanticFile(`base-${baseName}-dark.json`, primitiveMap);

  let css = `/* Base: ${baseName} */\n\n`;

  // Light mode - html selector for runtime override
  css += `html {\n`;
  for (const token of lightTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n\n`;

  // Dark mode - higher specificity with html.dark
  css += `html.dark {\n`;
  for (const token of darkTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n`;

  writeModularFile(`base-${baseName}.css`, css);
}

/**
 * Generate brands-{brand}.css with light and dark modes
 * Uses html selector for higher specificity to override Tailwind's @theme :root rules
 */
function generateBrandCSS(brandName, primitiveMap) {
  const lightTokens = processSemanticFile(`brands-${brandName}-light.json`, primitiveMap);
  const darkTokens = processSemanticFile(`brands-${brandName}-dark.json`, primitiveMap);

  let css = `/* Brand: ${brandName} */\n\n`;

  // Light mode - html selector for runtime override
  css += `html {\n`;
  for (const token of lightTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n\n`;

  // Dark mode - higher specificity with html.dark
  css += `html.dark {\n`;
  for (const token of darkTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n`;

  writeModularFile(`brands-${brandName}.css`, css);
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Generating modular CSS files...\n');

  // Ensure modular directory exists
  ensureDir(MODULAR_DIR);

  // Process primitives first (needed for reference resolution)
  const { tokens: primitiveTokens, primitiveMap } = processPrimitives();

  // Discover available themes
  const { bases, brands } = discoverThemes();

  console.log(`Found ${bases.length} base themes: ${bases.join(', ')}`);
  console.log(`Found ${brands.length} brand themes: ${brands.join(', ')}\n`);

  // Generate primitives
  generatePrimitivesCSS(primitiveTokens);

  // Generate base files
  console.log('\nBase themes:');
  bases.forEach((base) => generateBaseCSS(base, primitiveMap));

  // Generate brand files
  console.log('\nBrand themes:');
  brands.forEach((brand) => generateBrandCSS(brand, primitiveMap));

  const totalFiles = 1 + bases.length + brands.length;
  console.log(`\n✨ Generated ${totalFiles} modular CSS files in dist/modular/`);
}

main();
