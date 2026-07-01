import { existsSync, readdirSync } from 'node:fs';
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
      spacing: 'spacious',
      shadow: 'standard',
      radius: 'smooth',
      borderwidth: 'fine',
    });

    expect(state).toMatchObject({
      base: 'slate',
      brand: 'teal',
      spacing: 'spacious',
      shadow: 'standard',
      radius: 'smooth',
      borderwidth: 'fine',
    });
  });

  it('falls back safely for invalid or legacy values', () => {
    const state = sanitizeThemeState({
      base: '../base-slate',
      brand: 'blue.css',
      spacing: 'nova',
      shadow: 'nova',
      radius: 'smooth',
      borderwidth: 'mira',
    });

    expect(state).toMatchObject({
      ...DEFAULT_THEME_STATE,
      radius: 'smooth',
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

  it('keeps THEME_MODE_VALUES in sync with the shipped core token modes', () => {
    // The docs picker re-encodes the token-mode names; the @nexus_ds/core audit
    // can see the shadow/radius/borderwidth hrefs but NOT spacing (applied via
    // data-density, no /themes file). Bind every rename family to the actual
    // token files so a drifted or typo'd mode is caught. Green today, and after
    // the #546 cutover renames both sides together.
    const coreTokens = join(docsRoot, '..', '..', 'packages', 'core', 'tokens');
    const discover = (dir: string, pattern: RegExp): Set<string> => {
      const modes = new Set<string>();
      for (const file of readdirSync(dir)) {
        const mode = file.match(pattern)?.[1];
        if (mode) modes.add(mode);
      }
      return modes;
    };

    const tokenModes = {
      spacing: discover(
        join(coreTokens, 'semantic'),
        /^spacing-([a-z]+)\.json$/
      ),
      shadow: discover(
        join(coreTokens, 'primitives', 'shadow'),
        /^shadow-([a-z]+)-light\.json$/
      ),
      radius: discover(
        join(coreTokens, 'primitives', 'radius'),
        /^radius-([a-z]+(?:-[a-z]+)*)\.json$/
      ),
      borderwidth: discover(
        join(coreTokens, 'primitives', 'borderwidth'),
        /^borderwidth-([a-z]+)\.json$/
      ),
    };

    for (const family of Object.keys(
      tokenModes
    ) as (keyof typeof tokenModes)[]) {
      expect(new Set<string>(THEME_MODE_VALUES[family]), family).toEqual(
        tokenModes[family]
      );
    }
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
    document.documentElement.removeAttribute('data-density');
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
          borderwidth: 'javascript:alert(1)',
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
    expect(document.documentElement.getAttribute('data-density')).toBe(
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
      [
        'borderwidth',
        THEME_STYLESHEET_HREFS.borderwidth[DEFAULT_THEME_STATE.borderwidth],
      ],
    ]);
  });
});
