import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  collectBorderwidthTokens,
  collectBreakpointsTokens,
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
  generateBorderWidthUtilitiesCSS,
  generateSpacingModesCSS,
  generateSpacingRoleUtilitiesCSS,
  generateThemeCSS,
  generateTypographyUtilitiesCSS,
  getGoogleFontsImportFromTokens,
  isReference,
  log,
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
 * Process a primitive category file (size, typography, shadow, radius,
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
 * Generate mode file (size, typography, shadow, radius, borderwidth)
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
 * Mirrors generateThemedCSS so themed primitives load the same way as base/brands semantics.
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
 * Generate globals.css for playground using shared generateThemeCSS function
 */
function generatePlaygroundGlobalsCSS(
  distDir,
  primitives,
  primitiveMap,
  semantics
) {
  // Get first available typography mode for Google Fonts
  const typographyModes = primitives.typography?.modes || ['vega'];
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
  const brandTokens = collectSemanticColorTokensVarRef(
    SEMANTIC_DIR,
    'brands-blue-light.json',
    primitiveMap
  );
  // Standalone semantic files (e.g. focus.json) contribute both color tokens
  // (--color-focus-*) and dimension tokens (--focus-offset) into @theme so
  // their utilities emit in the playground build. Files owned by a dedicated
  // collector (spacing.json, breakpoints.json, z-index.json) are skipped from
  // the generic dimension scan to avoid duplicate emission.
  const standaloneTokens = semantics.standalone.flatMap((file) => {
    const tokens = collectSemanticColorTokensVarRef(
      SEMANTIC_DIR,
      file,
      primitiveMap
    );
    if (!FILES_WITH_DEDICATED_DIMENSION_COLLECTORS.has(file)) {
      tokens.push(...collectSemanticDimensionTokens(SEMANTIC_DIR, file));
    }
    return tokens;
  });
  const semanticTokens = [...baseTokens, ...brandTokens, ...standaloneTokens];

  // Collect other tokens using shared functions
  const spacingModes = collectSpacingTokens(SEMANTIC_DIR);
  const { numeric: vegaSpacingNumeric, role: vegaSpacingRole } =
    splitSpacingTokens(spacingModes.vega);

  const radiusTokens = primitives.radius?.modes?.[0]
    ? collectRadiusTokens(TOKENS_DIR, primitives.radius.modes[0])
    : [];
  const borderwidthTokens = primitives.borderwidth?.modes?.[0]
    ? collectBorderwidthTokens(TOKENS_DIR, primitives.borderwidth.modes[0])
    : [];
  const shadowTokens = collectShadowTokens(TOKENS_DIR, primitiveMap);
  const zIndexTokens = collectZIndexTokens(SEMANTIC_DIR);
  const breakpointTokens = collectBreakpointsTokens(SEMANTIC_DIR);

  // Generate using shared function. Spacing is split: numeric Vega tokens
  // seed @theme for Tailwind utility codegen; role tokens drive the inline
  // @utility declarations below; per-mode override blocks live outside
  // @theme so the cascade switches via [data-style="X"] on any ancestor.
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
 * switching uses [data-style="X"] on <html> (no file load).
 */
`;

  let css = generateThemeCSS({
    header,
    googleFontsImport,
    imports: [
      'tailwindcss',
      './color.css',
      './focus-default.css',
      './typography-utilities.css',
      './borderwidth-utilities.css',
    ],
    tailwindPrefix: 'nx',
    semanticTokens,
    spacingTokens: vegaSpacingNumeric,
    radiusTokens,
    borderwidthTokens,
    shadowTokens,
    zIndexTokens,
    breakpointTokens,
    // No dark mode block - playground uses dynamic theme switching
  });

  // Per-mode spacing override blocks (default Vega + 6 alphabetical others).
  css += generateSpacingModesCSS(spacingModes);

  // Spacing role utilities — inlined (not a separate file) so
  // sync-playground-themes.js's hardcoded STYLES_FILES allowlist covers them
  // via globals.css.
  const spacingUtilities = generateSpacingRoleUtilitiesCSS(vegaSpacingRole);
  css += `\n${spacingUtilities.css}`;

  writeModularFile(distDir, 'globals.css', css);
  return (
    semanticTokens.length + vegaSpacingNumeric.length + vegaSpacingRole.length
  );
}

/**
 * Main execution
 */
export async function generateModular({ distDir = DEFAULT_MODULAR_DIR } = {}) {
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

  // Generate themed semantic files (base, brands)
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

  // Generate playground globals.css
  console.log('\nPlayground:');
  const globalsTokenCount = generatePlaygroundGlobalsCSS(
    distDir,
    primitives,
    primitiveMap,
    semantics
  );
  console.log(`  ✓ globals.css (${globalsTokenCount} tokens)`);
  totalFiles++;

  await formatDistCssFiles(distDir);

  console.log(
    `\n✨ Generated ${totalFiles} modular CSS files in dist/modular/`
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generateModular();
}
