import type { CodexThemeContract, ThemeSeeds } from '@nexus/core';

import { DEFAULT_CODEX_CONTRACT } from './codex-contract';

export interface CodexPreset {
  name: string;
  contract: CodexThemeContract;
}

export const CUSTOM_PRESET = 'Custom';

export const CODEX_PRESETS: CodexPreset[] = [
  { name: 'Codex', contract: DEFAULT_CODEX_CONTRACT },
  {
    name: 'Paper',
    contract: {
      appearance: 'light',
      light: {
        accent: '#c2410c',
        background: '#faf9f7',
        foreground: '#1c1917',
      },
      dark: { accent: '#fb923c', background: '#1c1917', foreground: '#faf9f7' },
      contrast: 52,
    },
  },
  {
    name: 'Forest',
    contract: {
      appearance: 'dark',
      light: {
        accent: '#15803d',
        background: '#f5faf6',
        foreground: '#0c1410',
      },
      dark: { accent: '#22c55e', background: '#0c1410', foreground: '#ecfdf5' },
      contrast: 64,
    },
  },
  {
    name: 'Mono',
    contract: {
      appearance: 'dark',
      light: {
        accent: '#475569',
        background: '#ffffff',
        foreground: '#0a0a0a',
      },
      dark: { accent: '#94a3b8', background: '#0a0a0a', foreground: '#fafafa' },
      contrast: 88,
    },
  },
];

function seedsEqual(a: ThemeSeeds, b: ThemeSeeds): boolean {
  return (
    a.accent === b.accent &&
    a.background === b.background &&
    a.foreground === b.foreground
  );
}

function contractsEqual(a: CodexThemeContract, b: CodexThemeContract): boolean {
  return (
    a.appearance === b.appearance &&
    a.contrast === b.contrast &&
    seedsEqual(a.light, b.light) &&
    seedsEqual(a.dark, b.dark)
  );
}

/** Name of the preset matching `contract`, or "Custom" when it's been edited. */
export function activePresetName(contract: CodexThemeContract): string {
  const match = CODEX_PRESETS.find((p) => contractsEqual(p.contract, contract));
  return match ? match.name : CUSTOM_PRESET;
}
