// @vitest-environment node

import { renderToString } from 'react-dom/server';

import { describe, expect, it } from 'vitest';

import { NexusAppearanceProvider } from './provider';

describe('NexusAppearanceProvider SSR', () => {
  it('renders without window or document', () => {
    expect(() =>
      renderToString(
        <NexusAppearanceProvider>
          <span>ok</span>
        </NexusAppearanceProvider>
      )
    ).not.toThrow();
  });
});
