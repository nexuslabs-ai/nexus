import { renderToStaticMarkup } from 'react-dom/server';

import {
  DEFAULT_COOKIE_KEY,
  DEFAULT_NEXUS_APPEARANCE,
  type NexusAppearanceSnapshot,
  type NexusAppearanceState,
  serializeNexusAppearanceStateCookie,
} from '@nexus/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SERVER_ROUTE_PAGES } from '../_lib/real-pages';

const { cookieGetMock, cookiesMock } = vi.hoisted(() => ({
  cookieGetMock: vi.fn(),
  cookiesMock: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: cookiesMock }));

function extractDefaultSnapshot(html: string): NexusAppearanceSnapshot {
  const match = html.match(/var f=([\s\S]*?);var s=f;/);

  expect(match?.[1]).toBeDefined();

  return JSON.parse(match?.[1] ?? '{}') as NexusAppearanceSnapshot;
}

describe('AppearanceSsrFixturePage', () => {
  beforeEach(() => {
    cookieGetMock.mockReset();
    cookiesMock.mockReset();
    cookiesMock.mockResolvedValue({ get: cookieGetMock });
  });

  it('emits the first-paint script before client fixture content from the server fixture route', async () => {
    const seededState = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'dark',
      brandColor: '#2563eb',
      surfaceTone: 'slate',
    } satisfies NexusAppearanceState;

    cookieGetMock.mockImplementation((key: string) =>
      key === DEFAULT_COOKIE_KEY
        ? { value: serializeNexusAppearanceStateCookie(seededState) }
        : undefined
    );

    const { default: AppearanceSsrFixturePage } = await import('./page');
    const element = await AppearanceSsrFixturePage();
    const html = renderToStaticMarkup(element);
    const scriptIndex = html.indexOf('data-nexus-appearance-script');
    const fixtureIndex = html.indexOf('data-nexus-appearance-fixture');
    const snapshot = extractDefaultSnapshot(html);

    expect(SERVER_ROUTE_PAGES['/appearance-ssr'].source).toBe(
      'apps/docs/app/appearance-ssr/page.tsx'
    );
    expect(scriptIndex).toBeGreaterThanOrEqual(0);
    expect(fixtureIndex).toBeGreaterThanOrEqual(0);
    expect(scriptIndex).toBeLessThan(fixtureIndex);
    expect(html).toContain('data-nexus-appearance-theme');
    expect(cookieGetMock).toHaveBeenCalledWith(DEFAULT_COOKIE_KEY);
    expect(snapshot.state).toMatchObject({
      mode: 'dark',
      brandColor: '#2563eb',
      surfaceTone: 'slate',
    });
    expect(snapshot.themeCss).toContain('--nx-color-background');
  });
});
