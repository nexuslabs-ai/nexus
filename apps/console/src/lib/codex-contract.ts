import { type CodexThemeContract, isColor, type ThemeSeeds } from '@nexus/core';

/** Codex's own Appearance values — the default derived theme (dogfood). */
export const DEFAULT_CODEX_CONTRACT: CodexThemeContract = {
  appearance: 'dark',
  light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
  dark: { accent: '#339cff', background: '#181818', foreground: '#ffffff' },
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

/** Read the persisted contract, or null = preset path active. Never throws. */
export function loadCodexContract(): CodexThemeContract | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeContract(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Persist the contract, or clear it when null. Never throws. */
export function saveCodexContract(contract: CodexThemeContract | null): void {
  try {
    if (contract) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contract));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage failures (private mode, quota)
  }
}
