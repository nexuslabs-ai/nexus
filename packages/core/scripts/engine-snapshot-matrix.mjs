// Shared engine-snapshot shaping logic, imported by both the vitest fixture
// test (src/lib/engine-snapshot.test.ts) and the fixture generator
// (generate-engine-snapshot.mjs). Kept as a plain .mjs so the node generator
// can import it without a build step; the companion .d.mts types the test.
// The theme functions are injected so the test can source them from `src` while
// the generator sources them from the built `dist`.

const OKLCH_RE = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/;

export const MODES = ['light', 'dark'];

export function comps(value) {
  const match = value.match(OKLCH_RE);
  if (!match) throw new Error(`Unexpected OKLCH format: ${value}`);
  return {
    l: Number(match[1]),
    c: Number(match[2]),
    h: Number(match[3]),
    alpha: match[4] ? Number(match[4]) : 1,
  };
}

export function normalizeMap(map) {
  return Object.fromEntries(
    Object.entries(map)
      .map(([token, value]) => [token.replace('--nx-color-', ''), comps(value)])
      .sort(([a], [b]) => a.localeCompare(b))
  );
}

export function sameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function deriveMatrix({
  deriveTheme,
  createNexusThemeContract,
  baseAppearance,
  tones,
}) {
  return Object.fromEntries(
    tones.map((tone) => {
      const theme = deriveTheme(
        createNexusThemeContract({ ...baseAppearance, surfaceTone: tone })
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

export function compactSnapshot(matrix, tones) {
  const firstTone = tones[0];
  if (firstTone === undefined) {
    throw new Error('Engine snapshot requires at least one surface tone');
  }

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
