import { type ChildProcess, spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from 'playwright';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

import { GALLERY } from '../app/_create/gallery';

let browser: Browser,
  context: BrowserContext,
  page: Page,
  server: ChildProcess,
  base: string;
let logs = '';
beforeAll(async () => {
  const port = await new Promise<number>((resolve) => {
    const socket = net.createServer();
    socket.listen(0, '127.0.0.1', () => {
      const address = socket.address();
      if (!address || typeof address === 'string')
        throw new Error('No test port');
      socket.close(() => resolve(address.port));
    });
  });
  base = `http://127.0.0.1:${port}`;
  server = spawn(
    process.execPath,
    [
      path.resolve('node_modules/next/dist/bin/next'),
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(port),
    ],
    { cwd: path.resolve('apps/docs'), stdio: 'pipe' }
  );
  server.stdout?.on('data', (chunk) => {
    logs += String(chunk);
  });
  server.stderr?.on('data', (chunk) => {
    logs += String(chunk);
  });
  const deadline = Date.now() + 45000;
  let started = false;
  while (Date.now() < deadline) {
    try {
      started = (await fetch(base + '/create')).status === 200;
      if (started) break;
    } catch {
      /* Wait for the local production server to bind. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!started) throw new Error('Docs server failed to start: ' + logs);
  browser = await chromium.launch({ headless: true });
});
afterAll(async () => {
  await browser?.close();
  server?.kill('SIGTERM');
});
beforeEach(async () => {
  context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  });
  page = await context.newPage();
});
afterEach(async () => {
  await context?.close();
});
async function ready() {
  await expect
    .poll(
      () =>
        page
          .locator('[data-slot="preview-connection"]')
          .getAttribute('data-state'),
      { timeout: 20000 }
    )
    .toBe('applied');
}

it('isolates theme, preserves demo state through undo, and remembers only playground appearance', async () => {
  await page.goto(base + '/create');
  await ready();
  const frame = page.frameLocator('iframe');
  await frame.getByLabel('Project name', { exact: true }).fill('Keep my draft');
  const host = await page.evaluate(
    () => document.documentElement.outerHTML.split('<body')[0]
  );
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await ready();
  expect(
    await page.evaluate(
      () => document.documentElement.outerHTML.split('<body')[0]
    )
  ).toBe(host);
  expect(await frame.locator('html').getAttribute('class')).toContain('dark');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await ready();
  expect(
    await frame.getByLabel('Project name', { exact: true }).inputValue()
  ).toBe('Keep my draft');
  await page.getByLabel('Corners', { exact: true }).selectOption('round');
  await page.reload();
  await ready();
  expect(await page.getByLabel('Corners', { exact: true }).inputValue()).toBe(
    'round'
  );
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await ready();
  expect(
    await frame.getByLabel('Project name', { exact: true }).inputValue()
  ).toBe('');
});
it('contains dialog overlays and returns focus', async () => {
  await page.goto(base + '/create');
  await ready();
  const frame = page.frameLocator('iframe');
  await frame.getByRole('button', { name: 'Open dialog', exact: true }).click();
  expect(await frame.getByRole('dialog').isVisible()).toBe(true);
  expect(await page.getByRole('dialog').count()).toBe(0);
  await page.keyboard.press('Escape');
  expect(
    await frame
      .getByRole('button', { name: 'Open dialog', exact: true })
      .evaluate((el) => el === document.activeElement)
  ).toBe(true);
  await frame.getByRole('button', { name: 'Return to controls' }).click();
  await expect
    .poll(() =>
      page
        .getByRole('button', { name: 'Enter preview' })
        .evaluate((el) => el === document.activeElement)
    )
    .toBe(true);
});
it('renders every public component composition without preview failures', async () => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/create?view=components&component=button');
  await ready();
  for (const entry of GALLERY) {
    await page.getByLabel('Component', { exact: true }).selectOption(entry.id);
    await ready();
    await expect
      .poll(() =>
        page
          .frameLocator('iframe')
          .getByRole('heading', { name: entry.label, exact: true, level: 1 })
          .count()
      )
      .toBe(1);
    expect(errors, entry.id).toEqual([]);
  }
}, 180000);
it('retains Explorer deep links, logical filtering and browser navigation', async () => {
  await page.goto(
    base +
      '/create?view=tokens&group=runtime&token=runtime%3Acolor%3Abackground-hover&variant=runtime%3Acolor%3Abackground-hover%40dark'
  );
  await expect
    .poll(() => page.locator('[data-slot="token-detail"]').count())
    .toBe(1);
  await page.getByRole('link', { name: 'All tokens' }).click();
  await expect
    .poll(() => page.locator('[data-slot="token-explorer"]').count())
    .toBe(1);
  await page.getByLabel('Find a token').fill('primary-background');
  expect(
    await page
      .getByRole('link')
      .filter({ hasText: 'primary-background' })
      .count()
  ).toBeGreaterThan(0);
  await page.goBack();
  await expect
    .poll(() => page.locator('[data-slot="token-detail"]').count())
    .toBe(1);
});
it('recovers a reloaded frame and exposes a narrow-screen controls panel', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/create');
  await ready();
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  expect(await page.getByRole('dialog').isVisible()).toBe(true);
  await expect
    .poll(() =>
      page
        .getByRole('dialog')
        .getByLabel('Surface tone', { exact: true })
        .isVisible()
    )
    .toBe(true);
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Reload preview', exact: true })
    .click();
  await ready();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
});
it('keeps docs bootstrap out of preview and scopes frame policy', async () => {
  const response = await fetch(base + '/create/preview');
  const html = await response.text();
  expect(html).not.toContain('nexus-docs-appearance');
  expect(response.headers.get('content-security-policy-report-only')).toContain(
    "frame-ancestors 'self'"
  );
  const docs = await fetch(base + '/getting-started/install');
  expect(docs.status).toBe(200);
  expect(docs.headers.get('content-security-policy-report-only')).toContain(
    "frame-ancestors 'none'"
  );
  expect(await docs.text()).toContain('Create your theme');
  expect(logs).not.toContain('EADDRINUSE');
});
it('exports the accepted configuration and complete CSS with attributes', async () => {
  await page.goto(base + '/create');
  await ready();
  await page.getByLabel('Surface tone', { exact: true }).selectOption('slate');
  await ready();
  await page
    .getByRole('button', { name: 'Use this theme', exact: true })
    .click();
  const codes = await page
    .getByRole('dialog')
    .locator('code')
    .allTextContents();
  expect(codes[0]).toContain('"surfaceTone": "slate"');
  expect(codes[1]).toContain(':root.dark');
  expect(codes[2]).toContain('data-density');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download complete setup' }).click();
  expect((await download).suggestedFilename()).toBe('nexus-theme.json');
});

it('recovers missing documents and partial application failures without accepting a stale canvas', async () => {
  await page.route('**/create/preview', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<title>Unavailable</title>',
    })
  );
  await page.goto(base + '/create');
  await page
    .locator('[data-slot="preview-connection"][data-state="error"]')
    .waitFor({ timeout: 12000 });
  expect(await page.locator('iframe').isVisible()).toBe(false);
  await page.unroute('**/create/preview');
  await page
    .getByRole('button', { name: 'Reload preview', exact: true })
    .click();
  await ready();
  await page
    .frameLocator('iframe')
    .locator('html')
    .evaluate(() => {
      document.head.appendChild = () => {
        throw new Error('Controlled application failure');
      };
    });
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await page
    .locator('[data-slot="preview-connection"][data-state="error"]')
    .waitFor();
  await page
    .getByRole('button', { name: 'Reload preview', exact: true })
    .click();
  await ready();
  expect(
    await page.frameLocator('iframe').locator('html').getAttribute('class')
  ).toContain('dark');
});

it('falls back from corrupt storage and keeps rapid appearance edits consistent', async () => {
  await context.addInitScript(() =>
    localStorage.setItem('nexus-create-appearance-v1', '{ broken')
  );
  await page.goto(base + '/create');
  await ready();
  expect(
    await page.getByLabel('Appearance', { exact: true }).inputValue()
  ).toBe('light');
  for (const density of ['tight', 'spacious', 'compact'])
    await page.getByLabel('Density', { exact: true }).selectOption(density);
  await ready();
  expect(
    await page
      .frameLocator('iframe')
      .locator('html')
      .getAttribute('data-density')
  ).toBe('compact');
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.locator('[data-slot="create-inspector"]').waitFor();
  expect(
    await page.locator('[data-slot="create-inspector"] code').textContent()
  ).toContain('<Button');
});
