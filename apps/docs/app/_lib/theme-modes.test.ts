import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { DOCS_THEME_BOOTSTRAP_SCRIPT } from './theme-bootstrap-script';
import {
  DEFAULT_THEME_STATE,
  DOCS_DARK_MODE_STORAGE_KEY,
  DOCS_THEME_STORAGE_KEY,
  getThemeStylesheetHref,
  sanitizeMode,
  sanitizeStoredColorScheme,
  sanitizeThemeState,
  THEME_MODE_VALUES,
  THEME_STYLESHEET_HREFS,
  THEME_STYLESHEET_MODE_KEYS,
} from './theme-modes';

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('docs theme modes', () => {
  it('keeps valid theme state values', () => {
    const state = sanitizeThemeState({
      base: 'slate',
      brand: 'teal',
      spacing: 'sera',
      shadow: 'mira',
      radius: 'smooth',
      borderwidth: 'maia',
    });

    expect(state).toMatchObject({
      base: 'slate',
      brand: 'teal',
      spacing: 'sera',
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
      '/themes/brands-black.css'
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

  it('executes the bootstrap script with sanitized persisted theme values', () => {
    localStorage.clear();
    document.head.replaceChildren();
    document.documentElement.removeAttribute('data-style');
    document.documentElement.classList.remove('dark');

    localStorage.setItem(
      DOCS_THEME_STORAGE_KEY,
      JSON.stringify({
        state: {
          base: '../base-slate',
          brand: '/themes/brands-pink.css',
          spacing: 'sera);document.body.innerHTML=""',
          shadow: 'javascript:alert(1)',
          radius: 'smooth',
          borderwidth: 'mira',
        },
      })
    );
    localStorage.setItem(DOCS_DARK_MODE_STORAGE_KEY, 'javascript:alert(1)');

    window.eval(DOCS_THEME_BOOTSTRAP_SCRIPT);

    expect(
      document.head
        .querySelector<HTMLLinkElement>('link:not([data-theme])')
        ?.getAttribute('href')
    ).toBe('/themes/focus-default.css');
    expect(document.documentElement.getAttribute('data-style')).toBe(
      DEFAULT_THEME_STATE.spacing
    );
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    const themeLinks = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>('link[data-theme]')
    );

    expect(
      themeLinks.map((link) => [link.dataset.theme, link.getAttribute('href')])
    ).toEqual([
      ['base', THEME_STYLESHEET_HREFS.base[DEFAULT_THEME_STATE.base]],
      ['brand', THEME_STYLESHEET_HREFS.brand[DEFAULT_THEME_STATE.brand]],
      ['shadow', THEME_STYLESHEET_HREFS.shadow[DEFAULT_THEME_STATE.shadow]],
      ['radius', THEME_STYLESHEET_HREFS.radius.smooth],
      ['borderwidth', THEME_STYLESHEET_HREFS.borderwidth.mira],
    ]);
  });
});
