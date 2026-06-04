import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_THEME_STATE,
  getThemeStylesheetHref,
  sanitizeMode,
  sanitizeStoredColorScheme,
  sanitizeThemeState,
  THEME_MODE_VALUES,
  THEME_STYLESHEET_MODE_KEYS,
} from './theme-modes';

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('docs theme modes', () => {
  it('keeps valid theme state values', () => {
    const state = sanitizeThemeState({
      base: 'slate',
      brand: 'teal',
      spacing: 'sera',
      typography: 'nova',
      shadow: 'mira',
      radius: 'smooth',
      borderwidth: 'maia',
    });

    expect(state).toMatchObject({
      base: 'slate',
      brand: 'teal',
      spacing: 'sera',
      typography: 'nova',
      shadow: 'mira',
      radius: 'smooth',
      borderwidth: 'maia',
    });
  });

  it('falls back safely for invalid or legacy values', () => {
    const state = sanitizeThemeState({
      base: '../base-slate',
      brand: 'blue.css',
      spacing: 'compact',
      typography: null,
      shadow: 'nova',
      radius: 'smooth',
      borderwidth: 'mira',
    });

    expect(state).toMatchObject({
      ...DEFAULT_THEME_STATE,
      shadow: 'nova',
      radius: 'smooth',
      borderwidth: 'mira',
    });
  });

  it('sanitizes interactive updates before building stylesheet hrefs', () => {
    expect(sanitizeMode('brand', 'pink')).toBe('pink');
    expect(sanitizeMode('brand', '/themes/brands-pink.css')).toBe(
      DEFAULT_THEME_STATE.brand
    );
    expect(getThemeStylesheetHref('brand', '/themes/brands-pink.css')).toBe(
      '/themes/brands-blue.css'
    );
  });

  it('maps every allowlisted stylesheet mode to an existing file', () => {
    for (const mode of THEME_STYLESHEET_MODE_KEYS) {
      for (const value of THEME_MODE_VALUES[mode]) {
        const href = getThemeStylesheetHref(mode, value);
        const filePath = join(docsRoot, 'public', href.slice(1));

        expect(existsSync(filePath), `${mode}:${value} -> ${href}`).toBe(true);
      }
    }
  });

  it('keeps stored dark mode values narrow', () => {
    expect(sanitizeStoredColorScheme('dark')).toBe('dark');
    expect(sanitizeStoredColorScheme('light')).toBe('light');
    expect(sanitizeStoredColorScheme('auto')).toBeNull();
  });
});
