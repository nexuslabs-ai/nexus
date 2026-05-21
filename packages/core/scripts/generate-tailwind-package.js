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
  formatDistCssFiles,
  formatTokenValue,
  generateBaseLayerCSS,
  generateBorderWidthUtilitiesCSS,
  generateThemeCSS,
  generateTypographyUtilitiesCSS,
  getGoogleFontsImportFromTokens,
  isReference,
  log,
  parseArgs,
  partitionThemedModes,
  pathToCssVarPrefixed,
  readTokenFile,
  resolveValue,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const DEFAULT_DIST_DIR = path.join(__dirname, '../dist/tailwind');
const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');
const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');

/**
 * Get primitive file paths based on discovered structure and config.
 * For themed categories (mode names matching `${base}-{light|dark}`), returns
 * both light and dark paths so the bundled output can emit a `.dark` override
 * block in variables.css.
 */
function getPrimitiveFiles(discovered, config) {
  const result = {};

  for (const [category, info] of Object.entries(discovered)) {
    if (info.modes === null) {
      result[category] = {
        themed: false,
        mode: null,
        filePath: path.join(PRIMITIVES_DIR, `${category}.json`),
      };
      continue;
    }

    const mode = config[category] || info.modes[0];
    const { themed } = partitionThemedModes(info.modes);

    if (themed[mode]) {
      result[category] = {
        themed: true,
        mode,
        lightFilePath: path.join(
          PRIMITIVES_DIR,
          category,
          `${category}-${mode}-light.json`
        ),
        darkFilePath: path.join(
          PRIMITIVES_DIR,
          category,
          `${category}-${mode}-dark.json`
        ),
      };
    } else {
      result[category] = {
        themed: false,
        mode,
        filePath: path.join(
          PRIMITIVES_DIR,
          category,
          `${category}-${mode}.json`
        ),
      };
    }
  }

  return result;
}

/**
 * Throws if any primitive file does not exist.
 */
function assertPrimitiveFilesExist(primitiveFiles) {
  for (const [category, info] of Object.entries(primitiveFiles)) {
    if (info.themed) {
      if (!fs.existsSync(info.lightFilePath)) {
        throw new Error(
          `Primitive file missing: ${info.lightFilePath} (themed category "${category}", mode "${info.mode}")`
        );
      }
      if (!fs.existsSync(info.darkFilePath)) {
        throw new Error(
          `Primitive file missing: ${info.darkFilePath} (themed category "${category}", mode "${info.mode}")`
        );
      }
    } else if (!fs.existsSync(info.filePath)) {
      throw new Error(
        `Primitive file missing: ${info.filePath} (category "${category}")`
      );
    }
  }
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
 * Load tokens with --nx-* prefixed CSS variable names.
 * Caller guarantees the file exists (via assertPrimitiveFilesExist).
 */
function loadTokensWithNxPrefix(filePath, primitiveMap, tokenList, category) {
  const tokenData = readTokenFile(filePath);
  const tokens = extractTokens(tokenData);

  for (const token of tokens) {
    const cssName = pathToCssVarPrefixed(token.path, category, true);
    const cssValue = formatTokenValue(token.value, token.type, token.path);

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
 * Load dark themed primitive tokens into a separate list. The light-side
 * primitiveMap is the canonical resolution map, so dark tokens do not write
 * to it; they only contribute the `.dark` override declarations. References
 * are stored raw and resolved against the fully-populated primitiveMap by
 * `resolveDarkReferences` after all primitive categories have loaded.
 */
function loadDarkThemedTokens(filePath, tokenList, category) {
  const tokenData = readTokenFile(filePath);
  const tokens = extractTokens(tokenData);

  for (const token of tokens) {
    const cssName = pathToCssVarPrefixed(token.path, category, true);
    const cssValue = isReference(token.value)
      ? token.value
      : formatTokenValue(token.value, token.type, token.path);

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
 * Resolve `{ref}` values in dark tokens against the light primitiveMap.
 * Unlike `resolveCrossPrimitiveReferences`, this does not write back into the
 * primitiveMap — dark resolutions must not bleed into the light-canonical map.
 * Throws on any reference that does not resolve.
 */
function resolveDarkReferences(darkTokens, primitiveMap) {
  for (const token of darkTokens) {
    if (!isReference(token.rawValue)) continue;

    const resolved = resolveValue(token.rawValue, primitiveMap, token.type);
    if (isReference(resolved)) {
      throw new Error(
        `Dark themed primitive reference not found: ${token.category}.${token.path} = ${token.rawValue}`
      );
    }
    token.value = resolved;
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
      const resolved = resolveValue(token.rawValue, primitiveMap, token.type);
      token.value = resolved;

      const existing = primitiveMap.get(token.path);
      if (existing) {
        existing.value = resolved;
      }
    }
  }
}

/**
 * Process all primitive tokens with --nx-* prefix.
 * Returns light tokens (for `:root`), dark tokens (for `.dark` override block),
 * the resolved primitive map, and the chosen mode per category for logging.
 */
function processPrimitivesWithNxPrefix(discovered, config) {
  const primitiveTokens = [];
  const darkPrimitiveTokens = [];
  const primitiveMap = new Map();
  const usedModes = {};

  const primitiveFiles = getPrimitiveFiles(discovered, config);
  assertPrimitiveFilesExist(primitiveFiles);

  for (const [category, fileInfo] of Object.entries(primitiveFiles)) {
    if (fileInfo.themed) {
      loadTokensWithNxPrefix(
        fileInfo.lightFilePath,
        primitiveMap,
        primitiveTokens,
        category
      );
      loadDarkThemedTokens(
        fileInfo.darkFilePath,
        darkPrimitiveTokens,
        category
      );
    } else {
      loadTokensWithNxPrefix(
        fileInfo.filePath,
        primitiveMap,
        primitiveTokens,
        category
      );
    }
    usedModes[category] = fileInfo.mode;
  }

  resolveCrossPrimitiveReferences(primitiveTokens, primitiveMap);
  resolveDarkReferences(darkPrimitiveTokens, primitiveMap);

  return {
    tokens: primitiveTokens,
    darkTokens: darkPrimitiveTokens,
    primitiveMap,
    usedModes,
  };
}

/**
 * Group tokens by `category` field, preserving insertion order.
 */
function groupByCategory(tokens) {
  const groups = {};
  for (const token of tokens) {
    if (!token.category) continue;
    if (!groups[token.category]) groups[token.category] = [];
    groups[token.category].push(token);
  }
  return groups;
}

/**
 * Return dark tokens whose value differs from the light token sharing the same
 * cssName. Dark tokens with identical values would emit redundant `.dark`
 * overrides.
 */
function filterDivergentDark(primitiveTokens, darkTokens) {
  const lightByName = new Map(primitiveTokens.map((t) => [t.cssName, t.value]));
  return darkTokens.filter((t) => lightByName.get(t.cssName) !== t.value);
}

/**
 * Generate variables.css with --nx-* prefixed primitives.
 * Themed dark variants emit into a `.dark` block that overrides `:root` when
 * an ancestor carries the `.dark` class (matching the @custom-variant selector
 * used in nexus.css).
 */
function generateVariablesCSS(primitiveTokens, divergentDark, usedModes) {
  let css = `/* ===== NEXUS DESIGN SYSTEM - PRIMITIVE VARIABLES ===== */\n`;
  css += `/* Auto-generated - DO NOT EDIT */\n`;
  css += `/* All primitives use --nx-* prefix for namespace isolation */\n\n`;

  css += `:root {\n`;
  const lightCategories = groupByCategory(primitiveTokens);
  for (const [category, tokens] of Object.entries(lightCategories)) {
    if (tokens.length === 0) continue;
    const modeInfo = usedModes[category] ? ` (${usedModes[category]})` : '';
    css += `  /* ${category}${modeInfo} */\n`;
    for (const token of tokens) {
      css += `  --${token.cssName}: ${token.value};\n`;
    }
    css += `\n`;
  }
  css += `}\n`;

  if (divergentDark.length > 0) {
    css += `\n.dark {\n`;
    const darkCategories = groupByCategory(divergentDark);
    for (const [category, tokens] of Object.entries(darkCategories)) {
      if (tokens.length === 0) continue;
      const modeInfo = usedModes[category]
        ? ` (${usedModes[category]} dark)`
        : '';
      css += `  /* ${category}${modeInfo} */\n`;
      for (const token of tokens) {
        css += `  --${token.cssName}: ${token.value};\n`;
      }
      css += `\n`;
    }
    css += `}\n`;
  }

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
 * Main generation function. Exported so tests can run it against a temp
 * `distDir` without overwriting the committed bundle in `dist/tailwind`.
 */
export async function generateTailwindPackage(
  config,
  { distDir = DEFAULT_DIST_DIR } = {}
) {
  ensureDir(distDir);

  const writeDistFile = (fileName, content) => {
    const filePath = path.join(distDir, fileName);
    fs.writeFileSync(filePath, content);
    log.file(fileName);
  };

  const discoveredPrimitives = discoverPrimitives(PRIMITIVES_DIR);
  const discoveredSemantics = discoverSemantics(SEMANTIC_DIR);
  const semanticFiles = getSemanticFiles(discoveredSemantics, config);

  const {
    tokens: primitiveTokens,
    darkTokens: darkPrimitiveTokens,
    primitiveMap,
    usedModes,
  } = processPrimitivesWithNxPrefix(discoveredPrimitives, config);

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

  const divergentDark = filterDivergentDark(
    primitiveTokens,
    darkPrimitiveTokens
  );

  const variablesCSS = generateVariablesCSS(
    primitiveTokens,
    divergentDark,
    usedModes
  );
  writeDistFile('variables.css', variablesCSS);

  const typography = generateTypographyUtilitiesCSS(TOKENS_DIR, primitiveMap);
  if (typography.css) {
    writeDistFile('typography-utilities.css', typography.css);
    log.success(`Generated ${typography.count} typography utilities`);
  }

  const borderwidthTokens = primitiveTokens.filter(
    (t) => t.category === 'borderwidth'
  );
  const borderWidth = generateBorderWidthUtilitiesCSS(borderwidthTokens);
  if (borderWidth.css) {
    writeDistFile('borderwidth-utilities.css', borderWidth.css);
    log.success(`Generated ${borderWidth.count} border width utilities`);
  }

  const nexusCSS = generateNexusCSS(semanticFiles, primitiveMap, usedModes);
  writeDistFile('nexus.css', nexusCSS);

  await formatDistCssFiles(distDir);

  const themeCount = semanticFiles.themed.length;
  console.log('');
  console.log(`📊 Summary:`);
  console.log(
    `   Primitives: ${primitiveTokens.length} tokens (with --nx-* prefix)`
  );
  if (divergentDark.length > 0) {
    console.log(`   Dark overrides: ${divergentDark.length} tokens`);
  }
  console.log(`   Semantic themes: ${themeCount} (light + dark)`);
  console.log(`   Typography utilities: ${typography.count}`);
  console.log(`   Border width utilities: ${borderWidth.count}`);
  console.log(`   Output: ${distDir}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('🎨 Generating @nexus/tailwind package from DTCG tokens...');
  const cliConfig = parseArgs();
  await generateTailwindPackage(cliConfig);
  console.log('');
  console.log('✨ @nexus/tailwind package generation complete!');
}
