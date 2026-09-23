import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const runtimeDir = path.join(packageRoot, 'dist', 'runtime');
const esmPath = path.join(runtimeDir, 'index.js');
const cjsPath = path.join(runtimeDir, 'index.cjs');

const EXPECTED_RUNTIME_EXPORTS = [
  'BASE_TONE_OPTIONS',
  'BASE_TONE_SEEDS',
  'BRAND_COLOR_PRESETS',
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
  'findBrandColorPreset',
  'isColor',
  'measureThemeContrast',
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
  'PRIMITIVE_PALETTE_NAMES',
  'SHADES',
  'getPaletteRamp',
  'getPaletteShade',
];

const EXPECTED_CATALOGUE_EXPORTS = ['createTokenCatalogue'];

const OKLCH_VALUE = /^oklch\(\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?\)$/;

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
for (const name of paletteEsm.PRIMITIVE_PALETTE_NAMES) {
  const ramp = paletteEsm.getPaletteRamp(name);
  assert.deepEqual(ramp, paletteCjs.getPaletteRamp(name));
  for (const shade of paletteEsm.SHADES) {
    assert.match(ramp[shade], OKLCH_VALUE, `${name}.${shade}`);
  }
}
console.log(
  `@nexus_ds/core/palette exports and ESM/CJS parity clean (${EXPECTED_PALETTE_EXPORTS.length} exports).`
);

const catalogueEsm = await import('@nexus_ds/core/catalogue');
const catalogueCjs = require('@nexus_ds/core/catalogue');
assertExports('Catalogue ESM', catalogueEsm, EXPECTED_CATALOGUE_EXPORTS);
assertExports('Catalogue CJS', catalogueCjs, EXPECTED_CATALOGUE_EXPORTS);
const catalogue = catalogueEsm.createTokenCatalogue();
assert.deepEqual(catalogue, catalogueCjs.createTokenCatalogue());
console.log(
  `@nexus_ds/core/catalogue exports and ESM/CJS parity clean (${catalogue.length} tokens).`
);

// esbuild escapes non-ASCII and quote characters inside string literals.
function decodedBundle(file) {
  return readFileSync(path.join(runtimeDir, file), 'utf8')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    )
    .replace(/\\(['"`\\])/g, '$1');
}

const catalogueProse = [
  ...new Set(catalogue.map((token) => token.description).filter(Boolean)),
];
assert.ok(catalogueProse.length > 0, 'The catalogue carries no descriptions.');
for (const file of ['catalogue.js', 'catalogue.cjs']) {
  const bundle = decodedBundle(file);
  const missing = catalogueProse.filter((prose) => !bundle.includes(prose));
  assert.deepEqual(missing, [], `${file} is missing catalogue prose.`);
}
for (const file of ['index.js', 'index.cjs']) {
  const bundle = decodedBundle(file);
  const leaked = catalogueProse.filter((prose) => bundle.includes(prose));
  assert.deepEqual(leaked, [], `${file} ships catalogue-only prose.`);
  assert.ok(
    !bundle.includes('createTokenCatalogue'),
    `${file} bundles catalogue code.`
  );
}
console.log(
  `Main ESM/CJS bundles are free of catalogue code and its ${catalogueProse.length} descriptions.`
);
