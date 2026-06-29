import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const consumerRoot = path.join(repoRoot, 'apps', 'console');
const probeDir = await mkdtemp(
  path.join(consumerRoot, '.appearance-dist-typecheck-')
);
const probePath = path.join(probeDir, 'probe.tsx');
const runtimeProbePath = path.join(probeDir, 'probe-runtime.mjs');
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

await writeFile(
  probePath,
  `import { Button } from '@nexus/react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  createNexusAppearance,
  NexusAppearanceProvider,
  type NexusAppearanceProviderProps,
  useNexusAppearance,
} from '@nexus/react/appearance';
import {
  createNexusAppearanceScript,
  NexusAppearanceScript as ServerNexusAppearanceScript,
} from '@nexus/react/appearance/server';

type NexusAppearanceState = NonNullable<NexusAppearanceProviderProps['defaultState']>;

const defaultState: NexusAppearanceState = {
  mode: 'dark',
  brandColor: '#2563eb',
  surfaceTone: 'slate',
  contrast: 60,
  density: 'default',
  corners: 'square',
  elevation: 'quiet',
  stroke: 'normal',
  prefs: {
    uiFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    codeFont: 'ui-monospace, "SF Mono", Menlo, monospace',
    uiFontSize: 14,
    codeFontSize: 12,
    reduceMotion: 'system',
    pointerCursors: false,
    fontSmoothing: true,
  },
};
const ConfiguredNexusAppearanceScript = createNexusAppearanceScript({
  storageKey: 'app-appearance',
  defaultState,
});
const { NexusAppearanceProvider: ConfiguredNexusAppearanceProvider } =
  createNexusAppearance({
    storageKey: 'app-appearance',
    cookieWriteKey: 'appearance-state',
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

function DefaultProviderProbe() {
  return (
    <NexusAppearanceProvider storageKey={false} cookieWriteKey="appearance-state">
      <ThemeControls />
    </NexusAppearanceProvider>
  );
}

function ConfiguredProviderProbe() {
  return (
    <ConfiguredNexusAppearanceProvider>
      <ThemeControls />
    </ConfiguredNexusAppearanceProvider>
  );
}

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
  cookieWriteKey: 'appearance-state',
});
const defaultProviderHtml = renderToStaticMarkup(<DefaultProviderProbe />);
const configuredProviderHtml = renderToStaticMarkup(<ConfiguredProviderProbe />);

const defaultProviderMarkup: string = defaultProviderHtml;
const configuredProviderMarkup: string = configuredProviderHtml;

void defaultProviderMarkup;
void configuredProviderMarkup;
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

await writeFile(
  runtimeProbePath,
  `import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  createNexusAppearance,
  NexusAppearanceProvider,
  useNexusAppearance,
} from '@nexus/react/appearance';

const defaultState = {
  mode: 'dark',
  brandColor: '#2563eb',
  surfaceTone: 'slate',
  contrast: 60,
  density: 'default',
  corners: 'square',
  elevation: 'quiet',
  stroke: 'normal',
  prefs: {
    uiFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    codeFont: 'ui-monospace, "SF Mono", Menlo, monospace',
    uiFontSize: 14,
    codeFontSize: 12,
    reduceMotion: 'system',
    pointerCursors: false,
    fontSmoothing: true,
  },
};

function ThemeControls() {
  const { state } = useNexusAppearance();

  return React.createElement('span', { 'data-mode': state.mode }, state.mode);
}

const { NexusAppearanceProvider: ConfiguredProvider } = createNexusAppearance({
  storageKey: false,
  defaultState,
});
const defaultProviderHtml = renderToStaticMarkup(
  React.createElement(
    NexusAppearanceProvider,
    { storageKey: false, defaultState },
    React.createElement(ThemeControls)
  )
);
const configuredProviderHtml = renderToStaticMarkup(
  React.createElement(ConfiguredProvider, null, React.createElement(ThemeControls))
);

if (!defaultProviderHtml.includes('data-mode="dark"')) {
  throw new Error('Default provider runtime probe did not render hook state.');
}

if (!configuredProviderHtml.includes('data-mode="dark"')) {
  throw new Error('Configured provider runtime probe did not render hook state.');
}
`
);

const result = spawnSync(
  process.execPath,
  [tscBin, '--project', tsconfigPath],
  {
    cwd: repoRoot,
    stdio: 'inherit',
  }
);

if (result.status !== 0) {
  await rm(probeDir, { recursive: true, force: true });
  process.exit(result.status ?? 1);
}

const runtimeResult = spawnSync(process.execPath, [runtimeProbePath], {
  cwd: consumerRoot,
  stdio: 'inherit',
});

await rm(probeDir, { recursive: true, force: true });

process.exit(runtimeResult.status ?? 1);
