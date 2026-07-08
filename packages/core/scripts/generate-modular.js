import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  CANONICAL_SPACING_DEFAULT_MODE,
  collectBorderwidthTokens,
  collectBreakpointsTokens,
  collectMotionTokens,
  collectRadiusTokens,
  collectSemanticColorTokensVarRef,
  collectSemanticDimensionTokens,
  collectShadowTokens,
  collectSpacingTokens,
  collectZIndexTokens,
  discoverPrimitives,
  discoverSemantics,
  ensureDir,
  extractTokens,
  FILES_WITH_DEDICATED_DIMENSION_COLLECTORS,
  filterDivergentDark,
  formatDistCssFiles,
  formatTokenValue,
  generateBorderColorAliasUtilitiesCSS,
  generateBorderWidthUtilitiesCSS,
  generateFocusRingCSS,
  generateMotionUtilitiesCSS,
  generateNativeBrowserUIThemeCSS,
  generateRootDimensionsCSS,
  generateSpacingModesCSS,
  generateSpacingRoleUtilitiesCSS,
  generateThemeCSS,
  generateTypographyUtilitiesCSS,
  getGoogleFontsImportFromTokens,
  isReference,
  log,
  parseArgs,
  partitionThemedModes,
  pathToCssVar,
  processSemanticTokens,
  readTokenFile,
  resolveValue,
  splitSpacingTokens,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens');
const DEFAULT_MODULAR_DIR = path.join(__dirname, '../dist/modular');

const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');
const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');

/**
 * Process a single-file primitive category (e.g., color.json). Throws if the
 * file does not exist.
 */
function processSinglePrimitive(category, primitiveMap) {
  const filePath = path.join(PRIMITIVES_DIR, `${category}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Primitive file missing: ${filePath} (single-file category "${category}")`
    );
  }

  const tokenData = readTokenFile(filePath);
  const extracted = extractTokens(tokenData);
  const tokens = [];

  for (const token of extracted) {
    const cssName = `nx-${category}-${pathToCssVar(token.path)}`;
    const cssValue = formatTokenValue(token.value, token.type, token.path);
    const entry = { cssName, value: cssValue };
    const refPath = token.path.join('.');
    primitiveMap.set(refPath, entry);
    primitiveMap.set(`${category}.${refPath}`, entry);
    tokens.push({ cssName, value: cssValue });
  }

  return tokens;
}

/**
 * Process a primitive category file (focus, typography, shadow, radius,
 * borderwidth). Throws if the file does not exist.
 */
function processPrimitiveFile(category, mode, primitiveMap) {
  const filePath = path.join(
    TOKENS_DIR,
    `primitives/${category}/${category}-${mode}.json`
  );
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Primitive file missing: ${filePath} (category "${category}", mode "${mode}")`
    );
  }

  const tokenData = readTokenFile(filePath);
  const extracted = extractTokens(tokenData);
  const tokens = [];

  for (const token of extracted) {
    const cssName = `nx-${category}-${pathToCssVar(token.path)}`;
    let cssValue = token.value;

    if (isReference(cssValue)) {
      cssValue = resolveValue(cssValue, primitiveMap, token.type);
    } else {
      cssValue = formatTokenValue(cssValue, token.type, token.path);
    }

    const entry = { cssName, value: cssValue };
    const refPath = token.path.join('.');
    primitiveMap.set(refPath, entry);
    primitiveMap.set(`${category}.${refPath}`, entry);
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
 * Write CSS file
 */
function writeModularFile(distDir, fileName, content) {
  const filePath = path.join(distDir, fileName);
  fs.writeFileSync(filePath, content);
  log.file(fileName);
}

/**
 * Generate CSS file for a single-file primitive category
 */
function generatePrimitivesCSS(distDir, tokens, category) {
  let css = `/* ${category} primitives */\n\n:root {\n`;

  for (const token of tokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }

  css += `}\n`;
  writeModularFile(distDir, `${category}.css`, css);
}

/**
 * Generate mode file (typography, radius, borderwidth)
 */
function generateModeCSS(distDir, category, mode, tokens) {
  let css = `/* ${category}: ${mode} */\n\n:root {\n`;

  for (const token of tokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }

  css += `}\n`;
  writeModularFile(distDir, `${category}-${mode}.css`, css);
}

/**
 * Generate themed CSS file (supports light/dark variants)
 */
function generateThemedCSS(distDir, type, mode, primitiveMap) {
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

  writeModularFile(distDir, `${type}-${mode}.css`, css);
}

/**
 * Generate themed primitive CSS file (light/dark pair → one file with html / html.dark blocks).
 * Mirrors generateThemedCSS so themed primitives load the same way as base/theme semantics.
 * Dark tokens identical to their light counterpart are filtered out so the
 * `html.dark` block contains only genuine divergences (matches the bundled
 * variables.css behaviour).
 */
function generateThemedPrimitiveCSS(distDir, category, mode, primitiveMap) {
  const lightTokens = processPrimitiveFile(
    category,
    `${mode}-light`,
    primitiveMap
  );
  const darkTokens = processPrimitiveFile(
    category,
    `${mode}-dark`,
    primitiveMap
  );
  const divergentDark = filterDivergentDark(lightTokens, darkTokens);

  let css = `/* ${category}: ${mode} */\n\nhtml {\n`;

  for (const token of lightTokens) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n\nhtml.dark {\n`;

  for (const token of divergentDark) {
    css += `  --${token.cssName}: ${token.value};\n`;
  }
  css += `}\n`;

  writeModularFile(distDir, `${category}-${mode}.css`, css);
}

/**
 * Generate the modular globals.css (apps/console + apps/docs) via generateThemeCSS.
 *
 * `spacingDefault` controls which mode lands under `:root, [data-density="X"]`
 * in globals.css — i.e. the no-`data-density` default. All six modes still ship
 * either way (the other five emit as plain `[data-density="X"]` blocks); the
 * app's runtime UI swaps via `data-density` regardless.
 */
function generateModularGlobalsCSS(
  distDir,
  primitives,
  primitiveMap,
  semantics,
  spacingDefault
) {
  // Get first available typography mode for Google Fonts
  const typographyModes = primitives.typography?.modes || ['default'];
  const typographyMode = typographyModes[0];
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

  // Collect color tokens with var() references (consistent with tailwind output)
  const baseTokens = collectSemanticColorTokensVarRef(
    SEMANTIC_DIR,
    'base-slate-light.json',
    primitiveMap
  );
  const themeTokens = collectSemanticColorTokensVarRef(
    SEMANTIC_DIR,
    'theme-default-light.json',
    primitiveMap
  );
  // Standalone semantic files (e.g. focus.json) contribute color tokens
  // (--color-focus-* utilities in @theme) and dimension tokens (--focus-offset).
  // Dimensions go to a :root block, not @theme — used only via arbitrary utilities
  // Tailwind doesn't track as @theme usage (see generateRootDimensionsCSS / #506).
  // Files owned by a dedicated collector (spacing/breakpoints/z-index) are skipped
  // from the generic dimension scan to avoid duplicate emission.
  const dimensionTokens = [];
  const standaloneTokens = semantics.standalone.flatMap((file) => {
    const tokens = collectSemanticColorTokensVarRef(
      SEMANTIC_DIR,
      file,
      primitiveMap
    );
    if (!FILES_WITH_DEDICATED_DIMENSION_COLLECTORS.has(file)) {
      dimensionTokens.push(
        ...collectSemanticDimensionTokens(SEMANTIC_DIR, file)
      );
    }
    return tokens;
  });
  const semanticTokens = [...baseTokens, ...themeTokens, ...standaloneTokens];

  // Collect other tokens using shared functions
  const spacingModes = collectSpacingTokens(SEMANTIC_DIR);
  const { numeric: defaultSpacingNumeric, role: defaultSpacingRole } =
    splitSpacingTokens(spacingModes[CANONICAL_SPACING_DEFAULT_MODE]);

  const radiusTokens = primitives.radius?.modes?.[0]
    ? collectRadiusTokens(TOKENS_DIR, primitives.radius.modes[0])
    : [];
  const borderwidthTokens = primitives.borderwidth?.modes?.[0]
    ? collectBorderwidthTokens(TOKENS_DIR, primitives.borderwidth.modes[0])
    : [];
  const motionTokens = primitives.motion?.modes?.[0]
    ? collectMotionTokens(TOKENS_DIR, primitives.motion.modes[0])
    : [];
  const shadowTokens = collectShadowTokens(TOKENS_DIR, primitiveMap);
  const zIndexTokens = collectZIndexTokens(SEMANTIC_DIR);
  const breakpointTokens = collectBreakpointsTokens(SEMANTIC_DIR);
  const borderColorAliases =
    generateBorderColorAliasUtilitiesCSS(semanticTokens);

  // Generate using shared function. Spacing is split: numeric default tokens
  // seed @theme for Tailwind utility codegen; role tokens drive the inline
  // @utility declarations below; per-mode override blocks live outside
  // @theme so the cascade switches via [data-density="X"] on any ancestor.
  const header = `/*
 * Playground globals.css - Auto-generated by generate-modular.js
 * DO NOT EDIT MANUALLY - changes will be overwritten
 *
 * This file uses @theme (not inline) so utilities use var() references
 * that can be overridden by dynamically loaded theme CSS files.
 * Tailwind utilities are generated with nx: prefix (e.g., nx:bg-background).
 *
 * Color tokens reference --nx-* primitives via var().
 * Color theme switching loads different primitive CSS files; spacing mode
 * switching uses [data-density="X"] on <html> (no file load).
 */
`;

  let css = generateThemeCSS({
    header,
    googleFontsImport,
    imports: [
      'tailwindcss',
      './color.css',
      './focus-default.css',
      './motion-snappy.css',
      './typography-utilities.css',
      './borderwidth-utilities.css',
      ...(borderColorAliases.css ? ['./border-color-aliases.css'] : []),
      './motion-utilities.css',
      './spacing-utilities.css',
    ],
    tailwindPrefix: 'nx',
    semanticTokens,
    spacingTokens: defaultSpacingNumeric,
    radiusTokens,
    borderwidthTokens,
    motionTokens,
    shadowTokens,
    zIndexTokens,
    breakpointTokens,
    // No dark mode block - the app uses dynamic theme switching
  });

  // Fixed dimension primitives at :root (e.g. --focus-offset) — see #506.
  css += generateRootDimensionsCSS(dimensionTokens);
  css += generateFocusRingCSS();

  // Per-mode spacing override blocks. `spacingDefault` picks which mode lands
  // under `:root, [data-density="X"]`; the other five emit as bare
  // `[data-density="X"]` blocks (alphabetical for determinism).
  css += generateSpacingModesCSS(spacingModes, { defaultMode: spacingDefault });

  css += generateNativeBrowserUIThemeCSS();

  writeModularFile(distDir, 'globals.css', css);

  // Sibling utility/primitive files are imported by `globals.css`; keep the
  // console sync allowlist in step so build-time Tailwind processing can load
  // the same local graph.
  const spacingUtilities = generateSpacingRoleUtilitiesCSS(defaultSpacingRole);
  writeModularFile(distDir, 'spacing-utilities.css', spacingUtilities.css);

  if (borderColorAliases.css) {
    writeModularFile(
      distDir,
      'border-color-aliases.css',
      borderColorAliases.css
    );
  }

  return (
    semanticTokens.length +
    defaultSpacingNumeric.length +
    defaultSpacingRole.length
  );
}

/**
 * Main execution
 */
export async function generateModular({
  distDir = DEFAULT_MODULAR_DIR,
  spacingDefault = CANONICAL_SPACING_DEFAULT_MODE,
} = {}) {
  console.log('🎨 Generating modular CSS files...\n');

  // Wipe and recreate dist so renamed/removed outputs do not leave orphans.
  fs.rmSync(distDir, { recursive: true, force: true });
  ensureDir(distDir);

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
      generatePrimitivesCSS(distDir, tokens, category);
      totalFiles++;
    }
  }

  // Process multi-mode primitives
  for (const [category, info] of Object.entries(primitives)) {
    if (info.modes && info.modes.length > 0) {
      console.log(`\n${category} modes:`);
      const { themed, plain } = partitionThemedModes(info.modes);

      for (const mode of plain) {
        const tokens = processPrimitiveFile(category, mode, primitiveMap);
        generateModeCSS(distDir, category, mode, tokens);
        totalFiles++;
      }

      for (const mode of Object.keys(themed)) {
        generateThemedPrimitiveCSS(distDir, category, mode, primitiveMap);
        totalFiles++;
      }
    }
  }

  // Generate themed semantic files (base, theme)
  for (const [type, modes] of Object.entries(semantics.themed)) {
    console.log(`\n${type} themes:`);
    for (const mode of Object.keys(modes)) {
      generateThemedCSS(distDir, type, mode, primitiveMap);
      totalFiles++;
    }
  }

  // Generate typography utilities (using shared function from utils.js)
  console.log('\nStyles:');
  const typography = generateTypographyUtilitiesCSS(TOKENS_DIR, primitiveMap);
  if (typography.css) {
    writeModularFile(distDir, 'typography-utilities.css', typography.css);
    console.log(`  ✓ ${typography.count} typography utilities`);
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
    const borderWidth = generateBorderWidthUtilitiesCSS(borderwidthTokens);
    writeModularFile(distDir, 'borderwidth-utilities.css', borderWidth.css);
    console.log(`  ✓ ${borderWidth.count} border width utilities`);
    totalFiles++;
  }

  // Generate motion duration utilities (use first mode as reference)
  if (primitives.motion && primitives.motion.modes) {
    const firstMode = primitives.motion.modes[0];
    const motionTokens = collectMotionTokens(TOKENS_DIR, firstMode);
    const motionUtilities = generateMotionUtilitiesCSS(motionTokens);
    writeModularFile(distDir, 'motion-utilities.css', motionUtilities.css);
    console.log(`  ✓ ${motionUtilities.count} motion duration utilities`);
    totalFiles++;
  }

  // Generate the modular globals.css
  console.log('\nGlobals:');
  const globalsTokenCount = generateModularGlobalsCSS(
    distDir,
    primitives,
    primitiveMap,
    semantics,
    spacingDefault
  );
  console.log(`  ✓ globals.css (${globalsTokenCount} tokens)`);
  totalFiles++;

  await formatDistCssFiles(distDir);

  console.log(
    `\n✨ Generated ${totalFiles} modular CSS files in dist/modular/`
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Surface `--spacingDefault=X` symmetric with `generate-tailwind-package.js`.
  // Other CLI flags consumed by `parseArgs` (base/typography/...) don't
  // apply here — the modular build emits every mode of every category — so
  // this generator only accepts the one knob it honours.
  const cliConfig = parseArgs(undefined, { allowedKeys: ['spacingDefault'] });
  await generateModular({ spacingDefault: cliConfig.spacingDefault });
}
