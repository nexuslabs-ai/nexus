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
  pathToCssVarPrefixed,
  readTokenFile,
  resolveValueWithNxPrefix,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const TAILWIND_PKG_DIR = path.join(__dirname, '../../tailwind');
const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');
const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');

// Ensure tailwind package directory exists
ensureDir(TAILWIND_PKG_DIR);

/**
 * Get primitive file paths based on discovered structure and config
 */
function getPrimitiveFiles(discovered, config) {
  const result = {};

  for (const [category, info] of Object.entries(discovered)) {
    if (info.modes === null) {
      result[category] = {
        filePath: path.join(PRIMITIVES_DIR, `${category}.json`),
        mode: null,
      };
    } else {
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
 */
function getSemanticFiles(discovered, config) {
  const result = {
    themed: [],
    standalone: [],
  };

  for (const [type, modes] of Object.entries(discovered.themed)) {
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

  result.standalone = discovered.standalone;
  return result;
}

/**
 * Load tokens with --nx-* prefixed CSS variable names
 */
function loadTokensWithNxPrefix(filePath, primitiveMap, tokenList, category) {
  if (!fs.existsSync(filePath)) {
    log.warn(`File not found: ${filePath}`);
    return;
  }

  const tokenData = readTokenFile(filePath);
  const tokens = extractTokens(tokenData);

  for (const token of tokens) {
    // Generate CSS name with nx- prefix: --nx-{category}-{token-path}
    const cssName = pathToCssVarPrefixed(token.path, category, true);
    const cssValue = formatTokenValue(token.value, token.type);

    // Add to map for reference resolution
    primitiveMap.set(token.path.join('.'), {
      cssName,
      value: cssValue,
      type: token.type,
      rawValue: token.value,
    });

    // Add to list for CSS output
    tokenList.push({
      cssName,
      value: cssValue,
      type: token.type,
      category,
      rawValue: token.value,
      path: token.path.join('.'),
    });
  }
}

/**
 * Resolve cross-primitive references in token list
 */
function resolveCrossPrimitiveReferences(tokenList, primitiveMap) {
  for (const token of tokenList) {
    if (
      typeof token.rawValue === 'string' &&
      token.rawValue.startsWith('{') &&
      token.rawValue.endsWith('}')
    ) {
      const resolved = resolveValueWithNxPrefix(token.rawValue, primitiveMap, token.type);
      token.value = resolved;

      const existing = primitiveMap.get(token.path);
      if (existing) {
        existing.value = resolved;
      }
    }
  }
}

/**
 * Process all primitive tokens with --nx-* prefix
 */
function processPrimitivesWithNxPrefix(discovered, config) {
  const primitiveTokens = [];
  const primitiveMap = new Map();
  const usedModes = {};

  const primitiveFiles = getPrimitiveFiles(discovered, config);

  // First pass: load all tokens
  for (const [category, fileInfo] of Object.entries(primitiveFiles)) {
    loadTokensWithNxPrefix(fileInfo.filePath, primitiveMap, primitiveTokens, category);
    usedModes[category] = fileInfo.mode;
  }

  // Second pass: resolve cross-references
  resolveCrossPrimitiveReferences(primitiveTokens, primitiveMap);

  return { tokens: primitiveTokens, primitiveMap, usedModes };
}

/**
 * Process a semantic token file with nx-prefixed references
 */
function processSemanticTokensWithNxPrefix(fileName, primitiveMap) {
  const filePath = path.join(SEMANTIC_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    log.warn(`Semantic file not found: ${filePath}`);
    return [];
  }

  const tokenData = readTokenFile(filePath);
  const extracted = extractTokens(tokenData);
  const tokens = [];

  for (const token of extracted) {
    // Semantic tokens keep their original names (no nx- prefix)
    // But references resolve to var(--nx-*)
    const prefix = token.type === 'color' ? 'color' : null;
    const cssName = pathToCssVar(token.path, prefix);
    const cssValue = resolveValueWithNxPrefix(token.value, primitiveMap, token.type);
    tokens.push({ cssName, value: cssValue, type: token.type });
  }

  return tokens;
}

/**
 * Resolve a typography property value for nx-prefixed output
 */
function resolveTypographyProperty(value, primitiveMap) {
  if (value === 'auto') return 'auto';

  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return resolveValueWithNxPrefix(value, primitiveMap, 'unknown');
  }

  if (typeof value === 'object' && value !== null && 'value' in value) {
    return formatTokenValue(value, 'dimension');
  }

  return String(value);
}

/**
 * Generate typography utility classes
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
 * Generate border width utility classes
 */
function generateBorderWidthUtilities(borderwidthTokens) {
  if (borderwidthTokens.length === 0) return '';

  let css = `/* ===== BORDER WIDTH UTILITIES ===== */\n`;

  for (const token of borderwidthTokens) {
    // Extract the name part (e.g., "default" from "nx-borderwidth-default")
    const name = token.cssName.replace('nx-borderwidth-', '');

    css += `@utility border-${name} {\n`;
    css += `  border-style: var(--tw-border-style, solid);\n`;
    css += `  border-width: var(--${token.cssName});\n`;
    css += `}\n\n`;
  }

  log.success(`Generated ${borderwidthTokens.length} border width utilities`);
  return css;
}

/**
 * Generate shadow variables for @theme inline
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
 * Generate variables.css with --nx-* prefixed primitives
 */
function generateVariablesCSS(primitiveTokens, usedModes) {
  let css = `/* ===== NEXUS DESIGN SYSTEM - PRIMITIVE VARIABLES ===== */\n`;
  css += `/* Auto-generated - DO NOT EDIT */\n`;
  css += `/* All primitives use --nx-* prefix for namespace isolation */\n\n`;
  css += `:root {\n`;

  // Group tokens by category
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

  css += `}\n`;

  return css;
}

/**
 * Generate nexus.css with @theme and utilities
 *
 * IMPORTANT: Uses @theme (not @theme inline) for semantic tokens.
 * - @theme inline: resolves var() references at build time → dark mode won't work
 * - @theme: utilities use var(--color-*) → can be overridden by .dark
 */
function generateNexusCSS(lightTokens, darkTokens, primitiveTokens, primitiveMap, usedModes) {
  let css = `/* ===== NEXUS DESIGN SYSTEM - TAILWIND THEME ===== */\n`;
  css += `/* Auto-generated - DO NOT EDIT */\n`;
  css += `/* Uses nx: prefix for all utility classes */\n`;
  css += `/*\n`;
  css += ` * Uses @theme (not inline) so utilities reference CSS variables\n`;
  css += ` * that can be overridden by .dark selector for theme switching.\n`;
  css += ` */\n\n`;

  // Tailwind import with prefix and variables import
  css += `@import "tailwindcss" prefix(nx);\n`;
  css += `@import "./variables.css";\n\n`;
  css += `@custom-variant dark (&:is(.dark *));\n\n`;

  // Generate shadow variables for @theme
  const { css: shadowCSS } = generateShadowVariables();

  // Extract radius and borderwidth primitives for @theme
  const radiusTokens = primitiveTokens.filter((t) => t.category === 'radius');
  const borderwidthTokens = primitiveTokens.filter((t) => t.category === 'borderwidth');

  // @theme (NOT inline) - Semantic tokens + shadows + radius + borderwidth
  // Using @theme (without inline) ensures utilities use var(--color-*) references
  // which can be overridden by .dark selector
  if (lightTokens.length > 0 || shadowCSS || radiusTokens.length > 0) {
    css += `/* ===== SEMANTIC TOKENS (Light) ===== */\n`;
    css += `@theme {\n`;
    css += `  --*: initial;\n\n`;

    for (const token of lightTokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }

    // Add radius variables (for rounded-* utilities)
    if (radiusTokens.length > 0) {
      css += `\n  /* Radius */\n`;
      for (const token of radiusTokens) {
        // Map nx-radius-* to radius-* for Tailwind
        const twName = token.cssName.replace('nx-', '');
        css += `  --${twName}: var(--${token.cssName});\n`;
      }
    }

    // Add borderwidth variables (for border-* utilities)
    if (borderwidthTokens.length > 0) {
      css += `\n  /* Border Width */\n`;
      for (const token of borderwidthTokens) {
        // Map nx-borderwidth-* to border-* for Tailwind
        const twName = token.cssName.replace('nx-borderwidth-', 'border-');
        css += `  --${twName}: var(--${token.cssName});\n`;
      }
    }

    // Add shadow variables
    if (shadowCSS) {
      css += `\n  /* Shadows */\n`;
      css += shadowCSS;
    }

    css += `}\n\n`;
  }

  // .dark - Dark mode overrides
  // NOTE: Variables must be prefixed with 'nx-' to match what Tailwind generates
  // when using prefix(nx). The @theme block creates --nx-color-* variables,
  // so dark mode overrides need to use the same names.
  if (darkTokens.length > 0) {
    css += `/* ===== DARK MODE ===== */\n`;
    css += `.dark {\n`;
    for (const token of darkTokens) {
      css += `  --nx-${token.cssName}: ${token.value};\n`;
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

  return css;
}

/**
 * Main generation function
 */
function generateTailwindPackage(config) {
  // Auto-discover available structure
  const discoveredPrimitives = discoverPrimitives(PRIMITIVES_DIR);
  const discoveredSemantics = discoverSemantics(SEMANTIC_DIR);

  // Get files based on discovered structure and config
  const semanticFiles = getSemanticFiles(discoveredSemantics, config);

  // Process primitives with nx- prefix
  const { tokens: primitiveTokens, primitiveMap, usedModes } = processPrimitivesWithNxPrefix(
    discoveredPrimitives,
    config
  );

  // Log configuration
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

  // Process themed semantic files
  const lightTokens = [];
  const darkTokens = [];

  for (const themed of semanticFiles.themed) {
    const lightThemedTokens = processSemanticTokensWithNxPrefix(themed.light, primitiveMap);
    const darkThemedTokens = processSemanticTokensWithNxPrefix(themed.dark, primitiveMap);
    lightTokens.push(...lightThemedTokens);
    darkTokens.push(...darkThemedTokens);
  }

  // Process standalone semantic files
  for (const standaloneFile of semanticFiles.standalone) {
    const standaloneTokens = processSemanticTokensWithNxPrefix(standaloneFile, primitiveMap);
    lightTokens.push(...standaloneTokens);
  }

  // Generate variables.css
  const variablesCSS = generateVariablesCSS(primitiveTokens, usedModes);
  fs.writeFileSync(path.join(TAILWIND_PKG_DIR, 'variables.css'), variablesCSS);
  log.success('Generated variables.css');

  // Generate nexus.css
  const nexusCSS = generateNexusCSS(lightTokens, darkTokens, primitiveTokens, primitiveMap, usedModes);
  fs.writeFileSync(path.join(TAILWIND_PKG_DIR, 'nexus.css'), nexusCSS);
  log.success('Generated nexus.css');

  // Log summary
  console.log('');
  console.log(`📊 Summary:`);
  console.log(`   Primitives: ${primitiveTokens.length} tokens (with --nx-* prefix)`);
  console.log(`   Light semantic: ${lightTokens.length} tokens`);
  console.log(`   Dark semantic: ${darkTokens.length} tokens`);
  console.log(`   Output: packages/tailwind/`);
}

/**
 * Main execution
 */
console.log('🎨 Generating @nexus/tailwind package from DTCG tokens...');

const config = parseArgs();
generateTailwindPackage(config);

console.log('');
console.log('✨ @nexus/tailwind package generation complete!');
