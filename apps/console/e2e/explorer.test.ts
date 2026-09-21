import path from 'node:path';
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from 'playwright';
import {
  createServer,
  preview,
  type PreviewServer,
  type ViteDevServer,
} from 'vite';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

let browser: Browser;
let server: ViteDevServer;
let production: PreviewServer;
let context: BrowserContext;
let page: Page;
let base: string;
let productionBase: string;
const errors: string[] = [];
const businessRequests: string[] = [];
const root = path.resolve('apps/console');

beforeAll(async () => {
  server = await createServer({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    server: { host: '127.0.0.1', port: 0 },
  });
  await server.listen();
  const address = server.resolvedUrls?.local[0];
  if (!address) throw new Error('The development server has no URL.');
  base = address;
  production = await preview({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    preview: { host: '127.0.0.1', port: 0 },
  });
  const productionAddress = production.resolvedUrls?.local[0];
  if (!productionAddress) throw new Error('The production server has no URL.');
  productionBase = productionAddress;
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
  await new Promise<void>((resolve, reject) => {
    if (!production) {
      resolve();
      return;
    }
    production.httpServer.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
});

beforeEach(async () => {
  errors.length = 0;
  businessRequests.length = 0;
  context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/\/api\/|mockServiceWorker/.test(request.url()))
      businessRequests.push(request.url());
  });
});

afterEach(async () => {
  await context?.close();
  expect(errors).toEqual([]);
  expect(businessRequests).toEqual([]);
});

describe('minimal Console', () => {
  it('opens the explorer without authentication and supports keyboard navigation', async () => {
    await page.goto(base);
    await page
      .getByRole('heading', { name: 'Every token has a story.' })
      .waitFor();
    expect(new URL(page.url()).pathname).toBe('/explore');
    expect(
      await page
        .getByRole('link', {
          name: /sign in|CRM|Billing|Projects|Learn|foundations/i,
        })
        .count()
    ).toBe(0);
    await expect
      .poll(() => page.title())
      .toBe('Every token has a story. · Nexus Console');
    const appearance = page.getByRole('link', {
      name: 'Console appearance',
      exact: true,
    });
    await appearance.focus();
    await page.keyboard.press('Enter');
    await page
      .getByRole('heading', { name: 'Console appearance', exact: true })
      .waitFor();
  });

  it('gives retired business, lesson and reference routes an operable return path', async () => {
    for (const route of [
      'm/crm',
      'login',
      'learn',
      'learn/foundations',
      'learn/theme',
      'learn/preview',
      'playground/theme',
      'reference',
      'reference/states',
      'unknown',
    ]) {
      await page.goto(`${base}${route}`);
      await page.getByRole('heading', { name: 'Page not found' }).waitFor();
      await page.getByRole('link', { name: 'Back to tokens' }).click();
      await page
        .getByRole('heading', { name: 'Every token has a story.' })
        .waitFor();
    }
  });

  it('keeps saved Console appearance across reloads', async () => {
    await page.goto(base);
    await page.getByRole('button', { name: 'Theme', exact: true }).click();
    await page.getByRole('radio', { name: 'Dark', exact: true }).click();
    await expect
      .poll(() => page.locator('html').getAttribute('class'))
      .toContain('dark');
    await page.reload();
    await page
      .getByRole('heading', { name: 'Every token has a story.' })
      .waitFor();
    expect(await page.locator('html').getAttribute('class')).toContain('dark');
  });

  it('supports narrow navigation and enlarged text', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page
      .getByRole('heading', { name: 'Every token has a story.' })
      .waitFor();
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
    await page
      .getByRole('link', { name: 'Console appearance', exact: true })
      .click();
    await page
      .getByRole('heading', { name: 'Console appearance', exact: true })
      .waitFor();
    await expect.poll(() => page.getByRole('dialog').count()).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      )
    ).toBe(true);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${base}explore`);
    await page
      .getByRole('heading', { name: 'Every token has a story.' })
      .waitFor();
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      )
    ).toBe(true);
  });
});

describe('complete token explorer', () => {
  it('filters live records, opens a stable detail link, and keeps filters on return', async () => {
    await page.goto(`${base}explore`);
    await page
      .getByRole('heading', { name: 'Every token has a story.' })
      .waitFor();
    await page.getByLabel('Find a token').fill('primary-background');
    await page
      .getByLabel('Token group', { exact: true })
      .selectOption('runtime');
    await page.getByLabel('Mode', { exact: true }).selectOption('dark');
    await page
      .getByRole('link', { name: /^--nx-color-primary-background Runtime/ })
      .click();
    await page
      .getByRole('heading', {
        name: '--nx-color-primary-background',
        exact: true,
      })
      .waitFor();
    expect(new URL(page.url()).searchParams.get('token')).toBe(
      'runtime:color:primary-background'
    );
    await page.getByRole('heading', { name: 'Inside the engine' }).waitFor();
    expect(await page.getByLabel('Mode / variant').inputValue()).toBe(
      'runtime:color:primary-background@dark'
    );
    await page.reload();
    await page
      .getByRole('heading', {
        name: '--nx-color-primary-background',
        exact: true,
      })
      .waitFor();
    await page.getByText('Read the trace', { exact: true }).click();
    expect(
      await page.locator('[data-slot="token-detail"]').innerText()
    ).toContain('"sequence"');
    await page.getByRole('link', { name: 'All tokens', exact: true }).click();
    expect(await page.getByLabel('Find a token').inputValue()).toBe(
      'primary-background'
    );
    expect(await page.getByLabel('Mode', { exact: true }).inputValue()).toBe(
      'dark'
    );
  });

  it('offers logical groups and clears incompatible selections before they can empty results', async () => {
    await page.goto(`${base}explore`);
    const group = page.getByLabel('Token group', { exact: true });
    const type = page.getByLabel('Value type', { exact: true });
    const mode = page.getByLabel('Mode', { exact: true });
    await group.selectOption('runtime');
    await mode.selectOption('dark');
    expect(await type.isDisabled()).toBe(true);
    await group.selectOption('group:spacing');
    expect(await mode.inputValue()).toBe('');
    expect(await type.inputValue()).toBe('');
    expect(await mode.locator('option').allTextContents()).not.toContain(
      'dark'
    );
    await mode.selectOption('compact');
    expect(
      await page
        .getByRole('heading', { name: 'No tokens match these filters.' })
        .count()
    ).toBe(0);
    await group.selectOption('set:primitives:radius');
    expect(await mode.locator('option').allTextContents()).not.toContain(
      'compact'
    );
    await mode.selectOption('round');
    await page.reload();
    await group.waitFor();
    expect(await group.inputValue()).toBe('set:primitives:radius');
    expect(await mode.inputValue()).toBe('round');
    expect(
      await page.getByRole('link', { name: /radius.md/ }).count()
    ).toBeGreaterThan(0);
    await group.selectOption('group:colors');
    await page.getByLabel('Find a token').fill('primary-background');
    expect(
      await group.locator('option[value="set:primitives:radius"]').isDisabled()
    ).toBe(true);
    const gaps = await page
      .locator('section[aria-label="Find tokens"] label')
      .evaluateAll((labels) =>
        labels.map((label) => {
          const input = document.getElementById(
            (label as HTMLLabelElement).htmlFor
          );
          if (!input) throw new Error('Missing control');
          return (
            input.getBoundingClientRect().top -
            label.getBoundingClientRect().bottom
          );
        })
      );
    expect(gaps).toEqual([8, 8, 8, 8]);
  });

  it('follows composite aliases with the keyboard and exposes authored versus emitted normalization', async () => {
    await page.goto(`${base}explore?token=styles%3Atypography%3Acode.inline`);
    await page
      .getByRole('heading', { name: 'typography.code.inline', exact: true })
      .waitFor();
    expect(
      await page.locator('[data-slot="token-detail"]').innerText()
    ).toContain('auto');
    await page.getByText('View emitted CSS', { exact: true }).click();
    expect(
      await page.locator('[data-slot="token-detail"]').innerText()
    ).toContain('line-height: normal;');
    const reference = page.getByRole('link', {
      name: '{family.font-mono}',
      exact: true,
    });
    await reference.focus();
    await page.keyboard.press('Enter');
    await page
      .getByRole('heading', {
        name: 'typography.family.font-mono',
        exact: true,
      })
      .waitFor();
    await page.goBack();
    await page
      .getByRole('heading', { name: 'typography.code.inline', exact: true })
      .waitFor();
  });

  it('handles empty searches and removed token or variant links', async () => {
    await page.goto(`${base}explore?q=definitely-missing-token`);
    await page
      .getByRole('heading', { name: 'No tokens match these filters.' })
      .waitFor();
    await page.getByRole('link', { name: 'Clear filters' }).click();
    await page.getByRole('link', { name: /borderwidth.default/ }).waitFor();
    await page.goto(`${base}explore?token=removed-token`);
    await page
      .getByRole('heading', { name: 'This token was not found.' })
      .waitFor();
    await page.goto(
      `${base}explore?token=primitives%3Aradius%3Amd&variant=removed-mode`
    );
    await page
      .getByRole('heading', { name: 'This token variant was not found.' })
      .waitFor();
    await page.getByRole('link', { name: 'View available variants' }).click();
    await page
      .getByRole('heading', { name: 'radius.md', exact: true })
      .waitFor();
  });

  it('keeps list and composite details usable on narrow screens with enlarged text', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of [
      'explore',
      'explore?token=styles%3Ashadows%3Asm',
      'explore?token=runtime%3Acolor%3Aprimary-background',
    ]) {
      await page.goto(`${base}${route}`);
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflow).toBe(false);
    }
  });

  it('serves production detail links and lazy-loads catalog and evidence separately', async () => {
    const scripts: string[] = [];
    page.on('request', (request) => {
      if (request.resourceType() === 'script') scripts.push(request.url());
    });
    await page.goto(`${productionBase}settings/appearance`);
    await page.getByRole('heading', { name: 'Console appearance' }).waitFor();
    expect(scripts.some((url) => url.includes('explore-route'))).toBe(false);
    expect(scripts.some((url) => url.includes('runtime-evidence'))).toBe(false);
    await page.goto(
      `${productionBase}explore?token=runtime%3Acolor%3Aprimary-background`
    );
    await page
      .getByRole('heading', {
        name: '--nx-color-primary-background',
        exact: true,
      })
      .waitFor();
    await page.getByRole('heading', { name: 'Inside the engine' }).waitFor();
    expect(scripts.some((url) => url.includes('explore-route'))).toBe(true);
    expect(scripts.some((url) => url.includes('runtime-evidence'))).toBe(true);
  });
});
