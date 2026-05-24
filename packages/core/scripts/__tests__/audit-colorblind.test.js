import { describe, expect, it } from 'vitest';

import {
  ADJACENT_CONFUSABLE_DELTA_E,
  ALL_PALETTES,
  BASE_PALETTES,
  buildPalettesSrgb,
  buildSimulatedByVision,
  CHART_PALETTES,
  computeDeltaE,
  findConfusableAdjacent,
  findStatusPairConfusable,
  renderSvg,
  SHADES,
  simulatePalette,
  simulateRgb,
  STATUS_PAIRS_600,
  STATUS_PALETTES,
  VISION_TYPES,
} from '../audit-colorblind.js';

const colorToken = (value) => ({ $value: value, $type: 'color' });

function ramp(shades) {
  const out = {};
  for (let i = 0; i < SHADES.length; i += 1) {
    out[SHADES[i]] = shades[i];
  }
  return out;
}

// High-contrast alternating ramp: every adjacent pair is white↔black so APCA
// Lc is ≫ 15 across the board, regardless of the threshold being exercised.
// Used as the "no findings" baseline.
const ALTERNATING_RAMP = ramp([
  [255, 255, 255],
  [0, 0, 0],
  [255, 255, 255],
  [0, 0, 0],
  [255, 255, 255],
  [0, 0, 0],
  [255, 255, 255],
  [0, 0, 0],
  [255, 255, 255],
  [0, 0, 0],
  [255, 255, 255],
]);

describe('constants', () => {
  it('SHADES is the 11-shade Tailwind ramp', () => {
    expect(SHADES).toEqual([
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '950',
    ]);
  });

  it('ALL_PALETTES is base ∪ status ∪ chart with no overlap', () => {
    expect(ALL_PALETTES).toEqual([
      ...BASE_PALETTES,
      ...STATUS_PALETTES,
      ...CHART_PALETTES,
    ]);
    expect(new Set(ALL_PALETTES).size).toBe(ALL_PALETTES.length);
  });

  it('VISION_TYPES starts with normal then 3 dichromacies', () => {
    expect(VISION_TYPES[0]).toBe('normal');
    expect(VISION_TYPES.slice(1)).toEqual([
      'deuteranopia',
      'protanopia',
      'tritanopia',
    ]);
  });

  it('ADJACENT_CONFUSABLE_DELTA_E is the OKLab JND floor (0.02)', () => {
    expect(ADJACENT_CONFUSABLE_DELTA_E).toBe(0.02);
  });

  it('STATUS_PAIRS_600 is the 4-choose-2 of STATUS_PALETTES (derived, no hand-maintenance)', () => {
    const n = STATUS_PALETTES.length;
    expect(STATUS_PAIRS_600).toHaveLength((n * (n - 1)) / 2);
    // every pair is two distinct status palettes
    for (const [a, b] of STATUS_PAIRS_600) {
      expect(STATUS_PALETTES).toContain(a);
      expect(STATUS_PALETTES).toContain(b);
      expect(a).not.toBe(b);
    }
    // no unordered pair repeats
    const keys = STATUS_PAIRS_600.map(([a, b]) => [a, b].sort().join('|'));
    expect(new Set(keys).size).toBe(STATUS_PAIRS_600.length);
  });
});

describe('computeDeltaE', () => {
  it('returns 0 for identical colors', () => {
    expect(computeDeltaE([128, 64, 200], [128, 64, 200])).toBe(0);
  });

  it('returns a positive number for different colors', () => {
    expect(computeDeltaE([255, 0, 0], [0, 255, 0])).toBeGreaterThan(0);
  });

  it('is symmetric (Euclidean)', () => {
    const a = [10, 20, 30];
    const b = [200, 50, 100];
    expect(computeDeltaE(a, b)).toBeCloseTo(computeDeltaE(b, a), 6);
  });
});

describe('buildPalettesSrgb', () => {
  function fakePrimitives() {
    const palette = {};
    for (const shade of SHADES) palette[shade] = colorToken('#808080');
    const out = {};
    for (const name of ALL_PALETTES) out[name] = palette;
    return out;
  }

  it('returns one shade map per palette, each with 11 sRGB tuples', () => {
    const result = buildPalettesSrgb(fakePrimitives());
    expect(Object.keys(result)).toEqual(ALL_PALETTES);
    for (const palette of ALL_PALETTES) {
      expect(Object.keys(result[palette])).toEqual(SHADES);
      for (const shade of SHADES) {
        const ints = result[palette][shade];
        expect(ints).toHaveLength(3);
        expect(
          ints.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)
        ).toBe(true);
      }
    }
  });

  it('throws when a palette is absent from primitives', () => {
    const broken = fakePrimitives();
    delete broken.slate;
    expect(() => buildPalettesSrgb(broken)).toThrow(/palette "slate" missing/);
  });

  it('throws when a single shade is absent from a palette', () => {
    const broken = fakePrimitives();
    delete broken.slate['500'];
    expect(() => buildPalettesSrgb(broken)).toThrow(/slate\.500 missing/);
  });
});

describe('simulateRgb', () => {
  it('returns the input unchanged for vision="normal"', () => {
    expect(simulateRgb([220, 38, 38], 'normal')).toEqual([220, 38, 38]);
  });

  it('returns a 3-tuple of integer sRGB channels', () => {
    const out = simulateRgb([220, 38, 38], 'deuteranopia');
    expect(out).toHaveLength(3);
    expect(out.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)).toBe(
      true
    );
  });

  it('drives red.600 and green.600 toward the same muted yellow-brown under deuteranopia (textbook red-green confusion)', () => {
    const red = simulateRgb([220, 38, 38], 'deuteranopia');
    const green = simulateRgb([22, 163, 74], 'deuteranopia');
    // After simulation the two should share a near-equal R/G ratio (the
    // collapsed channel) — the test of the deutan-confusion phenomenon
    // rather than any specific output value.
    expect(Math.abs(red[0] - red[1])).toBeLessThan(10);
    expect(Math.abs(green[0] - green[1])).toBeLessThan(10);
  });
});

describe('simulatePalette', () => {
  it('returns one simulated tuple per shade key', () => {
    const out = simulatePalette(ALTERNATING_RAMP, 'deuteranopia');
    expect(Object.keys(out)).toEqual(SHADES);
    for (const shade of SHADES) expect(out[shade]).toHaveLength(3);
  });

  it('passes through every value unchanged when vision="normal"', () => {
    const out = simulatePalette(ALTERNATING_RAMP, 'normal');
    for (const shade of SHADES) {
      expect(out[shade]).toEqual(ALTERNATING_RAMP[shade]);
    }
  });
});

describe('buildSimulatedByVision', () => {
  function fakePrimitives() {
    const palette = {};
    for (const shade of SHADES) palette[shade] = colorToken('#808080');
    const out = {};
    for (const name of ALL_PALETTES) out[name] = palette;
    return out;
  }

  it('returns a vision → palette → shade tree of sRGB tuples', () => {
    const tree = buildSimulatedByVision(fakePrimitives());
    expect(Object.keys(tree)).toEqual(VISION_TYPES);
    for (const vision of VISION_TYPES) {
      expect(Object.keys(tree[vision])).toEqual(ALL_PALETTES);
      for (const palette of ALL_PALETTES) {
        expect(Object.keys(tree[vision][palette])).toEqual(SHADES);
        expect(tree[vision][palette]['500']).toHaveLength(3);
      }
    }
  });

  it('leaves the normal-vision section equal to the raw (unsimulated) sRGB', () => {
    const primitives = fakePrimitives();
    const tree = buildSimulatedByVision(primitives);
    expect(tree.normal.slate).toEqual(buildPalettesSrgb(primitives).slate);
  });
});

describe('findConfusableAdjacent', () => {
  it('returns no findings when every adjacent pair has high contrast', () => {
    const findings = findConfusableAdjacent(ALTERNATING_RAMP, 'fake', 'normal');
    expect(findings).toEqual([]);
  });

  it('flags only the one pair that collapses (50≡100) on an otherwise high-contrast ramp', () => {
    const collapsedAt50 = ramp([
      [255, 255, 255], // 50
      [255, 255, 255], // 100 ≡ 50 → ΔE 0 → flagged
      [0, 0, 0],
      [255, 255, 255],
      [0, 0, 0],
      [255, 255, 255],
      [0, 0, 0],
      [255, 255, 255],
      [0, 0, 0],
      [255, 255, 255],
      [0, 0, 0],
    ]);
    const findings = findConfusableAdjacent(
      collapsedAt50,
      'fake',
      'deuteranopia'
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      palette: 'fake',
      visionType: 'deuteranopia',
      shadeA: '50',
      shadeB: '100',
      label: 'fake.50 ↔ fake.100',
    });
    expect(findings[0].deltaE).toBeLessThan(ADJACENT_CONFUSABLE_DELTA_E);
  });

  it('honors a custom threshold (2.0 marks every white↔black pair as below threshold)', () => {
    const findings = findConfusableAdjacent(
      ALTERNATING_RAMP,
      'fake',
      'normal',
      2.0
    );
    expect(findings).toHaveLength(SHADES.length - 1);
  });
});

describe('findStatusPairConfusable', () => {
  function statusPalettes(shade600ColorByPalette) {
    const out = {};
    for (const palette of STATUS_PALETTES) {
      out[palette] = { 600: shade600ColorByPalette[palette] };
    }
    return out;
  }

  it('flags every status pair when all four converge to one color', () => {
    const same = [120, 120, 120];
    const findings = findStatusPairConfusable(
      statusPalettes({ red: same, green: same, amber: same, blue: same }),
      'deuteranopia'
    );
    // 4-choose-2 = 6 pairs; all collapse.
    expect(findings).toHaveLength(6);
    for (const f of findings) {
      expect(f.shade).toBe('600');
      expect(f.visionType).toBe('deuteranopia');
      expect(f.deltaE).toBeLessThan(ADJACENT_CONFUSABLE_DELTA_E);
      expect(f.label).toBe(`${f.paletteA}.600 ↔ ${f.paletteB}.600`);
    }
  });

  it('returns no findings when status colors are well-separated primaries', () => {
    const findings = findStatusPairConfusable(
      statusPalettes({
        red: [255, 0, 0],
        green: [0, 255, 0],
        amber: [255, 200, 0],
        blue: [0, 0, 255],
      }),
      'normal'
    );
    expect(findings).toEqual([]);
  });
});

describe('renderSvg', () => {
  function tinyData() {
    const oneShade = [128, 128, 128];
    const shades = {};
    for (const s of SHADES) shades[s] = oneShade;
    const byVision = {};
    for (const v of VISION_TYPES) {
      byVision[v] = {};
      for (const p of ALL_PALETTES) byVision[v][p] = shades;
    }
    return byVision;
  }

  it('emits a well-formed standalone SVG document', () => {
    const svg = renderSvg(tinyData());
    expect(svg.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });

  it('renders one swatch <rect> per (vision × palette × shade) plus a background rect', () => {
    const svg = renderSvg(tinyData());
    const rectCount = (svg.match(/<rect /g) ?? []).length;
    const expected =
      VISION_TYPES.length * ALL_PALETTES.length * SHADES.length + 1;
    expect(rectCount).toBe(expected);
  });

  it('labels every section, shade, and palette', () => {
    const svg = renderSvg(tinyData());
    expect(svg).toContain('Normal vision');
    expect(svg).toContain('Deuteranopia');
    expect(svg).toContain('Protanopia');
    expect(svg).toContain('Tritanopia');
    for (const palette of ALL_PALETTES) expect(svg).toContain(`>${palette}<`);
    for (const shade of SHADES) expect(svg).toContain(`>${shade}<`);
  });

  it('is deterministic — identical input produces identical output', () => {
    expect(renderSvg(tinyData())).toBe(renderSvg(tinyData()));
  });
});
