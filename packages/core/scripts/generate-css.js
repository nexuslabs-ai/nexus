import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ensureDir,
  extractTokens,
  formatTokenValue,
  log,
  parseArgs,
  pathToCssVar,
  readTokenFile,
  resolveValue,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const DIST_DIR = path.join(__dirname, '../dist');

// Ensure dist directory exists
ensureDir(DIST_DIR);

/**
 * Get primitive file paths based on config
 * @param {object} config - Configuration object
 * @returns {object} Map of category to file path
 */
function getPrimitiveFiles(config) {
  return {
    color: 'color.json',
    size: `size/size-${config.size}.json`,
    typography: `typography/typography-${config.typography}.json`,
    shadow: `shadow/shadow-${config.shadow}.json`,
    radius: `radius/radius-${config.radius}.json`,
    borderwidth: `borderwidth/borderwidth-${config.borderwidth}.json`,
  };
}

/**
 * Get semantic file paths based on config
 * @param {object} config - Configuration object
 * @returns {object} Semantic file names
 */
function getSemanticFiles(config) {
  return {
    baseLight: `base-${config.base}-light.json`,
    baseDark: `base-${config.base}-dark.json`,
    brandLight: `brands-${config.brand}-light.json`,
    brandDark: `brands-${config.brand}-dark.json`,
    spacing: 'spacing.json',
  };
}

/**
 * Load tokens from a file and add to primitive map (first pass - no reference resolution)
 * @param {string} filePath - Path to token file
 * @param {Map} primitiveMap - Map to add tokens to
 * @param {object[]} tokenList - List to add raw tokens to
 * @param {string} category - Category name for the tokens
 */
function loadTokensIntoMap(filePath, primitiveMap, tokenList, category) {
  if (!fs.existsSync(filePath)) {
    log.warn(`File not found: ${filePath}`);
    return;
  }

  const tokenData = readTokenFile(filePath);
  const tokens = extractTokens(tokenData);

  for (const token of tokens) {
    const cssName = pathToCssVar(token.path);
    const cssValue = formatTokenValue(token.value, token.type);

    // Add to map for reference resolution (path.to.token → cssName)
    primitiveMap.set(token.path.join('.'), {
      cssName,
      value: cssValue,
      type: token.type,
      rawValue: token.value, // Keep raw value for later resolution
    });

    // Add to list for CSS output (with category for proper grouping)
    tokenList.push({
      cssName,
      value: cssValue,
      type: token.type,
      category,
      rawValue: token.value,
      path: token.path.join('.'), // Original path for map lookup
    });
  }
}

/**
 * Resolve any cross-primitive references in token list and update primitiveMap
 * @param {object[]} tokenList - List of tokens
 * @param {Map} primitiveMap - Primitive map for resolution
 */
function resolveCrossPrimitiveReferences(tokenList, primitiveMap) {
  for (const token of tokenList) {
    // Check if the raw value is a reference
    if (
      typeof token.rawValue === 'string' &&
      token.rawValue.startsWith('{') &&
      token.rawValue.endsWith('}')
    ) {
      const resolved = resolveValue(token.rawValue, primitiveMap, token.type);
      token.value = resolved;

      // Also update the primitiveMap so shadow/typography style resolution works
      const existing = primitiveMap.get(token.path);
      if (existing) {
        existing.value = resolved;
      }
    }
  }
}

/**
 * Process all primitive token files based on config
 * @param {object} config - Configuration object
 * @returns {{ tokens: object[], primitiveMap: Map }}
 */
function processPrimitives(config) {
  const primitivesDir = path.join(TOKENS_DIR, 'primitives');
  const primitiveTokens = [];
  const primitiveMap = new Map();

  const primitiveFiles = getPrimitiveFiles(config);

  // First pass: load all tokens into map
  for (const [category, relativePath] of Object.entries(primitiveFiles)) {
    const filePath = path.join(primitivesDir, relativePath);
    loadTokensIntoMap(filePath, primitiveMap, primitiveTokens, category);
  }

  // Second pass: resolve cross-primitive references (e.g., shadow colors → color primitives)
  resolveCrossPrimitiveReferences(primitiveTokens, primitiveMap);

  return { tokens: primitiveTokens, primitiveMap };
}

/**
 * Process a semantic token file
 * @param {string} fileName - Semantic file name
 * @param {Map} primitiveMap - Primitive map for reference resolution
 * @returns {object[]} Array of { cssName, value }
 */
function processSemanticFile(fileName, primitiveMap) {
  const semanticDir = path.join(TOKENS_DIR, 'semantic');
  const filePath = path.join(semanticDir, fileName);

  if (!fs.existsSync(filePath)) {
    log.warn(`Semantic file not found: ${fileName}`);
    return [];
  }

  const tokenData = readTokenFile(filePath);
  const tokens = extractTokens(tokenData);
  const result = [];

  for (const token of tokens) {
    // Add 'color' prefix for color tokens, no prefix for dimensions (spacing)
    const prefix = token.type === 'color' ? 'color' : null;
    const cssName = pathToCssVar(token.path, prefix);
    const cssValue = resolveValue(token.value, primitiveMap, token.type);

    result.push({ cssName, value: cssValue, type: token.type });
  }

  return result;
}

/**
 * Extract typography composite tokens from styles/typography.json
 * @param {object} obj - Token object
 * @param {string[]} pathParts - Current path parts
 * @param {object[]} result - Accumulated results
 * @returns {object[]} Array of { name, value, description }
 */
function extractTypographyTokens(obj, pathParts = [], result = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;

    if (value && typeof value === 'object') {
      if (value.$type === 'typography' && value.$value) {
        result.push({
          name: [...pathParts, key].join('-'),
          value: value.$value,
          description: value.$description,
        });
      } else {
        extractTypographyTokens(value, [...pathParts, key], result);
      }
    }
  }
  return result;
}

/**
 * Resolve a typography property value to CSS
 * @param {*} value - Property value (reference, dimension object, or literal)
 * @param {Map} primitiveMap - Primitive map for resolution
 * @returns {string} CSS value
 */
function resolveTypographyProperty(value, primitiveMap) {
  // Handle "auto" line-height
  if (value === 'auto') {
    return 'auto';
  }

  // Handle references like {family.font-sans}
  if (
    typeof value === 'string' &&
    value.startsWith('{') &&
    value.endsWith('}')
  ) {
    return resolveValue(value, primitiveMap, 'unknown');
  }

  // Handle dimension objects like { value: 0, unit: "rem" }
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return formatTokenValue(value, 'dimension');
  }

  // Return as-is for other values
  return String(value);
}

/**
 * Generate typography utility classes for Tailwind v4
 * @param {Map} primitiveMap - Primitive map for reference resolution
 * @returns {string} CSS string with @utility declarations
 */
function generateTypographyUtilities(primitiveMap) {
  const stylesDir = path.join(TOKENS_DIR, 'styles');
  const typographyPath = path.join(stylesDir, 'typography.json');

  if (!fs.existsSync(typographyPath)) {
    log.warn('Typography styles file not found');
    return '';
  }

  const tokenData = readTokenFile(typographyPath);
  const typographyTokens = extractTypographyTokens(tokenData);

  if (typographyTokens.length === 0) {
    return '';
  }

  let css = `/* ===== TYPOGRAPHY UTILITIES ===== */\n`;

  for (const token of typographyTokens) {
    const { name, value } = token;

    css += `@utility text-${name} {\n`;

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

    css += `}\n\n`;
  }

  log.success(`Generated ${typographyTokens.length} typography utilities`);
  return css;
}

/**
 * Extract shadow composite tokens from styles/shadows.json
 * @param {object} obj - Token object
 * @param {string[]} pathParts - Current path parts
 * @param {object[]} result - Accumulated results
 * @returns {object[]} Array of { name, value }
 */
function extractShadowTokens(obj, pathParts = [], result = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;

    if (value && typeof value === 'object') {
      if (value.$type === 'shadow' && value.$value) {
        result.push({
          name: [...pathParts, key].join('-'),
          value: value.$value,
        });
      } else {
        extractShadowTokens(value, [...pathParts, key], result);
      }
    }
  }
  return result;
}

/**
 * Resolve a shadow property value (reference or dimension object)
 * @param {*} value - Property value
 * @param {Map} primitiveMap - Primitive map for resolution
 * @returns {string} Resolved CSS value
 */
function resolveShadowProperty(value, primitiveMap) {
  // Handle references like {2xs.layer-1.x}
  if (
    typeof value === 'string' &&
    value.startsWith('{') &&
    value.endsWith('}')
  ) {
    const refPath = value.slice(1, -1);
    const primitive = primitiveMap.get(refPath);
    if (primitive) {
      return primitive.value;
    }
    console.warn(`⚠ Shadow reference not found: ${value}`);
    return '0';
  }

  // Handle dimension objects like { value: 3, unit: "rem" }
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return formatTokenValue(value, 'dimension');
  }

  // Return as-is for other values
  return String(value);
}

/**
 * Format a single shadow layer to CSS box-shadow value
 * @param {object} layer - Shadow layer definition
 * @param {Map} primitiveMap - Primitive map for resolution
 * @param {boolean} isInset - Whether this is an inset shadow
 * @returns {string} CSS box-shadow value for this layer
 */
function formatShadowLayer(layer, primitiveMap, isInset = false) {
  const x = resolveShadowProperty(layer.offsetX, primitiveMap);
  const y = resolveShadowProperty(layer.offsetY, primitiveMap);
  const blur = resolveShadowProperty(layer.blur, primitiveMap);
  const spread = resolveShadowProperty(layer.spread, primitiveMap);
  const color = resolveShadowProperty(layer.color, primitiveMap);
  const inset = isInset || layer.inset ? 'inset ' : '';

  return `${inset}${x} ${y} ${blur} ${spread} ${color}`;
}

/**
 * Generate shadow CSS variables for Tailwind v4
 * @param {Map} primitiveMap - Primitive map for reference resolution
 * @returns {string} CSS string with shadow variables
 */
function generateShadowVariables(primitiveMap) {
  const stylesDir = path.join(TOKENS_DIR, 'styles');
  const shadowsPath = path.join(stylesDir, 'shadows.json');

  if (!fs.existsSync(shadowsPath)) {
    log.warn('Shadows styles file not found');
    return '';
  }

  const tokenData = readTokenFile(shadowsPath);
  const shadowTokens = extractShadowTokens(tokenData);

  if (shadowTokens.length === 0) {
    return '';
  }

  let css = `/* ===== SHADOW VARIABLES ===== */\n`;

  for (const token of shadowTokens) {
    const { name, value } = token;

    // Check if this is an inset shadow (name contains "inner")
    const isInset = name.toLowerCase().includes('inner');

    // Handle single layer (object) or multiple layers (array)
    const layers = Array.isArray(value) ? value : [value];
    const shadowValues = layers.map((layer) =>
      formatShadowLayer(layer, primitiveMap, isInset)
    );
    const cssValue = shadowValues.join(', ');

    css += `  --shadow-${name}: ${cssValue};\n`;
  }

  css += `\n`;
  log.success(`Generated ${shadowTokens.length} shadow variables`);
  return css;
}

/**
 * Generate the globals.css file
 * @param {object} config - Configuration object
 */
function generateGlobalsCSS(config) {
  const semanticFiles = getSemanticFiles(config);

  console.log('');
  console.log(`📦 Theme Configuration:`);
  console.log(`   Base: ${config.base}`);
  console.log(`   Brand: ${config.brand}`);
  console.log(`   Size: ${config.size}`);
  console.log(`   Typography: ${config.typography}`);
  console.log(`   Shadow: ${config.shadow}`);
  console.log(`   Radius: ${config.radius}`);
  console.log(`   Border Width: ${config.borderwidth}`);
  console.log('');

  // Process primitives (based on selected modes)
  const { tokens: primitiveTokens, primitiveMap } = processPrimitives(config);

  // Process semantic files
  const lightBaseTokens = processSemanticFile(
    semanticFiles.baseLight,
    primitiveMap
  );
  const lightBrandTokens = processSemanticFile(
    semanticFiles.brandLight,
    primitiveMap
  );
  const darkBaseTokens = processSemanticFile(
    semanticFiles.baseDark,
    primitiveMap
  );
  const darkBrandTokens = processSemanticFile(
    semanticFiles.brandDark,
    primitiveMap
  );
  const spacingTokens = processSemanticFile(
    semanticFiles.spacing,
    primitiveMap
  );

  const lightTokens = [
    ...lightBaseTokens,
    ...lightBrandTokens,
    ...spacingTokens,
  ];
  const darkTokens = [...darkBaseTokens, ...darkBrandTokens];

  // Generate CSS
  let css = '';

  // Tailwind import and dark mode variant
  css += `@import "tailwindcss";\n\n`;
  css += `@custom-variant dark (&:is(.dark *));\n\n`;

  // :root - Primitives (all selected mode tokens)
  if (primitiveTokens.length > 0) {
    css += `/* ===== PRIMITIVES ===== */\n`;
    css += `:root {\n`;

    // Group by category (using the category property set during loading)
    const categories = {
      color: [],
      size: [],
      typography: [],
      shadow: [],
      radius: [],
      borderwidth: [],
    };

    for (const token of primitiveTokens) {
      if (token.category && categories[token.category]) {
        categories[token.category].push(token);
      }
    }

    // Output colors
    if (categories.color.length > 0) {
      css += `  /* Colors */\n`;
      for (const token of categories.color) {
        css += `  --${token.cssName}: ${token.value};\n`;
      }
      css += `\n`;
    }

    // Output sizes
    if (categories.size.length > 0) {
      css += `  /* Sizes (${config.size}) */\n`;
      for (const token of categories.size) {
        css += `  --${token.cssName}: ${token.value};\n`;
      }
      css += `\n`;
    }

    // Output typography primitives
    if (categories.typography.length > 0) {
      css += `  /* Typography (${config.typography}) */\n`;
      for (const token of categories.typography) {
        css += `  --${token.cssName}: ${token.value};\n`;
      }
      css += `\n`;
    }

    // Output radius
    if (categories.radius.length > 0) {
      css += `  /* Radius (${config.radius}) */\n`;
      for (const token of categories.radius) {
        css += `  --radius-${token.cssName}: ${token.value};\n`;
      }
      css += `\n`;
    }

    // Output border width
    if (categories.borderwidth.length > 0) {
      css += `  /* Border Width (${config.borderwidth}) */\n`;
      for (const token of categories.borderwidth) {
        css += `  --borderwidth-${token.cssName}: ${token.value};\n`;
      }
      css += `\n`;
    }

    // Output shadow primitives (layer values)
    if (categories.shadow.length > 0) {
      css += `  /* Shadow Primitives (${config.shadow}) */\n`;
      for (const token of categories.shadow) {
        css += `  --shadow-${token.cssName}: ${token.value};\n`;
      }
    }

    css += `}\n\n`;
  }

  // @theme inline - Light mode semantic tokens
  if (lightTokens.length > 0) {
    css += `/* ===== SEMANTIC TOKENS (Light) ===== */\n`;
    css += `@theme inline {\n`;
    css += `  --*: initial;\n\n`;

    for (const token of lightTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }

    css += `}\n\n`;
  }

  // .dark - Dark mode semantic overrides
  if (darkTokens.length > 0) {
    css += `/* ===== DARK MODE ===== */\n`;
    css += `.dark {\n`;
    for (const token of darkTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
    css += `}\n\n`;
  }

  // Typography utilities
  const typographyCSS = generateTypographyUtilities(primitiveMap);
  if (typographyCSS) {
    css += typographyCSS;
  }

  // Shadow variables (added to @theme inline for Tailwind compatibility)
  const shadowCSS = generateShadowVariables(primitiveMap);
  if (shadowCSS) {
    css += shadowCSS;
  }

  // @layer base - Default styles
  css += `/* ===== BASE LAYER ===== */\n`;
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

  // Write file
  fs.writeFileSync(path.join(DIST_DIR, 'globals.css'), css);
  log.success('Generated globals.css');

  // Log summary
  console.log('');
  console.log(`📊 Summary:`);
  console.log(`   Primitives: ${primitiveTokens.length} tokens`);
  console.log(`   Light semantic: ${lightTokens.length} tokens`);
  console.log(`   Dark semantic: ${darkTokens.length} tokens`);
}

/**
 * Main execution
 */
console.log('🎨 Generating Tailwind v4 CSS from DTCG tokens...');

const config = parseArgs();
generateGlobalsCSS(config);

console.log('');
console.log('✨ Token generation complete!');
