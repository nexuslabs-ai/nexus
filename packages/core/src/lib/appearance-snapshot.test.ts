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
  createNexusAppearanceSnapshotFromState,
  deriveNexusAppearanceCss,
  parseNexusAppearanceStateCookie,
  sanitizeNexusAppearanceSnapshot,
  serializeNexusAppearanceStateCookie,
  SNAPSHOT_VERSION,
} from './appearance-snapshot';
import { deriveTheme, themeToCss } from './derive-theme';
import {
  NEXUS_DOCUMENT_ROOT_KEY,
  NEXUS_ROOT_ATTRIBUTES,
  nexusRootAttributes,
  nexusRootScope,
} from './nexus-root';

const documentScope = nexusRootScope(NEXUS_DOCUMENT_ROOT_KEY);

function themeCss(state = DEFAULT_NEXUS_APPEARANCE): string {
  return themeToCss(
    deriveTheme(createNexusThemeContract(state)),
    documentScope
  );
}

function prefsCss(state = DEFAULT_NEXUS_APPEARANCE): string {
  return appearancePrefsToCss(state.prefs, documentScope);
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
  it('invalidates cached CSS written for the document root selectors', () => {
    expect(SNAPSHOT_VERSION).toBe(8);
  });

  it('scopes snapshot CSS to the document root', () => {
    const snapshot = createNexusAppearanceSnapshotFromState({
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark',
    });

    expect(snapshot.themeCss).toContain(`${documentScope} {`);
    expect(snapshot.themeCss).toContain(
      `${documentScope}[data-nx-mode='dark'] {`
    );
    expect(snapshot.prefsCss).toContain(`${documentScope} {`);
    expect(`${snapshot.themeCss}${snapshot.prefsCss}`).not.toMatch(
      /:root|\.dark|\bhtml\b/
    );
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
      darkContrast: 100,
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

  it('falls back to the default contrast for non-numeric stored values', () => {
    const state = {
      ...DEFAULT_NEXUS_APPEARANCE,
      surfaceTone: 'slate' as const,
    };
    const snapshot = sanitizeNexusAppearanceSnapshot({
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
        ...DEFAULT_NEXUS_APPEARANCE,
        mode: 'dark' as const,
        surfaceTone: 'slate' as const,
        brandColor: '#2563eb',
      };
      const snapshot = sanitizeNexusAppearanceSnapshot({
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

  it('does not treat a raw (unversioned) state object as a snapshot payload', () => {
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
      version: 6,
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
      lightContrast: 35,
      darkContrast: 85,
    };
    const raw = serializeNexusAppearanceStateCookie({
      ...state,
      ...{ unknownField: 'dropped' },
    });

    expect(parseNexusAppearanceStateCookie(raw)).toEqual(state);
    expect(decodeURIComponent(raw)).not.toContain('unknownField');

    const snapshot = createNexusAppearanceSnapshotFromCookie(raw);
    expect(snapshot.state).toEqual(state);
    expect(snapshot.themeCss).toBe(themeCss(state));
    expect(snapshot.prefsCss).toBe(prefsCss(state));
  });

  it('reuses derived snapshots for identical sanitized state', () => {
    const state = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark' as const,
      surfaceTone: 'slate' as const,
    };

    expect(createNexusAppearanceSnapshotFromState(state)).toBe(
      createNexusAppearanceSnapshotFromState({ ...state })
    );
  });

  it('falls back when the state cookie is unreadable or stale', () => {
    expect(parseNexusAppearanceStateCookie('%')).toBeNull();
    expect(
      parseNexusAppearanceStateCookie(
        encodeURIComponent(
          JSON.stringify({
            version: 4,
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

describe('Nexus root contract', () => {
  it('renders the key, the resolved mode and every appearance field', () => {
    expect(
      nexusRootAttributes(
        {
          ...DEFAULT_NEXUS_APPEARANCE,
          mode: 'system',
          density: 'compact',
          corners: 'round',
          elevation: 'strong',
          stroke: 'fine',
        },
        'dark',
        'panel'
      )
    ).toEqual({
      'data-nexus-root': 'panel',
      'data-nx-mode': 'dark',
      'data-nx-density': 'compact',
      'data-nx-radius': 'round',
      'data-nx-shadow': 'strong',
      'data-nx-borderwidth': 'fine',
    });
  });

  it('escapes the key inside the root selector', () => {
    expect(nexusRootScope('a"b\\c')).toBe('[data-nexus-root="a\\"b\\\\c"]');
    expect(nexusRootScope('a\nb')).toBe('[data-nexus-root="a\\a b"]');
  });

  it('derives sanitized CSS for any root scope', () => {
    const scope = nexusRootScope('embedded');
    const css = deriveNexusAppearanceCss(
      {
        ...DEFAULT_NEXUS_APPEARANCE,
        prefs: { ...DEFAULT_NEXUS_APPEARANCE.prefs, uiFont: 'x; } body {' },
      },
      scope
    );

    expect(css.themeCss).toBe(
      themeToCss(
        deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE)),
        scope
      )
    );
    expect(css.prefsCss).toBe(
      appearancePrefsToCss(DEFAULT_NEXUS_APPEARANCE.prefs, scope)
    );
  });
});

describe('createNexusAppearanceBootstrapScript', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.localStorage.clear();
    window.matchMedia = originalMatchMedia;
    for (const attr of NEXUS_ROOT_ATTRIBUTES) {
      document.documentElement.removeAttribute(attr);
    }
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

    expect(document.documentElement.getAttribute('data-nexus-root')).toBe(
      'document'
    );
    expect(document.documentElement.getAttribute('data-nx-mode')).toBe('dark');
    expect(document.documentElement.getAttribute('data-nx-radius')).toBe(
      'square'
    );
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

  it('uses fresh cookie-derived CSS before hydration when storage contains v6 CSS', () => {
    const state = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'system' as const,
      brandColor: '#6366f1',
      density: 'compact' as const,
    };
    const oldCookie = encodeURIComponent(JSON.stringify({ version: 6, state }));
    const serverSnapshot = createNexusAppearanceSnapshotFromCookie(oldCookie);
    window.localStorage.setItem(
      'nexus-appearance',
      JSON.stringify({
        version: 6,
        state,
        themeCss: ':root { --nx-color-border-active: red; }',
        prefsCss: 'STALE',
      })
    );
    mockSystemPrefersDark(true);

    new Function(
      createNexusAppearanceBootstrapScript({ defaultSnapshot: serverSnapshot })
    )();

    expect(serverSnapshot.state).toEqual(state);
    expect(document.documentElement.getAttribute('data-nx-mode')).toBe('dark');
    expect(document.documentElement.getAttribute('data-nx-density')).toBe(
      'compact'
    );
    const rendered = document.querySelector(
      'style[data-nexus-appearance-theme]'
    )?.textContent;
    expect(rendered).toBe(serverSnapshot.themeCss);
    expect(rendered).toContain('--nx-color-border-focus:');
    expect(rendered).not.toContain('--nx-color-border-active:');
  });

  it('paints the default first paint when storage holds only obsolete v6 CSS', () => {
    const state = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark' as const,
      brandColor: '#6366f1',
    };
    const stale = { version: 6, state, themeCss: 'STALE', prefsCss: 'STALE' };
    window.localStorage.setItem('nexus-appearance', JSON.stringify(stale));
    new Function(createNexusAppearanceBootstrapScript())();

    expect(document.documentElement.getAttribute('data-nx-mode')).toBe('light');
    expect(
      document.querySelector('style[data-nexus-appearance-theme]')?.textContent
    ).toBe(themeCss());
  });

  it('never injects a v7 snapshot written for :root and .dark', () => {
    const state = { ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' as const };
    window.localStorage.setItem(
      'nexus-appearance',
      JSON.stringify({
        version: 7,
        state,
        themeCss: ':root { --nx-color-background: white; } :root.dark {}',
        prefsCss: ':root { font-size: 14px; }',
      })
    );

    new Function(createNexusAppearanceBootstrapScript())();

    const injected = `${
      document.querySelector('style[data-nexus-appearance-theme]')?.textContent
    }${document.querySelector('style[data-nexus-appearance-prefs]')?.textContent}`;
    expect(injected).toBe(`${themeCss()}${prefsCss()}`);
    expect(injected).not.toContain(':root');
  });

  it('gives its styles the nonce of the script that runs it', () => {
    const currentScript = vi
      .spyOn(document, 'currentScript', 'get')
      .mockReturnValue(
        Object.assign(document.createElement('script'), {
          nonce: 'first-paint',
        })
      );

    new Function(createNexusAppearanceBootstrapScript())();
    currentScript.mockRestore();

    const styles = document.querySelectorAll<HTMLStyleElement>(
      'style[data-nexus-appearance-theme], style[data-nexus-appearance-prefs]'
    );
    expect([...styles].map((style) => style.nonce)).toEqual([
      'first-paint',
      'first-paint',
    ]);
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

    expect(document.documentElement.getAttribute('data-nx-density')).toBe(
      'default'
    );
    expect(document.documentElement.getAttribute('data-nx-mode')).toBe('light');
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

    expect(document.documentElement.getAttribute('data-nx-mode')).toBe('light');
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

    expect(document.documentElement.getAttribute('data-nx-mode')).toBe('dark');
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

    expect(document.documentElement.getAttribute('data-nx-mode')).toBe('light');
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
    'renders the same root attributes as nexusRootAttributes (mode=%s, systemPrefersDark=%s)',
    (mode, prefersDark) => {
      const state = {
        ...DEFAULT_NEXUS_APPEARANCE,
        mode,
        density: 'comfortable' as const,
        corners: 'round' as const,
      };
      const snapshot = createNexusAppearanceSnapshot(
        state,
        ':root { --t: 1; }',
        ':root { --p: 1; }'
      );
      const resolvedMode =
        mode === 'dark' || (mode === 'system' && prefersDark)
          ? 'dark'
          : 'light';
      const expected = nexusRootAttributes(
        state,
        resolvedMode,
        NEXUS_DOCUMENT_ROOT_KEY
      );
      window.localStorage.setItem('nexus-appearance', JSON.stringify(snapshot));
      mockSystemPrefersDark(prefersDark);

      new Function(createNexusAppearanceBootstrapScript())();

      const root = document.documentElement;
      for (const attr of NEXUS_ROOT_ATTRIBUTES) {
        expect(root.getAttribute(attr)).toBe(expected[attr]);
      }
      expect(root.classList.contains('dark')).toBe(false);
      expect(
        document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
          ?.content
      ).toBe(mode === 'system' ? 'light dark' : mode);
    }
  );
});
