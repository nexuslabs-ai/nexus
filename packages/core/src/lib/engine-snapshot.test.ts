import { describe, expect, it } from 'vitest';

import {
  compactSnapshot,
  deriveMatrix,
} from '../../scripts/engine-snapshot-matrix.mjs';

import {
  BASE_TONE_OPTIONS,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import { deriveTheme } from './derive-theme';
import snapshotFixture from './engine-snapshot.fixture.json';

const TONES = BASE_TONE_OPTIONS.map((option) => option.value);

describe('engine snapshot', () => {
  it('matches the reviewed production tone matrix fixture', () => {
    const matrix = deriveMatrix({
      deriveTheme,
      createNexusThemeContract,
      baseAppearance: DEFAULT_NEXUS_APPEARANCE,
      tones: TONES,
    });

    expect(compactSnapshot(matrix, TONES)).toEqual(snapshotFixture);
  });
});
