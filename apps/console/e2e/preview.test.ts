import { appearancePrefsToCss } from '@nexus_ds/core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from 'playwright';
import {
  build,
  createServer,
  preview,
  type PreviewServer,
  type ViteDevServer,
} from 'vite';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

import {
  createPreviewResult,
  PREVIEW_DEFAULT_STATE,
} from '../src/preview/accepted-result';

let browser: Browser;
let context: BrowserContext;
let page: Page;
let server: ViteDevServer;
let production: PreviewServer;
let nested: PreviewServer;
let base: string;
let productionBase: string;
let nestedBase: string;
const root = path.resolve('apps/console');
const configFile = path.join(root, 'vite.config.ts');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-preview-build-'));
const errors: string[] = [];
declare global {
  interface Window {
    persistenceAccess: string[];
    previewMessages: Record<string, unknown>[];
  }
}

beforeAll(async () => {
  server = await createServer({
    root,
    configFile,
    server: { host: '127.0.0.1', port: 0 },
  });
  await server.listen();
  base = server.resolvedUrls?.local[0] ?? '';
  production = await preview({
    root,
    configFile,
    preview: { host: '127.0.0.1', port: 0 },
  });
  productionBase = production.resolvedUrls?.local[0] ?? '';
  await build({
    root,
    configFile,
    base: '/nexus-console/',
    logLevel: 'error',
    build: { outDir: output, emptyOutDir: true, manifest: true },
  });
  nested = await preview({
    root,
    configFile,
    base: '/nexus-console/',
    build: { outDir: output },
    preview: { host: '127.0.0.1', port: 0 },
  });
  nestedBase = nested.resolvedUrls?.local[0] ?? '';
  if (!base || !productionBase || !nestedBase)
    throw new Error('Missing test server URL');
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
  for (const serving of [production, nested]) {
    if (serving)
      await new Promise<void>((resolve, reject) =>
        serving.httpServer.close((error) => (error ? reject(error) : resolve()))
      );
  }
  fs.rmSync(output, { recursive: true, force: true });
});

beforeEach(async () => {
  errors.length = 0;
  context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => {
    const target = window;
    target.persistenceAccess = [];
    target.previewMessages = [];
    window.addEventListener('message', (event) => {
      if (event.data?.channel === 'nexus-preview')
        target.previewMessages.push(event.data);
    });
    // Initial child documents can still report about:blank here. Instrument every
    // document; only the preview is required to have zero persistence access.
    for (const key of ['localStorage', 'sessionStorage'] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(window, key);
      if (!descriptor?.get) throw new Error(`Missing ${key} descriptor`);
      Object.defineProperty(window, key, {
        configurable: true,
        get() {
          target.persistenceAccess.push(key);
          return descriptor.get?.call(window);
        },
      });
    }
    const cookie = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'cookie'
    );
    if (!cookie?.get || !cookie.set)
      throw new Error('Missing cookie descriptor');
    Object.defineProperty(Document.prototype, 'cookie', {
      configurable: true,
      get() {
        target.persistenceAccess.push('cookie:get');
        return cookie.get?.call(this);
      },
      set(value: string) {
        target.persistenceAccess.push('cookie:set');
        cookie.set?.call(this, value);
      },
    });
  });
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
});

afterEach(async () => {
  await context?.close();
  expect(errors).toEqual([]);
});

async function ready() {
  await frame().locator('[data-slot="preview-scene"]').waitFor();
  await page
    .locator('[data-slot="preview-connection"][data-state="applied"]')
    .waitFor();
}
function frame() {
  return page.frameLocator('iframe[title="Nexus component preview"]');
}
async function hostSnapshot() {
  return page.evaluate(() => ({
    attributes: [...document.documentElement.attributes].map((attr) => [
      attr.name,
      attr.value,
    ]),
    styles: [
      ...document.querySelectorAll(
        'style[data-nexus-appearance-theme], style[data-nexus-appearance-prefs]'
      ),
    ].map((style) => style.textContent),
    local: { ...localStorage },
    session: { ...sessionStorage },
    cookies: document.cookie,
  }));
}
async function noPreviewPersistence() {
  expect(
    await frame()
      .locator('html')
      .evaluate(() => window.persistenceAccess)
  ).toEqual([]);
}

it('keeps inspected colors, host appearance and storage independent across edits, reset and reload', async () => {
  await page.goto(`${base}preview`);
  await ready();
  const before = await hostSnapshot();
  const expected = createPreviewResult(PREVIEW_DEFAULT_STATE, 1).inspection
    .theme.light['--nx-color-primary-background'];
  expect(
    await frame()
      .locator('html')
      .evaluate((el) =>
        getComputedStyle(el)
          .getPropertyValue('--nx-color-primary-background')
          .trim()
      )
  ).toBe(expected);
  await page.getByLabel('Preview appearance').selectOption('dark');
  await ready();
  expect(await frame().locator('html').getAttribute('class')).toBe('dark');
  expect(await page.locator('html').getAttribute('class')).not.toBe('dark');
  await page.getByLabel('Preview brand color').selectOption({ label: 'Rose' });
  await ready();
  await noPreviewPersistence();
  const doc = page
    .frames()
    .find((item) => item.url().endsWith('/component-preview.html'));
  if (!doc) throw new Error('Missing preview document');
  await Promise.all([
    page.waitForEvent('framenavigated', (navigated) => navigated === doc),
    doc.evaluate(() => location.reload()),
  ]);
  await ready();
  expect(await frame().locator('html').getAttribute('class')).toBe('dark');
  await noPreviewPersistence();
  await page
    .getByRole('button', { name: 'Reset preview', exact: true })
    .click();
  await ready();
  expect(await frame().locator('html').getAttribute('class')).not.toBe('dark');
  await page
    .getByRole('button', { name: 'Reload preview', exact: true })
    .click();
  await ready();
  await noPreviewPersistence();
  expect(await hostSnapshot()).toEqual(before);
  // A deliberate read proves each probe is active in the actual preview document.
  await frame()
    .locator('html')
    .evaluate(() => {
      void window.localStorage.length;
      void window.sessionStorage.length;
      void document.cookie;
    });
  expect(
    await frame()
      .locator('html')
      .evaluate(() => window.persistenceAccess)
  ).toEqual(['localStorage', 'sessionStorage', 'cookie:get']);
});

it('supports a light preview inside a dark Console with dialog and popover portals owned by the frame', async () => {
  await page.goto(`${base}preview`);
  await ready();
  await page.getByRole('button', { name: 'Theme', exact: true }).click();
  await page.getByRole('radio', { name: 'Dark', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect
    .poll(() => page.locator('html').getAttribute('class'))
    .toBe('dark');
  const before = await hostSnapshot();
  expect(await frame().locator('html').getAttribute('class')).not.toBe('dark');
  await page
    .getByRole('button', { name: 'Enter preview', exact: true })
    .click();
  await expect
    .poll(() =>
      frame()
        .getByRole('button', { name: 'Continue', exact: true })
        .evaluate((el) => document.activeElement === el)
    )
    .toBe(true);
  await page.keyboard.press('Enter');
  await frame().getByRole('dialog').waitFor();
  expect(await page.getByRole('dialog').count()).toBe(0);
  expect(
    await page.locator('body').getAttribute('data-scroll-locked')
  ).toBeNull();
  expect(await frame().locator('body').getAttribute('data-scroll-locked')).toBe(
    '1'
  );
  await page.getByLabel('Preview appearance').selectOption('dark');
  await ready();
  expect(await frame().getByRole('dialog').isVisible()).toBe(true);
  await frame()
    .getByRole('button', { name: 'Back to the preview', exact: true })
    .focus();
  await page.keyboard.press('Escape');
  await frame().getByRole('dialog').waitFor({ state: 'hidden' });
  await expect
    .poll(() =>
      frame()
        .getByRole('button', { name: 'Continue', exact: true })
        .evaluate((el) => document.activeElement === el)
    )
    .toBe(true);
  await frame()
    .getByRole('button', { name: 'Look closer', exact: true })
    .click();
  await frame().getByRole('dialog', { name: 'About this surface' }).waitFor();
  expect(await page.locator('[data-slot="popover-content"]').count()).toBe(0);
  await page.keyboard.press('Escape');
  await expect
    .poll(() =>
      frame()
        .getByRole('button', { name: 'Look closer', exact: true })
        .evaluate((el) => document.activeElement === el)
    )
    .toBe(true);
  await frame().getByRole('button', { name: 'Return to Console' }).click();
  await expect
    .poll(() =>
      page
        .getByRole('button', { name: 'Enter preview', exact: true })
        .evaluate((el) => document.activeElement === el)
    )
    .toBe(true);
  expect(await hostSnapshot()).toEqual(before);
  await noPreviewPersistence();
});

it('keeps the latest revision through rapid edits and ignores stale replies', async () => {
  await page.goto(`${base}preview`);
  await ready();
  const old = await frame()
    .locator('html')
    .evaluate(() =>
      window.previewMessages.find((message) => message.type === 'apply')
    );
  if (!old) throw new Error('Missing initial apply');
  for (const label of ['Indigo', 'Rose', 'Teal'])
    await page.getByLabel('Preview brand color').selectOption({ label });
  await page.getByLabel('Preview appearance').selectOption('dark');
  await ready();
  const revision = await page
    .locator('[data-slot="preview-connection"]')
    .getAttribute('data-revision');
  await frame()
    .locator('html')
    .evaluate((_el, message) => {
      parent.postMessage({ ...message, type: 'applied' }, location.origin);
      parent.postMessage({ ...message, type: 'error' }, location.origin);
    }, old);
  expect(
    await page
      .locator('[data-slot="preview-connection"]')
      .getAttribute('data-revision')
  ).toBe(revision);
  expect(
    await frame().locator('#preview-root').getAttribute('data-revision')
  ).toBe(revision);
  expect(await frame().locator('html').getAttribute('class')).toBe('dark');
  await page.getByRole('link', { name: 'Token Explorer', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Every token has a story.' })
    .waitFor();
  await page.getByRole('link', { name: 'Preview', exact: true }).click();
  await ready();
  expect(
    await page
      .locator('[data-slot="preview-connection"]')
      .getAttribute('data-revision')
  ).toBe('1');
});

it('shows a waiting state without an accepted theme and rejects messages from another source', async () => {
  await page.goto(`${base}component-preview.html`);
  await page.getByText('Waiting for a theme from Nexus Console.').waitFor();
  expect(await page.getByRole('button').count()).toBe(0);
  expect(await page.locator('style[data-nexus-appearance-theme]').count()).toBe(
    0
  );
  expect(await page.evaluate(() => window.persistenceAccess)).toEqual([]);
  await page.evaluate(() =>
    window.postMessage(
      {
        channel: 'nexus-preview',
        version: 1,
        type: 'connect',
        connection: 'untrusted',
      },
      location.origin
    )
  );
  expect(await page.getByRole('button').count()).toBe(0);
});

it('recovers from missing entry and partial application failure by remounting', async () => {
  await page.route('**/component-preview.html', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<title>Unavailable</title>',
    })
  );
  await page.goto(`${base}preview`);
  await page
    .locator('[data-slot="preview-connection"][data-state="error"]')
    .waitFor({ timeout: 12000 });
  expect(await page.locator('iframe').isVisible()).toBe(false);
  await page.unroute('**/component-preview.html');
  await page
    .getByRole('button', { name: 'Reload preview', exact: true })
    .click();
  await ready();
  await frame()
    .locator('html')
    .evaluate(() => {
      document.head.appendChild = () => {
        throw new Error('Controlled document apply failure');
      };
    });
  await page.getByLabel('Preview appearance').selectOption('dark');
  await page
    .locator('[data-slot="preview-connection"][data-state="error"]')
    .waitFor();
  expect(await page.locator('iframe').isVisible()).toBe(false);
  await page
    .getByRole('button', { name: 'Reload preview', exact: true })
    .click();
  await ready();
  expect(await frame().locator('html').getAttribute('class')).toBe('dark');
  await noPreviewPersistence();
});

it('keeps narrow previews and overlays usable when text is enlarged in both documents', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}preview`);
  await ready();
  const enlargedText = appearancePrefsToCss({
    ...PREVIEW_DEFAULT_STATE.prefs,
    uiFontSize: 28,
    codeFontSize: 24,
  });
  await page.addStyleTag({ content: enlargedText });
  const previewDoc = page
    .frames()
    .find((item) => item.url().endsWith('/component-preview.html'));
  if (!previewDoc) throw new Error('Missing frame');
  await previewDoc.addStyleTag({ content: enlargedText });
  await page.locator('iframe').scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  expect(
    await frame()
      .locator('html')
      .evaluate((el) => el.scrollWidth <= innerWidth)
  ).toBe(true);
  await frame().getByRole('button', { name: 'Continue', exact: true }).click();
  await frame().getByRole('dialog').waitFor();
  expect(
    await frame()
      .getByRole('dialog')
      .evaluate((el) => el.getBoundingClientRect().right <= innerWidth)
  ).toBe(true);
  await frame()
    .getByRole('button', { name: 'Back to the preview', exact: true })
    .click();
  await frame()
    .getByRole('button', { name: 'Look closer', exact: true })
    .click();
  await frame().getByRole('dialog', { name: 'About this surface' }).waitFor();
  expect(
    await frame()
      .getByRole('dialog', { name: 'About this surface' })
      .evaluate((el) => el.getBoundingClientRect().right <= innerWidth)
  ).toBe(true);
  await page.keyboard.press('Escape');
  await frame().getByRole('button', { name: 'Return to Console' }).click();
  await expect
    .poll(() =>
      page
        .getByRole('button', { name: 'Enter preview', exact: true })
        .evaluate((el) => document.activeElement === el)
    )
    .toBe(true);
});

it('loads the separate production entry at root and non-root bases with host-only bootstrap', async () => {
  for (const address of [productionBase, nestedBase]) {
    await page.goto(`${address}preview`);
    await ready();
    expect(
      await page.locator('style[data-nexus-appearance-theme]').count()
    ).toBe(1);
    expect(await frame().locator('#preview-root').count()).toBe(1);
    expect(await frame().getByRole('navigation').count()).toBe(0);
    expect(
      await frame().locator('style[data-nexus-appearance-theme]').count()
    ).toBe(0);
    await noPreviewPersistence();
    await page.getByLabel('Preview appearance').selectOption('dark');
    await ready();
    const doc = page
      .frames()
      .find((item) => item.url().endsWith('/component-preview.html'));
    if (!doc) throw new Error('Missing built frame');
    expect(doc.url()).toBe(`${address}component-preview.html`);
    await Promise.all([
      page.waitForEvent('framenavigated', (navigated) => navigated === doc),
      doc.evaluate(() => location.reload()),
    ]);
    await ready();
    expect(await frame().locator('html').getAttribute('class')).toBe('dark');
    await page.goto(`${address}component-preview.html`);
    await page.getByText('Waiting for a theme from Nexus Console.').waitFor();
    expect(await page.evaluate(() => window.persistenceAccess)).toEqual([]);
  }
  const html = fs.readFileSync(
    path.join(output, 'component-preview.html'),
    'utf8'
  );
  expect(html).not.toContain('localStorage');
  expect(html).not.toContain('data-nexus-appearance-theme');
  expect(fs.readFileSync(path.join(output, 'index.html'), 'utf8')).toContain(
    'localStorage'
  );
});

it('keeps an embedded sample hidden until a validated theme has been applied', async () => {
  await context.addInitScript(() => {
    if (parent === window) return;
    window.addEventListener('message', (event) => {
      if (
        event.data?.type === 'apply' &&
        document.documentElement.dataset.allowPreview !== 'yes'
      )
        event.stopImmediatePropagation();
    });
  });
  await page.goto(`${base}preview`);
  await frame().getByText('Waiting for a theme from Nexus Console.').waitFor();
  expect(await frame().getByRole('button').count()).toBe(0);
  expect(
    await page
      .getByRole('button', { name: 'Enter preview', exact: true })
      .isDisabled()
  ).toBe(true);
  await frame()
    .locator('html')
    .evaluate((el) => {
      el.dataset.allowPreview = 'yes';
    });
  await page.getByLabel('Preview appearance').selectOption('dark');
  await ready();
  expect(await frame().locator('html').getAttribute('class')).toBe('dark');
});

it('reports a React commit failure instead of acknowledging a missing scene', async () => {
  await context.addInitScript(() => {
    if (parent === window) return;
    window.addEventListener('message', (event) => {
      if (event.data?.type !== 'apply') return;
      const createElement = document.createElement.bind(document);
      document.createElement = ((
        name: string,
        options?: ElementCreationOptions
      ) => {
        if (name === 'button')
          throw new Error('Controlled scene commit failure');
        return createElement(name, options);
      }) as typeof document.createElement;
    });
  });
  await page.goto(`${base}preview`);
  await page
    .locator('[data-slot="preview-connection"][data-state="error"]')
    .waitFor();
  expect(await page.locator('iframe').isVisible()).toBe(false);
  expect(
    await page
      .locator('[data-slot="preview-connection"]')
      .getAttribute('data-revision')
  ).toBeNull();
});
