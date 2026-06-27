import type { ComponentProps, ReactNode } from 'react';

import { DEFAULT_NEXUS_APPEARANCE } from '@nexus/core';
import {
  act,
  beforeEach,
  describe,
  expect,
  it,
  renderHook,
  vi,
} from '@nexus/test-utils';

import { NexusAppearanceProvider, useNexusAppearance } from './provider';

function resetAppearanceDom(): void {
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-style');
  document.documentElement.removeAttribute('data-radius');
  document.documentElement.removeAttribute('data-shadow');
  document.documentElement.removeAttribute('data-borderwidth');
  document.documentElement.style.colorScheme = '';
  document
    .querySelectorAll(
      'style[data-nexus-appearance-theme], style[data-nexus-appearance-prefs]'
    )
    .forEach((style) => style.remove());
  window.localStorage.clear();
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

    expect(root).toHaveAttribute('data-style', 'mira');
    expect(root).toHaveAttribute('data-radius', 'sharp');
    expect(root).toHaveAttribute('data-shadow', 'maia');
    expect(root).toHaveAttribute('data-borderwidth', 'vega');
    expect(root).not.toHaveClass('dark');
    expect(root.style.colorScheme).toBe('light');
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
  });

  it('round-trips uncontrolled state through storage', () => {
    const key = 'test-appearance';
    const { result, unmount } = renderHook(() => useNexusAppearance(), {
      wrapper: wrapperFor({ storageKey: key }),
    });

    act(() => {
      result.current.setState((state) => ({ ...state, surfaceTone: 'slate' }));
    });
    unmount();

    expect(JSON.parse(window.localStorage.getItem(key) ?? '{}')).toMatchObject({
      surfaceTone: 'slate',
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
      }),
    });

    act(() => {
      result.current.setState((state) => ({ ...state, surfaceTone: 'gray' }));
    });

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ surfaceTone: 'gray' })
    );
    expect(window.localStorage.getItem('controlled-appearance')).toBeNull();
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
