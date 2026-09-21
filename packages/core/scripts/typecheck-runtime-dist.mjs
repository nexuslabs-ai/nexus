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
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshotFromCookie,
  createNexusAppearanceSnapshotFromState,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  DEFAULT_STORAGE_KEY,
  deriveTheme,
  inspectTheme,
  type ThemeInspection,
  type ThemeTraceEvent,
  resolveFirstPaint,
  sanitizeNexusAppearance,
  themeToCss,
  type NexusAppearanceState,
} from '@nexus_ds/core';
import { BRAND_COLOR_PRESETS, getPaletteRamp, getPaletteShade, type BrandColorPreset, type PrimitivePaletteName, type Shade } from '@nexus_ds/core/palette';

const preset: BrandColorPreset | undefined = BRAND_COLOR_PRESETS[0];
if (preset) {
  const seed: string = preset.color;
  // @ts-expect-error public preset colors are immutable.
  preset.color = '#000000';
  void seed;
}
// @ts-expect-error the preset catalog is immutable.
BRAND_COLOR_PRESETS.push({ value: 'custom', label: 'Custom', color: '#123456' });

const palette: PrimitivePaletteName = 'green';
const shade: Shade = '600';
const ramp = getPaletteRamp(palette);
const green: string = getPaletteShade(palette, shade);
// @ts-expect-error public ramps are immutable.
ramp['600'] = '#000000';
// @ts-expect-error singleton colors are not shade ramps.
getPaletteRamp('white');
// @ts-expect-error only authored shades are accepted.
getPaletteShade('green', '999');
void green;

const state: NexusAppearanceState = sanitizeNexusAppearance({
  ...DEFAULT_NEXUS_APPEARANCE,
  mode: 'system',
  brandColor: '#2563eb',
  surfaceTone: 'slate',
});

const snapshot = createNexusAppearanceSnapshotFromState(state);
const serverSnapshot = createNexusAppearanceSnapshotFromCookie('', state);
const css: string = themeToCss(deriveTheme(createNexusThemeContract(state)));
const bootstrap: string = createNexusAppearanceBootstrapScript({
  storageKey: DEFAULT_STORAGE_KEY,
  defaultSnapshot: snapshot,
});
const firstPaint = resolveFirstPaint(snapshot, true);
const inspection: ThemeInspection = inspectTheme(createNexusThemeContract(state));
const event: ThemeTraceEvent | undefined = inspection.trace[0];
if (event?.kind === 'measurement') {
  const lc: number = event.lc;
  void lc;
}
// @ts-expect-error inspection events are a discriminated union.
event.notAnInspectionField;
// @ts-expect-error the inspection schema is versioned.
const wrongVersion: ThemeInspection['schemaVersion'] = 2;
void wrongVersion;

// @ts-expect-error proves the public state is not any.
state.notARealNexusAppearanceField;

void snapshot;
void serverSnapshot;
void css;
void bootstrap;
void firstPaint.colorScheme;
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
