import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  appearancePrefsToCss,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import {
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshot,
  createNexusAppearanceSnapshotFromCookie,
  NEXUS_APPEARANCE_DATA_ATTRS,
  parseNexusAppearanceStateCookie,
  resolveFirstPaint,
  sanitizeNexusAppearanceSnapshot,
  serializeNexusAppearanceStateCookie,
  SNAPSHOT_VERSION,
} from './appearance-snapshot';
import { deriveTheme, themeToCss } from './derive-theme';

function themeCss(state = DEFAULT_NEXUS_APPEARANCE): string {
  return themeToCss(deriveTheme(createNexusThemeContract(state)));
}

function prefsCss(state = DEFAULT_NEXUS_APPEARANCE): string {
  return appearancePrefsToCss(state.prefs);
}

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

describe('NexusAppearanceSnapshot', () => {
  it('uses snapshot version 3 for friendly token-mode ids', () => {
    expect(SNAPSHOT_VERSION).toBe(3);
  });

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

  it('refreshes a v1 snapshot without resetting the stored state', () => {
    const state = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark' as const,
      surfaceTone: 'slate' as const,
      brandColor: '#2563eb',
    };
    const snapshot = sanitizeNexusAppearanceSnapshot({
      version: 1,
      state,
      themeCss: ':root { --nx-color-background: stale; }',
      prefsCss: ':root { --stale-prefs: stale; }',
    });

    expect(snapshot.version).toBe(SNAPSHOT_VERSION);
    expect(snapshot.state).toEqual(state);
    expect(snapshot.themeCss).toBe(themeCss(state));
    expect(snapshot.themeCss).toContain('--nx-color-focus-default:');
    expect(snapshot.themeCss).toContain('--nx-color-focus-error:');
    expect(snapshot.prefsCss).toBe(prefsCss(state));
  });

  it('embeds runtime focus tokens in the default first-paint snapshot', () => {
    const script = createNexusAppearanceBootstrapScript();

    expect(script).toContain('--nx-color-focus-default');
    expect(script).toContain('--nx-color-focus-error');
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

  it('serializes only versioned state into the server cookie payload', () => {
    const state = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark' as const,
      surfaceTone: 'slate' as const,
      brandColor: '#2563eb',
    };
    const raw = serializeNexusAppearanceStateCookie(state);
    const decoded = JSON.parse(decodeURIComponent(raw));

    expect(decoded).toEqual({
      version: SNAPSHOT_VERSION,
      state,
    });
    expect(decoded.themeCss).toBeUndefined();
    expect(decoded.prefsCss).toBeUndefined();
  });

  it('parses a versioned state cookie and derives a fresh server snapshot', () => {
    const state = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark' as const,
      surfaceTone: 'gray' as const,
      contrast: 85,
    };
    const raw = serializeNexusAppearanceStateCookie(state);

    expect(parseNexusAppearanceStateCookie(raw)).toEqual(state);

    const snapshot = createNexusAppearanceSnapshotFromCookie(raw);
    expect(snapshot.state).toEqual(state);
    expect(snapshot.themeCss).toBe(themeCss(state));
    expect(snapshot.prefsCss).toBe(prefsCss(state));
  });

  it('falls back when the state cookie is unreadable or stale', () => {
    expect(parseNexusAppearanceStateCookie('%')).toBeNull();
    expect(
      parseNexusAppearanceStateCookie(
        encodeURIComponent(
          JSON.stringify({
            version: SNAPSHOT_VERSION - 1,
            state: { ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' },
          })
        )
      )
    ).toBeNull();

    const snapshot = createNexusAppearanceSnapshotFromCookie('%', {
      ...DEFAULT_NEXUS_APPEARANCE,
      surfaceTone: 'zinc',
    });
    expect(snapshot.state.surfaceTone).toBe('zinc');
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
      'data-density': 'default',
      'data-radius': 'square',
      'data-shadow': 'quiet',
      'data-borderwidth': 'normal',
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
    for (const attr of NEXUS_APPEARANCE_DATA_ATTRS) {
      document.documentElement.removeAttribute(attr);
    }
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
    expect(document.documentElement.getAttribute('data-radius')).toBe('square');
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

    expect(document.documentElement.getAttribute('data-density')).toBe(
      'default'
    );
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(
      document.querySelectorAll('style[data-nexus-appearance-theme]')
    ).toHaveLength(1);
  });

  it('can be locked to the embedded snapshot with storageKey false', () => {
    const dark = createNexusAppearanceSnapshot(
      { ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' },
      ':root { --test-theme: dark; }',
      ':root { --test-prefs: dark; }'
    );
    window.localStorage.setItem('nexus-appearance', JSON.stringify(dark));

    new Function(
      createNexusAppearanceBootstrapScript({
        storageKey: false,
        defaultSnapshot: createNexusAppearanceSnapshot(
          DEFAULT_NEXUS_APPEARANCE,
          ':root { --test-theme: light; }',
          ':root { --test-prefs: light; }'
        ),
      })
    )();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(
      document.querySelector('style[data-nexus-appearance-theme]')?.textContent
    ).toBe(':root { --test-theme: light; }');
  });

  it('uses matchMedia for system mode', () => {
    const system = createNexusAppearanceSnapshot(
      { ...DEFAULT_NEXUS_APPEARANCE, mode: 'system' },
      ':root {}',
      ':root {}'
    );
    window.localStorage.setItem('nexus-appearance', JSON.stringify(system));
    mockSystemPrefersDark(true);

    new Function(createNexusAppearanceBootstrapScript())();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
        ?.content
    ).toBe('light dark');
  });

  it('does not force dark in system mode when matchMedia is unavailable', () => {
    const system = createNexusAppearanceSnapshot(
      { ...DEFAULT_NEXUS_APPEARANCE, mode: 'system' },
      ':root {}',
      ':root {}'
    );
    window.localStorage.setItem('nexus-appearance', JSON.stringify(system));
    Reflect.set(window, 'matchMedia', undefined);

    new Function(createNexusAppearanceBootstrapScript())();

    const root = document.documentElement;
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.style.colorScheme).toBe('light');
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
        ?.content
    ).toBe('light dark');
  });

  it.each([
    ['light', false],
    ['light', true],
    ['dark', false],
    ['dark', true],
    ['system', false],
    ['system', true],
  ] as const)(
    'applies the same resolution as resolveFirstPaint (mode=%s, systemPrefersDark=%s)',
    (mode, prefersDark) => {
      const snapshot = createNexusAppearanceSnapshot(
        { ...DEFAULT_NEXUS_APPEARANCE, mode },
        ':root { --t: 1; }',
        ':root { --p: 1; }'
      );
      const expected = resolveFirstPaint(snapshot, prefersDark);
      window.localStorage.setItem('nexus-appearance', JSON.stringify(snapshot));
      mockSystemPrefersDark(prefersDark);

      new Function(createNexusAppearanceBootstrapScript())();

      const root = document.documentElement;
      expect(root.classList.contains('dark')).toBe(
        expected.className === 'dark'
      );
      expect(root.style.colorScheme).toBe(expected.colorScheme);
      expect(
        document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
          ?.content
      ).toBe(expected.metaColorScheme);
      for (const attr of NEXUS_APPEARANCE_DATA_ATTRS) {
        expect(root.getAttribute(attr)).toBe(expected.dataAttrs[attr]);
      }
    }
  );
});
