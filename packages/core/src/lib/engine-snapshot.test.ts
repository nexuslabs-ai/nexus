import { describe, expect, it } from 'vitest';

import {
  BASE_TONE_OPTIONS,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import { deriveTheme, type Mode } from './derive-theme';
import snapshotFixture from './engine-snapshot.fixture.json';

type Tone = (typeof BASE_TONE_OPTIONS)[number]['value'];
type EngineSnapshotValue = {
  l: number;
  c: number;
  h: number;
  alpha: number;
};
type SnapshotMap = Record<string, EngineSnapshotValue>;
type EngineMatrix = Record<Tone, Record<Mode, SnapshotMap>>;

const MODES = ['light', 'dark'] as const;
const TONES = BASE_TONE_OPTIONS.map((option) => option.value);
const OKLCH_RE = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/;

function comps(value: string): EngineSnapshotValue {
  const match = value.match(OKLCH_RE);
  if (!match) throw new Error(`Unexpected OKLCH format: ${value}`);
  return {
    l: Number(match[1]),
    c: Number(match[2]),
    h: Number(match[3]),
    alpha: match[4] ? Number(match[4]) : 1,
  };
}

function normalizeMap(map: Record<string, string>): SnapshotMap {
  return Object.fromEntries(
    Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([token, value]) => [token.replace('--nx-color-', ''), comps(value)])
  );
}

function deriveMatrix(): EngineMatrix {
  return Object.fromEntries(
    TONES.map((tone) => {
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
  ) as EngineMatrix;
}

function sameValue(a: EngineSnapshotValue, b: EngineSnapshotValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function snapshotValue(
  matrix: EngineMatrix,
  tone: Tone,
  mode: Mode,
  token: string
): EngineSnapshotValue {
  const value = matrix[tone][mode][token];
  if (value === undefined) {
    throw new Error(`Missing engine snapshot value ${tone}.${mode}.${token}`);
  }
  return value;
}

function compactSnapshot(matrix: EngineMatrix) {
  const firstTone = TONES[0];
  if (firstTone === undefined) {
    throw new Error('Engine snapshot requires at least one surface tone');
  }

  const tokenNames = Object.keys(matrix[firstTone].light).sort();
  const invariant: Record<Mode, SnapshotMap> = { light: {}, dark: {} };
  const toneVarying: Record<
    Tone,
    Record<Mode, SnapshotMap>
  > = Object.fromEntries(TONES.map((tone) => [tone, { light: {}, dark: {} }]));
  const snapshot = {
    schemaVersion: 1,
    source:
      'Generated from deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE)) across every surfaceTone; review diffs when engine token values change.',
    tones: TONES,
    invariant,
    toneVarying,
  };

  for (const mode of MODES) {
    for (const token of tokenNames) {
      const firstValue = snapshotValue(matrix, firstTone, mode, token);
      const invariant = TONES.every((tone) =>
        sameValue(snapshotValue(matrix, tone, mode, token), firstValue)
      );

      if (invariant) {
        snapshot.invariant[mode][token] = firstValue;
        continue;
      }

      for (const tone of TONES) {
        snapshot.toneVarying[tone][mode][token] = snapshotValue(
          matrix,
          tone,
          mode,
          token
        );
      }
    }
  }

  return snapshot;
}

describe('engine snapshot', () => {
  it('matches the reviewed production tone matrix fixture', () => {
    expect(compactSnapshot(deriveMatrix())).toEqual(snapshotFixture);
  });
});
