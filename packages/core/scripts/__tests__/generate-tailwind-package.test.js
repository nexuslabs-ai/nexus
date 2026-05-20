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

  beforeAll(() => {
    distDir = makeTmpDir();
    generateTailwindPackage(DEFAULT_CONFIG, { distDir });
    variablesCSS = read(distDir, 'variables.css');
    nexusCSS = read(distDir, 'nexus.css');
  });

  it('emits a :root block and a .dark block in variables.css', () => {
    expect(variablesCSS).toMatch(/^:root \{/m);
    expect(variablesCSS).toMatch(/^\.dark \{/m);
  });

  it('emits shadow primitives in :root (light values)', () => {
    const rootBlock = variablesCSS.slice(
      variablesCSS.indexOf(':root {'),
      variablesCSS.indexOf('.dark {')
    );
    expect(rootBlock).toMatch(/--nx-shadow-2xs-layer-1-x: 0px;/);
    expect(rootBlock).toMatch(/--nx-shadow-focus-default-color:/);
  });

  it('emits dark shadow overrides in .dark', () => {
    const darkBlock = variablesCSS.slice(variablesCSS.indexOf('.dark {'));
    expect(darkBlock).toMatch(/--nx-shadow-2xs-layer-1-x: 0px;/);
    expect(darkBlock).toMatch(/--nx-shadow-focus-default-color:/);
  });

  // The contract that broke before this fix: every var(--nx-shadow-*) reference
  // in the emitted nexus.css must resolve to a --nx-shadow-*: declaration in
  // variables.css. If any decl is missing, the corresponding nx:shadow-*
  // utility silently renders flat.
  it('symmetric: every var(--nx-shadow-*) ref in nexus.css has a matching decl in :root', () => {
    const rootBlock = variablesCSS.slice(
      variablesCSS.indexOf(':root {'),
      variablesCSS.indexOf('.dark {')
    );

    const refPattern = /var\(--(nx-shadow-[a-z0-9-]+)\)/g;
    const refs = new Set();
    let match;
    while ((match = refPattern.exec(nexusCSS)) !== null) {
      refs.add(match[1]);
    }

    expect(refs.size).toBeGreaterThan(0);

    const missing = [];
    for (const varName of refs) {
      const declPattern = new RegExp(`--${varName}:`);
      if (!declPattern.test(rootBlock)) {
        missing.push(varName);
      }
    }

    expect(missing).toEqual([]);
  });

  it('dark block contains overrides for the same shadow layer vars declared in :root', () => {
    const rootBlock = variablesCSS.slice(
      variablesCSS.indexOf(':root {'),
      variablesCSS.indexOf('.dark {')
    );
    const darkBlock = variablesCSS.slice(variablesCSS.indexOf('.dark {'));

    const rootLayerVars = new Set();
    const layerPattern = /--nx-shadow-([a-z0-9-]+-layer-\d+-[a-z]+):/g;
    let match;
    while ((match = layerPattern.exec(rootBlock)) !== null) {
      rootLayerVars.add(match[1]);
    }

    expect(rootLayerVars.size).toBeGreaterThan(0);

    const missing = [];
    for (const layerVar of rootLayerVars) {
      const declPattern = new RegExp(`--nx-shadow-${layerVar}:`);
      if (!declPattern.test(darkBlock)) {
        missing.push(layerVar);
      }
    }

    expect(missing).toEqual([]);
  });

  it('emits zero `File not found` warnings for the default config', () => {
    // Re-run while capturing console.warn; the silent-skip failure mode emitted
    // `⚠ File not found: ...`. With the file-existence invariant, missing files
    // throw instead — so no warn lines should fire on a clean run.
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (msg) => warnings.push(String(msg));

    try {
      const fresh = makeTmpDir();
      generateTailwindPackage(DEFAULT_CONFIG, { distDir: fresh });
    } finally {
      console.warn = originalWarn;
    }

    const fileNotFound = warnings.filter((w) => /File not found/.test(w));
    expect(fileNotFound).toEqual([]);
  });
});
