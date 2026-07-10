import {
  createNexusAppearanceSnapshotFromState,
  DEFAULT_NEXUS_APPEARANCE,
  type NexusAppearanceState,
} from '@nexus_ds/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DOCS_APPEARANCE_BOOTSTRAP_SCRIPT } from '../../theme-csp';

import {
  DOCS_APPEARANCE_DEFAULT_STATE,
  DOCS_APPEARANCE_STORAGE_KEY,
  getThemeModeValue,
  sanitizeMode,
  THEME_MODE_OPTIONS,
  type ThemeMode,
  updateThemeMode,
} from './appearance-controls';

function mockSystemPrefersDark(matches: boolean): void {
  const mediaQuery: MediaQueryList = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  };
  window.matchMedia = vi.fn(() => mediaQuery);
}

describe('docs appearance controls', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-density');
    document.documentElement.removeAttribute('data-radius');
    document.documentElement.removeAttribute('data-shadow');
    document.documentElement.removeAttribute('data-borderwidth');
    document.documentElement.style.colorScheme = '';
    document
      .querySelectorAll(
        'meta[name="color-scheme"], style[data-nexus-appearance-theme], style[data-nexus-appearance-prefs]'
      )
      .forEach((node) => node.remove());
  });

  it('defaults docs to provider system mode with the documented default values', () => {
    expect(DOCS_APPEARANCE_DEFAULT_STATE).toMatchObject({
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'system',
      surfaceTone: 'stone',
      density: 'default',
      elevation: 'quiet',
      corners: 'square',
      stroke: 'normal',
    });
  });

  it('maps the docs controls onto provider state fields', () => {
    const state: NexusAppearanceState = {
      ...DOCS_APPEARANCE_DEFAULT_STATE,
      mode: 'light',
    };

    const updates = [
      ['mode', 'dark'],
      ['base', 'slate'],
      ['spacing', 'spacious'],
      ['shadow', 'standard'],
      ['radius', 'smooth'],
      ['borderwidth', 'fine'],
    ] as const satisfies readonly (readonly [ThemeMode, string])[];

    const updated = updates.reduce<NexusAppearanceState>(
      (current, [mode, value]) => updateThemeMode(current, mode, value),
      state
    );

    expect(updated).toMatchObject({
      mode: 'dark',
      surfaceTone: 'slate',
      density: 'spacious',
      elevation: 'standard',
      corners: 'smooth',
      stroke: 'fine',
    });
    expect('borderwidth' in updated).toBe(false);
  });

  it('falls back safely for invalid interactive values', () => {
    const state = updateThemeMode(
      {
        ...DOCS_APPEARANCE_DEFAULT_STATE,
        surfaceTone: 'slate',
      },
      'base',
      'not-a-tone'
    );

    expect(state.surfaceTone).toBe(DOCS_APPEARANCE_DEFAULT_STATE.surfaceTone);
    expect(sanitizeMode('borderwidth', 'javascript:alert(1)')).toBe(
      DOCS_APPEARANCE_DEFAULT_STATE.stroke
    );
  });

  it('keeps options aligned with provider mode names', () => {
    expect(THEME_MODE_OPTIONS.mode.map((option) => option.value)).toEqual([
      'system',
      'light',
      'dark',
    ]);
    expect(
      THEME_MODE_OPTIONS.borderwidth.map((option) => option.value)
    ).toEqual(['fine', 'normal', 'strong']);
    expect(
      getThemeModeValue(
        { ...DOCS_APPEARANCE_DEFAULT_STATE, stroke: 'strong' },
        'borderwidth'
      )
    ).toBe('strong');
  });

  it('uses the provider bootstrap script and docs storage key for CSP', () => {
    expect(DOCS_APPEARANCE_BOOTSTRAP_SCRIPT).toContain(
      DOCS_APPEARANCE_STORAGE_KEY
    );
    expect(DOCS_APPEARANCE_BOOTSTRAP_SCRIPT).not.toContain(
      'data-nexus-theme-bootstrap'
    );
  });

  it('preserves system dark first paint when no docs provider snapshot is stored', () => {
    mockSystemPrefersDark(true);

    new Function(DOCS_APPEARANCE_BOOTSTRAP_SCRIPT)();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(document.documentElement.getAttribute('data-density')).toBe(
      DOCS_APPEARANCE_DEFAULT_STATE.density
    );
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
        ?.content
    ).toBe('light dark');
  });

  it('uses a stored docs provider snapshot when present', () => {
    const storedState = {
      ...DOCS_APPEARANCE_DEFAULT_STATE,
      mode: 'dark',
      surfaceTone: 'slate',
      density: 'spacious',
      corners: 'smooth',
      elevation: 'standard',
      stroke: 'strong',
    } satisfies NexusAppearanceState;

    window.localStorage.setItem(
      DOCS_APPEARANCE_STORAGE_KEY,
      JSON.stringify(createNexusAppearanceSnapshotFromState(storedState))
    );

    new Function(DOCS_APPEARANCE_BOOTSTRAP_SCRIPT)();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'spacious'
    );
    expect(document.documentElement.getAttribute('data-radius')).toBe('smooth');
    expect(document.documentElement.getAttribute('data-shadow')).toBe(
      'standard'
    );
    expect(document.documentElement.getAttribute('data-borderwidth')).toBe(
      'strong'
    );
    expect(
      document.querySelector('style[data-nexus-appearance-theme]')?.textContent
    ).toContain('--nx-color-background');
  });
});
