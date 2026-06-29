import type { ComponentProps, ReactNode } from 'react';

import {
  appearancePrefsToCss,
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshot,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  deriveTheme,
  NEXUS_APPEARANCE_DATA_ATTRS,
  type NexusAppearanceState,
  parseNexusAppearanceStateCookie,
  sanitizeNexusAppearance,
  SNAPSHOT_VERSION,
  themeToCss,
} from '@nexus/core';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS,
  NexusAppearanceProvider,
  useNexusAppearance,
} from './provider';

function resetAppearanceDom(): void {
  document.documentElement.classList.remove('dark');
  for (const attr of NEXUS_APPEARANCE_DATA_ATTRS) {
    document.documentElement.removeAttribute(attr);
  }
  document.documentElement.style.colorScheme = '';
  document
    .querySelectorAll(
      'meta[name="color-scheme"], style[data-nexus-appearance-theme], style[data-nexus-appearance-prefs]'
    )
    .forEach((style) => style.remove());
  window.localStorage.clear();
  document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0]?.trim())
    .filter(Boolean)
    .forEach((name) => {
      document.cookie = `${name}=; Path=/; Max-Age=0`;
    });
}

function snapshotFor(state: NexusAppearanceState) {
  return createNexusAppearanceSnapshot(
    state,
    themeToCss(deriveTheme(createNexusThemeContract(state))),
    appearancePrefsToCss(state.prefs)
  );
}

function captureAppearanceDom() {
  const root = document.documentElement;

  return {
    dark: root.classList.contains('dark'),
    density: root.getAttribute('data-density'),
    radius: root.getAttribute('data-radius'),
    shadow: root.getAttribute('data-shadow'),
    borderwidth: root.getAttribute('data-borderwidth'),
    colorScheme: root.style.colorScheme,
    metaColorScheme: document.querySelector<HTMLMetaElement>(
      'meta[name="color-scheme"]'
    )?.content,
    themeCss: document.querySelector('style[data-nexus-appearance-theme]')
      ?.textContent,
    prefsCss: document.querySelector('style[data-nexus-appearance-prefs]')
      ?.textContent,
  };
}

function wrapperFor(
  props: Partial<ComponentProps<typeof NexusAppearanceProvider>> = {}
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NexusAppearanceProvider {...props}>{children}</NexusAppearanceProvider>
    );
  };
}

describe('NexusAppearanceProvider', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    resetAppearanceDom();
    window.matchMedia = originalMatchMedia;
  });

  it('applies the documentElement attributes for the active state', () => {
    renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({ storageKey: false }),
    });

    const root = document.documentElement;

    expect(root).toHaveAttribute('data-density', 'default');
    expect(root).toHaveAttribute('data-radius', 'square');
    expect(root).toHaveAttribute('data-shadow', 'quiet');
    expect(root).toHaveAttribute('data-borderwidth', 'normal');
    expect(root).not.toHaveClass('dark');
    expect(root.style.colorScheme).toBe('light');
  });

  it('first renders default state, then adopts stored state after mount', async () => {
    window.localStorage.setItem(
      'nexus-appearance',
      JSON.stringify(
        snapshotFor({ ...DEFAULT_NEXUS_APPEARANCE, surfaceTone: 'slate' })
      )
    );
    const seen: string[] = [];

    function Probe() {
      const { mounted, state } = useNexusAppearance();
      seen.push(`${mounted}:${state.surfaceTone}`);
      return null;
    }

    render(
      <NexusAppearanceProvider>
        <Probe />
      </NexusAppearanceProvider>
    );

    expect(seen[0]).toBe('false:stone');
    await waitFor(() => expect(seen[seen.length - 1]).toBe('true:slate'));
  });

  it('keeps the bootstrap-painted DOM equivalent after provider hydration', async () => {
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
    window.localStorage.setItem(
      'nexus-appearance',
      JSON.stringify(
        snapshotFor({
          ...DEFAULT_NEXUS_APPEARANCE,
          mode: 'system',
          surfaceTone: 'slate',
          density: 'compact',
          corners: 'round',
          elevation: 'strong',
          stroke: 'strong',
        })
      )
    );

    new Function(createNexusAppearanceBootstrapScript())();
    const beforeHydration = captureAppearanceDom();

    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor(),
    });

    await waitFor(() => expect(result.current.mounted).toBe(true));

    expect(captureAppearanceDom()).toEqual(beforeHydration);
    expect(result.current.resolvedMode).toBe('dark');
  });

  it('repairs readable snapshots against the sanitized state after hydration', async () => {
    const rawState = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark',
      surfaceTone: 'slate',
      contrast: 999,
    };
    const sanitizedState = sanitizeNexusAppearance(rawState);
    window.localStorage.setItem(
      'nexus-appearance',
      JSON.stringify({
        version: 1,
        state: rawState,
        themeCss: 'STALE',
        prefsCss: 'STALE',
      })
    );

    new Function(createNexusAppearanceBootstrapScript())();
    expect(
      document.querySelector('style[data-nexus-appearance-theme]')?.textContent
    ).toBe(
      themeToCss(
        deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE))
      )
    );

    renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor(),
    });

    await waitFor(() => {
      expect(
        document.querySelector('style[data-nexus-appearance-theme]')
          ?.textContent
      ).toBe(themeToCss(deriveTheme(createNexusThemeContract(sanitizedState))));
    });
  });

  it('applies the embedded default theme CSS before the provider mounts', async () => {
    const defaultThemeCss = themeToCss(
      deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE))
    );

    new Function(createNexusAppearanceBootstrapScript())();

    expect(
      document.querySelector('style[data-nexus-appearance-theme]')?.textContent
    ).toBe(defaultThemeCss);

    renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor(),
    });

    await waitFor(() => {
      expect(
        document.querySelector('style[data-nexus-appearance-theme]')
          ?.textContent
      ).toBe(defaultThemeCss);
    });
  });

  it('injects exactly one theme and prefs style tag across updates', () => {
    const { result, rerender } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({ storageKey: false }),
    });

    act(() => {
      result.current.setState((state) => ({
        ...state,
        brandColor: '#ff0000',
        prefs: {
          ...state.prefs,
          uiFontSize: 16,
        },
      }));
    });
    rerender();

    expect(
      document.querySelectorAll('style[data-nexus-appearance-theme]')
    ).toHaveLength(1);
    expect(
      document.querySelectorAll('style[data-nexus-appearance-prefs]')
    ).toHaveLength(1);
    expect(
      document.querySelector('style[data-nexus-appearance-theme]')?.textContent
    ).toContain('--nx-color-primary');
    expect(
      document.querySelector('style[data-nexus-appearance-prefs]')?.textContent
    ).toContain('font-size: 16px');
    expect(
      document.querySelector('style[data-nexus-appearance-prefs]')?.textContent
    ).toContain('--nx-typography-size-sm: 16px');
  });

  it('writes uncontrolled state as a versioned snapshot', async () => {
    const key = 'test-appearance';
    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({ storageKey: key }),
    });

    act(() => {
      result.current.setState((state) => ({ ...state, surfaceTone: 'slate' }));
    });

    await waitFor(() => {
      const snapshot = JSON.parse(window.localStorage.getItem(key) ?? '{}');

      expect(snapshot).toMatchObject({
        version: SNAPSHOT_VERSION,
        state: { surfaceTone: 'slate' },
      });
      expect(typeof snapshot.themeCss).toBe('string');
      expect(typeof snapshot.prefsCss).toBe('string');
    });
  });

  it('can write uncontrolled state as a versioned SSR cookie', async () => {
    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({
        storageKey: false,
        cookieKey: 'test-appearance-cookie',
      }),
    });

    act(() => {
      result.current.setState((state) => ({ ...state, surfaceTone: 'slate' }));
    });

    await waitFor(() => {
      const rawCookie = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('test-appearance-cookie='))
        ?.split('=')[1];

      expect(parseNexusAppearanceStateCookie(rawCookie)).toMatchObject({
        surfaceTone: 'slate',
      });
    });
  });

  it('writes SSR cookies with named defaults and consumer-overridden attributes', async () => {
    const cookieSetter = vi.spyOn(document, 'cookie', 'set');
    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({
        storageKey: false,
        cookieKey: 'test-appearance-cookie',
        cookieOptions: {
          maxAge: 120,
          path: '/',
          sameSite: 'Strict',
          secure: true,
        },
      }),
    });

    act(() => {
      result.current.setState((state) => ({ ...state, surfaceTone: 'slate' }));
    });

    await waitFor(() => {
      expect(cookieSetter).toHaveBeenCalledWith(
        expect.stringContaining(
          '; Path=/; SameSite=Strict; Max-Age=120; Secure'
        )
      );
    });
    expect(NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 365);

    cookieSetter.mockRestore();
  });

  it('treats the cookie/default state as the SSR seed and localStorage as the client override', async () => {
    const key = 'precedence-appearance';
    window.localStorage.setItem(
      key,
      JSON.stringify(
        snapshotFor({ ...DEFAULT_NEXUS_APPEARANCE, surfaceTone: 'gray' })
      )
    );

    const seen: string[] = [];

    function Probe() {
      const { mounted, state } = useNexusAppearance();
      seen.push(`${mounted}:${state.surfaceTone}`);
      return null;
    }

    render(
      <NexusAppearanceProvider
        defaultState={{ ...DEFAULT_NEXUS_APPEARANCE, surfaceTone: 'slate' }}
        storageKey={key}
        cookieKey="precedence-appearance-cookie"
      >
        <Probe />
      </NexusAppearanceProvider>
    );

    expect(seen[0]).toBe('false:slate');

    await waitFor(() => {
      expect(seen[seen.length - 1]).toBe('true:gray');
    });
    await waitFor(() => {
      const rawCookie = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('precedence-appearance-cookie='))
        ?.split('=')[1];

      expect(parseNexusAppearanceStateCookie(rawCookie)).toMatchObject({
        surfaceTone: 'gray',
      });
    });
  });

  it('recovers stale snapshot versions through the provider and refreshes storage', async () => {
    const key = 'stale-appearance';
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 999,
        state: {
          ...DEFAULT_NEXUS_APPEARANCE,
          mode: 'dark',
          surfaceTone: 'gray',
        },
        themeCss: 'STALE',
        prefsCss: 'STALE',
      })
    );

    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({ storageKey: key }),
    });

    await waitFor(() => expect(result.current.mounted).toBe(true));

    expect(result.current.state).toMatchObject({
      mode: 'dark',
      surfaceTone: 'gray',
    });

    await waitFor(() => {
      const snapshot = JSON.parse(window.localStorage.getItem(key) ?? '{}');

      expect(snapshot).toMatchObject({
        version: SNAPSHOT_VERSION,
        state: { mode: 'dark', surfaceTone: 'gray' },
      });
      expect(snapshot.themeCss).not.toBe('STALE');
      expect(snapshot.prefsCss).not.toBe('STALE');
    });
  });

  it('resets to the default state on corrupt storage', () => {
    window.localStorage.setItem('bad', '{not json');

    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({ storageKey: 'bad' }),
    });

    expect(result.current.state).toMatchObject(DEFAULT_NEXUS_APPEARANCE);
  });

  it('does not write storage when state is controlled', () => {
    const onStateChange = vi.fn();
    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({
        state: DEFAULT_NEXUS_APPEARANCE,
        onStateChange,
        storageKey: 'controlled-appearance',
        cookieKey: 'controlled-appearance-cookie',
      }),
    });

    act(() => {
      result.current.setState((state) => ({ ...state, surfaceTone: 'gray' }));
    });

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ surfaceTone: 'gray' })
    );
    expect(window.localStorage.getItem('controlled-appearance')).toBeNull();
    expect(document.cookie).not.toContain('controlled-appearance-cookie=');
  });

  it('reuses bootstrap-created style tags instead of stacking duplicates', async () => {
    const theme = document.createElement('style');
    theme.setAttribute('data-nexus-appearance-theme', '');
    theme.textContent = '/* boot theme */';
    const prefs = document.createElement('style');
    prefs.setAttribute('data-nexus-appearance-prefs', '');
    prefs.textContent = '/* boot prefs */';
    document.head.append(theme, prefs);

    renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({ storageKey: false }),
    });

    await waitFor(() => {
      expect(
        document.querySelectorAll('style[data-nexus-appearance-theme]')
      ).toHaveLength(1);
      expect(
        document.querySelectorAll('style[data-nexus-appearance-prefs]')
      ).toHaveLength(1);
    });
  });

  it('notifies onStateChange with the composed next state in uncontrolled mode', () => {
    const onStateChange = vi.fn();
    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({ onStateChange, storageKey: false }),
    });

    expect(onStateChange).not.toHaveBeenCalled();

    act(() => {
      result.current.setState((state) => ({ ...state, surfaceTone: 'zinc' }));
      result.current.setState((state) => ({ ...state, mode: 'dark' }));
    });

    expect(onStateChange).toHaveBeenCalledTimes(2);
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ surfaceTone: 'zinc', mode: 'dark' })
    );
  });

  it('resolves system mode from matchMedia changes', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    const mediaQueryList: Partial<MediaQueryList> & { matches: boolean } = {
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    mediaQueryList.addEventListener = vi.fn(
      (_event: string, callback: EventListenerOrEventListenerObject | null) => {
        if (!callback) return;
        listener = (event) => {
          if (typeof callback === 'function') {
            callback.call(mediaQueryList as MediaQueryList, event);
          } else {
            callback.handleEvent(event);
          }
        };
      }
    ) as MediaQueryList['addEventListener'];

    window.matchMedia = vi.fn(() => mediaQueryList as MediaQueryList);

    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({
        defaultState: { ...DEFAULT_NEXUS_APPEARANCE, mode: 'system' },
        storageKey: false,
      }),
    });

    expect(result.current.resolvedMode).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    act(() => {
      mediaQueryList.matches = false;
      listener?.({ matches: false } as MediaQueryListEvent);
    });

    expect(result.current.resolvedMode).toBe('light');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});
