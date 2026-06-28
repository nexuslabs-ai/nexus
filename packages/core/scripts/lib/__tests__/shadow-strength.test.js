import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { diffLeaves, leafValues } from '../mode-distinctness.js';
import { shadowStrengthScore } from '../shadow-strength.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const SHADOW_DIR = path.resolve(
  TEST_DIR,
  '..',
  '..',
  '..',
  'tokens',
  'primitives',
  'shadow'
);
const PUBLIC_MODES = ['quiet', 'standard', 'strong'];

function readShadowMode(mode, scheme) {
  return JSON.parse(
    fs.readFileSync(
      path.join(SHADOW_DIR, `shadow-${mode}-${scheme}.json`),
      'utf8'
    )
  );
}

describe('shadow strength diagnostics', () => {
  it('scores public shadow modes in ascending elevation order', () => {
    for (const scheme of ['light', 'dark']) {
      const scores = PUBLIC_MODES.map((mode) => ({
        mode,
        score: shadowStrengthScore(readShadowMode(mode, scheme)),
      }));

      console.info(
        `${scheme} shadow strength: ${scores
          .map(({ mode, score }) => `${mode}=${score.toFixed(4)}`)
          .join(', ')}`
      );

      expect(scores[0].score).toBeLessThan(scores[1].score);
      expect(scores[1].score).toBeLessThan(scores[2].score);
    }
  });

  it('calibrates public dark shadow files separately from light files', () => {
    for (const mode of PUBLIC_MODES) {
      const diffs = diffLeaves(
        leafValues(readShadowMode(mode, 'light')),
        leafValues(readShadowMode(mode, 'dark'))
      );

      expect(diffs.length, mode).toBeGreaterThan(0);
    }
  });

  it('rejects unsupported colour and dimension formats', () => {
    expect(() =>
      shadowStrengthScore({
        '2xs': {
          'layer-1': {
            x: { $value: { value: 0, unit: 'px' } },
            y: { $value: { value: 1, unit: 'px' } },
            blur: { $value: { value: 3, unit: 'px' } },
            spread: { $value: { value: 0, unit: 'px' } },
            color: { $value: '#000' },
          },
        },
      })
    ).toThrow(/8-digit hex color/);
  });
});
