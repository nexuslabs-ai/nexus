import { describe, expect, it } from 'vitest';

import {
  blendAlphaOver,
  formatLine,
  resolveToSrgbInts,
} from '../audit-contrast.js';

// The over-operator behind alpha-foreground contrast scoring (#249): an
// 8-digit hex is composited onto its resolved backdrop before APCA reads it.
// The full audit exercises this only transitively, so these pin the math
// directly — a swapped operand or a /256-vs-/255 slip would still "pass
// 440/440" as long as every real pair stayed above threshold. Expected
// triples are hand-computed: out = round(fg·a + bg·(1−a)) per channel,
// with a = byte / 255.
describe('blendAlphaOver', () => {
  it('composites 50%-alpha black over white to mid grey (round(255·(1−128/255)) = 127)', () => {
    expect(blendAlphaOver('#00000080', [255, 255, 255])).toEqual([
      127, 127, 127,
    ]);
  });

  it('composites 50%-alpha white over black to mid grey (round(255·128/255) = 128)', () => {
    expect(blendAlphaOver('#ffffff80', [0, 0, 0])).toEqual([128, 128, 128]);
  });

  it('ignores the backdrop when the foreground is fully opaque (a = 1)', () => {
    expect(blendAlphaOver('#000000ff', [255, 255, 255])).toEqual([0, 0, 0]);
  });

  it('returns the backdrop unchanged when the foreground is fully transparent (a = 0)', () => {
    expect(blendAlphaOver('#ffffff00', [10, 20, 30])).toEqual([10, 20, 30]);
  });

  it('blends each channel independently (red over blue at 50%)', () => {
    expect(blendAlphaOver('#ff000080', [0, 0, 255])).toEqual([128, 0, 127]);
  });
});

describe('resolveToSrgbInts', () => {
  it('accepts direct OKLCH semantic literals', () => {
    expect(resolveToSrgbInts('oklch(1 0 0)', new Map())).toEqual([
      255, 255, 255,
    ]);
    expect(resolveToSrgbInts('oklch(0 0 0)', new Map())).toEqual([0, 0, 0]);
    expect(resolveToSrgbInts('oklch(0.1624 0.04 264.7)', new Map())).toEqual([
      6, 13, 31,
    ]);
  });

  it('requires a backdrop for alpha OKLCH semantic literals', () => {
    expect(() => resolveToSrgbInts('oklch(1 0 0 / 0.5)', new Map())).toThrow(
      'needs a backdrop to composite against'
    );
    expect(
      resolveToSrgbInts('oklch(1 0 0 / 0.5)', new Map(), [0, 0, 0])
    ).toEqual([128, 128, 128]);
  });
});

// Pins the textual contract `contrast-auditor` agent's parser relies on:
// 2-space prefix + mark + label padded to 48 + ` Lc ` + 6-char Lc + tail.
// Drift here silently breaks the agent — see .claude/agents/contrast-auditor.md
// § 4 "Parse with streaming-header tracking" for the exact layout.
describe('formatLine', () => {
  it('snapshots the FAIL line layout', () => {
    expect(
      formatLine(false, 'foreground ↔ background', -45.3, 75, 'body')
    ).toMatchInlineSnapshot(
      `"  ✗ foreground ↔ background                          Lc  -45.3   FAIL (< 75, body)"`
    );
  });

  it('snapshots the pass line layout', () => {
    expect(
      formatLine(true, 'muted-foreground ↔ muted', 52.1, 45, 'incidental')
    ).toMatchInlineSnapshot(
      `"  ✓ muted-foreground ↔ muted                         Lc   52.1   (≥ 45, incidental)"`
    );
  });

  it('preserves the 2-space prefix, label region, and Lc anchor', () => {
    const line = formatLine(false, 'a ↔ b', -10, 60, 'ui');
    expect(line.startsWith('  ✗ ')).toBe(true);
    // `  ${mark} ` (4 chars) + label.padEnd(48) + ` Lc ` → ' Lc ' at index 52
    expect(line.indexOf(' Lc ')).toBe(52);
    expect(line).toContain('FAIL (< 60, ui)');
  });
});
