import { renderToStaticMarkup } from 'react-dom/server';

import { DEFAULT_NEXUS_APPEARANCE } from '@nexus/core';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { createNexusAppearance } from './factory';
import { useNexusAppearance } from './provider';
import { NexusAppearanceScript } from './script';

describe('NexusAppearanceScript', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the bootstrap script with nonce and storage key', () => {
    const html = renderToStaticMarkup(
      <NexusAppearanceScript
        nonce="nonce-1"
        storageKey="custom-appearance"
        defaultState={{ ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' }}
      />
    );

    expect(html).toContain('nonce="nonce-1"');
    expect(html).toContain('custom-appearance');
    expect(html).toContain('data-nexus-appearance-script');
  });

  it('renders a locked no-storage bootstrap script', () => {
    const html = renderToStaticMarkup(
      <NexusAppearanceScript
        storageKey={false}
        defaultState={{ ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' }}
      />
    );

    expect(html).toContain('var k=false');
    expect(html).toContain('data-nexus-appearance-script');
  });

  it('creates a provider and script closed over the same config', async () => {
    const appearance = createNexusAppearance({
      storageKey: 'factory-appearance',
      cookieKey: 'factory-appearance-cookie',
      defaultState: { ...DEFAULT_NEXUS_APPEARANCE, surfaceTone: 'slate' },
    });

    const html = renderToStaticMarkup(
      <appearance.NexusAppearanceScript nonce="nonce-2" />
    );
    expect(html).toContain('factory-appearance');

    const { result } = renderHook(() => useNexusAppearance(), {
      wrapper: ({ children }) => (
        <appearance.NexusAppearanceProvider>
          {children}
        </appearance.NexusAppearanceProvider>
      ),
    });

    await waitFor(() => expect(result.current.mounted).toBe(true));

    const snapshot = JSON.parse(
      window.localStorage.getItem('factory-appearance') ?? '{}'
    );
    expect(snapshot.state.surfaceTone).toBe('slate');
  });
});
