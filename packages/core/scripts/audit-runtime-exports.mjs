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
  'SNAPSHOT_VERSION',
  'STROKE_OPTIONS',
  'TIER_THRESHOLDS',
  'adjustContrast',
  'appearancePrefsToCss',
  'createDefaultNexusAppearanceSnapshot',
  'createNexusAppearanceBootstrapScript',
  'createNexusAppearanceSnapshot',
  'createNexusAppearanceSnapshotFromCookie',
  'createNexusAppearanceSnapshotFromState',
  'createNexusAppearanceStateCookie',
  'createNexusThemeContract',
  'deriveTheme',
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

function assertExports(label, mod) {
  const actual = Object.keys(mod).sort();
  const expected = [...EXPECTED_RUNTIME_EXPORTS].sort();
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
  `@nexus/core runtime export allowlist clean (${EXPECTED_RUNTIME_EXPORTS.length} exports).`
);
