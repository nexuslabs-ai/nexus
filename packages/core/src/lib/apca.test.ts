import { describe, expect, it } from 'vitest';

import { blendAlphaOver, resolveToSrgbInts } from './apca';

// The over-operator behind alpha-foreground contrast scoring (#249): an
// alpha color is composited onto its resolved backdrop before APCA reads it.
// These pin the math directly so a swapped operand or a /256-vs-/255 slip
// cannot hide behind high real-world pair margins.
describe('blendAlphaOver', () => {
  it('composites 50%-alpha black over white to mid grey (round(255*(1-128/255)) = 127)', () => {
    expect(blendAlphaOver('#00000080', [255, 255, 255])).toEqual([
      127, 127, 127,
    ]);
  });

  it('composites 50%-alpha white over black to mid grey (round(255*128/255) = 128)', () => {
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
    expect(resolveToSrgbInts('oklch(1 0 0)')).toEqual([255, 255, 255]);
    expect(resolveToSrgbInts('oklch(0 0 0)')).toEqual([0, 0, 0]);
    expect(resolveToSrgbInts('oklch(0.1624 0.04 264.7)')).toEqual([6, 13, 31]);
  });

  it('requires a backdrop for alpha OKLCH semantic literals', () => {
    expect(() => resolveToSrgbInts('oklch(1 0 0 / 0.5)')).toThrow(
      'needs a backdrop to composite against'
    );
    expect(
      resolveToSrgbInts('oklch(1 0 0 / 0.5)', undefined, [0, 0, 0])
    ).toEqual([128, 128, 128]);
  });
});
