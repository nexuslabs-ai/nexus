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
  getGoogleFontsImportFromTokens,
  isReference,
  log,
  pathToCssVar,
  processSemanticTokens,
  readTokenFile,
  resolveValueWithNxPrefix,
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
    // Add nx- prefix and category: --nx-{category}-{token-path}
    const cssName = `nx-${category}-${pathToCssVar(token.path)}`;
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
    // Add nx- prefix and category: --nx-{category}-{token-path}
    // e.g., shadow/2xs.layer-1.x → --nx-shadow-2xs-layer-1-x
    const cssName = `nx-${category}-${pathToCssVar(token.path)}`;
    let cssValue = token.value;

    // Resolve references if needed (references resolve to var(--nx-*))
    if (isReference(cssValue)) {
      cssValue = resolveValueWithNxPrefix(cssValue, primitiveMap, token.type);
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
 * Uses resolveValueWithNxPrefix to resolve references to var(--nx-*)
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

    // Resolve each typography property using nx-prefixed variables
    if (token.value.fontFamily) {
      properties['font-family'] = resolveValueWithNxPrefix(
        token.value.fontFamily,
        primitiveMap,
        'fontFamily'
      );
    }
    if (token.value.fontSize) {
      properties['font-size'] = resolveValueWithNxPrefix(
        token.value.fontSize,
        primitiveMap,
        'dimension'
      );
    }
    if (token.value.fontWeight) {
      properties['font-weight'] = resolveValueWithNxPrefix(
        token.value.fontWeight,
        primitiveMap,
        'fontWeight'
      );
    }
    if (token.value.lineHeight) {
      if (token.value.lineHeight === 'auto') {
        properties['line-height'] = 'auto';
      } else {
        properties['line-height'] = resolveValueWithNxPrefix(
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
        properties['letter-spacing'] = resolveValueWithNxPrefix(
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
 * Note: shadow composites reference --nx-shadow-* layer variables
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

    // Shadow composite variables use nx- prefix
    const cssName = `nx-shadow-${token.path.join('-')}`;
    const isInset = token.path.includes('inner');
    // formatShadowComposite generates var(--shadow-*) references
    // We need to update those to var(--nx-shadow-*)
    let cssValue = formatShadowComposite(token.value, isInset);
    // Replace var(--shadow- with var(--nx-shadow-
    cssValue = cssValue.replace(/var\(--shadow-/g, 'var(--nx-shadow-');

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
 * @param {object[]} tokens - Array of borderwidth tokens (with nx- prefix)
 */
function generateBorderWidthUtilitiesCSS(tokens) {
  let css = `/* Border Width Utilities */\n\n`;

  for (const token of tokens) {
    // Extract the name part (e.g., "default" from "nx-borderwidth-default")
    const name = token.cssName.replace('nx-borderwidth-', '');

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
 * Collect all semantic color tokens from a file with resolved values
 * Returns array of { cssName, value } for @theme block
 * @param {string} fileName - Semantic token file name
 * @param {Map} primitiveMap - Map of primitive token values for resolution
 */
function collectSemanticColorTokens(fileName, primitiveMap) {
  const filePath = path.join(SEMANTIC_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  // Recursively extract token paths and resolve values
  function extractPaths(obj, pathParts = []) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;

      const currentPath = [...pathParts, key];

      if (value.$value !== undefined && value.$type === 'color') {
        // This is a token - resolve its value
        const cssName = `color-${currentPath.join('-')}`;
        let resolvedValue = value.$value;

        // Resolve reference like {slate.50} to actual hex value
        if (isReference(resolvedValue)) {
          const refPath = resolvedValue.slice(1, -1); // Remove { }
          const primitiveInfo = primitiveMap.get(refPath);
          if (primitiveInfo) {
            resolvedValue = primitiveInfo.value;
          }
        }

        tokens.push({ cssName, value: resolvedValue });
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Nested group
        extractPaths(value, currentPath);
      }
    }
  }

  extractPaths(tokenData);
  return tokens;
}

/**
 * Collect spacing token mappings from spacing.json
 * Returns array of { cssName, varRef } for @theme block
 */
function collectSpacingTokens() {
  const filePath = path.join(SEMANTIC_DIR, 'spacing.json');
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const tokenData = readTokenFile(filePath);
  const tokens = [];

  for (const [key, value] of Object.entries(tokenData)) {
    if (key.startsWith('$')) continue;
    if (value.$type !== 'dimension') continue;

    // Extract the size key from the reference {N} -> N
    const match = value.$value.match(/\{(.+)\}/);
    if (match) {
      const sizeKey = match[1];
      // spacing-0_5 -> --spacing-0_5: var(--nx-size-0_5)
      const cssName = key.replace('spacing-', 'spacing-');
      tokens.push({
        cssName,
        varRef: `var(--nx-size-${sizeKey})`,
      });
    }
  }

  return tokens;
}

/**
 * Collect radius token mappings from a sample mode file
 * Returns array of { cssName, varRef } for @theme block
 */
function collectRadiusTokens(mode) {
  const filePath = path.join(
    TOKENS_DIR,
    `primitives/radius/radius-${mode}.json`
  );
  if (!fs.existsSync(filePath)) {
    return [];
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
 * Collect borderwidth token mappings from a sample mode file
 * Returns array of { cssName, varRef } for @theme block
 */
function collectBorderwidthTokens(mode) {
  const filePath = path.join(
    TOKENS_DIR,
    `primitives/borderwidth/borderwidth-${mode}.json`
  );
  if (!fs.existsSync(filePath)) {
    return [];
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
 * Generate shadow CSS value with var() references to layer variables
 */
function generateShadowVarValue(name, shadowValue, isInset = false) {
  const prefix = isInset ? 'inset ' : '';

  if (Array.isArray(shadowValue)) {
    // Multi-layer shadow
    const layers = shadowValue.map((_layer, index) => {
      const layerNum = shadowValue.length - index; // layer-2, layer-1
      return `var(--nx-shadow-${name}-layer-${layerNum}-x) var(--nx-shadow-${name}-layer-${layerNum}-y) var(--nx-shadow-${name}-layer-${layerNum}-blur) var(--nx-shadow-${name}-layer-${layerNum}-spread) var(--nx-shadow-${name}-layer-${layerNum}-color)`;
    });
    return layers.join(', ');
  } else {
    // Single layer or focus shadow
    if (name.startsWith('focus-')) {
      // Focus shadows use different naming: focus-default-x instead of focus-default-layer-1-x
      return `${prefix}var(--nx-shadow-${name}-x) var(--nx-shadow-${name}-y) var(--nx-shadow-${name}-blur) var(--nx-shadow-${name}-spread) var(--nx-shadow-${name}-color)`;
    }
    return `${prefix}var(--nx-shadow-${name}-layer-1-x) var(--nx-shadow-${name}-layer-1-y) var(--nx-shadow-${name}-layer-1-blur) var(--nx-shadow-${name}-layer-1-spread) var(--nx-shadow-${name}-layer-1-color)`;
  }
}

/**
 * Collect shadow token CSS values with var() references
 * Returns array of { cssName, value } for @theme block
 */
function collectShadowTokens() {
  const stylesFile = path.join(TOKENS_DIR, 'styles/shadows.json');
  if (!fs.existsSync(stylesFile)) {
    return [];
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
            const cssValue = generateShadowVarValue(
              shadowName,
              subValue.$value
            );
            shadows.push({ cssName: `shadow-${shadowName}`, value: cssValue });
          }
        }
      }
      continue;
    }

    const isInset = key === 'inner';
    const cssValue = generateShadowVarValue(key, value.$value, isInset);
    shadows.push({ cssName: `shadow-${key}`, value: cssValue });
  }

  return shadows;
}

/**
 * Generate globals.css for playground
 * Uses @theme (not inline) for dynamic theme switching
 * @param {object} primitives - Discovered primitives info
 * @param {Map} primitiveMap - Map of primitive token values for resolution
 */
function generatePlaygroundGlobalsCSS(primitives, primitiveMap) {
  // Generate Google Fonts import from first available typography mode
  const typographyModes = primitives.typography?.modes || ['vega'];
  const typographyMode = typographyModes[0];
  const typographyFilePath = path.join(
    TOKENS_DIR,
    `primitives/typography/typography-${typographyMode}.json`
  );
  const googleFontsImport = getGoogleFontsImportFromTokens(typographyFilePath);

  let css = `/*
 * Playground globals.css - Auto-generated by generate-modular.js
 * DO NOT EDIT MANUALLY - changes will be overwritten
 *
 * This file uses @theme (not inline) so utilities use var() references
 * that can be overridden by dynamically loaded theme CSS files.
 * Tailwind utilities are generated with nx: prefix (e.g., nx:bg-background).
 *
 * Default values are from slate-light base + blue-light brand.
 * These can be overridden by theme CSS files loaded by useTheme hook.
 */
`;

  // Add Google Fonts import if available
  if (googleFontsImport) {
    css += `/* Google Fonts - auto-generated from typography tokens */\n`;
    css += `${googleFontsImport}\n\n`;
    log.success(`Generated Google Fonts import for typography mode: ${typographyMode}`);
  }

  css += `@import 'tailwindcss' prefix(nx);
@import './color.css';
@import './typography-utilities.css';
@import './borderwidth-utilities.css';

@custom-variant dark (&:is(.dark *));

@theme {
  /* Reset default Tailwind namespaces to enforce semantic tokens only */
  --color-*: initial;
  --spacing-*: initial;
  --radius-*: initial;
  --shadow-*: initial;

`;

  // Collect all color tokens from base and brands (with resolved default values)
  const baseTokens = collectSemanticColorTokens(
    'base-slate-light.json',
    primitiveMap
  );
  const brandTokens = collectSemanticColorTokens(
    'brands-blue-light.json',
    primitiveMap
  );
  const allColorTokens = [...baseTokens, ...brandTokens];

  // Group tokens for organized output
  css += `  /* Semantic color tokens - defaults, overridden by theme CSS */\n`;
  for (const token of allColorTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }

  // Spacing tokens
  const spacingTokens = collectSpacingTokens();
  if (spacingTokens.length > 0) {
    css += `\n  /* Spacing tokens - reference --nx-size-* primitives */\n`;
    for (const token of spacingTokens) {
      css += `  --${token.cssName}: ${token.varRef};\n`;
    }
  }

  // Radius tokens
  const firstRadiusMode = primitives.radius?.modes?.[0];
  if (firstRadiusMode) {
    const radiusTokens = collectRadiusTokens(firstRadiusMode);
    if (radiusTokens.length > 0) {
      css += `\n  /* Radius tokens - reference --nx-radius-* primitives */\n`;
      for (const token of radiusTokens) {
        css += `  --${token.cssName}: ${token.varRef};\n`;
      }
    }
  }

  // Border width tokens
  const firstBorderwidthMode = primitives.borderwidth?.modes?.[0];
  if (firstBorderwidthMode) {
    const borderwidthTokens = collectBorderwidthTokens(firstBorderwidthMode);
    if (borderwidthTokens.length > 0) {
      css += `\n  /* Border width tokens - reference --nx-borderwidth-* primitives */\n`;
      for (const token of borderwidthTokens) {
        css += `  --${token.cssName}: ${token.varRef};\n`;
      }
    }
  }

  // Shadow tokens
  const shadowTokens = collectShadowTokens();
  if (shadowTokens.length > 0) {
    css += `\n  /* Shadow tokens - reference --nx-shadow-* layer variables */\n`;
    for (const token of shadowTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
  }

  css += `}\n`;

  writeModularFile('globals.css', css);
  return allColorTokens.length + spacingTokens.length;
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

  // Generate playground globals.css
  console.log('\nPlayground:');
  const globalsTokenCount = generatePlaygroundGlobalsCSS(primitives, primitiveMap);
  console.log(`  ✓ globals.css (${globalsTokenCount} tokens)`);
  totalFiles++;

  console.log(
    `\n✨ Generated ${totalFiles} modular CSS files in dist/modular/`
  );
}

main();
