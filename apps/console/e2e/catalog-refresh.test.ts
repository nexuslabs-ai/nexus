import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { type Browser, chromium, type Page } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, expect, it } from 'vitest';

import { tokenCatalogPlugin } from '../scripts/token-catalog-plugin';

let server: ViteDevServer;
let browser: Browser;
let page: Page;
let base: string;
const tokensDir = fs.mkdtempSync(
  path.join(os.tmpdir(), 'nexus-catalog-refresh-')
);
const repo = process.cwd();
const fixture = path.join(tokensDir, 'semantic/catalog-study.json');

beforeAll(async () => {
  fs.cpSync(path.join(repo, 'packages/core/tokens'), tokensDir, {
    recursive: true,
  });
  server = await createServer({
    root: path.join(repo, 'apps/console'),
    configFile: false,
    plugins: [tokenCatalogPlugin({ tokensDir }), react(), tailwindcss()],
    resolve: {
      alias: [
        {
          find: /^@nexus_ds\/core\/palette$/,
          replacement: path.join(repo, 'packages/core/src/palette.ts'),
        },
        {
          find: /^@nexus_ds\/core$/,
          replacement: path.join(repo, 'packages/core/src/index.ts'),
        },
      ],
    },
    server: { host: '127.0.0.1', port: 0 },
  });
  await server.listen();
  const address = server.resolvedUrls?.local[0];
  if (!address) throw new Error('Missing test server URL.');
  base = address;
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
  fs.rmSync(tokensDir, { force: true, recursive: true });
});

it('refreshes edits, additions, removals and mode renames, and replaces invalid data with an error', async () => {
  await page.goto(`${base}explore?q=catalog-study`);
  await page
    .getByRole('heading', { name: 'No tokens match these filters.' })
    .waitFor();
  fs.writeFileSync(
    fixture,
    JSON.stringify({
      caption: { $type: 'string', $value: 'First source value' },
    })
  );
  await page.getByRole('link', { name: /catalog-study.caption/ }).waitFor();
  await page.getByRole('link', { name: /catalog-study.caption/ }).click();
  await page
    .getByRole('heading', { name: 'catalog-study.caption', exact: true })
    .waitFor();
  fs.writeFileSync(
    fixture,
    JSON.stringify({
      caption: { $type: 'string', $value: 'Updated source value' },
    })
  );
  await page
    .getByText('Updated source value', { exact: true })
    .first()
    .waitFor();
  fs.writeFileSync(fixture, '{ invalid json');
  await page
    .getByRole('heading', { name: 'The catalog needs attention.' })
    .waitFor();
  expect(await page.locator('[data-slot="token-detail"]').count()).toBe(0);
  fs.writeFileSync(
    fixture,
    JSON.stringify({
      caption: { $type: 'string', $value: 'Recovered source value' },
    })
  );
  await page
    .getByText('Recovered source value', { exact: true })
    .first()
    .waitFor();
  fs.rmSync(fixture);
  await page
    .getByRole('heading', { name: 'This token was not found.' })
    .waitFor();

  await page.goto(`${base}explore?token=primitives%3Aradius%3Amd`);
  await page.getByLabel('Mode / variant').waitFor();
  const original = path.join(tokensDir, 'primitives/radius/radius-smooth.json');
  const added = path.join(tokensDir, 'primitives/radius/radius-notebook.json');
  const renamed = path.join(tokensDir, 'primitives/radius/radius-study.json');
  fs.copyFileSync(original, added);
  await page
    .getByRole('option', { name: 'notebook', exact: true })
    .waitFor({ state: 'attached' });
  await page.getByLabel('Mode / variant').selectOption({ label: 'notebook' });
  fs.renameSync(added, renamed);
  await page
    .getByRole('heading', { name: 'This token variant was not found.' })
    .waitFor();
  await page.getByRole('link', { name: 'View available variants' }).click();
  await page
    .getByRole('option', { name: 'study', exact: true })
    .waitFor({ state: 'attached' });
  fs.rmSync(renamed);
  await page
    .getByRole('option', { name: 'study', exact: true })
    .waitFor({ state: 'detached' });
}, 60000);

it('keeps filesystem, generator, and parser code out of the production browser bundles', () => {
  const dir = path.join(repo, 'apps/console/dist/assets');
  const scripts = fs.readdirSync(dir).filter((file) => file.endsWith('.js'));
  expect(scripts.length).toBeGreaterThan(0);
  for (const script of scripts) {
    const content = fs.readFileSync(path.join(dir, script), 'utf8');
    expect(content).not.toMatch(
      /node:fs|node:child_process|generateTokenCatalog|collectTokenSources|class CssSyntaxError/
    );
  }
});
