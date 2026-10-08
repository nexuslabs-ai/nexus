import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const probeDir = path.join(packageRoot, '.runtime-dist-typecheck');
const probePath = path.join(probeDir, 'probe.ts');
const commonJsProbePath = path.join(probeDir, 'probe.cts');
const tsconfigPath = path.join(probeDir, 'tsconfig.json');
const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const packageJsonPath = path.join(packageRoot, 'package.json');

const requiredDistFiles = [
  path.join(packageRoot, 'dist', 'runtime', 'index.d.ts'),
  path.join(packageRoot, 'dist', 'runtime', 'index.d.cts'),
  path.join(packageRoot, 'dist', 'runtime', 'index.js'),
  path.join(packageRoot, 'dist', 'runtime', 'index.cjs'),
];

for (const distFile of requiredDistFiles) {
  if (!existsSync(distFile)) {
    throw new Error(
      `Missing ${path.relative(repoRoot, distFile)}. Run @nexus_ds/core build before this dist typecheck.`
    );
  }
}

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

if (!packageJson.files?.includes('dist/runtime')) {
  throw new Error('@nexus_ds/core package files must include dist/runtime.');
}

function collectExportEntries(value, keyPath = 'exports', out = []) {
  if (typeof value === 'string') {
    out.push({ keyPath, file: value });
    return out;
  }

  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      collectExportEntries(nested, `${keyPath}.${key}`, out);
    }
  }

  return out;
}

for (const { keyPath, file: exportFile } of collectExportEntries(
  packageJson.exports
)) {
  if (!exportFile.startsWith('./dist/runtime/')) {
    throw new Error(
      `@nexus_ds/core ${keyPath} -> ${exportFile} must stay inside dist/runtime.`
    );
  }

  const resolved = path.join(packageRoot, exportFile);
  if (!existsSync(resolved)) {
    throw new Error(
      `@nexus_ds/core ${keyPath} -> ${exportFile} points to missing ${path.relative(
        repoRoot,
        resolved
      )}.`
    );
  }
}

await rm(probeDir, { recursive: true, force: true });
await mkdir(probeDir, { recursive: true });

await writeFile(
  probePath,
  `import {
  BRAND_COLOR_PRESETS,
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshotFromCookie,
  createNexusAppearanceSnapshotFromState,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  DEFAULT_STORAGE_KEY,
  deriveTheme,
  measureThemeContrast,
  resolveFirstPaint,
  sanitizeNexusAppearance,
  themeToCss,
  type BrandColorPreset,
  type Mode,
  type NexusAppearanceState,
  type SemanticColorName,
  type SurfaceToken,
  type ThemeContrastCheck,
  type Tier,
} from '@nexus_ds/core';
import {
  getPaletteRamp,
  getPaletteShade,
  PRIMITIVE_PALETTE_NAMES,
  SHADES,
  type PrimitivePaletteName,
  type PrimitivePaletteRamp,
  type Shade,
} from '@nexus_ds/core/palette';
import {
  createTokenCatalogue,
  DARK_SURFACE_LADDER,
  LIGHT_SURFACE_LADDER,
  SURFACE_TOKENS,
  type CatalogueToken,
  type CatalogueTokenName,
  type ShadeAnchor,
} from '@nexus_ds/core/catalogue';

const preset: BrandColorPreset | undefined = BRAND_COLOR_PRESETS[0];
if (preset) {
  const seed: string = preset.color;
  // @ts-expect-error public preset colors are immutable.
  preset.color = '#000000';
  // @ts-expect-error the preset catalog is immutable.
  BRAND_COLOR_PRESETS.push(preset);
  void seed;
}

const palettes: readonly PrimitivePaletteName[] = PRIMITIVE_PALETTE_NAMES;
const shades: readonly Shade[] = SHADES;
const palette: PrimitivePaletteName = 'green';
const shade: Shade = '600';
const ramp: PrimitivePaletteRamp = getPaletteRamp(palette);
const green: string = getPaletteShade(palette, shade);
// @ts-expect-error public ramps are immutable.
ramp['600'] = '#000000';
// @ts-expect-error singleton colors are not shade ramps.
getPaletteRamp('white');
// @ts-expect-error only authored shades are accepted.
getPaletteShade('green', '999');
void green;
void palettes;
void shades;

const catalogue: readonly CatalogueToken[] = createTokenCatalogue();
const catalogued = catalogue[0];
if (catalogued) {
  const name: CatalogueTokenName = catalogued.name;
  const variant = catalogued.variants[0];
  const themeMode: Mode | null | undefined = variant?.mode;
  const filePreset: string | null | undefined = variant?.preset;
  const file: string | undefined = variant?.source?.file;
  const appearanceMode: string | undefined = variant?.appearance?.mode;
  // @ts-expect-error catalogue variants are immutable.
  catalogued.variants.push(catalogued.variants[0]);
  if (variant?.appearance) {
    // @ts-expect-error a variant's appearance is immutable.
    variant.appearance.prefs.uiFontSize = 16;
  }
  void name;
  void themeMode;
  void filePreset;
  void file;
  void appearanceMode;
}
// @ts-expect-error canonical names are in the --nx-* scheme.
const aliasName: CatalogueTokenName = '--color-background';
void aliasName;

const state: NexusAppearanceState = sanitizeNexusAppearance({
  ...DEFAULT_NEXUS_APPEARANCE,
  mode: 'system',
  brandColor: '#2563eb',
  surfaceTone: 'slate',
});

const snapshot = createNexusAppearanceSnapshotFromState(state);
const serverSnapshot = createNexusAppearanceSnapshotFromCookie('', state);
const theme = deriveTheme(createNexusThemeContract(state));
const css: string = themeToCss(theme);
const bootstrap: string = createNexusAppearanceBootstrapScript({
  storageKey: DEFAULT_STORAGE_KEY,
  defaultSnapshot: snapshot,
});
const firstPaint = resolveFirstPaint(snapshot, true);
const checks: ThemeContrastCheck[] = measureThemeContrast(theme);
const lc: number | undefined = checks[0]?.lc;
const checkMode: Mode | undefined = checks[0]?.mode;
const checkTier: Tier | undefined = checks[0]?.tier;
// @ts-expect-error contrast checks are typed records.
checks[0]?.notAContrastCheckField;

const surface: SurfaceToken = SURFACE_TOKENS[0];
const lightAnchor: ShadeAnchor = LIGHT_SURFACE_LADDER[surface];
const darkAnchor: ShadeAnchor = DARK_SURFACE_LADDER[surface];
// @ts-expect-error the surface ladders are keyed by surface tokens only.
void LIGHT_SURFACE_LADDER['primary-background'];

const colorName: SemanticColorName = 'popover-alpha';
// @ts-expect-error semantic colour names are the registry's literal names.
const unknownColorName: SemanticColorName = 'not-a-color-token';

// @ts-expect-error proves the public state is not any.
state.notARealNexusAppearanceField;

void snapshot;
void serverSnapshot;
void css;
void bootstrap;
void firstPaint.colorScheme;
void lc;
void checkMode;
void checkTier;
void lightAnchor;
void darkAnchor;
void colorName;
void unknownColorName;
`
);

await writeFile(commonJsProbePath, await readFile(probePath, 'utf8'));

await writeFile(
  tsconfigPath,
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM'],
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ['probe.ts', 'probe.cts'],
    },
    null,
    2
  )
);

const result = spawnSync(
  process.execPath,
  [tscBin, '--project', tsconfigPath],
  {
    cwd: repoRoot,
    stdio: 'inherit',
  }
);

await rm(probeDir, { recursive: true, force: true });

process.exit(result.status ?? 1);
