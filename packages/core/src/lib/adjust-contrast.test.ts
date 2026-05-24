import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { clampChroma, converter, oklch, parse } from 'culori';
import { describe, expect, it } from 'vitest';

import { adjustContrast } from './adjust-contrast';
import { PALETTE_KEYS, TIER_THRESHOLDS } from './palette';

const toRgb = converter('rgb');

function oklchStringToSrgbInts(value: string): [number, number, number] {
  const parsed = parse(value);
  if (!parsed) throw new Error(`unparseable oklch string: ${value}`);
  const clamped = clampChroma(oklch(parsed), 'oklch', 'rgb');
  const rgb = toRgb(clamped);
  const channel = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v * 255)));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
}

function hexToSrgbInts(hex: string): [number, number, number] {
  return oklchStringToSrgbInts(hex);
}

function lcOf(fg: string, bg: string): number {
  const lc = APCAcontrast(
    sRGBtoY(oklchStringToSrgbInts(fg)),
    sRGBtoY(hexToSrgbInts(bg))
  );
  return Math.abs(typeof lc === 'number' ? lc : Number(lc));
}

describe('adjustContrast', () => {
  describe('tiers', () => {
    it.each([
      ['body', 75],
      ['ui', 60],
      ['incidental', 45],
    ] as const)(
      'returns a shade clearing %s tier (Lc ≥ %i) against white',
      (tier, minLc) => {
        const result = adjustContrast('#ff0000', { tier });
        expect(lcOf(result, '#ffffff')).toBeGreaterThanOrEqual(minLc);
      }
    );

    it('matches TIER_THRESHOLDS exactly', () => {
      expect(TIER_THRESHOLDS).toEqual({ body: 75, ui: 60, incidental: 45 });
    });
  });

  describe('palette option (achromatic inputs)', () => {
    it.each(PALETTE_KEYS)(
      'accepts %s and returns a shade clearing the UI tier on white',
      (palette) => {
        const result = adjustContrast('#888888', { palette });
        expect(result).toMatch(/^oklch\(/);
        expect(lcOf(result, '#ffffff')).toBeGreaterThanOrEqual(60);
      }
    );

    it('borrows palette hue for achromatic input', () => {
      const stone = adjustContrast('#888888', { palette: 'stone' });
      const slate = adjustContrast('#888888', { palette: 'slate' });
      const stoneHue = Number(stone.match(/oklch\([^ ]+ [^ ]+ ([^)]+)\)/)![1]);
      const slateHue = Number(slate.match(/oklch\([^ ]+ [^ ]+ ([^)]+)\)/)![1]);
      // stone is warm (~58°), slate is cool (~257°)
      expect(Math.abs(stoneHue - slateHue)).toBeGreaterThan(100);
    });
  });

  describe('extreme inputs', () => {
    it.each([
      ['#ff0000', 'pure red'],
      ['#ffff00', 'pure yellow'],
      ['#000000', 'pure black'],
      ['#ffffff', 'pure white'],
    ])('handles %s (%s) without throwing', (input) => {
      expect(() => adjustContrast(input)).not.toThrow();
      const result = adjustContrast(input);
      expect(result).toMatch(/^oklch\(/);
    });

    it('returns a light shade for any input against a black background', () => {
      const result = adjustContrast('#ff0000', { background: '#000000' });
      const l = Number(result.match(/oklch\(([^ ]+)/)![1]);
      // Light text on black means high L
      expect(l).toBeGreaterThan(0.5);
    });

    it('returns a dark shade for any input against a white background', () => {
      const result = adjustContrast('#ffff00', { background: '#ffffff' });
      const l = Number(result.match(/oklch\(([^ ]+)/)![1]);
      // Dark text on white means low L
      expect(l).toBeLessThan(0.6);
    });
  });

  describe('snap behavior', () => {
    it('snaps already-accessible input to a grid-L OKLCH', () => {
      // Black is already maximally accessible on white, but we still snap
      const result = adjustContrast('#000000');
      expect(result).toMatch(/^oklch\(/);
      // L should match one of the grid values, not the input's L (0)
      const l = Number(result.match(/oklch\(([^ ]+)/)![1]);
      expect(l).toBeGreaterThan(0);
    });
  });

  describe('input validation', () => {
    it('throws with a diagnostic on unparseable input', () => {
      expect(() => adjustContrast('not-a-color')).toThrow(
        /cannot parse input 'not-a-color'/
      );
    });

    it('throws with a diagnostic on unparseable background', () => {
      expect(() =>
        adjustContrast('#ff0000', { background: 'not-a-color' })
      ).toThrow(/cannot parse background 'not-a-color'/);
    });

    it('strips alpha from input rather than throwing', () => {
      expect(() => adjustContrast('rgba(255, 0, 0, 0.5)')).not.toThrow();
    });
  });

  describe('no-passing-shade case', () => {
    it('throws listing every attempted shade and Lc score', () => {
      // Mid-gray background gives no shade enough contrast for body tier
      try {
        adjustContrast('#ffffff', { background: '#808080', tier: 'body' });
        expect.fail('expected adjustContrast to throw');
      } catch (e) {
        const msg = (e as Error).message;
        expect(msg).toMatch(/no shade in palette/);
        expect(msg).toMatch(/body tier/);
        expect(msg).toMatch(/\|Lc\| ≥ 75/);
        // Diagnostic must list all 11 shades
        for (const shade of [
          50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
        ]) {
          expect(msg).toContain(`${shade}=`);
        }
      }
    });
  });

  describe('defaults', () => {
    it('uses ui tier and slate palette and #ffffff background by default', () => {
      const explicit = adjustContrast('#888888', {
        tier: 'ui',
        palette: 'slate',
        background: '#ffffff',
      });
      const implicit = adjustContrast('#888888');
      expect(implicit).toBe(explicit);
    });
  });

  describe('input formats', () => {
    it('accepts oklch() input strings', () => {
      const result = adjustContrast('oklch(0.5 0.2 200)');
      expect(result).toMatch(/^oklch\(/);
    });

    it('accepts rgb() input strings', () => {
      const result = adjustContrast('rgb(255, 100, 50)');
      expect(result).toMatch(/^oklch\(/);
    });
  });
});
