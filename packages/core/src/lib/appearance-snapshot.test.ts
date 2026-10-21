import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  appearancePrefsToCss,
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
} from './appearance-model';
import {
  createNxdsAppearanceBootstrapScript,
  createNxdsAppearanceSnapshot,
  createNxdsAppearanceSnapshotFromCookie,
  createNxdsAppearanceSnapshotFromState,
  NXDS_APPEARANCE_DATA_ATTRS,
  parseNxdsAppearanceStateCookie,
  resolveFirstPaint,
  sanitizeNxdsAppearanceSnapshot,
  serializeNxdsAppearanceStateCookie,
  SNAPSHOT_VERSION,
} from './appearance-snapshot';
import { deriveTheme, themeToCss } from './derive-theme';

function themeCss(state = DEFAULT_NXDS_APPEARANCE): string {
  return themeToCss(deriveTheme(createNxdsThemeContract(state)));
}

function prefsCss(state = DEFAULT_NXDS_APPEARANCE): string {
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

describe('NxdsAppearanceSnapshot', () => {
  it('invalidates cached CSS that styled the host page', () => {
    expect(SNAPSHOT_VERSION).toBe(9);
  });

  it('stores pre-derived CSS verbatim', () => {
    const theme = themeCss();
    const prefs = prefsCss();
    const snapshot = createNxdsAppearanceSnapshot(
      DEFAULT_NXDS_APPEARANCE,
      theme,
      prefs
    );

    expect(snapshot).toEqual({
      version: SNAPSHOT_VERSION,
      state: DEFAULT_NXDS_APPEARANCE,
      themeCss: theme,
      prefsCss: prefs,
    });
  });

  it('recovers state on version mismatch and refreshes the stale CSS cache', () => {
    const dark = {
      ...DEFAULT_NXDS_APPEARANCE,
      mode: 'dark' as const,
      brandColor: '#ff0000',
      darkContrast: 100,
    };
    const snapshot = sanitizeNxdsAppearanceSnapshot({
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

  it('falls back to the default contrast for non-numeric stored values', () => {
    const state = {
      ...DEFAULT_NXDS_APPEARANCE,
      surfaceTone: 'slate' as const,
    };
    const snapshot = sanitizeNxdsAppearanceSnapshot({
      version: SNAPSHOT_VERSION,
      state: { ...state, lightContrast: 'high', darkContrast: null },
      themeCss: 'STALE',
      prefsCss: 'STALE',
    });
    expect(snapshot.state).toEqual(state);
  });

  it.each([1, 5, 6])(
    'refreshes a v%s snapshot without resetting the stored state',
    (version) => {
      const state = {
        ...DEFAULT_NXDS_APPEARANCE,
        mode: 'dark' as const,
        surfaceTone: 'slate' as const,
        brandColor: '#2563eb',
      };
      const snapshot = sanitizeNxdsAppearanceSnapshot({
        version,
        state,
        themeCss: ':root { --nx-color-border-active: stale; }',
        prefsCss: ':root { --stale-prefs: stale; }',
      });

      expect(snapshot.version).toBe(SNAPSHOT_VERSION);
      expect(snapshot.state).toEqual(state);
      expect(snapshot.themeCss).toBe(themeCss(state));
      expect(snapshot.themeCss).not.toContain('--nx-color-border-active:');
      expect(snapshot.themeCss).toContain('--nx-color-focus-default:');
      expect(snapshot.themeCss).toContain('--nx-color-focus-error:');
      expect(snapshot.prefsCss).toBe(prefsCss(state));
    }
  );

  it('embeds runtime focus tokens in the default first-paint snapshot', () => {
    const script = createNxdsAppearanceBootstrapScript();

    expect(script).toContain('--nx-color-focus-default');
    expect(script).toContain('--nx-color-focus-error');
  });

  it('resets to the default snapshot on unreadable payloads', () => {
    const snapshot = sanitizeNxdsAppearanceSnapshot('garbage');

    expect(snapshot.state).toEqual(DEFAULT_NXDS_APPEARANCE);
    expect(snapshot.themeCss).toBe(themeCss());
    expect(snapshot.prefsCss).toBe(prefsCss());
  });

  it('does not treat a raw (unversioned) state object as a snapshot payload', () => {
    const snapshot = sanitizeNxdsAppearanceSnapshot({
      ...DEFAULT_NXDS_APPEARANCE,
      mode: 'dark',
    });

    expect(snapshot.state).toEqual(DEFAULT_NXDS_APPEARANCE);
  });

  it('serializes only versioned state into the server cookie payload', () => {
    const state = {
      ...DEFAULT_NXDS_APPEARANCE,
      mode: 'dark' as const,
      surfaceTone: 'slate' as const,
      brandColor: '#2563eb',
    };
    const raw = serializeNxdsAppearanceStateCookie(state);
    const decoded = JSON.parse(decodeURIComponent(raw));

    expect(decoded).toEqual({
      version: 6,
      state,
    });
    expect(decoded.themeCss).toBeUndefined();
    expect(decoded.prefsCss).toBeUndefined();
  });

  it('parses a versioned state cookie and derives a fresh server snapshot', () => {
    const state = {
      ...DEFAULT_NXDS_APPEARANCE,
      mode: 'dark' as const,
      surfaceTone: 'gray' as const,
      lightContrast: 35,
      darkContrast: 85,
    };
    const raw = serializeNxdsAppearanceStateCookie({
      ...state,
      ...{ unknownField: 'dropped' },
    });

    expect(parseNxdsAppearanceStateCookie(raw)).toEqual(state);
    expect(decodeURIComponent(raw)).not.toContain('unknownField');

    const snapshot = createNxdsAppearanceSnapshotFromCookie(raw);
    expect(snapshot.state).toEqual(state);
    expect(snapshot.themeCss).toBe(themeCss(state));
    expect(snapshot.prefsCss).toBe(prefsCss(state));
  });

  it('reuses derived snapshots for identical sanitized state', () => {
    const state = {
      ...DEFAULT_NXDS_APPEARANCE,
      mode: 'dark' as const,
      surfaceTone: 'slate' as const,
    };

    expect(createNxdsAppearanceSnapshotFromState(state)).toBe(
      createNxdsAppearanceSnapshotFromState({ ...state })
    );
  });

  it('falls back when the state cookie is unreadable or stale', () => {
    expect(parseNxdsAppearanceStateCookie('%')).toBeNull();
    expect(
      parseNxdsAppearanceStateCookie(
        encodeURIComponent(
          JSON.stringify({
            version: 4,
            state: { ...DEFAULT_NXDS_APPEARANCE, mode: 'dark' },
          })
        )
      )
    ).toBeNull();

    const snapshot = createNxdsAppearanceSnapshotFromCookie('%', {
      ...DEFAULT_NXDS_APPEARANCE,
      surfaceTone: 'zinc',
    });
    expect(snapshot.state.surfaceTone).toBe('zinc');
  });
});

describe('resolveFirstPaint', () => {
  const snapshotFor = (state = DEFAULT_NXDS_APPEARANCE) =>
    createNxdsAppearanceSnapshot(state, 'THEME', 'PREFS');

  it('resolves pinned dark mode concretely', () => {
    const result = resolveFirstPaint(
      snapshotFor({ ...DEFAULT_NXDS_APPEARANCE, mode: 'dark' }),
      false
    );

    expect(result.className).toBe('dark');
    expect(result.dataAttrs).toEqual({
      'data-density': 'default',
      'data-radius': 'subtle',
      'data-shadow': 'quiet',
      'data-borderwidth': 'normal',
    });
  });

  it('resolves system mode from the OS preference', () => {
    const result = resolveFirstPaint(
      snapshotFor({ ...DEFAULT_NXDS_APPEARANCE, mode: 'system' }),
      true
    );

    expect(result.className).toBe('dark');
  });

  it('passes snapshot CSS through without derivation', () => {
    const result = resolveFirstPaint(snapshotFor(), false);

    expect(result.themeCss).toBe('THEME');
    expect(result.prefsCss).toBe('PREFS');
  });
});

describe('createNxdsAppearanceBootstrapScript', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.localStorage.clear();
    window.matchMedia = originalMatchMedia;
    document.documentElement.classList.remove('dark');
    for (const attr of NXDS_APPEARANCE_DATA_ATTRS) {
      document.documentElement.removeAttribute(attr);
    }
    document.documentElement.style.colorScheme = '';
    document
      .querySelectorAll(
        'meta[name="color-scheme"], style[data-nxds-appearance-theme], style[data-nxds-appearance-prefs]'
      )
      .forEach((node) => node.remove());
  });

  it('is engine-free and safe to inline in a classic script tag', () => {
    const script = createNxdsAppearanceBootstrapScript();

    expect(script).not.toMatch(
      /culori|apca|deriveTheme|themeToCss|rampFromSeed|seedOklch/i
    );
    expect(script).not.toContain('</script');
    expect(script).not.toContain('light-dark(');
    expect(script).not.toMatch(/\u2028|\u2029/);
  });

  it('applies a stored dark snapshot to the document', () => {
    const dark = createNxdsAppearanceSnapshot(
      { ...DEFAULT_NXDS_APPEARANCE, mode: 'dark' },
      ':root { --test-theme: dark; }',
      ':root { --test-prefs: dark; }'
    );
    window.localStorage.setItem('nxds-appearance', JSON.stringify(dark));

    new Function(createNxdsAppearanceBootstrapScript())();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-radius')).toBe('subtle');
    // The host page's own color-scheme is left alone; `.dark` CSS covers it.
    expect(document.documentElement.style.colorScheme).toBe('');
    expect(document.querySelector('meta[name="color-scheme"]')).toBeNull();
    expect(
      document.querySelector('style[data-nxds-appearance-theme]')?.textContent
    ).toBe(':root { --test-theme: dark; }');
    expect(
      document.querySelector('style[data-nxds-appearance-prefs]')?.textContent
    ).toBe(':root { --test-prefs: dark; }');
  });

  it('uses fresh cookie-derived CSS before hydration when storage contains v6 CSS', () => {
    const state = {
      ...DEFAULT_NXDS_APPEARANCE,
      mode: 'system' as const,
      brandColor: '#6366f1',
      density: 'compact' as const,
    };
    const oldCookie = encodeURIComponent(JSON.stringify({ version: 6, state }));
    const serverSnapshot = createNxdsAppearanceSnapshotFromCookie(oldCookie);
    window.localStorage.setItem(
      'nxds-appearance',
      JSON.stringify({
        version: 6,
        state,
        themeCss: ':root { --nx-color-border-active: red; }',
        prefsCss: 'STALE',
      })
    );
    mockSystemPrefersDark(true);

    new Function(
      createNxdsAppearanceBootstrapScript({ defaultSnapshot: serverSnapshot })
    )();

    expect(serverSnapshot.state).toEqual(state);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-density')).toBe(
      'compact'
    );
    const rendered = document.querySelector(
      'style[data-nxds-appearance-theme]'
    )?.textContent;
    expect(rendered).toBe(serverSnapshot.themeCss);
    expect(rendered).toContain('--nx-color-border-focus:');
    expect(rendered).not.toContain('--nx-color-border-active:');
  });

  it('paints the default first paint when storage holds only obsolete v6 CSS', () => {
    const state = {
      ...DEFAULT_NXDS_APPEARANCE,
      mode: 'dark' as const,
      brandColor: '#6366f1',
    };
    const stale = { version: 6, state, themeCss: 'STALE', prefsCss: 'STALE' };
    window.localStorage.setItem('nxds-appearance', JSON.stringify(stale));
    new Function(createNxdsAppearanceBootstrapScript())();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(
      document.querySelector('style[data-nxds-appearance-theme]')?.textContent
    ).toBe(themeCss());
  });

  it('falls back to the embedded default snapshot on empty storage', () => {
    new Function(
      createNxdsAppearanceBootstrapScript({
        defaultSnapshot: createNxdsAppearanceSnapshot(
          DEFAULT_NXDS_APPEARANCE,
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
      document.querySelectorAll('style[data-nxds-appearance-theme]')
    ).toHaveLength(1);
  });

  it('can be locked to the embedded snapshot with storageKey false', () => {
    const dark = createNxdsAppearanceSnapshot(
      { ...DEFAULT_NXDS_APPEARANCE, mode: 'dark' },
      ':root { --test-theme: dark; }',
      ':root { --test-prefs: dark; }'
    );
    window.localStorage.setItem('nxds-appearance', JSON.stringify(dark));

    new Function(
      createNxdsAppearanceBootstrapScript({
        storageKey: false,
        defaultSnapshot: createNxdsAppearanceSnapshot(
          DEFAULT_NXDS_APPEARANCE,
          ':root { --test-theme: light; }',
          ':root { --test-prefs: light; }'
        ),
      })
    )();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(
      document.querySelector('style[data-nxds-appearance-theme]')?.textContent
    ).toBe(':root { --test-theme: light; }');
  });

  it('uses matchMedia for system mode', () => {
    const system = createNxdsAppearanceSnapshot(
      { ...DEFAULT_NXDS_APPEARANCE, mode: 'system' },
      ':root {}',
      ':root {}'
    );
    window.localStorage.setItem('nxds-appearance', JSON.stringify(system));
    mockSystemPrefersDark(true);

    new Function(createNxdsAppearanceBootstrapScript())();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('does not force dark in system mode when matchMedia is unavailable', () => {
    const system = createNxdsAppearanceSnapshot(
      { ...DEFAULT_NXDS_APPEARANCE, mode: 'system' },
      ':root {}',
      ':root {}'
    );
    window.localStorage.setItem('nxds-appearance', JSON.stringify(system));
    Reflect.set(window, 'matchMedia', undefined);

    new Function(createNxdsAppearanceBootstrapScript())();

    const root = document.documentElement;
    expect(root.classList.contains('dark')).toBe(false);
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
      const snapshot = createNxdsAppearanceSnapshot(
        { ...DEFAULT_NXDS_APPEARANCE, mode },
        ':root { --t: 1; }',
        ':root { --p: 1; }'
      );
      const expected = resolveFirstPaint(snapshot, prefersDark);
      window.localStorage.setItem('nxds-appearance', JSON.stringify(snapshot));
      mockSystemPrefersDark(prefersDark);

      new Function(createNxdsAppearanceBootstrapScript())();

      const root = document.documentElement;
      expect(root.classList.contains('dark')).toBe(
        expected.className === 'dark'
      );
      for (const attr of NXDS_APPEARANCE_DATA_ATTRS) {
        expect(root.getAttribute(attr)).toBe(expected.dataAttrs[attr]);
      }
    }
  );
});
