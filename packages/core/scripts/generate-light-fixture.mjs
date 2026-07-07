import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TONES = ['slate', 'neutral', 'zinc', 'gray', 'stone'];
const TONE_TOKENS = [
  'background',
  'background-hover',
  'background-hover-alpha',
  'background-active',
  'muted',
  'muted-foreground',
  'muted-foreground-subtle',
  'disabled',
  'disabled-foreground',
  'container',
  'container-foreground',
  'container-hover',
  'container-active',
  'popover',
  'popover-foreground',
  'popover-hover',
  'popover-active',
  'popover-alpha',
  'popover-backdrop',
  'control-background',
  'control-background-hover',
  'nav-background',
  'nav-foreground',
  'nav-muted-foreground',
  'nav-item-hover',
  'nav-item-active',
  'nav-border',
  'border-default-alpha',
  'border-active',
  'overlay',
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(coreDir, '..', '..');
const distEntry = path.join(coreDir, 'dist', 'runtime', 'index.js');
const fixturePath = path.join(
  coreDir,
  'src',
  'lib',
  'light-tone.fixture.json'
);

execFileSync('pnpm', ['--filter', '@nexus_ds/core', 'build'], {
  cwd: repoRoot,
  stdio: 'inherit',
});

const { deriveTheme } = await import(pathToFileURL(distEntry).href);

const fixture = {
  schemaVersion: 1,
  source:
    'Generated from deriveTheme canonical light seeds after Model 2 surface hierarchy calibration; review diffs when surface tone constants or light steps change.',
  pageL: 0.97,
  lightDepthMultiplier: 1.4,
  toneContrast: 60,
  tones: {},
};

for (const tone of TONES) {
  const light = deriveTheme({
    surfaceTone: tone,
    light: {
      accent: '#2563eb',
      background: '#ffffff',
      foreground: '#181818',
    },
    dark: {
      accent: '#2563eb',
      background: '#181818',
      foreground: '#ffffff',
    },
    contrast: 60,
  }).light;

  fixture.tones[tone] = Object.fromEntries(
    TONE_TOKENS.map((token) => {
      const value = light[`--nx-color-${token}`];
      if (!value) throw new Error(`Missing light token ${tone}.${token}`);
      return [token, value];
    })
  );
}

fs.writeFileSync(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`Wrote ${path.relative(repoRoot, fixturePath)}`);
