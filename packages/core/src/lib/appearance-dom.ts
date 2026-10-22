import type { NxdsAppearanceState } from './appearance-model';
import {
  createNxdsAppearanceSnapshotFromState,
  NXDS_APPEARANCE_DATA_ATTRS,
  resolveFirstPaint,
  sanitizeNxdsAppearanceSnapshot,
  serializeNxdsAppearanceStateCookie,
} from './appearance-snapshot';

export type NxdsResolvedAppearanceMode = 'light' | 'dark';
export type NxdsAppearanceCookieSameSite = 'Lax' | 'Strict' | 'None';

export interface NxdsAppearanceCookieOptions {
  maxAge?: number;
  path?: string;
  sameSite?: NxdsAppearanceCookieSameSite;
  secure?: boolean | 'auto';
  domain?: string;
}

export interface NxdsAppearancePersistOptions {
  /** localStorage key the first-paint script reads. `false` skips it. */
  storageKey: string | false;
  /** Cookie a server reads to render the saved appearance. `false` skips it. */
  cookieWriteKey?: string | false;
  cookieOptions?: NxdsAppearanceCookieOptions;
}

export const NXDS_APPEARANCE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const THEME_STYLE_ATTR = 'data-nxds-appearance-theme';
const PREFS_STYLE_ATTR = 'data-nxds-appearance-prefs';

export function prefersDarkColorScheme(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false;
  return window.matchMedia(COLOR_SCHEME_QUERY).matches;
}

/** Calls `onChange` when the OS colour scheme flips. Returns the unsubscribe. */
export function watchColorScheme(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {};

  const query = window.matchMedia(COLOR_SCHEME_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

export function resolveNxdsAppearanceMode(
  mode: NxdsAppearanceState['mode'],
  systemPrefersDark: boolean
): NxdsResolvedAppearanceMode {
  if (mode === 'system') return systemPrefersDark ? 'dark' : 'light';
  return mode;
}

/** The appearance saved under `storageKey`, or `fallback` when there is none. */
export function readStoredNxdsAppearance(
  storageKey: string | false,
  fallback: NxdsAppearanceState
): NxdsAppearanceState {
  if (storageKey === false || typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw
      ? sanitizeNxdsAppearanceSnapshot(JSON.parse(raw)).state
      : fallback;
  } catch {
    return fallback;
  }
}

function upsertStyle(attribute: string, css: string): void {
  const styles = Array.from(
    document.querySelectorAll<HTMLStyleElement>(`style[${attribute}]`)
  );
  const style = styles[0] ?? document.createElement('style');

  for (const duplicate of styles.slice(1)) duplicate.remove();

  style.setAttribute(attribute, '');
  style.textContent = css;
  if (!style.parentNode) document.head.appendChild(style);
}

/**
 * Writes the theme to the page: the `.dark` class and mode attributes on
 * `<html>`, and the derived theme and preference styles in `<head>`.
 */
export function applyNxdsAppearance(
  state: NxdsAppearanceState,
  systemPrefersDark: boolean
): void {
  const firstPaint = resolveFirstPaint(
    createNxdsAppearanceSnapshotFromState(state),
    systemPrefersDark
  );
  const root = document.documentElement;

  root.classList.toggle('dark', firstPaint.className === 'dark');
  for (const attr of NXDS_APPEARANCE_DATA_ATTRS) {
    root.setAttribute(attr, firstPaint.dataAttrs[attr]);
  }
  upsertStyle(THEME_STYLE_ATTR, firstPaint.themeCss);
  upsertStyle(PREFS_STYLE_ATTR, firstPaint.prefsCss);
}

/** Undoes `applyNxdsAppearance`. */
export function removeNxdsAppearance(): void {
  document
    .querySelectorAll(`style[${THEME_STYLE_ATTR}], style[${PREFS_STYLE_ATTR}]`)
    .forEach((style) => style.remove());

  const root = document.documentElement;
  root.classList.remove('dark');
  for (const attr of NXDS_APPEARANCE_DATA_ATTRS) root.removeAttribute(attr);
}

function writeStateCookie(
  cookieWriteKey: string,
  state: NxdsAppearanceState,
  options: NxdsAppearanceCookieOptions
): void {
  const secure =
    options.secure === true ||
    (options.secure !== false && window.location.protocol === 'https:');
  const attrs = [
    `Path=${(options.path ?? '/').replace(/[;\r\n]/g, '')}`,
    `SameSite=${options.sameSite ?? 'Lax'}`,
    `Max-Age=${options.maxAge ?? NXDS_APPEARANCE_COOKIE_MAX_AGE_SECONDS}`,
    options.domain ? `Domain=${options.domain.replace(/[;\r\n]/g, '')}` : '',
    secure ? 'Secure' : '',
  ].filter(Boolean);

  document.cookie = `${cookieWriteKey}=${serializeNxdsAppearanceStateCookie(
    state
  )}; ${attrs.join('; ')}`;
}

/** Saves the appearance for the first-paint script and, optionally, the server. */
export function persistNxdsAppearance(
  state: NxdsAppearanceState,
  {
    storageKey,
    cookieWriteKey = false,
    cookieOptions = {},
  }: NxdsAppearancePersistOptions
): void {
  if (storageKey !== false) {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(createNxdsAppearanceSnapshotFromState(state))
      );
    } catch {
      // Storage can fail in privacy modes or quota-constrained embeds.
    }
  }

  if (cookieWriteKey !== false) {
    try {
      writeStateCookie(cookieWriteKey, state, cookieOptions);
    } catch {
      // Cookie writes can fail in locked-down embeds.
    }
  }
}
