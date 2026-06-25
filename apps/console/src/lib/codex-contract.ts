import { type CodexThemeContract, isColor, type ThemeSeeds } from '@nexus/core';

import { BASE_TONE_SEEDS, DEFAULT_BRAND_COLOR } from './appearance-theme';

const DEFAULT_BASE_TONE = BASE_TONE_SEEDS.stone;

/** Codex's own Appearance values — the default derived theme (dogfood). */
export const DEFAULT_CODEX_CONTRACT: CodexThemeContract = {
  appearance: 'dark',
  light: { accent: DEFAULT_BRAND_COLOR, ...DEFAULT_BASE_TONE.light },
  dark: { accent: DEFAULT_BRAND_COLOR, ...DEFAULT_BASE_TONE.dark },
  contrast: 60,
};

const STORAGE_KEY = 'nexus-console-codex-contract';

function isSeeds(value: unknown): value is ThemeSeeds {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.accent === 'string' &&
    isColor(o.accent) &&
    typeof o.background === 'string' &&
    isColor(o.background) &&
    typeof o.foreground === 'string' &&
    isColor(o.foreground)
  );
}

/** Coerce an unknown payload into a valid contract, falling back to the default. */
export function sanitizeContract(raw: unknown): CodexThemeContract {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_CODEX_CONTRACT;
  const o = raw as Record<string, unknown>;
  if (!isSeeds(o.light) || !isSeeds(o.dark)) return DEFAULT_CODEX_CONTRACT;
  const appearance =
    o.appearance === 'light' ||
    o.appearance === 'dark' ||
    o.appearance === 'system'
      ? o.appearance
      : DEFAULT_CODEX_CONTRACT.appearance;
  const contrast =
    typeof o.contrast === 'number' && o.contrast >= 0 && o.contrast <= 100
      ? o.contrast
      : DEFAULT_CODEX_CONTRACT.contrast;
  return { appearance, light: o.light, dark: o.dark, contrast };
}

/** Read the persisted contract. Never throws. */
export function loadCodexContract(): CodexThemeContract {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeContract(JSON.parse(raw)) : DEFAULT_CODEX_CONTRACT;
  } catch {
    return DEFAULT_CODEX_CONTRACT;
  }
}

/** Persist the active contract. Never throws. */
export function saveCodexContract(contract: CodexThemeContract): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contract));
  } catch {
    // ignore storage failures (private mode, quota)
  }
}
