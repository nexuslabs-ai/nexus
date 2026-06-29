import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => undefined),
  })),
}));

describe('AppearanceSsrFixturePage', () => {
  it('emits the first-paint script before client fixture content', async () => {
    vi.stubGlobal('React', React);
    const { default: AppearanceSsrFixturePage } = await import('./page');
    const element = await AppearanceSsrFixturePage();
    const html = renderToStaticMarkup(element);
    const scriptIndex = html.indexOf('data-nexus-appearance-script');
    const fixtureIndex = html.indexOf('data-nexus-appearance-fixture');

    expect(scriptIndex).toBeGreaterThanOrEqual(0);
    expect(fixtureIndex).toBeGreaterThanOrEqual(0);
    expect(scriptIndex).toBeLessThan(fixtureIndex);
    expect(html).toContain('data-nexus-appearance-theme');
  });
});
