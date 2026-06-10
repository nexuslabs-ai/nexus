import { describe, expect, it } from 'vitest';

import { DEFAULT_CODEX_PREFS, prefsToCss, sanitizePrefs } from './codex-prefs';

describe('sanitizePrefs font sizes', () => {
  it('keeps an in-range size', () => {
    expect(sanitizePrefs({ uiFontSize: 18 }).uiFontSize).toBe(18);
  });

  it('clamps an over-range size to the max', () => {
    expect(sanitizePrefs({ uiFontSize: 99 }).uiFontSize).toBe(32);
  });

  it('clamps an under-range size to the min', () => {
    expect(sanitizePrefs({ codeFontSize: 2 }).codeFontSize).toBe(8);
  });

  it('falls back per-field on a non-positive or non-number size', () => {
    expect(sanitizePrefs({ codeFontSize: 0 }).codeFontSize).toBe(
      DEFAULT_CODEX_PREFS.codeFontSize
    );
    expect(sanitizePrefs({ uiFontSize: 'big' }).uiFontSize).toBe(
      DEFAULT_CODEX_PREFS.uiFontSize
    );
  });
});

describe('prefsToCss', () => {
  it('emits each font size with its own per-field fallback (not a shared 14)', () => {
    const css = prefsToCss({
      ...DEFAULT_CODEX_PREFS,
      uiFontSize: 0, // → uiFont default (14)
      codeFontSize: 0, // → codeFont default (12), not 14
    });
    expect(css).toContain('font-size: 14px;');
    expect(css).toContain('font-size: 12px;');
  });
});
