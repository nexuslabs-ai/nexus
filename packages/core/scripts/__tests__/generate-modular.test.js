import fs from 'fs';
import os from 'os';
import path from 'path';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generateModular } from '../generate-modular.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-modular-test-'));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  while (tmpDirs.length > 0) {
    const dir = tmpDirs.pop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('generateModular', () => {
  let distDir;

  beforeAll(async () => {
    const originalLog = console.log;
    console.log = () => {};
    try {
      distDir = makeTmpDir();
      await generateModular({ distDir });
    } finally {
      console.log = originalLog;
    }
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

  it('emits z-index tokens in playground globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/--z-index-popover: 70;/);
    expect(globals).toMatch(/--z-index-modal: 50;/);
  });

  it('emits breakpoint tokens in playground globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/--breakpoint-sm: 40rem;/);
    expect(globals).toMatch(/--breakpoint-2xl: 96rem;/);
  });

  // -----------------------------------------------------------------------
  // Spacing migration (#119) — per-mode blocks + inline role utilities
  // -----------------------------------------------------------------------

  it('emits all 7 per-mode [data-style="X"] blocks in playground globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    const matches = globals.match(/\[data-style=['"][a-z]+['"]\]/g) ?? [];
    expect(matches).toHaveLength(7);

    const modes = new Set(matches.map((m) => m.match(/['"]([a-z]+)['"]/)[1]));
    expect(modes).toEqual(
      new Set(['vega', 'lyra', 'maia', 'mira', 'nova', 'luma', 'sera'])
    );
  });

  it('emits Vega numerics in @theme as direct px (not var refs)', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/--spacing-4:\s*16px;/);
    expect(globals).toMatch(/--spacing-6:\s*24px;/);
    expect(globals).not.toMatch(/--spacing-0:\s*var\(/);
  });

  it('inlines role @utility declarations into globals.css (no separate spacing-utilities.css)', () => {
    // sync-playground-themes' STYLES_FILES allowlist is hardcoded — adding a
    // new file in dist/modular/ wouldn't carry to apps/playground/src/styles/.
    // Inlining role utilities into globals.css keeps them inside that
    // allowlist and reaches the playground's Tailwind build.
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/@utility h-control-md \{/);
    expect(globals).toMatch(/@utility p-container \{/);
    expect(globals).toMatch(/@utility gap-layout-section \{/);

    // No separate spacing-utilities.css in the modular dist (that's the
    // bundled-tailwind dist's pattern).
    const files = fs.readdirSync(distDir);
    expect(files).not.toContain('spacing-utilities.css');
  });

  it('@utility declarations in globals.css bind the right prefixed CSS vars', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(
      /@utility h-control-md \{[\s\S]*?height:\s*var\(--nx-control-h-md\);/
    );
    expect(globals).toMatch(
      /@utility p-container \{[\s\S]*?padding:\s*var\(--nx-container-p\);/
    );
    expect(globals).toMatch(
      /@utility gap-layout-stack \{[\s\S]*?gap:\s*var\(--nx-layout-stack-gap\);/
    );
  });

  it('per-mode override blocks use --nx- prefix (Tailwind only rewrites @theme)', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    // Both numeric AND role tokens inside [data-style="X"] blocks must be
    // already-prefixed since they live outside @theme.
    expect(globals).toMatch(
      /\[data-style=['"]vega['"]\] \{[\s\S]*?--nx-spacing-4:\s*16px;/
    );
    expect(globals).toMatch(
      /\[data-style=['"]vega['"]\] \{[\s\S]*?--nx-control-h-md:\s*32px;/
    );
  });
});
