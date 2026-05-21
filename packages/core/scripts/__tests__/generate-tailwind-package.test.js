import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { generateTailwindPackage } from '../generate-tailwind-package.js';
import { DEFAULT_CONFIG } from '../utils.js';

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

afterEach(() => {
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

  beforeAll(() => {
    warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.map(String).join(' '));

    try {
      distDir = makeTmpDir();
      generateTailwindPackage(DEFAULT_CONFIG, { distDir });
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

  it('emits shadow primitives in :root (light values)', () => {
    const rootBlock = extractBlock(variablesCSS, ':root');
    expect(rootBlock).toMatch(/--nx-shadow-2xs-layer-1-x: 0px;/);
    expect(rootBlock).toMatch(/--nx-shadow-focus-default-color:/);
  });

  // Every var(--nx-shadow-*) ref in nexus.css must have a matching decl in
  // :root of variables.css; missing decls render the utility flat.
  it('every var(--nx-shadow-*) ref in nexus.css has a matching decl in :root', () => {
    const rootBlock = extractBlock(variablesCSS, ':root');

    const refPattern = /var\(--(nx-shadow-[a-z0-9-]+)\)/g;
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
  // their `:root` counterpart by cssName. Today's vega shadow has 2 divergent
  // focus colors; the rest of the 80 dark shadow tokens are byte-identical to
  // light and must be suppressed.
  it('.dark block contains only tokens that diverge from :root by value', () => {
    const darkBlock = extractBlock(variablesCSS, '.dark');

    expect(darkBlock).toMatch(/--nx-shadow-focus-default-color:/);
    expect(darkBlock).toMatch(/--nx-shadow-focus-error-color:/);

    expect(darkBlock).not.toMatch(/--nx-shadow-2xs-layer-1-x:/);
    expect(darkBlock).not.toMatch(/--nx-shadow-2xs-layer-1-y:/);
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
});
