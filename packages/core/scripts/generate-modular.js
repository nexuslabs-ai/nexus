import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  discoverPrimitives,
  discoverSemantics,
  ensureDir,
  extractTokens,
  formatShadowComposite,
  formatTokenValue,
  isReference,
  log,
  pathToCssVar,
  processSemanticTokens,
  readTokenFile,
  resolveValue,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const MODULAR_DIR = path.join(__dirname, '../dist/modular');

const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');
const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');

/**
 * Process a single-file primitive category (e.g., color.json)
 * @param {string} category - Category name (e.g., 'color')
 * @param {Map} primitiveMap - Map to populate with token references
 * @returns {object[]} Array of { cssName, value } tokens
 */
function processSinglePrimitive(category, primitiveMap) {
  const filePath = path.join(PRIMITIVES_DIR, `${category}.json`);
  const tokens = [];

  if (!fs.existsSync(filePath)) {
    log.warn(`Single primitive not found: ${category}.json`);
    return tokens;
  }

  const tokenData = readTokenFile(filePath);
  const extracted = extractTokens(tokenData);

  for (const token of extracted) {
    // Add category prefix: --{category}-{token-path}
    const cssName = `${category}-${pathToCssVar(token.path)}`;
    const cssValue = formatTokenValue(token.value, token.type);
    primitiveMap.set(token.path.join('.'), { cssName, value: cssValue });
    tokens.push({ cssName, value: cssValue });
  }

  return tokens;
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
    // Add category prefix to CSS variable name: --{category}-{token-path}
    // e.g., shadow/2xs.layer-1.x → --shadow-2xs-layer-1-x
    const cssName = `${category}-${pathToCssVar(token.path)}`;
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
 * Process semantic file (wrapper for shared function)
 */
function processSemanticFile(fileName, primitiveMap) {
  const filePath = path.join(SEMANTIC_DIR, fileName);
  return processSemanticTokens(filePath, primitiveMap);
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
 * Process shadow styles - generates var() references instead of resolved values
 */
function processShadowStyles() {
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
    const isInset = token.path.includes('inner');
    const cssValue = formatShadowComposite(token.value, isInset);

    shadows.push({ cssName, value: cssValue });
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
 * Generate CSS file for a single-file primitive category
 * @param {object[]} tokens - Array of { cssName, value } tokens
 * @param {string} category - Category name for file naming
 */
function generatePrimitivesCSS(tokens, category) {
  let css = `/* ${category} primitives */\n\n:root {\n`;

  for (const token of tokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }

  css += `}\n`;
  writeModularFile(`${category}.css`, css);
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
 * Generate themed CSS file (supports light/dark variants)
 * @param {string} type - Theme type (e.g., 'base', 'brands')
 * @param {string} mode - Mode name (e.g., 'slate', 'blue')
 * @param {Map} primitiveMap - Map of primitive token references
 */
function generateThemedCSS(type, mode, primitiveMap) {
  const lightTokens = processSemanticFile(
    `${type}-${mode}-light.json`,
    primitiveMap
  );
  const darkTokens = processSemanticFile(
    `${type}-${mode}-dark.json`,
    primitiveMap
  );

  let css = `/* ${type}: ${mode} */\n\nhtml {\n`;

  for (const token of lightTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n\nhtml.dark {\n`;

  for (const token of darkTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n`;

  writeModularFile(`${type}-${mode}.css`, css);
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
 * Generate border width utilities CSS
 * @param {object[]} tokens - Array of borderwidth tokens
 */
function generateBorderWidthUtilitiesCSS(tokens) {
  let css = `/* Border Width Utilities */\n\n`;

  for (const token of tokens) {
    // Extract the name part (e.g., "default" from "borderwidth-default")
    const name = token.cssName.replace('borderwidth-', '');

    css += `@utility border-${name} {\n`;
    css += `  border-style: var(--tw-border-style, solid);\n`;
    css += `  border-width: var(--${token.cssName});\n`;
    css += `}\n\n`;
  }

  writeModularFile('borderwidth-utilities.css', css);
}

/**
 * Generate standalone semantic CSS (spacing, etc.)
 */
function generateStandaloneSemanticCSS(name, tokens) {
  let css = `/* ${name} */\n\n:root {\n`;

  for (const token of tokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }

  css += `}\n`;
  writeModularFile(`${name}.css`, css);
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Generating modular CSS files...\n');

  ensureDir(MODULAR_DIR);

  // Auto-discover all categories and modes
  const primitives = discoverPrimitives(PRIMITIVES_DIR);
  const semantics = discoverSemantics(SEMANTIC_DIR);

  // Log discovered structure
  console.log('📦 Discovered primitives:');
  for (const [category, info] of Object.entries(primitives)) {
    if (info.modes) {
      console.log(`   ${category}: ${info.modes.join(', ')}`);
    } else {
      console.log(`   ${category}: (single file)`);
    }
  }

  console.log('\n📦 Discovered semantics:');
  for (const [type, modes] of Object.entries(semantics.themed)) {
    console.log(`   ${type}: ${Object.keys(modes).join(', ')}`);
  }
  if (semantics.standalone.length > 0) {
    console.log(`   standalone: ${semantics.standalone.join(', ')}`);
  }

  // Build primitive map starting with single-file categories (like color)
  const primitiveMap = new Map();
  let totalFiles = 0;

  // Process single-file primitives first (no modes)
  console.log('\nSingle-file primitives:');
  for (const [category, info] of Object.entries(primitives)) {
    if (info.modes === null) {
      const tokens = processSinglePrimitive(category, primitiveMap);
      if (tokens.length > 0) {
        generatePrimitivesCSS(tokens, category);
        totalFiles++;
      }
    }
  }

  // Process multi-mode primitives
  for (const [category, info] of Object.entries(primitives)) {
    if (info.modes && info.modes.length > 0) {
      console.log(`\n${category} modes:`);
      for (const mode of info.modes) {
        const tokens = processPrimitiveFile(category, mode, primitiveMap);
        generateModeCSS(category, mode, tokens);
        totalFiles++;
      }
    }
  }

  // Generate themed semantic files (base, brands)
  for (const [type, modes] of Object.entries(semantics.themed)) {
    console.log(`\n${type} themes:`);
    for (const mode of Object.keys(modes)) {
      generateThemedCSS(type, mode, primitiveMap);
      totalFiles++;
    }
  }

  // Generate standalone semantic files (spacing, etc.)
  if (semantics.standalone.length > 0) {
    console.log('\nStandalone semantics:');
    for (const standaloneFile of semantics.standalone) {
      const tokens = processSemanticFile(standaloneFile, primitiveMap);
      if (tokens.length > 0) {
        const fileName = standaloneFile.replace('.json', '');
        generateStandaloneSemanticCSS(fileName, tokens);
        totalFiles++;
      }
    }
  }

  // Generate typography utilities from styles
  console.log('\nStyles:');
  const typographyUtilities = processTypographyStyles(primitiveMap);
  if (typographyUtilities.length > 0) {
    generateTypographyUtilitiesCSS(typographyUtilities);
    console.log(`  ✓ ${typographyUtilities.length} typography utilities`);
    totalFiles++;
  }

  // Generate shadow variables from styles
  const shadowVariables = processShadowStyles();
  if (shadowVariables.length > 0) {
    generateShadowVariablesCSS(shadowVariables);
    console.log(`  ✓ ${shadowVariables.length} shadow variables`);
    totalFiles++;
  }

  // Generate border width utilities (use first mode as reference)
  if (primitives.borderwidth && primitives.borderwidth.modes) {
    const firstMode = primitives.borderwidth.modes[0];
    const borderwidthTokens = processPrimitiveFile(
      'borderwidth',
      firstMode,
      primitiveMap
    );
    if (borderwidthTokens.length > 0) {
      generateBorderWidthUtilitiesCSS(borderwidthTokens);
      console.log(`  ✓ ${borderwidthTokens.length} border width utilities`);
      totalFiles++;
    }
  }

  console.log(
    `\n✨ Generated ${totalFiles} modular CSS files in dist/modular/`
  );
}

main();
