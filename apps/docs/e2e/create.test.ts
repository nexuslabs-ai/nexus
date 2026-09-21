import { type ChildProcess, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from 'playwright';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

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

it('shares theme with docs, preserves demo state through undo, and remembers appearance', async () => {
  await page.goto(base + '/create');
  await ready();
  const frame = page.frameLocator('iframe');
  await frame.getByLabel('Project name', { exact: true }).fill('Keep my draft');
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await ready();
  await expect
    .poll(() => page.locator('html').getAttribute('class'))
    .toContain('dark');
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
  await expect
    .poll(() =>
      page.locator('iframe').evaluate((element) => {
        const content = (
          element as HTMLIFrameElement
        ).contentDocument?.getElementById('preview-root');
        return (
          !!content &&
          Math.abs(
            element.getBoundingClientRect().height -
              content.getBoundingClientRect().height
          ) <= 1
        );
      })
    )
    .toBe(true);
  expect(
    await page
      .locator('iframe')
      .evaluate((element) => getComputedStyle(element).borderTopWidth)
  ).toBe('0px');
  await frame.getByRole('button', { name: 'Open dialog', exact: true }).click();
  expect(await frame.getByRole('dialog').isVisible()).toBe(true);
  expect(await page.getByRole('dialog').count()).toBe(0);
  await page.keyboard.press('Escape');
  expect(
    await frame
      .getByRole('button', { name: 'Open dialog', exact: true })
      .evaluate((el) => el === document.activeElement)
  ).toBe(true);
  expect(
    await frame.getByRole('button', { name: 'Return to controls' }).count()
  ).toBe(0);
  expect(
    await page
      .getByRole('button', { name: /Enter preview|Reload preview|Inspect/ })
      .count()
  ).toBe(0);
  expect(await frame.getByRole('button', { name: /Inspect/ }).count()).toBe(0);
});
it('keeps Create focused on examples even for former component-view links', async () => {
  await page.goto(base + '/create?view=components&component=button');
  await ready();
  expect(
    await page.getByRole('button', { name: 'Components', exact: true }).count()
  ).toBe(0);
  expect(await page.getByLabel('Component', { exact: true }).count()).toBe(0);
  const rail = await page
    .getByRole('complementary', { name: 'Playground controls' })
    .boundingBox();
  const canvas = await page
    .getByRole('region', { name: 'Playground canvas' })
    .boundingBox();
  expect(rail).not.toBeNull();
  expect(canvas).not.toBeNull();
  expect(rail!.x + rail!.width).toBeLessThanOrEqual(canvas!.x);
  expect(Math.abs(rail!.height - canvas!.height)).toBeLessThan(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight
    )
  ).toBe(true);

  await page
    .frameLocator('iframe')
    .getByRole('heading', { name: 'A fresh start' })
    .waitFor();
});
it('retains Explorer deep links, logical filtering and browser navigation', async () => {
  await page.goto(
    base +
      '/create?view=tokens&group=runtime&token=runtime%3Acolor%3Abackground-hover&variant=runtime%3Acolor%3Abackground-hover%40dark'
  );
  await expect
    .poll(() => page.locator('[data-slot="token-detail"]').count())
    .toBe(1);
  expect(new URL(page.url()).pathname).toBe('/token');
  expect(new URL(page.url()).searchParams.has('view')).toBe(false);
  await page
    .locator('[data-slot="accordion-trigger"][aria-expanded="true"]')
    .click();
  await expect
    .poll(() => page.locator('[data-slot="token-explorer"]').count())
    .toBe(1);
  await page.getByLabel('Find a token').fill('primary-background');
  expect(
    await page
      .getByRole('button')
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
  await page.reload();
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
  await page.reload();
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
  await page.reload();
  await ready();
  expect(
    await page.frameLocator('iframe').locator('html').getAttribute('class')
  ).toContain('dark');
});

it('falls back from corrupt storage and keeps rapid appearance edits consistent', async () => {
  await context.addInitScript(() =>
    localStorage.setItem('nexus-docs-appearance', '{ broken')
  );
  await page.goto(base + '/create');
  await ready();
  expect(
    await page.getByLabel('Appearance', { exact: true }).inputValue()
  ).toBe('system');
  for (const density of ['tight', 'spacious', 'compact'])
    await page.getByLabel('Density', { exact: true }).selectOption(density);
  await ready();
  expect(
    await page
      .frameLocator('iframe')
      .locator('html')
      .getAttribute('data-density')
  ).toBe('compact');
});

it('operates selection and popover controls with the keyboard inside the preview', async () => {
  await page.goto(base + '/create');
  await ready();
  const frame = page.frameLocator('iframe');
  await frame.getByLabel('Project name', { exact: true }).focus();
  expect(await frame.locator(':focus').count()).toBe(1);
  await frame.getByRole('combobox', { name: 'Visibility' }).focus();
  await page.keyboard.press('Enter');
  await frame.getByRole('listbox').waitFor();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await frame.getByRole('listbox').waitFor({ state: 'hidden' });
  await expect
    .poll(() =>
      frame
        .getByRole('combobox', { name: 'Visibility' })
        .evaluate((el) => el === document.activeElement)
    )
    .toBe(true);
  await frame
    .getByRole('button', { name: 'Quick details', exact: true })
    .press('Enter');
  await frame.getByText('Same theme, another layer.').waitFor();
  expect(await page.getByText('Same theme, another layer.').count()).toBe(0);
  await page.keyboard.press('Escape');
  await expect
    .poll(() =>
      frame
        .getByRole('button', { name: 'Quick details', exact: true })
        .evaluate((el) => el === document.activeElement)
    )
    .toBe(true);
});

it('distinguishes active theme tokens from build defaults and recovers invalid deep links', async () => {
  await page.goto(base + '/token?token=runtime%3Acolor%3Abackground-hover');
  const active = page
    .getByRole('region', { name: 'Active preview value' })
    .locator('code');
  await active.waitFor();
  const before = await active.textContent();
  await page
    .getByRole('button', { name: 'Switch to dark mode', exact: true })
    .click();
  await expect.poll(() => active.textContent()).not.toBe(before);
  await page.goto(base + '/token?token=removed');
  await page
    .getByRole('heading', { name: 'This token was not found.' })
    .waitFor();
  await page.getByRole('link', { name: 'Explore all tokens' }).click();
  await page.getByLabel('Find a token').fill('no-such-nexus-token');
  await page
    .getByRole('heading', { name: 'No tokens match these filters.' })
    .waitFor();
});

it('keeps generator and filesystem tooling out of production browser chunks', () => {
  const root = path.resolve('apps/docs/.next/static/chunks');
  const files: string[] = [];
  function collect(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(file);
      else if (entry.name.endsWith('.js')) files.push(file);
    }
  }
  collect(root);
  expect(files.length).toBeGreaterThan(0);
  for (const file of files)
    expect(fs.readFileSync(file, 'utf8')).not.toMatch(
      /node:fs|node:child_process|generateTokenCatalog|collectTokenSources|class CssSyntaxError/
    );
});

it('keeps the narrow examples usable with enlarged text and density extremes', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/create?view=components&component=button');
  await ready();
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  const controls = page.getByRole('dialog');
  await controls.getByLabel('UI font size', { exact: true }).fill('28');
  for (const density of ['tight', 'spacious']) {
    await controls.getByLabel('Density', { exact: true }).selectOption(density);
    await ready();
    expect(
      await page
        .frameLocator('iframe')
        .locator('html')
        .evaluate((el) => el.scrollWidth <= innerWidth)
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
});

it('shares surfaces across Create, article navigation and the docs selector', async () => {
  await page.goto(base + '/create');
  await ready();
  await page.getByLabel('Surface tone', { exact: true }).selectOption('slate');
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await ready();
  const hostSurface = await page
    .locator('html')
    .evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--nx-color-background')
    );
  const frameSurface = await page
    .frameLocator('iframe')
    .locator('html')
    .evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--nx-color-background')
    );
  expect(frameSurface.trim()).toBe(hostSurface.trim());
  await page.goto(base + '/getting-started/install');
  await expect
    .poll(() =>
      page.getByRole('combobox', { name: 'Surface tone' }).textContent()
    )
    .toContain('Slate');
  await expect
    .poll(() => page.locator('html').getAttribute('class'))
    .toContain('dark');
  await page.getByRole('combobox', { name: 'Surface tone' }).click();
  await page.getByRole('option', { name: 'Zinc', exact: true }).click();
  await page.goto(base + '/create');
  await ready();
  expect(
    await page.getByLabel('Surface tone', { exact: true }).inputValue()
  ).toBe('zinc');
  await page
    .getByRole('button', { name: 'Switch to light mode', exact: true })
    .click();
  await ready();
  await expect
    .poll(() => page.getByLabel('Appearance', { exact: true }).inputValue())
    .toBe('light');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await ready();
  expect(
    await page.getByLabel('Appearance', { exact: true }).inputValue()
  ).toBe('dark');
});

it('follows device mode in the site and preview without changing the saved preference', async () => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(base + '/create');
  await ready();
  expect(
    await page.getByLabel('Appearance', { exact: true }).inputValue()
  ).toBe('system');
  await expect
    .poll(() =>
      page.frameLocator('iframe').locator('html').getAttribute('class')
    )
    .toContain('dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect
    .poll(() =>
      page.frameLocator('iframe').locator('html').getAttribute('class')
    )
    .not.toContain('dark');
  expect(
    await page.getByLabel('Appearance', { exact: true }).inputValue()
  ).toBe('system');
});

it('uses token filters in the left rail and in a narrow-screen panel', async () => {
  await page.goto(base + '/token');
  const rail = page.getByRole('complementary', { name: 'Token filters' });
  await rail.getByLabel('Find a token').waitFor();
  expect(await page.getByLabel('Surface tone', { exact: true }).count()).toBe(
    0
  );
  expect(
    await page.getByRole('button', { name: 'Use this theme' }).count()
  ).toBe(0);
  await rail.getByLabel('Token group', { exact: true }).selectOption('runtime');
  expect(new URL(page.url()).searchParams.get('group')).toBe('runtime');
  await rail.getByLabel('Find a token').fill('primary-background');
  await page
    .getByRole('region', { name: 'Token results' })
    .getByRole('button')
    .filter({ hasText: 'primary-background' })
    .first()
    .waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const panel = page.getByRole('dialog');
  expect(
    await panel.getByLabel('Token group', { exact: true }).inputValue()
  ).toBe('runtime');
  await panel.getByRole('link', { name: 'Clear filters' }).click();
  expect(new URL(page.url()).searchParams.has('group')).toBe(false);
  await page.keyboard.press('Escape');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
});

it('expands token details in place and keeps variant deep links through reload', async () => {
  await page.goto(base + '/token');
  const first = page.getByRole('button', { name: /borderwidth.thin/ });
  await first.click();
  expect(await first.getAttribute('aria-expanded')).toBe('true');
  await page.locator('[data-slot="token-detail"]').waitFor();
  expect(
    await page.getByRole('button', { name: /borderwidth.default/ }).isVisible()
  ).toBe(true);
  expect(new URL(page.url()).searchParams.get('token')).toBeTruthy();
  await page.reload();
  await page.locator('[data-slot="token-detail"]').waitFor();
  await first.focus();
  await page.keyboard.press('Enter');
  expect(await first.getAttribute('aria-expanded')).toBe('false');
  expect(new URL(page.url()).searchParams.has('token')).toBe(false);
});
