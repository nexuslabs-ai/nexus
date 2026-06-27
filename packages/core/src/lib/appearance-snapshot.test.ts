import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  appearancePrefsToCss,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import {
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshot,
  resolveFirstPaint,
  sanitizeNexusAppearanceSnapshot,
  SNAPSHOT_VERSION,
} from './appearance-snapshot';
import { deriveTheme, themeToCss } from './derive-theme';

function themeCss(state = DEFAULT_NEXUS_APPEARANCE): string {
  return themeToCss(deriveTheme(createNexusThemeContract(state)));
}

function prefsCss(state = DEFAULT_NEXUS_APPEARANCE): string {
  return appearancePrefsToCss(state.prefs);
}

describe('NexusAppearanceSnapshot', () => {
  it('stores pre-derived CSS verbatim', () => {
    const theme = themeCss();
    const prefs = prefsCss();
    const snapshot = createNexusAppearanceSnapshot(
      DEFAULT_NEXUS_APPEARANCE,
      theme,
      prefs
    );

    expect(snapshot).toEqual({
      version: SNAPSHOT_VERSION,
      state: DEFAULT_NEXUS_APPEARANCE,
      themeCss: theme,
      prefsCss: prefs,
    });
  });

  it('recovers state on version mismatch and refreshes the stale CSS cache', () => {
    const dark = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark' as const,
      brandColor: '#ff0000',
    };
    const snapshot = sanitizeNexusAppearanceSnapshot({
      version: 999,
      state: dark,
      themeCss: 'STALE',
      prefsCss: 'STALE',
    });

    expect(snapshot.version).toBe(SNAPSHOT_VERSION);
    expect(snapshot.state).toEqual(dark);
    expect(snapshot.themeCss).toBe(themeCss(dark));
    expect(snapshot.prefsCss).toBe(prefsCss(dark));
  });

  it('resets to the default snapshot on unreadable payloads', () => {
    const snapshot = sanitizeNexusAppearanceSnapshot('garbage');

    expect(snapshot.state).toEqual(DEFAULT_NEXUS_APPEARANCE);
    expect(snapshot.themeCss).toBe(themeCss());
    expect(snapshot.prefsCss).toBe(prefsCss());
  });

  it('does not treat a raw Phase B state object as a snapshot payload', () => {
    const snapshot = sanitizeNexusAppearanceSnapshot({
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark',
    });

    expect(snapshot.state).toEqual(DEFAULT_NEXUS_APPEARANCE);
  });
});

describe('resolveFirstPaint', () => {
  const snapshotFor = (state = DEFAULT_NEXUS_APPEARANCE) =>
    createNexusAppearanceSnapshot(state, 'THEME', 'PREFS');

  it('resolves pinned dark mode concretely', () => {
    const result = resolveFirstPaint(
      snapshotFor({ ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' }),
      false
    );

    expect(result.className).toBe('dark');
    expect(result.colorScheme).toBe('dark');
    expect(result.metaColorScheme).toBe('dark');
    expect(result.dataAttrs).toEqual({
      'data-style': 'mira',
      'data-radius': 'sharp',
      'data-shadow': 'maia',
      'data-borderwidth': 'vega',
    });
  });

  it('resolves system mode from the OS preference and keeps meta dual-scheme', () => {
    const result = resolveFirstPaint(
      snapshotFor({ ...DEFAULT_NEXUS_APPEARANCE, mode: 'system' }),
      true
    );

    expect(result.className).toBe('dark');
    expect(result.colorScheme).toBe('dark');
    expect(result.metaColorScheme).toBe('light dark');
  });

  it('passes snapshot CSS through without derivation', () => {
    const result = resolveFirstPaint(snapshotFor(), false);

    expect(result.themeCss).toBe('THEME');
    expect(result.prefsCss).toBe('PREFS');
  });
});

describe('createNexusAppearanceBootstrapScript', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.localStorage.clear();
    window.matchMedia = originalMatchMedia;
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-style');
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

  it('is engine-free and safe to inline in a classic script tag', () => {
    const script = createNexusAppearanceBootstrapScript();

    expect(script).not.toMatch(
      /culori|apca|deriveTheme|themeToCss|rampFromSeed|seedOklch/i
    );
    expect(script).not.toContain('</script');
    expect(script).not.toContain('light-dark(');
    expect(script).not.toMatch(/\u2028|\u2029/);
  });

  it('applies a stored dark snapshot to the document', () => {
    const dark = createNexusAppearanceSnapshot(
      { ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' },
      ':root { --test-theme: dark; }',
      ':root { --test-prefs: dark; }'
    );
    window.localStorage.setItem('nexus-appearance', JSON.stringify(dark));

    new Function(createNexusAppearanceBootstrapScript())();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-radius')).toBe('sharp');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
        ?.content
    ).toBe('dark');
    expect(
      document.querySelector('style[data-nexus-appearance-theme]')?.textContent
    ).toBe(':root { --test-theme: dark; }');
    expect(
      document.querySelector('style[data-nexus-appearance-prefs]')?.textContent
    ).toBe(':root { --test-prefs: dark; }');
  });

  it('falls back to the embedded default snapshot on empty storage', () => {
    new Function(
      createNexusAppearanceBootstrapScript({
        defaultSnapshot: createNexusAppearanceSnapshot(
          DEFAULT_NEXUS_APPEARANCE,
          '',
          ''
        ),
      })
    )();

    expect(document.documentElement.getAttribute('data-style')).toBe('mira');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(
      document.querySelectorAll('style[data-nexus-appearance-theme]')
    ).toHaveLength(1);
  });

  it('uses matchMedia for system mode', () => {
    const system = createNexusAppearanceSnapshot(
      { ...DEFAULT_NEXUS_APPEARANCE, mode: 'system' },
      ':root {}',
      ':root {}'
    );
    window.localStorage.setItem('nexus-appearance', JSON.stringify(system));
    const mediaQuery: MediaQueryList = {
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    };
    window.matchMedia = vi.fn(() => mediaQuery);

    new Function(createNexusAppearanceBootstrapScript())();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
        ?.content
    ).toBe('light dark');
  });
});
