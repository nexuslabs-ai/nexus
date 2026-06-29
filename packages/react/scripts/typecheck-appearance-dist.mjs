import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const consumerRoot = path.join(repoRoot, 'apps', 'console');
const probeDir = path.join(consumerRoot, '.appearance-dist-typecheck');
const probePath = path.join(probeDir, 'probe.tsx');
const tsconfigPath = path.join(probeDir, 'tsconfig.json');
const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');

const requiredDistFiles = [
  path.join(packageRoot, 'dist', 'index.d.ts'),
  path.join(packageRoot, 'dist', 'appearance.d.ts'),
  path.join(packageRoot, 'dist', 'appearance-server.d.ts'),
  path.join(packageRoot, '..', 'core', 'dist', 'runtime', 'index.d.ts'),
];

for (const distFile of requiredDistFiles) {
  if (!existsSync(distFile)) {
    throw new Error(
      `Missing ${path.relative(repoRoot, distFile)}. Run package builds before this dist typecheck.`
    );
  }
}

await rm(probeDir, { recursive: true, force: true });
await mkdir(probeDir, { recursive: true });

await writeFile(
  probePath,
  `import { Button } from '@nexus/react';
import {
  DEFAULT_NEXUS_APPEARANCE,
  type NexusAppearanceState,
} from '@nexus/core';
import {
  createNexusAppearance,
  NexusAppearanceProvider,
  useNexusAppearance,
} from '@nexus/react/appearance';
import {
  createNexusAppearanceScript,
  NexusAppearanceScript as ServerNexusAppearanceScript,
} from '@nexus/react/appearance/server';

const defaultState: NexusAppearanceState = {
  ...DEFAULT_NEXUS_APPEARANCE,
  brandColor: '#2563eb',
  surfaceTone: 'slate',
};
const ConfiguredNexusAppearanceScript = createNexusAppearanceScript({
  storageKey: 'app-appearance',
  defaultState,
});
const { NexusAppearanceProvider: ConfiguredNexusAppearanceProvider } =
  createNexusAppearance({
    storageKey: 'app-appearance',
    cookieKey: "appearance-state",
    defaultState,
  });

function ThemeControls() {
  const { setState, state } = useNexusAppearance();

  const toDark = () =>
    setState((current) => {
      const inferred: NexusAppearanceState = current;
      const mode: NexusAppearanceState['mode'] = current.mode;

      // @ts-expect-error proves the updater state is not any.
      current.notARealNexusAppearanceField;

      return { ...inferred, mode };
    });

  return (
    <>
      <span>{state.mode}</span>
      <Button onClick={toDark}>Confirm</Button>
    </>
  );
}

const element = (
  <NexusAppearanceProvider storageKey={false} cookieKey="appearance-state">
    <ThemeControls />
  </NexusAppearanceProvider>
);
const configuredElement = (
  <ConfiguredNexusAppearanceProvider>
    <ThemeControls />
  </ConfiguredNexusAppearanceProvider>
);
const serverScript = (
  <ServerNexusAppearanceScript
    storageKey="app-appearance"
    nonce="nonce"
    defaultState={defaultState}
  />
);
const configuredScript = <ConfiguredNexusAppearanceScript nonce="nonce" />;
const cookieOnly = createNexusAppearance({
  storageKey: false,
  cookieKey: "appearance-state",
});

void element;
void configuredElement;
void serverScript;
void configuredScript;
void cookieOnly;
`
);

await writeFile(
  tsconfigPath,
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ['probe.tsx'],
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
