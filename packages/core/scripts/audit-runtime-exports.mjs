import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const esmPath = path.join(packageRoot, 'dist', 'runtime', 'index.js');
const cjsPath = path.join(packageRoot, 'dist', 'runtime', 'index.cjs');

const EXPECTED_RUNTIME_EXPORTS = [
  'BASE_TONE_OPTIONS',
  'BASE_TONE_SEEDS',
  'CORNER_OPTIONS',
  'DEFAULT_BRAND_COLOR',
  'DEFAULT_COOKIE_KEY',
  'DEFAULT_NEXUS_APPEARANCE',
  'DEFAULT_STORAGE_KEY',
  'DENSITY_OPTIONS',
  'ELEVATION_OPTIONS',
  'NEXUS_APPEARANCE_DATA_ATTRS',
  'PALETTE_KEYS',
  'SEMANTIC_TOKEN_REGISTRY',
  'SNAPSHOT_VERSION',
  'STROKE_OPTIONS',
  'TIER_THRESHOLDS',
  'adjustContrast',
  'apcaLc',
  'appearancePrefsToCss',
  'createDefaultNexusAppearanceSnapshot',
  'createNexusAppearanceBootstrapScript',
  'createNexusAppearanceSnapshot',
  'createNexusAppearanceSnapshotFromCookie',
  'createNexusAppearanceSnapshotFromState',
  'createNexusAppearanceStateCookie',
  'createNexusThemeContract',
  'deriveTheme',
  'inspectTheme',
  'isColor',
  'normalizeAppearanceModeIds',
  'parseNexusAppearanceStateCookie',
  'resolveFirstPaint',
  'sanitizeNexusAppearance',
  'sanitizeNexusAppearancePrefs',
  'sanitizeNexusAppearanceSnapshot',
  'serializeNexusAppearanceStateCookie',
  'themeToCss',
];

const EXPECTED_PALETTE_EXPORTS = [
  'BRAND_COLOR_PRESETS',
  'CHART_PALETTE_REFERENCES',
  'STATUS_PALETTE_FAMILIES',
  'SHADES',
  'PERCEPTUAL_L_GRID',
  'PERCEPTUAL_L_GRID_HUE',
  'PRIMITIVE_PALETTE_NAMES',
  'getPaletteRamp',
  'getPaletteShade',
  'hexToOklchMechanical',
  'hexToOklchPinned',
  'hexToSrgbInts',
  'isPaletteShadeKey',
];

function assertExports(label, mod, allowlist = EXPECTED_RUNTIME_EXPORTS) {
  const actual = Object.keys(mod).sort();
  const expected = [...allowlist].sort();
  const missing = expected.filter((name) => !actual.includes(name));
  const extra = actual.filter((name) => !expected.includes(name));

  if (missing.length || extra.length) {
    throw new Error(
      [
        `${label} runtime exports drifted.`,
        missing.length ? `Missing: ${missing.join(', ')}` : null,
        extra.length ? `Extra: ${extra.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    );
  }
}

const esm = await import(pathToFileURL(esmPath).href);
const require = createRequire(import.meta.url);
const cjs = require(cjsPath);

assertExports('ESM', esm);
assertExports('CJS', cjs);

console.log(
  `@nexus_ds/core runtime export allowlist clean (${EXPECTED_RUNTIME_EXPORTS.length} exports).`
);

const paletteEsm = await import('@nexus_ds/core/palette');
const paletteCjs = require('@nexus_ds/core/palette');
assertExports('Palette ESM', paletteEsm, EXPECTED_PALETTE_EXPORTS);
assertExports('Palette CJS', paletteCjs, EXPECTED_PALETTE_EXPORTS);
assert.deepEqual(
  paletteEsm.BRAND_COLOR_PRESETS,
  paletteCjs.BRAND_COLOR_PRESETS
);
for (const name of paletteEsm.PRIMITIVE_PALETTE_NAMES) {
  assert.deepEqual(
    paletteEsm.getPaletteRamp(name),
    paletteCjs.getPaletteRamp(name)
  );
}
assert.equal(
  paletteEsm.getPaletteShade('green', '600'),
  'oklch(0.62 0.2233 140.055)'
);
console.log(
  `@nexus_ds/core/palette exports and ESM/CJS parity clean (${EXPECTED_PALETTE_EXPORTS.length} exports).`
);

const inspectionInput = esm.createNexusThemeContract(
  esm.DEFAULT_NEXUS_APPEARANCE
);
const inspection = esm.inspectTheme(inspectionInput);
assert.deepEqual(inspection, cjs.inspectTheme(inspectionInput));
assert.deepEqual(inspection.theme, esm.deriveTheme(inspectionInput));
assert.equal(inspection.schemaVersion, 1);
console.log('Theme inspection ESM/CJS execution parity clean.');
