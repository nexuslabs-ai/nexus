// Lists every host style that adding Nexus changed in an example app.
//
// Copies the app out of the repository twice: as it is, and as it was before
// Nexus — its Nexus CSS entry emptied and the appearance provider reduced to a
// pass-through. Builds and serves both, then compares 17 computed styles on
// <html>, <body> and every element whose nearest [data-check] is "host",
// page by page. Each [data-check-open] trigger is opened so portalled content
// is read too.
//
// Reads `check` from the app's nexus.json: { "cssEntry": "app/nexus.css", "pages": ["/"] }
// usage: node examples/scripts/check.mjs examples/shadcn-app
import { spawn, execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { chromium } from 'playwright';

const PROPERTIES = [
  'color',
  'background-color',
  'border-top-color',
  'border-top-style',
  'border-top-width',
  'border-top-left-radius',
  'box-sizing',
  'color-scheme',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'margin-top',
  'padding-top',
  'padding-left',
  'list-style-type',
  'text-decoration-line',
];
const SKIP = new Set(['node_modules', '.next', 'dist']);

const PROVIDER_STUB = `'use client';
import type * as React from 'react';
import { DEFAULT_NEXUS_APPEARANCE } from '@nexus_ds/core';

export function NexusAppearanceProvider({ children }: { children?: React.ReactNode; [prop: string]: unknown }) {
  return children;
}
type State = typeof DEFAULT_NEXUS_APPEARANCE;
export function useNexusAppearance(): { state: State; setState: React.Dispatch<React.SetStateAction<State>> } {
  return { state: DEFAULT_NEXUS_APPEARANCE, setState() {} };
}
export function NexusAppearanceScript(_props: Record<string, unknown>) {
  return null;
}
`;
const SCRIPT_STUB = `export function NexusAppearanceScript(_props: Record<string, unknown>) {
  return null;
}
`;

const appDir = path.resolve(process.argv[2] ?? '');
const config = JSON.parse(readFileSync(path.join(appDir, 'nexus.json'), 'utf8'));
const isNext = 'next' in JSON.parse(readFileSync(path.join(appDir, 'package.json'), 'utf8')).dependencies;

function copyApp(label) {
  const dir = path.join(mkdtempSync(path.join(tmpdir(), `nexus-check-${label}-`)), 'app');
  cpSync(appDir, dir, { recursive: true, filter: (src) => !SKIP.has(path.basename(src)) });
  return dir;
}

function removeNexus(dir) {
  const providerDir = path.join(dir, config.sourceDir, 'components/appearance/provider');
  writeFileSync(path.join(dir, config.check.cssEntry), '');
  writeFileSync(path.join(providerDir, 'index.ts'), PROVIDER_STUB);
  writeFileSync(path.join(providerDir, 'server.ts'), SCRIPT_STUB);
}

function run(dir, args) {
  try {
    execFileSync('npm', args, { cwd: dir, stdio: 'pipe' });
  } catch (error) {
    throw new Error(`npm ${args.join(' ')} failed in ${dir}\n${error.stdout}\n${error.stderr}`);
  }
}

function build(dir) {
  run(dir, ['ci', '--no-audit', '--no-fund']);
  run(dir, ['run', 'build']);
}

// Starts the production server and resolves once it prints its local URL.
function serve(dir, port) {
  const args = isNext
    ? ['next', 'start', '-p', String(port)]
    : ['vite', 'preview', '--port', String(port), '--strictPort'];
  const server = spawn('npx', args, { cwd: dir });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`server in ${dir} did not start`)), 60_000);
    server.stdout.on('data', (chunk) => {
      if (!String(chunk).includes(`localhost:${port}`)) return;
      clearTimeout(timer);
      resolve(server);
    });
    server.on('exit', (code) => reject(new Error(`server in ${dir} exited with ${code}`)));
  });
}

function readHostElements(properties) {
  const pathOf = (element) => {
    const parts = [];
    for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
      const index = [...node.parentElement.children].filter((sibling) => sibling.localName === node.localName).indexOf(node);
      parts.unshift(`${node.localName}:${index}`);
    }
    return parts.join('>') || 'html';
  };
  const isHost = (element) => element.closest('[data-check]')?.dataset.check === 'host';
  const elements = [document.documentElement, document.body, ...[...document.body.querySelectorAll('*')].filter(isHost)];
  return Object.fromEntries(
    elements.map((element) => {
      const style = getComputedStyle(element);
      return [pathOf(element), Object.fromEntries(properties.map((name) => [name, style.getPropertyValue(name)]))];
    })
  );
}

// Waits for finite animations; indeterminate progress bars run forever.
function settle() {
  const finite = document.getAnimations().filter((animation) => animation.effect?.getTiming().iterations !== Infinity);
  return Promise.all(finite.map((animation) => animation.finished.catch(() => {})));
}

async function snapshot(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(settle);
  const elements = await page.evaluate(readHostElements, PROPERTIES);

  const triggers = page.locator('[data-check-open]');
  for (let index = 0; index < (await triggers.count()); index += 1) {
    await triggers.nth(index).click();
    await page.waitForSelector('[data-state="open"][role="dialog"], [data-state="open"][role="menu"]');
    await page.evaluate(settle);
    Object.assign(elements, await page.evaluate(readHostElements, PROPERTIES));
    await page.keyboard.press('Escape');
    await page.waitForSelector('[data-state="open"][role="dialog"], [data-state="open"][role="menu"]', { state: 'detached' });
  }
  return elements;
}

const before = copyApp('before');
const after = copyApp('after');
removeNexus(before);
console.log('building the app without Nexus…');
build(before);
console.log('building the app with Nexus…');
build(after);

const servers = [await serve(before, 4174), await serve(after, 4173)];
const browser = await chromium.launch();
let total = 0;
try {
  const page = await browser.newPage({ colorScheme: 'light', viewport: { width: 1440, height: 1000 } });
  for (const route of config.check.pages) {
    const a = await snapshot(page, `http://localhost:4174${route}`);
    const b = await snapshot(page, `http://localhost:4173${route}`);

    // Group identical changes so one leak shows as one line, not one per element.
    const groups = new Map();
    for (const key of Object.keys(a).filter((key) => key in b)) {
      for (const name of PROPERTIES) {
        if (a[key][name] === b[key][name]) continue;
        const change = `${name}: ${a[key][name]} → ${b[key][name]}`;
        groups.set(change, (groups.get(change) ?? 0) + 1);
        total += 1;
      }
    }
    const count = [...groups.values()].reduce((sum, n) => sum + n, 0);
    console.log(`\n${route}  ${count} host properties changed`);
    for (const [change, n] of [...groups].sort((x, y) => y[1] - x[1])) console.log(`  ${String(n).padStart(4)} × ${change}`);
  }
} finally {
  await browser.close();
  for (const server of servers) server.kill();
}
console.log(`\n${total} host properties changed in total`);
