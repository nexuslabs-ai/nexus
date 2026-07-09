import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import prettier from 'prettier';

import { compactSnapshot, deriveMatrix } from './engine-snapshot-matrix.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(coreDir, '..', '..');
const distEntry = path.join(coreDir, 'dist', 'runtime', 'index.js');
const fixturePath = path.join(
  coreDir,
  'src',
  'lib',
  'engine-snapshot.fixture.json'
);

execFileSync('corepack', ['pnpm', '--filter', '@nexus_ds/core', 'build'], {
  cwd: repoRoot,
  stdio: 'inherit',
});

const {
  BASE_TONE_OPTIONS,
  DEFAULT_NEXUS_APPEARANCE,
  createNexusThemeContract,
  deriveTheme,
} = await import(pathToFileURL(distEntry).href);

const tones = BASE_TONE_OPTIONS.map((option) => option.value);
const matrix = deriveMatrix({
  deriveTheme,
  createNexusThemeContract,
  baseAppearance: DEFAULT_NEXUS_APPEARANCE,
  tones,
});
const snapshot = compactSnapshot(matrix, tones);
const formatted = await prettier.format(JSON.stringify(snapshot, null, 2), {
  ...(await prettier.resolveConfig(fixturePath)),
  filepath: fixturePath,
});

fs.writeFileSync(fixturePath, formatted);
console.log(`Wrote ${path.relative(repoRoot, fixturePath)}`);
