import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  collectBorderwidthTokens,
  collectRadiusTokens,
  collectSemanticColorTokensVarRef,
  collectShadowTokens,
  collectSpacingTokens,
  discoverPrimitives,
  discoverSemantics,
  ensureDir,
  extractTokens,
  formatTokenValue,
  generateBaseLayerCSS,
  generateBorderWidthUtilitiesCSS,
  generateThemeCSS,
  generateTypographyUtilitiesCSS,
  getGoogleFontsImportFromTokens,
  log,
  parseArgs,
  pathToCssVarPrefixed,
  readTokenFile,
  resolveValueWithNxPrefix,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const DIST_TAILWIND_DIR = path.join(__dirname, '../dist/tailwind');
const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');
const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');

// Ensure dist/tailwind directory exists
ensureDir(DIST_TAILWIND_DIR);

/**
 * Write CSS file to dist/tailwind
 */
function writeDistFile(fileName, content) {
  const filePath = path.join(DIST_TAILWIND_DIR, fileName);
  fs.writeFileSync(filePath, content);
  log.file(fileName);
}

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
        filePath: path.join(
          PRIMITIVES_DIR,
          category,
          `${category}-${mode}.json`
        ),
        mode,
      };
    }
  }

  return result;
}

/**
 * Get semantic file names based on discovered structure and config
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
    const cssName = pathToCssVarPrefixed(token.path, category, true);
    const cssValue = formatTokenValue(token.value, token.type);

    primitiveMap.set(token.path.join('.'), {
      cssName,
      value: cssValue,
      type: token.type,
      rawValue: token.value,
    });

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
      const resolved = resolveValueWithNxPrefix(
        token.rawValue,
        primitiveMap,
        token.type
      );
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
    loadTokensWithNxPrefix(
      fileInfo.filePath,
      primitiveMap,
      primitiveTokens,
      category
    );
    usedModes[category] = fileInfo.mode;
  }

  // Second pass: resolve cross-references
  resolveCrossPrimitiveReferences(primitiveTokens, primitiveMap);

  return { tokens: primitiveTokens, primitiveMap, usedModes };
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
 * Generate nexus.css using shared generateThemeCSS function
 */
function generateNexusCSS(semanticFiles, primitiveMap, usedModes) {
  // Get Google Fonts import
  const typographyMode = usedModes.typography || 'vega';
  const typographyFilePath = path.join(
    TOKENS_DIR,
    `primitives/typography/typography-${typographyMode}.json`
  );
  const googleFontsImport = getGoogleFontsImportFromTokens(typographyFilePath);

  if (googleFontsImport) {
    log.success(
      `Generated Google Fonts import for typography mode: ${typographyMode}`
    );
  }

  // Collect light color tokens with var() references
  const lightColorTokens = [];
  const darkColorTokens = [];

  for (const themed of semanticFiles.themed) {
    const lightTokens = collectSemanticColorTokensVarRef(
      SEMANTIC_DIR,
      themed.light,
      primitiveMap
    );
    const darkTokens = collectSemanticColorTokensVarRef(
      SEMANTIC_DIR,
      themed.dark,
      primitiveMap
    );
    lightColorTokens.push(...lightTokens);
    darkColorTokens.push(...darkTokens);
  }

  // Process standalone semantic files (like spacing.json) for light tokens
  for (const standaloneFile of semanticFiles.standalone) {
    const standaloneTokens = collectSemanticColorTokensVarRef(
      SEMANTIC_DIR,
      standaloneFile,
      primitiveMap
    );
    lightColorTokens.push(...standaloneTokens);
  }

  // Collect spacing, radius, borderwidth tokens using shared functions
  const spacingTokens = collectSpacingTokens(SEMANTIC_DIR);
  const radiusMode = usedModes.radius || 'subtle';
  const radiusTokens = collectRadiusTokens(TOKENS_DIR, radiusMode);
  const borderwidthMode = usedModes.borderwidth || 'vega';
  const borderwidthTokens = collectBorderwidthTokens(
    TOKENS_DIR,
    borderwidthMode
  );
  const shadowTokens = collectShadowTokens(TOKENS_DIR);

  // Generate header
  const header = `/* ===== NEXUS DESIGN SYSTEM - TAILWIND THEME ===== */
/* Auto-generated - DO NOT EDIT */
/* Uses nx: prefix for all utility classes */
/*
 * Uses @theme (not inline) so utilities reference CSS variables
 * that can be overridden by .dark selector for theme switching.
 */

`;

  // Generate theme CSS using shared function
  let css = generateThemeCSS({
    header,
    googleFontsImport,
    imports: [
      'tailwindcss',
      './variables.css',
      './typography-utilities.css',
      './borderwidth-utilities.css',
    ],
    tailwindPrefix: 'nx',
    colorTokens: lightColorTokens,
    spacingTokens,
    radiusTokens,
    borderwidthTokens,
    shadowTokens,
    darkColorTokens,
    darkSelector: '.dark',
    prefixDarkVars: true, // Use --nx-color-* for dark mode overrides
  });

  // Add base layer
  css += generateBaseLayerCSS();

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
  const {
    tokens: primitiveTokens,
    primitiveMap,
    usedModes,
  } = processPrimitivesWithNxPrefix(discoveredPrimitives, config);

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

  // Generate variables.css
  const variablesCSS = generateVariablesCSS(primitiveTokens, usedModes);
  writeDistFile('variables.css', variablesCSS);

  // Generate typography-utilities.css (using shared function from utils.js)
  const typography = generateTypographyUtilitiesCSS(TOKENS_DIR, primitiveMap);
  if (typography.css) {
    writeDistFile('typography-utilities.css', typography.css);
    log.success(`Generated ${typography.count} typography utilities`);
  }

  // Generate borderwidth-utilities.css (using shared function from utils.js)
  const borderwidthTokens = primitiveTokens.filter(
    (t) => t.category === 'borderwidth'
  );
  const borderWidth = generateBorderWidthUtilitiesCSS(borderwidthTokens);
  if (borderWidth.css) {
    writeDistFile('borderwidth-utilities.css', borderWidth.css);
    log.success(`Generated ${borderWidth.count} border width utilities`);
  }

  // Generate nexus.css using shared function
  const nexusCSS = generateNexusCSS(semanticFiles, primitiveMap, usedModes);
  writeDistFile('nexus.css', nexusCSS);

  // Log summary
  const themeCount = semanticFiles.themed.length;
  console.log('');
  console.log(`📊 Summary:`);
  console.log(
    `   Primitives: ${primitiveTokens.length} tokens (with --nx-* prefix)`
  );
  console.log(`   Semantic themes: ${themeCount} (light + dark)`);
  console.log(`   Typography utilities: ${typography.count}`);
  console.log(`   Border width utilities: ${borderWidth.count}`);
  console.log(`   Output: packages/core/dist/tailwind/`);
}

/**
 * Main execution
 */
console.log('🎨 Generating @nexus/tailwind package from DTCG tokens...');

const config = parseArgs();
generateTailwindPackage(config);

console.log('');
console.log('✨ @nexus/tailwind package generation complete!');
