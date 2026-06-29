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
      `Missing ${path.relative(repoRoot, distFile)}. Run @nexus/core build before this dist typecheck.`
    );
  }
}

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

if (!packageJson.files?.includes('dist/runtime')) {
  throw new Error('@nexus/core package files must include dist/runtime.');
}

function collectExportFiles(value, out = []) {
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }

  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      collectExportFiles(nested, out);
    }
  }

  return out;
}

for (const exportFile of collectExportFiles(packageJson.exports)) {
  if (!exportFile.startsWith('./dist/runtime/')) {
    throw new Error(
      `@nexus/core export ${exportFile} must stay inside dist/runtime.`
    );
  }

  const resolved = path.join(packageRoot, exportFile);
  if (!existsSync(resolved)) {
    throw new Error(
      `@nexus/core export ${exportFile} points to missing ${path.relative(
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
  resolveFirstPaint,
  sanitizeNexusAppearance,
  themeToCss,
  type NexusAppearanceState,
} from '@nexus/core';

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

// @ts-expect-error proves the public state is not any.
state.notARealNexusAppearanceField;

void snapshot;
void serverSnapshot;
void css;
void bootstrap;
void firstPaint.colorScheme;
`
);

await writeFile(
  tsconfigPath,
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ['probe.ts'],
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
