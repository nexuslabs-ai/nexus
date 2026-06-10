import { describe, expect, it } from 'vitest';

import { DEFAULT_CODEX_CONTRACT, sanitizeContract } from './codex-contract';

const VALID = {
  appearance: 'light' as const,
  light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
  dark: { accent: '#339cff', background: '#181818', foreground: '#ffffff' },
  contrast: 55,
};

describe('sanitizeContract', () => {
  it('passes a fully valid contract through unchanged', () => {
    expect(sanitizeContract(VALID)).toEqual(VALID);
  });

  it('rejects an unparseable seed and falls back to the default', () => {
    const bad = { ...VALID, light: { ...VALID.light, accent: 'not-a-color' } };
    expect(sanitizeContract(bad)).toEqual(DEFAULT_CODEX_CONTRACT);
  });

  it('rejects an empty-string seed', () => {
    const bad = { ...VALID, dark: { ...VALID.dark, background: '' } };
    expect(sanitizeContract(bad)).toEqual(DEFAULT_CODEX_CONTRACT);
  });

  it('clamps an out-of-range contrast to the default, keeping valid seeds', () => {
    const result = sanitizeContract({ ...VALID, contrast: 999 });
    expect(result.contrast).toBe(DEFAULT_CODEX_CONTRACT.contrast);
    expect(result.light).toEqual(VALID.light);
  });

  it('falls back on a non-object payload', () => {
    expect(sanitizeContract(null)).toEqual(DEFAULT_CODEX_CONTRACT);
    expect(sanitizeContract('nope')).toEqual(DEFAULT_CODEX_CONTRACT);
  });
});
