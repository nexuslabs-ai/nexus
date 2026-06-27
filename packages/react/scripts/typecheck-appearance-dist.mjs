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
const probePath = path.join(probeDir, 'probe.ts');
const tsconfigPath = path.join(probeDir, 'tsconfig.json');
const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');

const requiredDistFiles = [
  path.join(packageRoot, 'dist', 'appearance.d.ts'),
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
  `import type { NexusAppearanceState } from '@nexus/core';
import { useNexusAppearance } from '@nexus/react/appearance';

const { setState } = useNexusAppearance();

setState((state) => {
  const inferred: NexusAppearanceState = state;
  const mode: NexusAppearanceState['mode'] = state.mode;

  // @ts-expect-error proves the updater state is not any.
  state.notARealNexusAppearanceField;

  return { ...inferred, mode };
});
`
);

await writeFile(
  tsconfigPath,
  JSON.stringify(
    {
      extends: '../../../tsconfig.base.json',
      compilerOptions: {
        noEmit: true,
        jsx: 'react-jsx',
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
