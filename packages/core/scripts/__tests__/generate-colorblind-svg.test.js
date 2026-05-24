import { describe, expect, it } from 'vitest';

import {
  ALL_PALETTES,
  buildSimulatedByVision,
  SHADES,
  VISION_TYPES,
} from '../audit-colorblind.js';
import { renderSvg } from '../generate-colorblind-svg.js';

const colorToken = (value) => ({ $value: value, $type: 'color' });

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

describe('committed-grid pipeline', () => {
  // Distinct hex per shade so pinning + simulation + float→int rounding all
  // produce non-trivial values — the output the CI freshness gate diffs against.
  const FAKE_RAMP = [
    '#f8fafc',
    '#f1f5f9',
    '#e2e8f0',
    '#cbd5e1',
    '#94a3b8',
    '#64748b',
    '#475569',
    '#334155',
    '#1e293b',
    '#0f172a',
    '#020617',
  ];

  function fakePrimitives() {
    const palette = {};
    SHADES.forEach((shade, i) => {
      palette[shade] = colorToken(FAKE_RAMP[i]);
    });
    const out = {};
    for (const name of ALL_PALETTES) out[name] = palette;
    return out;
  }

  // Golden cells pin the parse→pin→simulate→round output the freshness gate
  // diffs against — a grid/simulation/rounding regression fails here first.
  it('pins the simulated float→int cells and renders them as SVG hex', () => {
    const tree = buildSimulatedByVision(fakePrimitives());
    expect(tree.normal.slate['500']).toEqual([100, 116, 139]);
    expect(tree.deuteranopia.slate['500']).toEqual([111, 111, 139]);
    expect(tree.protanopia.slate['500']).toEqual([113, 113, 139]);
    expect(tree.tritanopia.slate['500']).toEqual([97, 119, 119]);
    expect(tree.tritanopia.slate['950']).toEqual([0, 6, 6]);

    const svg = renderSvg(tree);
    expect(svg).toContain('fill="#6f6f8b"'); // deuteranopia slate.500
    expect(svg).toContain('fill="#000606"'); // tritanopia slate.950
  });
});
