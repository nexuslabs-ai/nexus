import { describe, expect, it } from 'vitest';

import { diffTokenTrees, parseArgs } from '../audit-figma-parity.js';

const colorToken = (value) => ({ $value: value, $type: 'color' });
const dimToken = (value) => ({
  $value: { value, unit: 'px' },
  $type: 'dimension',
});

describe('diffTokenTrees', () => {
  it('returns no findings when trees match exactly', () => {
    const tree = { blue: { 500: colorToken('#3b82f6') } };
    expect(diffTokenTrees(tree, tree)).toEqual([]);
  });

  it('returns no findings when trees are both empty', () => {
    expect(diffTokenTrees({}, {})).toEqual([]);
  });

  it('reports value-mismatch when $value differs at the same path', () => {
    const code = { blue: { 500: colorToken('#3b82f6') } };
    const figma = { blue: { 500: colorToken('#1d4ed8') } };
    const findings = diffTokenTrees(code, figma);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      path: 'blue.500',
      kind: 'value-mismatch',
      code: { value: '#3b82f6' },
      figma: { value: '#1d4ed8' },
    });
  });

  it('treats hex values as case-insensitive (no drift on case alone)', () => {
    const code = { blue: { 500: colorToken('#3b82f6') } };
    const figma = { blue: { 500: colorToken('#3B82F6') } };
    expect(diffTokenTrees(code, figma)).toEqual([]);
  });

  it('reports missing-in-figma when token exists in code only', () => {
    const code = {
      blue: { 500: colorToken('#3b82f6'), 600: colorToken('#2563eb') },
    };
    const figma = { blue: { 500: colorToken('#3b82f6') } };
    const findings = diffTokenTrees(code, figma);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      path: 'blue.600',
      kind: 'missing-in-figma',
      code: { value: '#2563eb' },
    });
  });

  it('reports missing-in-code when token exists in snapshot only', () => {
    const code = { blue: { 500: colorToken('#3b82f6') } };
    const figma = {
      blue: { 500: colorToken('#3b82f6'), 600: colorToken('#2563eb') },
    };
    const findings = diffTokenTrees(code, figma);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      path: 'blue.600',
      kind: 'missing-in-code',
      figma: { value: '#2563eb' },
    });
  });

  it('reports type-mismatch when $type differs at the same path', () => {
    const code = { blue: { 500: colorToken('#3b82f6') } };
    const figma = { blue: { 500: dimToken(4) } };
    const findings = diffTokenTrees(code, figma);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      path: 'blue.500',
      kind: 'type-mismatch',
      code: { type: 'color' },
      figma: { type: 'dimension' },
    });
  });

  it('does not lowercase non-color values', () => {
    const code = { font: { sans: { $value: 'Inter', $type: 'fontFamily' } } };
    const figma = { font: { sans: { $value: 'INTER', $type: 'fontFamily' } } };
    const findings = diffTokenTrees(code, figma);
    expect(findings).toHaveLength(1);
    expect(findings[0].kind).toBe('value-mismatch');
  });

  it('walks nested palettes and surfaces every drift', () => {
    const code = {
      blue: { 500: colorToken('#3b82f6'), 600: colorToken('#2563eb') },
      red: { 500: colorToken('#ef4444') },
    };
    const figma = {
      blue: { 500: colorToken('#3b82f6'), 600: colorToken('#1d4ed8') },
      red: { 500: colorToken('#dc2626') },
    };
    const findings = diffTokenTrees(code, figma);
    expect(findings.map((f) => f.path)).toEqual(['blue.600', 'red.500']);
    expect(findings.every((f) => f.kind === 'value-mismatch')).toBe(true);
  });

  it('sorts findings by path for stable output', () => {
    const code = {
      red: { 500: colorToken('#ef4444') },
      blue: { 500: colorToken('#3b82f6') },
      green: { 500: colorToken('#22c55e') },
    };
    const figma = {
      red: { 500: colorToken('#dc2626') },
      blue: { 500: colorToken('#1d4ed8') },
      green: { 500: colorToken('#16a34a') },
    };
    const findings = diffTokenTrees(code, figma);
    expect(findings.map((f) => f.path)).toEqual([
      'blue.500',
      'green.500',
      'red.500',
    ]);
  });

  it('preserves alpha-bearing hex differences', () => {
    const code = { overlay: colorToken('#000000cc') };
    const figma = { overlay: colorToken('#00000099') };
    const findings = diffTokenTrees(code, figma);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      kind: 'value-mismatch',
      code: { value: '#000000cc' },
      figma: { value: '#00000099' },
    });
  });

  it('reports no drift when dimension values match', () => {
    const code = { size: { 4: dimToken(16) } };
    const figma = { size: { 4: dimToken(16) } };
    expect(diffTokenTrees(code, figma)).toEqual([]);
  });

  it('reports value-mismatch for differing dimensions, with canonical string values', () => {
    const code = { size: { 4: dimToken(16) } };
    const figma = { size: { 4: dimToken(20) } };
    const findings = diffTokenTrees(code, figma);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      path: 'size.4',
      kind: 'value-mismatch',
      code: { value: '16px' },
      figma: { value: '20px' },
    });
  });

  it('skips DTCG metadata keys ($-prefixed) on either side', () => {
    const code = {
      blue: { 500: colorToken('#3b82f6') },
    };
    const figma = {
      $meta: { capturedAt: '2026-05-21' },
      blue: { 500: colorToken('#3b82f6') },
    };
    expect(diffTokenTrees(code, figma)).toEqual([]);
  });

  it('reports independent findings of all four kinds simultaneously, sorted by path', () => {
    const code = {
      blue: { 500: colorToken('#3b82f6'), 600: colorToken('#2563eb') },
      red: { 500: dimToken(8) },
      green: { 500: colorToken('#22c55e') },
    };
    const figma = {
      blue: { 500: colorToken('#1d4ed8'), 600: colorToken('#2563eb') },
      red: { 500: colorToken('#dc2626') },
      yellow: { 500: colorToken('#eab308') },
    };
    const findings = diffTokenTrees(code, figma);
    expect(findings.map((f) => f.path)).toEqual([
      'blue.500',
      'green.500',
      'red.500',
      'yellow.500',
    ]);
    expect(findings.map((f) => f.kind)).toEqual([
      'value-mismatch',
      'missing-in-figma',
      'type-mismatch',
      'missing-in-code',
    ]);
  });

  it('throws when an object value reaches an unsupported $type (locks contract before composite categories land)', () => {
    const code = {
      body: {
        $value: { fontFamily: 'Inter', fontSize: '16px' },
        $type: 'typography',
      },
    };
    expect(() => diffTokenTrees(code, {})).toThrow(/object value for \$type/);
  });
});

describe('parseArgs', () => {
  it('parses --key value form', () => {
    expect(parseArgs(['--category', 'color']).category).toBe('color');
  });

  it('parses --key=value form', () => {
    expect(parseArgs(['--category=color']).category).toBe('color');
  });

  it("does not consume a following --flag as the prior flag's value", () => {
    const args = parseArgs(['--category', '--snapshot', 'foo.json']);
    expect(args.category).toBe(null);
    expect(args.snapshot).toBe('foo.json');
  });

  it('handles a trailing bare --flag without crashing', () => {
    const args = parseArgs(['--category']);
    expect(args.category).toBe(null);
  });
});
