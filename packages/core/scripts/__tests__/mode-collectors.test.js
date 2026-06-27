import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  collectBorderwidthModes,
  collectRadiusModes,
  collectShadowModes,
} from '../utils.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.resolve(TEST_DIR, '..', '..', 'tokens');

describe('runtime mode collectors', () => {
  it('collects all radius modes including extra-round', () => {
    const modes = collectRadiusModes(TOKENS);

    expect(Object.keys(modes).sort()).toEqual([
      'extra-round',
      'round',
      'smooth',
      'square',
      'subtle',
    ]);
    expect(modes.square).toContainEqual({
      cssName: 'radius-base',
      path: ['base'],
      value: '0px',
    });
  });

  it('collects all border width modes under the borderwidth namespace', () => {
    const modes = collectBorderwidthModes(TOKENS);

    expect(Object.keys(modes).sort()).toEqual([
      'lyra',
      'maia',
      'mira',
      'nova',
      'vega',
    ]);
    const names = modes.vega.map((token) => token.cssName);
    expect(names).toContain('borderwidth-default');
    expect(names).not.toContain('border-default');
  });

  it('collects shadow modes as light and dark primitive-layer tokens', () => {
    const modes = collectShadowModes(TOKENS);

    expect(Object.keys(modes).sort()).toEqual([
      'flat',
      'quiet',
      'soft',
      'standard',
      'strong',
    ]);
    const lightNames = modes.quiet.light.map((token) => token.cssName);
    const darkNames = modes.quiet.dark.map((token) => token.cssName);
    expect(lightNames.some((name) => name.includes('-layer-'))).toBe(true);
    expect(lightNames).toContain('shadow-sm-layer-1-color');
    expect(lightNames).not.toContain('shadow-sm');
    expect(darkNames).toEqual(lightNames);
  });
});
