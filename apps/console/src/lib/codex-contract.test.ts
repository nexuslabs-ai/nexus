import { describe, expect, it } from 'vitest';

import { BASE_TONE_SEEDS } from './appearance-theme';
import { DEFAULT_CODEX_CONTRACT, sanitizeContract } from './codex-contract';

const VALID = {
  appearance: 'light' as const,
  surfaceTone: 'neutral' as const,
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

  it('drops an invalid surface tone to the default, keeping valid seeds', () => {
    const result = sanitizeContract({ ...VALID, surfaceTone: 'purple' });
    expect(result.surfaceTone).toBe(DEFAULT_CODEX_CONTRACT.surfaceTone);
    expect(result.light).toEqual(VALID.light);
    expect(result.dark).toEqual(VALID.dark);
  });

  it('drops a prototype-chain key as the surface tone', () => {
    // `'toString' in BASE_TONE_SEEDS` is true (inherited); the own-property check
    // rejects it, so a crafted value can't slip through and crash the engine.
    const result = sanitizeContract({ ...VALID, surfaceTone: 'toString' });
    expect(result.surfaceTone).toBe(DEFAULT_CODEX_CONTRACT.surfaceTone);
  });

  it('infers surface tone from legacy saved seed blocks', () => {
    const legacy = {
      appearance: 'dark' as const,
      light: { accent: '#339cff', ...BASE_TONE_SEEDS.slate.light },
      dark: { accent: '#339cff', ...BASE_TONE_SEEDS.slate.dark },
      contrast: 60,
    };

    expect(sanitizeContract(legacy).surfaceTone).toBe('slate');
  });

  it('falls back on a non-object payload', () => {
    expect(sanitizeContract(null)).toEqual(DEFAULT_CODEX_CONTRACT);
    expect(sanitizeContract('nope')).toEqual(DEFAULT_CODEX_CONTRACT);
  });
});
