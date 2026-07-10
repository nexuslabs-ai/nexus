import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import {
  CANONICAL_SPACING_DEFAULT_MODE,
  collectBorderwidthModes,
  collectBorderwidthTokens,
  collectBreakpointsTokens,
  collectMotionTokens,
  collectRadiusModes,
  collectRadiusTokens,
  collectSemanticDimensionTokens,
  collectShadowModes,
  collectShadowTokens,
  collectSpacingTokens,
  collectZIndexTokens,
  DEFAULT_CONFIG,
  discoverPrimitives,
  discoverSemantics,
  ensureDir,
  extractTokens,
  FILES_WITH_DEDICATED_DIMENSION_COLLECTORS,
  filterDivergentDark,
  formatDistCssFiles,
  formatTokenValue,
  generateBaseLayerCSS,
  generateBorderColorAliasUtilitiesCSS,
  generateBorderWidthUtilitiesCSS,
  generateFocusRingCSS,
  generateMotionUtilitiesCSS,
  generateNativeBrowserUIThemeCSS,
  generateRootDimensionsCSS,
  generateSpacingModesCSS,
  generateSpacingRoleUtilitiesCSS,
  generateThemeCSS,
  generateThemedModesCSS,
  generateTypographyUtilitiesCSS,
  getGoogleFontsImportFromTokens,
  isReference,
  log,
  parseArgs,
  partitionThemedModes,
  pathToCssVarPrefixed,
  readTokenFile,
  resolveValue,
  splitSpacingTokens,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const DEFAULT_DIST_DIR = path.join(__dirname, '../dist/tailwind');
const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');
const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');
const RUNTIME_DIST_ENTRY = path.join(__dirname, '../dist/runtime/index.js');

async function loadDistRuntimeEngine() {
  return import(pathToFileURL(RUNTIME_DIST_ENTRY).href);
}

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

function getSemanticSupportFiles(discovered) {
  return {
    standalone: discovered.standalone,
  };
}

function assertTokenEngine(engine) {
  if (
    !engine ||
    typeof engine.deriveTheme !== 'function' ||
    typeof engine.createNexusThemeContract !== 'function' ||
    typeof engine.isColor !== 'function' ||
    !engine.DEFAULT_NEXUS_APPEARANCE ||
    !Array.isArray(engine.BASE_TONE_OPTIONS) ||
    !Array.isArray(engine.SEMANTIC_TOKEN_REGISTRY)
  ) {
    throw new Error(
      'generateTailwindPackage: token engine must provide deriveTheme, createNexusThemeContract, isColor, DEFAULT_NEXUS_APPEARANCE, BASE_TONE_OPTIONS, and SEMANTIC_TOKEN_REGISTRY.'
    );
  }

  return engine;
}

function validateBaseTone(config, engine) {
  const baseTone = config.base ?? DEFAULT_CONFIG.base;
  const allowedTones = engine.BASE_TONE_OPTIONS.map((option) => option.value);

  if (!allowedTones.includes(baseTone)) {
    throw new Error(
      `generateTailwindPackage: config.base "${baseTone}" must be one of: ${allowedTones.join(', ')}.`
    );
  }

  return baseTone;
}

function validateBrandColor(config, engine) {
  const brandColor =
    config.brandColor ?? engine.DEFAULT_NEXUS_APPEARANCE.brandColor;

  if (typeof brandColor !== 'string' || !engine.isColor(brandColor)) {
    throw new Error(
      `generateTailwindPackage: config.brandColor "${brandColor}" must be a valid CSS color.`
    );
  }

  return brandColor;
}

function semanticTokensFromEngineMap(tokenMap, registry) {
  return registry.map(({ name }) => {
    const runtimeName = `--nx-color-${name}`;
    const value = tokenMap[runtimeName];

    if (typeof value !== 'string') {
      throw new Error(
        `generateTailwindPackage: token engine did not emit ${runtimeName}.`
      );
    }

    return {
      cssName: `color-${name}`,
      value,
    };
  });
}

function deriveEngineSemanticTokens(config, engine) {
  const baseTone = validateBaseTone(config, engine);
  const brandColor = validateBrandColor(config, engine);
  const theme = engine.deriveTheme(
    engine.createNexusThemeContract({
      ...engine.DEFAULT_NEXUS_APPEARANCE,
      surfaceTone: baseTone,
      brandColor,
    })
  );

  return {
    baseTone,
    lightSemanticTokens: semanticTokensFromEngineMap(
      theme.light,
      engine.SEMANTIC_TOKEN_REGISTRY
    ),
    darkSemanticTokens: semanticTokensFromEngineMap(
      theme.dark,
      engine.SEMANTIC_TOKEN_REGISTRY
    ),
  };
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
    const entry = {
      cssName,
      value: cssValue,
      type: token.type,
      rawValue: token.value,
    };
    const refPath = token.path.join('.');

    primitiveMap.set(refPath, entry);
    primitiveMap.set(`${category}.${refPath}`, entry);

    tokenList.push({
      cssName,
      value: cssValue,
      type: token.type,
      category,
      rawValue: token.value,
      path: refPath,
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
 * Generate nexus.css using shared generateThemeCSS function.
 *
 * `spacingDefault` controls which mode lands under `:root, [data-density="X"]`
 * (i.e. which mode applies when no `data-density` attribute is set). All six
 * modes still ship in the bundle either way — the other five emit as plain
 * `[data-density="X"]` blocks. The @theme numeric subset always comes from the
 * canonical default baseline because @theme drives Tailwind's utility codegen
 * (build-time); the cascade flip happens at runtime via the per-mode blocks.
 */
function generateNexusCSS(
  semanticFiles,
  primitiveMap,
  lightSemanticTokens,
  darkSemanticTokens,
  usedModes,
  spacingModes,
  spacingDefault,
  runtimeModes
) {
  // Get Google Fonts import
  const typographyMode = usedModes.typography || 'default';
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

  // Semantic colors are engine-owned in the Tailwind bundle. Dimension tokens
  // (e.g. focus.offset) still come from semantic JSON and emit at :root, not
  // @theme (see generateRootDimensionsCSS / #506).
  const dimensionTokens = [];

  // Process standalone semantic files for non-color dimensions. Color leaves are
  // ignored here because the engine registry now owns the Tailwind color surface.
  for (const standaloneFile of semanticFiles.standalone) {
    if (!FILES_WITH_DEDICATED_DIMENSION_COLLECTORS.has(standaloneFile)) {
      dimensionTokens.push(
        ...collectSemanticDimensionTokens(SEMANTIC_DIR, standaloneFile)
      );
    }
  }

  // Per-mode spacing — default numerics seed @theme for Tailwind's spacing-utility
  // codegen (nx:p-*, nx:m-*, nx:gap-*, nx:h-*, nx:w-*). The per-mode override
  // blocks live outside @theme in `:root, [data-density="X"]` form (see below);
  // role tokens are not registered in @theme — they're consumed by the
  // separately-emitted spacing-utilities.css.
  const { numeric: defaultSpacingNumeric } = splitSpacingTokens(
    spacingModes[CANONICAL_SPACING_DEFAULT_MODE]
  );

  const radiusMode = usedModes.radius || DEFAULT_CONFIG.radius;
  const radiusTokens = collectRadiusTokens(TOKENS_DIR, radiusMode);
  const borderwidthMode = usedModes.borderwidth || DEFAULT_CONFIG.borderwidth;
  const borderwidthTokens = collectBorderwidthTokens(
    TOKENS_DIR,
    borderwidthMode
  );
  const motionMode = usedModes.motion || 'snappy';
  const motionTokens = collectMotionTokens(TOKENS_DIR, motionMode);
  const shadowTokens = collectShadowTokens(TOKENS_DIR, primitiveMap);
  const zIndexTokens = collectZIndexTokens(SEMANTIC_DIR);
  const breakpointTokens = collectBreakpointsTokens(SEMANTIC_DIR);

  // Generate header
  const header = `/* ===== NEXUS DESIGN SYSTEM - TAILWIND THEME ===== */
/* Auto-generated - DO NOT EDIT */
/* Uses nx: prefix for all utility classes */
/*
 * Uses @theme for static scales and @theme inline for semantic colours so
 * generated utilities can fall back statically while accepting runtime
 * --nx-color-* overrides from NexusAppearanceProvider.
 */

`;

  // Generate theme CSS using shared function. spacingTokens carries only the
  // numeric default subset — role tokens (control/container/layout) live in the
  // per-mode override blocks below, not in @theme.
  let css = generateThemeCSS({
    header,
    googleFontsImport,
    imports: [
      'tailwindcss',
      './variables.css',
      './typography-utilities.css',
      './borderwidth-utilities.css',
      './border-color-aliases.css',
      './motion-utilities.css',
      './spacing-utilities.css',
    ],
    tailwindPrefix: 'nx',
    semanticTokens: lightSemanticTokens,
    spacingTokens: defaultSpacingNumeric,
    radiusTokens,
    borderwidthTokens,
    motionTokens,
    shadowTokens,
    zIndexTokens,
    breakpointTokens,
    darkSemanticTokens,
    darkSelector: '.dark',
    prefixDarkVars: true, // Use --nx-color-* for dark mode overrides
  });

  // Fixed dimension primitives at :root (e.g. --focus-offset) — see #506.
  css += generateRootDimensionsCSS(dimensionTokens);
  css += generateFocusRingCSS();

  // Per-mode spacing override blocks (`:root, [data-density="<default>"]` for
  // the consumer-chosen default + plain `[data-density="X"]` for the others).
  // Lives outside @theme so the cascade can pick the active mode at runtime
  // via the `data-density` attribute on any ancestor.
  css += generateSpacingModesCSS(spacingModes, { defaultMode: spacingDefault });
  css += generateSpacingModesCSS(runtimeModes.radiusModes, {
    defaultMode: usedModes.radius || DEFAULT_CONFIG.radius,
    attrName: 'data-radius',
    commentLabel: 'RADIUS',
    duplicateValuePrefix: null,
  });
  css += generateThemedModesCSS(runtimeModes.shadowModes, {
    defaultMode: usedModes.shadow || DEFAULT_CONFIG.shadow,
    attrName: 'data-shadow',
    commentLabel: 'SHADOW',
  });
  css += generateSpacingModesCSS(runtimeModes.borderwidthModes, {
    defaultMode: usedModes.borderwidth || DEFAULT_CONFIG.borderwidth,
    attrName: 'data-borderwidth',
    commentLabel: 'BORDER WIDTH',
    duplicateValuePrefix: null,
  });

  css += generateNativeBrowserUIThemeCSS();

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
  { distDir = DEFAULT_DIST_DIR, engine } = {}
) {
  const tokenEngine = assertTokenEngine(
    engine ?? (await loadDistRuntimeEngine())
  );
  ensureDir(distDir);

  const writeDistFile = (fileName, content) => {
    const filePath = path.join(distDir, fileName);
    fs.writeFileSync(filePath, content);
    log.file(fileName);
  };

  const discoveredPrimitives = discoverPrimitives(PRIMITIVES_DIR);
  const discoveredSemantics = discoverSemantics(SEMANTIC_DIR);
  const semanticFiles = getSemanticSupportFiles(discoveredSemantics);
  const { baseTone, lightSemanticTokens, darkSemanticTokens } =
    deriveEngineSemanticTokens(config, tokenEngine);

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
  console.log(`   base: ${baseTone}`);
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

  const borderColorAliases =
    generateBorderColorAliasUtilitiesCSS(lightSemanticTokens);
  if (borderColorAliases.css) {
    writeDistFile('border-color-aliases.css', borderColorAliases.css);
    log.success(
      `Generated ${borderColorAliases.count} border color alias utilities`
    );
  }

  // Spacing role utilities — data-driven from default role tokens. Numeric
  // spacing flows through @theme in generateNexusCSS; role tokens get
  // dedicated @utility declarations that read the per-mode --nx-control-*,
  // --nx-container-*, --nx-layout-* variables.
  const spacingModes = collectSpacingTokens(SEMANTIC_DIR);
  const { role: defaultSpacingRole } = splitSpacingTokens(
    spacingModes[CANONICAL_SPACING_DEFAULT_MODE]
  );
  const spacingUtilities = generateSpacingRoleUtilitiesCSS(defaultSpacingRole);
  if (spacingUtilities.css) {
    writeDistFile('spacing-utilities.css', spacingUtilities.css);
    log.success(`Generated ${spacingUtilities.count} spacing role utilities`);
  }

  const motionUtilities = generateMotionUtilitiesCSS(
    collectMotionTokens(TOKENS_DIR, usedModes.motion || 'snappy')
  );
  if (motionUtilities.css) {
    writeDistFile('motion-utilities.css', motionUtilities.css);
    log.success(`Generated ${motionUtilities.count} motion duration utilities`);
  }

  // `spacingDefault` controls which mode lands under `:root, [data-density="X"]`.
  // Falls back to the canonical baseline so older config objects without the
  // key (or hand-rolled test fixtures) still produce a valid build.
  const spacingDefault =
    config.spacingDefault || CANONICAL_SPACING_DEFAULT_MODE;
  const runtimeModes = {
    radiusModes: collectRadiusModes(TOKENS_DIR),
    shadowModes: collectShadowModes(TOKENS_DIR),
    borderwidthModes: collectBorderwidthModes(TOKENS_DIR),
  };
  const nexusCSS = generateNexusCSS(
    semanticFiles,
    primitiveMap,
    lightSemanticTokens,
    darkSemanticTokens,
    usedModes,
    spacingModes,
    spacingDefault,
    runtimeModes
  );
  writeDistFile('nexus.css', nexusCSS);

  await formatDistCssFiles(distDir);

  console.log('');
  console.log(`📊 Summary:`);
  console.log(
    `   Primitives: ${primitiveTokens.length} tokens (with --nx-* prefix)`
  );
  if (divergentDark.length > 0) {
    console.log(`   Dark overrides: ${divergentDark.length} tokens`);
  }
  console.log(`   Engine semantic colors: ${lightSemanticTokens.length}`);
  console.log(`   Typography utilities: ${typography.count}`);
  console.log(`   Border width utilities: ${borderWidth.count}`);
  console.log(`   Output: ${distDir}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('🎨 Generating @nexus_ds/tailwind package from DTCG tokens...');
  const engine = await loadDistRuntimeEngine();
  const cliConfig = parseArgs(undefined, {
    allowedKeys: [
      'base',
      'typography',
      'shadow',
      'radius',
      'borderwidth',
      'motion',
      'focus',
      'brandColor',
      'spacingDefault',
    ],
  });
  await generateTailwindPackage(cliConfig, { engine });
  console.log('');
  console.log('✨ @nexus_ds/tailwind package generation complete!');
}
