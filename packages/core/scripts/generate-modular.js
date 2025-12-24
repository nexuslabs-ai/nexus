import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ensureDir,
  extractTokens,
  formatTokenValue,
  isReference,
  log,
  pathToCssVar,
  readTokenFile,
  resolveValue,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const MODULAR_DIR = path.join(__dirname, '../dist/modular');

/**
 * Discover all available modes for each category
 */
function discoverModes() {
  const result = {
    bases: [],
    brands: [],
    sizes: [],
    typographies: [],
    shadows: [],
    radii: [],
    borderwidths: [],
  };

  // Discover base and brand themes from semantic
  const semanticDir = path.join(TOKENS_DIR, 'semantic');
  if (fs.existsSync(semanticDir)) {
    const files = fs.readdirSync(semanticDir);
    const bases = new Set();
    const brands = new Set();

    files.forEach((file) => {
      const baseMatch = file.match(/^base-(\w+)-(light|dark)\.json$/);
      if (baseMatch) bases.add(baseMatch[1]);

      const brandMatch = file.match(/^brands-(\w+)-(light|dark)\.json$/);
      if (brandMatch) brands.add(brandMatch[1]);
    });

    result.bases = Array.from(bases).sort();
    result.brands = Array.from(brands).sort();
  }

  // Discover density/shape modes from primitives subdirectories
  const primitivesDir = path.join(TOKENS_DIR, 'primitives');
  const modePatterns = [
    { dir: 'size', prefix: 'size-', key: 'sizes' },
    { dir: 'typography', prefix: 'typography-', key: 'typographies' },
    { dir: 'shadow', prefix: 'shadow-', key: 'shadows' },
    { dir: 'radius', prefix: 'radius-', key: 'radii' },
    { dir: 'borderwidth', prefix: 'borderwidth-', key: 'borderwidths' },
  ];

  for (const { dir, prefix, key } of modePatterns) {
    const subDir = path.join(primitivesDir, dir);
    if (fs.existsSync(subDir)) {
      const files = fs.readdirSync(subDir).filter((f) => f.endsWith('.json'));
      const modes = files.map((f) =>
        f.replace(prefix, '').replace('.json', '')
      );
      result[key] = modes.sort();
    }
  }

  return result;
}

/**
 * Process color primitives and build primitive map
 */
function processColorPrimitives() {
  const colorFile = path.join(TOKENS_DIR, 'primitives/color.json');
  const primitiveMap = new Map();
  const tokens = [];

  if (!fs.existsSync(colorFile)) {
    log.warn('Color primitives not found');
    return { tokens, primitiveMap };
  }

  const tokenData = readTokenFile(colorFile);
  const extracted = extractTokens(tokenData);

  for (const token of extracted) {
    const cssName = pathToCssVar(token.path);
    const cssValue = formatTokenValue(token.value, token.type);
    primitiveMap.set(token.path.join('.'), { cssName, value: cssValue });
    tokens.push({ cssName, value: cssValue });
  }

  return { tokens, primitiveMap };
}

/**
 * Process a primitive category file (size, typography, shadow, radius, borderwidth)
 */
function processPrimitiveFile(category, mode, primitiveMap) {
  const filePath = path.join(
    TOKENS_DIR,
    `primitives/${category}/${category}-${mode}.json`
  );
  const tokens = [];

  if (!fs.existsSync(filePath)) {
    log.warn(`File not found: ${category}-${mode}.json`);
    return tokens;
  }

  const tokenData = readTokenFile(filePath);
  const extracted = extractTokens(tokenData);

  for (const token of extracted) {
    // No prefix needed - category is already part of the token path
    const cssName = pathToCssVar(token.path);
    let cssValue = token.value;

    // Resolve references if needed
    if (isReference(cssValue)) {
      cssValue = resolveValue(cssValue, primitiveMap, token.type);
    } else {
      cssValue = formatTokenValue(cssValue, token.type);
    }

    // Add to primitive map for cross-references
    primitiveMap.set(token.path.join('.'), { cssName, value: cssValue });
    tokens.push({ cssName, value: cssValue, type: token.type });
  }

  return tokens;
}

/**
 * Process semantic file (base or brand)
 */
function processSemanticFile(fileName, primitiveMap) {
  const filePath = path.join(TOKENS_DIR, 'semantic', fileName);

  if (!fs.existsSync(filePath)) {
    log.warn(`Semantic file not found: ${fileName}`);
    return [];
  }

  const tokenData = readTokenFile(filePath);
  const extracted = extractTokens(tokenData);
  const tokens = [];

  for (const token of extracted) {
    const isColor = token.type === 'color';
    const cssName = pathToCssVar(token.path, isColor ? 'color' : null);
    const cssValue = resolveValue(token.value, primitiveMap, token.type);
    tokens.push({ cssName, value: cssValue });
  }

  return tokens;
}

/**
 * Process typography styles for utilities
 */
function processTypographyStyles(primitiveMap) {
  const stylesFile = path.join(TOKENS_DIR, 'styles/typography.json');

  if (!fs.existsSync(stylesFile)) {
    return [];
  }

  const tokenData = readTokenFile(stylesFile);
  const extracted = extractTokens(tokenData);
  const utilities = [];

  for (const token of extracted) {
    if (token.type !== 'typography') continue;

    const utilityName = `text-${token.path.join('-')}`;
    const properties = {};

    // Resolve each typography property
    if (token.value.fontFamily) {
      properties['font-family'] = resolveValue(
        token.value.fontFamily,
        primitiveMap,
        'fontFamily'
      );
    }
    if (token.value.fontSize) {
      properties['font-size'] = resolveValue(
        token.value.fontSize,
        primitiveMap,
        'dimension'
      );
    }
    if (token.value.fontWeight) {
      properties['font-weight'] = resolveValue(
        token.value.fontWeight,
        primitiveMap,
        'fontWeight'
      );
    }
    if (token.value.lineHeight) {
      if (token.value.lineHeight === 'auto') {
        properties['line-height'] = 'auto';
      } else {
        properties['line-height'] = resolveValue(
          token.value.lineHeight,
          primitiveMap,
          'dimension'
        );
      }
    }
    if (token.value.letterSpacing) {
      if (
        typeof token.value.letterSpacing === 'object' &&
        'value' in token.value.letterSpacing
      ) {
        properties['letter-spacing'] = formatTokenValue(
          token.value.letterSpacing,
          'dimension'
        );
      } else {
        properties['letter-spacing'] = resolveValue(
          token.value.letterSpacing,
          primitiveMap,
          'dimension'
        );
      }
    }

    utilities.push({ name: utilityName, properties });
  }

  return utilities;
}

/**
 * Process shadow styles
 */
function processShadowStyles(primitiveMap) {
  const stylesFile = path.join(TOKENS_DIR, 'styles/shadows.json');

  if (!fs.existsSync(stylesFile)) {
    return [];
  }

  const tokenData = readTokenFile(stylesFile);
  const extracted = extractTokens(tokenData);
  const shadows = [];

  for (const token of extracted) {
    if (token.type !== 'shadow') continue;

    const cssName = `shadow-${token.path.join('-')}`;
    const layers = Array.isArray(token.value) ? token.value : [token.value];

    const shadowParts = layers.map((layer) => {
      const inset = token.path.includes('inner') ? 'inset ' : '';
      const offsetX = resolveValue(layer.offsetX, primitiveMap, 'dimension');
      const offsetY = resolveValue(layer.offsetY, primitiveMap, 'dimension');
      const blur = formatTokenValue(layer.blur, 'dimension');
      const spread = resolveValue(layer.spread, primitiveMap, 'dimension');
      const color = resolveValue(layer.color, primitiveMap, 'color');

      return `${inset}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
    });

    shadows.push({ cssName, value: shadowParts.join(', ') });
  }

  return shadows;
}

/**
 * Write CSS file
 */
function writeModularFile(fileName, content) {
  const filePath = path.join(MODULAR_DIR, fileName);
  fs.writeFileSync(filePath, content);
  log.file(fileName);
}

/**
 * Generate primitives.css with all color scales
 */
function generatePrimitivesCSS(colorTokens) {
  let css = `/* Primitives - All color scales */\n\n:root {\n`;

  for (const token of colorTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }

  css += `}\n`;
  writeModularFile('primitives.css', css);
}

/**
 * Generate mode file (size, typography, shadow, radius, borderwidth)
 */
function generateModeCSS(category, mode, tokens) {
  let css = `/* ${category}: ${mode} */\n\n:root {\n`;

  for (const token of tokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }

  css += `}\n`;
  writeModularFile(`${category}-${mode}.css`, css);
}

/**
 * Generate base theme CSS
 */
function generateBaseCSS(baseName, primitiveMap) {
  const lightTokens = processSemanticFile(
    `base-${baseName}-light.json`,
    primitiveMap
  );
  const darkTokens = processSemanticFile(
    `base-${baseName}-dark.json`,
    primitiveMap
  );

  let css = `/* Base: ${baseName} */\n\nhtml {\n`;

  for (const token of lightTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n\nhtml.dark {\n`;

  for (const token of darkTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n`;

  writeModularFile(`base-${baseName}.css`, css);
}

/**
 * Generate brand theme CSS
 */
function generateBrandCSS(brandName, primitiveMap) {
  const lightTokens = processSemanticFile(
    `brands-${brandName}-light.json`,
    primitiveMap
  );
  const darkTokens = processSemanticFile(
    `brands-${brandName}-dark.json`,
    primitiveMap
  );

  let css = `/* Brand: ${brandName} */\n\nhtml {\n`;

  for (const token of lightTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n\nhtml.dark {\n`;

  for (const token of darkTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n`;

  writeModularFile(`brands-${brandName}.css`, css);
}

/**
 * Generate typography utilities CSS
 */
function generateTypographyUtilitiesCSS(utilities) {
  let css = `/* Typography Utilities */\n\n`;

  for (const utility of utilities) {
    css += `@utility ${utility.name} {\n`;
    for (const [prop, value] of Object.entries(utility.properties)) {
      css += `  ${prop}: ${value};\n`;
    }
    css += `}\n\n`;
  }

  writeModularFile('typography-utilities.css', css);
}

/**
 * Generate shadow variables CSS
 */
function generateShadowVariablesCSS(shadows) {
  let css = `/* Shadow Variables */\n\n:root {\n`;

  for (const shadow of shadows) {
    css += `  --${shadow.cssName}: ${shadow.value};\n`;
  }

  css += `}\n`;
  writeModularFile('shadow-variables.css', css);
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Generating modular CSS files...\n');

  ensureDir(MODULAR_DIR);

  // Discover all available modes
  const modes = discoverModes();

  console.log(`📦 Discovered modes:`);
  console.log(`   Bases: ${modes.bases.join(', ')}`);
  console.log(`   Brands: ${modes.brands.join(', ')}`);
  console.log(`   Sizes: ${modes.sizes.join(', ')}`);
  console.log(`   Typography: ${modes.typographies.join(', ')}`);
  console.log(`   Shadows: ${modes.shadows.join(', ')}`);
  console.log(`   Radii: ${modes.radii.join(', ')}`);
  console.log(`   Border widths: ${modes.borderwidths.join(', ')}\n`);

  // Process color primitives first (needed for reference resolution)
  const { tokens: colorTokens, primitiveMap } = processColorPrimitives();

  // Generate primitives.css
  console.log('Color primitives:');
  generatePrimitivesCSS(colorTokens);

  // Generate mode files
  console.log('\nSize modes:');
  for (const mode of modes.sizes) {
    const tokens = processPrimitiveFile('size', mode, primitiveMap);
    generateModeCSS('size', mode, tokens);
  }

  console.log('\nTypography modes:');
  for (const mode of modes.typographies) {
    const tokens = processPrimitiveFile('typography', mode, primitiveMap);
    generateModeCSS('typography', mode, tokens);
  }

  console.log('\nShadow modes:');
  for (const mode of modes.shadows) {
    const tokens = processPrimitiveFile('shadow', mode, primitiveMap);
    generateModeCSS('shadow', mode, tokens);
  }

  console.log('\nRadius modes:');
  for (const mode of modes.radii) {
    const tokens = processPrimitiveFile('radius', mode, primitiveMap);
    generateModeCSS('radius', mode, tokens);
  }

  console.log('\nBorder width modes:');
  for (const mode of modes.borderwidths) {
    const tokens = processPrimitiveFile('borderwidth', mode, primitiveMap);
    generateModeCSS('borderwidth', mode, tokens);
  }

  // Generate base theme files
  console.log('\nBase themes:');
  for (const base of modes.bases) {
    generateBaseCSS(base, primitiveMap);
  }

  // Generate brand theme files
  console.log('\nBrand themes:');
  for (const brand of modes.brands) {
    generateBrandCSS(brand, primitiveMap);
  }

  // Generate typography utilities from styles
  console.log('\nStyles:');
  const typographyUtilities = processTypographyStyles(primitiveMap);
  if (typographyUtilities.length > 0) {
    generateTypographyUtilitiesCSS(typographyUtilities);
    console.log(`  ✓ ${typographyUtilities.length} typography utilities`);
  }

  // Generate shadow variables from styles
  const shadowVariables = processShadowStyles(primitiveMap);
  if (shadowVariables.length > 0) {
    generateShadowVariablesCSS(shadowVariables);
    console.log(`  ✓ ${shadowVariables.length} shadow variables`);
  }

  // Count total files
  const totalFiles =
    1 + // primitives
    modes.sizes.length +
    modes.typographies.length +
    modes.shadows.length +
    modes.radii.length +
    modes.borderwidths.length +
    modes.bases.length +
    modes.brands.length +
    (typographyUtilities.length > 0 ? 1 : 0) +
    (shadowVariables.length > 0 ? 1 : 0);

  console.log(
    `\n✨ Generated ${totalFiles} modular CSS files in dist/modular/`
  );
}

main();
