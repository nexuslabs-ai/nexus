import fs from 'fs';
import os from 'os';
import path from 'path';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generateTailwindPackage } from '../generate-tailwind-package.js';
import { DEFAULT_CONFIG } from '../utils.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-tailwind-test-'));
  tmpDirs.push(dir);
  return dir;
}

function read(distDir, fileName) {
  return fs.readFileSync(path.join(distDir, fileName), 'utf8');
}

function extractBlock(css, openSelector) {
  const escaped = openSelector.replace(/\./g, '\\.');
  const pattern = new RegExp(`^${escaped} \\{\\n([\\s\\S]*?)^\\}`, 'm');
  const match = css.match(pattern);
  if (!match) {
    throw new Error(`Block "${openSelector}" not found in CSS`);
  }
  return match[1];
}

afterAll(() => {
  while (tmpDirs.length > 0) {
    const dir = tmpDirs.pop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('generateTailwindPackage', () => {
  let distDir;
  let variablesCSS;
  let nexusCSS;
  let typographyCSS;
  let warnings;

  beforeAll(async () => {
    warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.map(String).join(' '));

    try {
      distDir = makeTmpDir();
      await generateTailwindPackage(DEFAULT_CONFIG, { distDir });
    } finally {
      console.warn = originalWarn;
    }

    variablesCSS = read(distDir, 'variables.css');
    nexusCSS = read(distDir, 'nexus.css');
    typographyCSS = read(distDir, 'typography-utilities.css');
  });

  it('emits a :root block in variables.css', () => {
    expect(variablesCSS).toMatch(/^:root \{/m);
  });

  it('emits shadow and focus primitives in :root (light values)', () => {
    const rootBlock = extractBlock(variablesCSS, ':root');
    expect(rootBlock).toMatch(/--nx-shadow-2xs-layer-1-x: 0px;/);
    expect(rootBlock).toMatch(/--nx-focus-color-default:/);
    expect(rootBlock).toMatch(/--nx-focus-geometry-spread: 2px;/);
  });

  // Every var(--nx-shadow-*) or var(--nx-focus-*) ref in nexus.css must have a
  // matching decl in :root of variables.css; missing decls render the utility
  // flat. Focus refs are covered because shadow composites built from
  // styles/shadows.json now point at --nx-focus-* primitives directly.
  it('every var(--nx-(shadow|focus)-*) ref in nexus.css has a matching decl in :root', () => {
    const rootBlock = extractBlock(variablesCSS, ':root');

    const refPattern = /var\(--(nx-(?:shadow|focus)-[a-z0-9-]+)\)/g;
    const refs = new Set();
    let match;
    while ((match = refPattern.exec(nexusCSS)) !== null) {
      refs.add(match[1]);
    }

    expect(refs.size).toBeGreaterThan(0);

    const missing = [];
    for (const varName of refs) {
      if (!new RegExp(`--${varName}:`).test(rootBlock)) {
        missing.push(varName);
      }
    }

    expect(missing).toEqual([]);
  });

  // The .dark block must contain only dark tokens whose value diverges from
  // their `:root` counterpart by cssName. Focus colors live in their own
  // primitive category (primitives/focus/) and supply the dark divergence;
  // shadow tokens reference focus colors and stay byte-identical across
  // themes, so none of the 80 dark shadow tokens reach the .dark block.
  it('.dark block contains only tokens that diverge from :root by value', () => {
    const darkBlock = extractBlock(variablesCSS, '.dark');

    expect(darkBlock).toMatch(/--nx-focus-color-default:/);
    expect(darkBlock).toMatch(/--nx-focus-color-error:/);

    expect(darkBlock).not.toMatch(/--nx-shadow-focus-default-color:/);
    expect(darkBlock).not.toMatch(/--nx-shadow-focus-error-color:/);
    expect(darkBlock).not.toMatch(/--nx-shadow-2xs-layer-1-x:/);
    expect(darkBlock).not.toMatch(/--nx-shadow-2xs-layer-1-y:/);
  });

  it('emits chart.categorical tokens in @theme (light) and .dark (dark override)', () => {
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).toMatch(
      /--color-chart-categorical-1: var\(--nx-color-teal-600\);/
    );
    expect(themeBlock).toMatch(
      /--color-chart-categorical-5: var\(--nx-color-indigo-600\);/
    );

    const darkBlock = extractBlock(nexusCSS, '.dark');
    expect(darkBlock).toMatch(
      /--nx-color-chart-categorical-1: var\(--nx-color-teal-200\);/
    );
    expect(darkBlock).toMatch(
      /--nx-color-chart-categorical-5: var\(--nx-color-indigo-200\);/
    );
  });

  it('emits z-index tokens in @theme', () => {
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).toMatch(/--z-index-overlay: 10;/);
    expect(themeBlock).toMatch(/--z-index-sticky: 30;/);
    expect(themeBlock).toMatch(/--z-index-modal: 50;/);
    expect(themeBlock).toMatch(/--z-index-popover: 70;/);
    expect(themeBlock).toMatch(/--z-index-toast: 100;/);
    expect(themeBlock).toMatch(/--z-index-max: 9999;/);
  });

  it('emits breakpoint tokens (with reset) in @theme', () => {
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).toMatch(/--breakpoint-\*: initial;/);
    expect(themeBlock).toMatch(/--breakpoint-sm: 40rem;/);
    expect(themeBlock).toMatch(/--breakpoint-md: 48rem;/);
    expect(themeBlock).toMatch(/--breakpoint-lg: 64rem;/);
    expect(themeBlock).toMatch(/--breakpoint-xl: 80rem;/);
    expect(themeBlock).toMatch(/--breakpoint-2xl: 96rem;/);
  });

  it('emits zero `File not found` warnings for the default config', () => {
    const fileNotFound = warnings.filter((w) => /File not found/.test(w));
    expect(fileNotFound).toEqual([]);
  });

  // Source token has `lineHeight: "auto"` which is invalid CSS — the generator
  // maps it to `normal` inside resolveTypographyProperty.
  it('maps lineHeight "auto" to line-height: normal in typography-code-inline', () => {
    const block = extractBlock(
      typographyCSS,
      '@utility typography-code-inline'
    );
    expect(block).toMatch(/line-height: normal;/);
    expect(typographyCSS).not.toMatch(/line-height: auto/);
  });

  // Regenerating tokens used to produce a noisy whitespace diff against the
  // committed CSS because the generator emitted raw output but the committed
  // files were prettier-formatted. The generator now formats every emitted
  // file, so prettier --check must agree it has nothing to change.
  it('emits prettier-formatted CSS (idempotent under prettier)', async () => {
    const config = await prettier.resolveConfig(TEST_DIR);
    const files = fs
      .readdirSync(distDir)
      .filter((name) => name.endsWith('.css'));

    expect(files.length).toBeGreaterThan(0);

    for (const name of files) {
      const filePath = path.join(distDir, name);
      const content = fs.readFileSync(filePath, 'utf8');
      const reformatted = await prettier.format(content, {
        ...config,
        filepath: filePath,
      });
      expect(reformatted, `${name} is not prettier-formatted`).toBe(content);
    }
  });
});
