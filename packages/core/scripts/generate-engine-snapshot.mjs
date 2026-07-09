import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MODES = ['light', 'dark'];

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
const OKLCH_RE =
  /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/;

function comps(value) {
  const match = value.match(OKLCH_RE);
  if (!match) throw new Error(`Unexpected OKLCH format: ${value}`);
  return {
    l: Number(match[1]),
    c: Number(match[2]),
    h: Number(match[3]),
    alpha: match[4] ? Number(match[4]) : 1,
  };
}

function normalizeMap(map) {
  return Object.fromEntries(
    Object.entries(map)
      .map(([token, value]) => [token.replace('--nx-color-', ''), comps(value)])
      .sort(([a], [b]) => a.localeCompare(b))
  );
}

function deriveMatrix() {
  return Object.fromEntries(
    tones.map((tone) => {
      const theme = deriveTheme(
        createNexusThemeContract({
          ...DEFAULT_NEXUS_APPEARANCE,
          surfaceTone: tone,
        })
      );

      return [
        tone,
        {
          light: normalizeMap(theme.light),
          dark: normalizeMap(theme.dark),
        },
      ];
    })
  );
}

function sameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function compactSnapshot(matrix) {
  const firstTone = tones[0];
  const tokenNames = Object.keys(matrix[firstTone].light).sort();
  const snapshot = {
    schemaVersion: 1,
    source:
      'Generated from deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE)) across every surfaceTone; review diffs when engine token values change.',
    tones,
    invariant: { light: {}, dark: {} },
    toneVarying: Object.fromEntries(
      tones.map((tone) => [tone, { light: {}, dark: {} }])
    ),
  };

  for (const mode of MODES) {
    for (const token of tokenNames) {
      const firstValue = matrix[firstTone][mode][token];
      const invariant = tones.every((tone) =>
        sameValue(matrix[tone][mode][token], firstValue)
      );

      if (invariant) {
        snapshot.invariant[mode][token] = firstValue;
        continue;
      }

      for (const tone of tones) {
        snapshot.toneVarying[tone][mode][token] = matrix[tone][mode][token];
      }
    }
  }

  return snapshot;
}

const snapshot = compactSnapshot(deriveMatrix());

fs.writeFileSync(fixturePath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${path.relative(repoRoot, fixturePath)}`);
