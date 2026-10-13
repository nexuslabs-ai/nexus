import { spawnSync } from 'node:child_process';

import { DENSITY_OPTIONS } from '@nexus_ds/core';

for (const { value } of DENSITY_OPTIONS) {
  console.log(`\nStorybook project at ${value} density`);
  const { status } = spawnSync(
    'pnpm',
    ['-w', 'test:storybook', ...process.argv.slice(2)],
    {
      stdio: 'inherit',
      env: { ...process.env, VITE_NEXUS_TEST_DENSITY: value },
    }
  );
  if (status !== 0) process.exit(status ?? 1);
}
