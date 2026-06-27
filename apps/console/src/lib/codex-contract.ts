import {
  isColor,
  type NexusSurfaceTone,
  type NexusThemeContract,
  type ThemeSeeds,
} from '@nexus/core';

import { BASE_TONE_SEEDS, DEFAULT_BRAND_COLOR } from './appearance-theme';

const DEFAULT_BASE_TONE = BASE_TONE_SEEDS.stone;
export const DEFAULT_SURFACE_TONE: NexusSurfaceTone = 'stone';

/** Codex's own Appearance values — the default derived theme (dogfood). */
export const DEFAULT_CODEX_CONTRACT: NexusThemeContract = {
  appearance: 'dark',
  surfaceTone: DEFAULT_SURFACE_TONE,
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

function isSurfaceTone(value: unknown): value is NexusSurfaceTone {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(BASE_TONE_SEEDS, value)
  );
}

function sameSeeds(a: ThemeSeeds, b: Omit<ThemeSeeds, 'accent'>): boolean {
  return a.background === b.background && a.foreground === b.foreground;
}

function surfaceToneFromSeeds(
  light: ThemeSeeds,
  dark: ThemeSeeds
): NexusSurfaceTone {
  for (const [tone, seeds] of Object.entries(BASE_TONE_SEEDS)) {
    if (sameSeeds(light, seeds.light) && sameSeeds(dark, seeds.dark)) {
      return tone as NexusSurfaceTone;
    }
  }
  return DEFAULT_SURFACE_TONE;
}

/** Coerce an unknown payload into a valid contract, falling back to the default. */
export function sanitizeContract(raw: unknown): NexusThemeContract {
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
  const surfaceTone = isSurfaceTone(o.surfaceTone)
    ? o.surfaceTone
    : surfaceToneFromSeeds(o.light, o.dark);
  return { appearance, surfaceTone, light: o.light, dark: o.dark, contrast };
}

/** Read the persisted contract. Never throws. */
export function loadCodexContract(): NexusThemeContract {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeContract(JSON.parse(raw)) : DEFAULT_CODEX_CONTRACT;
  } catch {
    return DEFAULT_CODEX_CONTRACT;
  }
}

/** Persist the active contract. Never throws. */
export function saveCodexContract(contract: NexusThemeContract): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contract));
  } catch {
    // ignore storage failures (private mode, quota)
  }
}
