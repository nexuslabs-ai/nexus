// Lists every host style that adding nxds changed in an example app.
//
// Copies the app out of the repository twice: as it is, and as it was before
// nxds — its nxds CSS entry emptied and the appearance provider reduced to a
// pass-through. Builds and serves both, then compares every property in PROPERTIES on
// <html>, <body> and every element whose nearest [data-check] is "host" and
// that no nxds component rendered, page by page. Each [data-check-open] trigger is opened so portalled content
// is read too.
//
// Reads `check` from the app's nxds.json, paths relative to the app:
//   cssEntry         the CSS file that brings nxds in; emptied for the baseline
//   providerModules  modules that export the appearance provider; stubbed for the baseline
//   pages            routes to compare
//   root, prepare    optional: copy this ancestor folder instead of the app alone,
//                    and `npm ci && npm run build` these folders first (a local package)
// usage: node examples/scripts/check.mjs examples/shadcn-app
import { spawn, execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
  '-webkit-font-smoothing',
];
const SKIP = new Set(['node_modules', '.next', 'dist']);

const PROVIDER_STUB = `'use client';
import type * as React from 'react';
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';

export function NxdsAppearanceProvider({ children }: { children?: React.ReactNode; [prop: string]: unknown }) {
  return children;
}
type State = typeof DEFAULT_NXDS_APPEARANCE;
export function useNxdsAppearance(): { state: State; setState: React.Dispatch<React.SetStateAction<State>> } {
  return { state: DEFAULT_NXDS_APPEARANCE, setState() {} };
}
export function NxdsAppearanceScript(_props: Record<string, unknown>) {
  return null;
}
export function createNxdsAppearance(_options: Record<string, unknown>) {
  return { NxdsAppearanceProvider };
}
`;

const appDir = path.resolve(process.argv[2] ?? '');
const config = JSON.parse(readFileSync(path.join(appDir, 'nxds.json'), 'utf8')).check;
const isNext = 'next' in JSON.parse(readFileSync(path.join(appDir, 'package.json'), 'utf8')).dependencies;
const rootDir = path.resolve(appDir, config.root ?? '.');

// A file: dependency that leaves the copied folder (packages/core) would not
// resolve from the copy, so point it at the original folder.
function pinOutsideFileDependencies(root) {
  for (const file of readdirSync(root, { recursive: true })) {
    if (!/(^|\/)package(-lock)?\.json$/.test(file)) continue;
    const originalDir = path.dirname(path.join(rootDir, file));
    const text = readFileSync(path.join(root, file), 'utf8').replace(/"file:([^"]+)"/g, (spec, relative) => {
      const target = path.resolve(originalDir, relative);
      return target.startsWith(rootDir + path.sep) ? spec : `"file:${target}"`;
    });
    writeFileSync(path.join(root, file), text);
  }
}

// Every copy is deleted when the run ends: each one holds a full node_modules.
const tempDirs = [];

// Copies the root folder and returns the app's path inside the copy.
function copyApp(label) {
  const tempDir = mkdtempSync(path.join(tmpdir(), `nxds-check-${label}-`));
  tempDirs.push(tempDir);
  const root = path.join(tempDir, path.basename(rootDir));
  cpSync(rootDir, root, { recursive: true, filter: (src) => !SKIP.has(path.basename(src)) });
  pinOutsideFileDependencies(root);
  return path.join(root, path.relative(rootDir, appDir));
}

function removeNxds(dir) {
  writeFileSync(path.join(dir, config.cssEntry), '');
  for (const module of config.providerModules) writeFileSync(path.join(dir, module), PROVIDER_STUB);
}

function run(dir, args) {
  try {
    execFileSync('npm', args, { cwd: dir, stdio: 'pipe' });
  } catch (error) {
    throw new Error(`npm ${args.join(' ')} failed in ${dir}\n${error.stdout}\n${error.stderr}`);
  }
}

function build(dir) {
  for (const prepare of [...(config.prepare ?? []), '.']) {
    run(path.join(dir, prepare), ['ci', '--prefer-offline', '--no-audit', '--no-fund']);
    run(path.join(dir, prepare), ['run', 'build']);
  }
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
  // An nxds component renders nx: classes; anything it renders is not host UI,
  // even inside a host section. A host-marked nxds element still lets its
  // children count, so a host input inside an nxds dialog body is measured.
  const isNxds = (node) => [...node.classList].some((name) => name.startsWith('nx:'));
  const isHost = (element) => {
    const scope = element.closest('[data-check]');
    if (scope?.dataset.check !== 'host') return false;
    if (element === scope) return !isNxds(element);
    for (let node = element; node !== scope; node = node.parentElement) {
      if (isNxds(node)) return false;
    }
    return true;
  };
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
  // Radix and MUI mark open overlays differently, so wait for the open and
  // close transitions to finish rather than for a library-specific attribute.
  for (let index = 0; index < (await triggers.count()); index += 1) {
    await triggers.nth(index).click();
    await page.waitForTimeout(50);
    await page.evaluate(settle);
    Object.assign(elements, await page.evaluate(readHostElements, PROPERTIES));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(50);
    await page.evaluate(settle);
  }
  return elements;
}

try {
  const before = copyApp('before');
  const after = copyApp('after');
  removeNxds(before);
  console.log('building the app without nxds…');
  build(before);
  // A Vite app injects the first-paint script at build time, marked data-nxds-appearance.
  if (!isNext) {
    const html = path.join(before, 'dist/index.html');
    writeFileSync(html, readFileSync(html, 'utf8').replace(/<script data-nxds-appearance>.*?<\/script>/s, ''));
  }
  console.log('building the app with nxds…');
  build(after);

  const servers = [];
  let browser;
  let total = 0;
  try {
    servers.push(await serve(before, 4174));
    servers.push(await serve(after, 4173));
    browser = await chromium.launch();
    const page = await browser.newPage({ colorScheme: 'light', viewport: { width: 1440, height: 1000 } });
    for (const route of config.pages) {
      const a = await snapshot(page, `http://localhost:4174${route}`);
      const b = await snapshot(page, `http://localhost:4173${route}`);

      // Group identical changes so one leak shows as one line, not one per element.
      const groups = new Map();
      const add = (change) => {
        groups.set(change, (groups.get(change) ?? 0) + 1);
        total += 1;
      };
      // Both builds render the same markup, so a host element found in only one
      // of them is itself a change.
      for (const key of Object.keys(a)) if (!(key in b)) add(`host element missing with nxds: ${key}`);
      for (const key of Object.keys(b)) if (!(key in a)) add(`host element only with nxds: ${key}`);
      for (const key of Object.keys(a).filter((key) => key in b)) {
        for (const name of PROPERTIES) {
          if (a[key][name] !== b[key][name]) add(`${name}: ${a[key][name]} → ${b[key][name]}`);
        }
      }
      const count = [...groups.values()].reduce((sum, n) => sum + n, 0);
      console.log(`\n${route}  ${count} host changes`);
      for (const [change, n] of [...groups].sort((x, y) => y[1] - x[1])) console.log(`  ${String(n).padStart(4)} × ${change}`);
    }
  } finally {
    await browser?.close();
    for (const server of servers) server.kill();
  }
  console.log(`\n${total} host changes in total`);
  if (total > 0) process.exitCode = 1;
} finally {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
}
