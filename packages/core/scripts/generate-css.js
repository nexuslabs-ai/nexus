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
  log,
  parseArgs,
  pathToCssVar,
  processSemanticTokens,
  readTokenFile,
  resolveValue,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const DIST_DIR = path.join(__dirname, '../dist');
const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');
const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');

// Ensure dist directory exists
ensureDir(DIST_DIR);

/**
 * Get primitive file paths based on discovered structure and config
 * @param {object} discovered - Result from discoverPrimitives()
 * @param {object} config - Configuration object with mode selections
 * @returns {object} Map of category to { filePath, mode }
 */
function getPrimitiveFiles(discovered, config) {
  const result = {};

  for (const [category, info] of Object.entries(discovered)) {
    if (info.modes === null) {
      // Single-file category (like color)
      result[category] = {
        filePath: path.join(PRIMITIVES_DIR, `${category}.json`),
        mode: null,
      };
    } else {
      // Multi-mode category - use config or first available mode
      const mode = config[category] || info.modes[0];
      result[category] = {
        filePath: path.join(PRIMITIVES_DIR, category, `${category}-${mode}.json`),
        mode,
      };
    }
  }

  return result;
}

/**
 * Get semantic file paths based on discovered structure and config
 * @param {object} discovered - Result from discoverSemantics()
 * @param {object} config - Configuration object with theme selections
 * @returns {object} Semantic file info
 */
function getSemanticFiles(discovered, config) {
  const result = {
    themed: [],
    standalone: [],
  };

  // Handle themed files (base, brands)
  for (const [type, modes] of Object.entries(discovered.themed)) {
    // Use config or first available mode
    const configKey = type === 'brands' ? 'brand' : type;
    const selectedMode = config[configKey] || Object.keys(modes)[0];

    if (modes[selectedMode]) {
      result.themed.push({
        type,
        mode: selectedMode,
        light: modes[selectedMode].light,
        dark: modes[selectedMode].dark,
      });
    }
  }

  // Handle standalone files
  result.standalone = discovered.standalone;

  return result;
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
    // Add category prefix to CSS variable name: --{category}-{token-path}
    const cssName = `${category}-${pathToCssVar(token.path)}`;
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
 * Process all primitive token files based on discovered structure and config
 * @param {object} discovered - Result from discoverPrimitives()
 * @param {object} config - Configuration object
 * @returns {{ tokens: object[], primitiveMap: Map, usedModes: object }}
 */
function processPrimitives(discovered, config) {
  const primitiveTokens = [];
  const primitiveMap = new Map();
  const usedModes = {};

  const primitiveFiles = getPrimitiveFiles(discovered, config);

  // First pass: load all tokens into map
  for (const [category, fileInfo] of Object.entries(primitiveFiles)) {
    loadTokensIntoMap(fileInfo.filePath, primitiveMap, primitiveTokens, category);
    usedModes[category] = fileInfo.mode;
  }

  // Second pass: resolve cross-primitive references (e.g., shadow colors → color primitives)
  resolveCrossPrimitiveReferences(primitiveTokens, primitiveMap);

  return { tokens: primitiveTokens, primitiveMap, usedModes };
}

/**
 * Process a semantic token file (wrapper for shared function)
 */
function processSemanticFile(fileName, primitiveMap) {
  const filePath = path.join(SEMANTIC_DIR, fileName);
  return processSemanticTokens(filePath, primitiveMap);
}

/**
 * Resolve a typography property value to CSS
 * @param {*} value - Property value (reference, dimension object, or literal)
 * @param {Map} primitiveMap - Primitive map for resolution
 * @returns {string} CSS value
 */
function resolveTypographyProperty(value, primitiveMap) {
  if (value === 'auto') return 'auto';

  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return resolveValue(value, primitiveMap, 'unknown');
  }

  if (typeof value === 'object' && value !== null && 'value' in value) {
    return formatTokenValue(value, 'dimension');
  }

  return String(value);
}

/**
 * Generate typography utility classes for Tailwind v4
 * @param {Map} primitiveMap - Primitive map for reference resolution
 * @returns {string} CSS string with @utility declarations
 */
function generateTypographyUtilities(primitiveMap) {
  const typographyPath = path.join(TOKENS_DIR, 'styles/typography.json');

  if (!fs.existsSync(typographyPath)) {
    log.warn('Typography styles file not found');
    return '';
  }

  const tokenData = readTokenFile(typographyPath);
  const tokens = extractTokens(tokenData).filter((t) => t.type === 'typography');

  if (tokens.length === 0) return '';

  let css = `/* ===== TYPOGRAPHY UTILITIES ===== */\n`;

  for (const token of tokens) {
    const name = token.path.join('-');
    const value = token.value;

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

  log.success(`Generated ${tokens.length} typography utilities`);
  return css;
}

/**
 * Generate border width utility classes for Tailwind v4
 * @param {object[]} borderwidthTokens - Border width tokens from primitives
 * @returns {string} CSS string with @utility declarations
 */
function generateBorderWidthUtilities(borderwidthTokens) {
  if (borderwidthTokens.length === 0) return '';

  let css = `/* ===== BORDER WIDTH UTILITIES ===== */\n`;

  for (const token of borderwidthTokens) {
    // Extract the name part (e.g., "default" from "borderwidth-default")
    const name = token.cssName.replace('borderwidth-', '');

    css += `@utility border-${name} {\n`;
    css += `  border-style: var(--tw-border-style, solid);\n`;
    css += `  border-width: var(--${token.cssName});\n`;
    css += `}\n\n`;
  }

  log.success(`Generated ${borderwidthTokens.length} border width utilities`);
  return css;
}

/**
 * Generate shadow CSS variables for Tailwind v4 @theme inline
 * @returns {{ css: string, count: number }} CSS variable declarations and count
 */
function generateShadowVariables() {
  const shadowsPath = path.join(TOKENS_DIR, 'styles/shadows.json');

  if (!fs.existsSync(shadowsPath)) {
    log.warn('Shadows styles file not found');
    return { css: '', count: 0 };
  }

  const tokenData = readTokenFile(shadowsPath);
  const tokens = extractTokens(tokenData).filter((t) => t.type === 'shadow');

  if (tokens.length === 0) return { css: '', count: 0 };

  let css = '';

  for (const token of tokens) {
    const name = token.path.join('-');
    const isInset = name.toLowerCase().includes('inner');
    const cssValue = formatShadowComposite(token.value, isInset);

    css += `  --shadow-${name}: ${cssValue};\n`;
  }

  log.success(`Generated ${tokens.length} shadow variables`);
  return { css, count: tokens.length };
}

/**
 * Generate the globals.css file
 * @param {object} config - Configuration object
 */
function generateGlobalsCSS(config) {
  // Auto-discover available structure
  const discoveredPrimitives = discoverPrimitives(PRIMITIVES_DIR);
  const discoveredSemantics = discoverSemantics(SEMANTIC_DIR);

  // Get files based on discovered structure and config
  const semanticFiles = getSemanticFiles(discoveredSemantics, config);

  // Process primitives (based on selected modes)
  const { tokens: primitiveTokens, primitiveMap, usedModes } = processPrimitives(
    discoveredPrimitives,
    config
  );

  // Log configuration (using actual resolved modes)
  console.log('');
  console.log(`📦 Theme Configuration:`);
  for (const [category, mode] of Object.entries(usedModes)) {
    if (mode) {
      console.log(`   ${category}: ${mode}`);
    }
  }
  for (const themed of semanticFiles.themed) {
    console.log(`   ${themed.type}: ${themed.mode}`);
  }
  console.log('');

  // Process themed semantic files (base, brands)
  const lightTokens = [];
  const darkTokens = [];

  for (const themed of semanticFiles.themed) {
    const lightThemedTokens = processSemanticFile(themed.light, primitiveMap);
    const darkThemedTokens = processSemanticFile(themed.dark, primitiveMap);
    lightTokens.push(...lightThemedTokens);
    darkTokens.push(...darkThemedTokens);
  }

  // Process standalone semantic files (spacing, etc.)
  for (const standaloneFile of semanticFiles.standalone) {
    const standaloneTokens = processSemanticFile(standaloneFile, primitiveMap);
    lightTokens.push(...standaloneTokens);
  }

  // Generate CSS
  let css = '';

  // Tailwind import and dark mode variant
  css += `@import "tailwindcss";\n\n`;
  css += `@custom-variant dark (&:is(.dark *));\n\n`;

  // :root - Primitives (all selected mode tokens)
  if (primitiveTokens.length > 0) {
    css += `/* ===== PRIMITIVES ===== */\n`;
    css += `:root {\n`;

    // Group tokens by category dynamically
    const categories = {};
    for (const token of primitiveTokens) {
      if (token.category) {
        if (!categories[token.category]) {
          categories[token.category] = [];
        }
        categories[token.category].push(token);
      }
    }

    // Output each category
    for (const [category, tokens] of Object.entries(categories)) {
      if (tokens.length > 0) {
        const modeInfo = usedModes[category] ? ` (${usedModes[category]})` : '';
        css += `  /* ${category}${modeInfo} */\n`;
        for (const token of tokens) {
          css += `  --${token.cssName}: ${token.value};\n`;
        }
        css += `\n`;
      }
    }

    css += `}\n\n`;
  }

  // Generate shadow variables for @theme inline
  const { css: shadowCSS } = generateShadowVariables();

  // Extract radius and borderwidth primitives for @theme inline
  // These need to be in @theme for Tailwind to use them (rounded-*, border-*)
  const radiusTokens = primitiveTokens.filter((t) => t.category === 'radius');
  const borderwidthTokens = primitiveTokens.filter((t) => t.category === 'borderwidth');

  // @theme inline - Light mode semantic tokens + shadows + radius + borderwidth
  if (lightTokens.length > 0 || shadowCSS || radiusTokens.length > 0) {
    css += `/* ===== SEMANTIC TOKENS (Light) ===== */\n`;
    css += `@theme inline {\n`;
    css += `  --*: initial;\n\n`;

    for (const token of lightTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }

    // Add radius variables inside @theme inline (for rounded-* utilities)
    if (radiusTokens.length > 0) {
      css += `\n  /* Radius */\n`;
      for (const token of radiusTokens) {
        css += `  --${token.cssName}: ${token.value};\n`;
      }
    }

    // Add borderwidth variables inside @theme inline (for border-* utilities)
    if (borderwidthTokens.length > 0) {
      css += `\n  /* Border Width */\n`;
      for (const token of borderwidthTokens) {
        // Tailwind expects --border-* not --borderwidth-*
        const twName = token.cssName.replace('borderwidth-', 'border-');
        css += `  --${twName}: ${token.value};\n`;
      }
    }

    // Add shadow variables inside @theme inline
    if (shadowCSS) {
      css += `\n  /* Shadows */\n`;
      css += shadowCSS;
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

  // Border width utilities
  const borderWidthCSS = generateBorderWidthUtilities(borderwidthTokens);
  if (borderWidthCSS) {
    css += borderWidthCSS;
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
