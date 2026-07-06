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

  it('emits z-index tokens in globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/--z-index-popover: 70;/);
    expect(globals).toMatch(/--z-index-modal: 50;/);
  });

  it('emits breakpoint tokens in globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/--breakpoint-sm: 40rem;/);
    expect(globals).toMatch(/--breakpoint-2xl: 96rem;/);
  });

  it('emits the --text-*: initial reset in globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/--text-\*:\s*initial;/);
  });

  it('emits the native browser UI theme policy in globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/:root \{\n\s*color-scheme:\s*light dark;\n\s*\}/);
    expect(globals).toMatch(
      /:root:not\(\.dark\) \{\n\s*color-scheme:\s*light;\n\s*\}/
    );
    expect(globals).toMatch(/\.dark \{\n\s*color-scheme:\s*dark;\n\s*\}/);
    expect(globals).toMatch(
      /:where\([\s\S]*input\[type='checkbox'\],[\s\S]*input\[type='radio'\],[\s\S]*input\[type='range'\],[\s\S]*progress[\s\S]*\) \{\n\s*accent-color:\s*var\(--color-primary-background\);\n\s*\}/
    );
    expect(globals).not.toMatch(/light-dark\(/);
  });

  it('emits focus error primitives through Nexus red scale tokens', () => {
    const focus = fs.readFileSync(
      path.join(distDir, 'focus-default.css'),
      'utf8'
    );

    expect(focus).toMatch(
      /--nx-focus-color-error:\s*var\(--nx-color-red-600\);/
    );
    expect(focus).toMatch(
      /\.dark \{[\s\S]*--nx-focus-color-error:\s*var\(--nx-color-red-300\);/
    );
  });

  it('emits the shared focus ring treatment in globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');

    expect(globals).toMatch(/\/\* ===== FOCUS RING ===== \*\//);
    expect(globals).toMatch(
      /\[class~='nx:focus-visible:outline-focus-default'\]:focus-visible/
    );
    expect(globals).toMatch(
      /\[data-slot='input'\]\[class~='nx:focus-visible:outline-focus-default'\]:focus-visible/
    );
    expect(globals).toMatch(/\[data-slot='input'\]\[data-variant='default'\]/);
    expect(globals).toMatch(
      /box-shadow:\s*inset 0 0 0 1px var\(--color-border-default\);/
    );
    expect(globals).toMatch(/\[data-slot='input'\]\[aria-invalid='true'\]/);
    expect(globals).toMatch(
      /box-shadow:\s*inset 0 0 0 1px var\(--color-border-error\);/
    );
    expect(globals).toMatch(/\[data-slot='input-otp-slot'\]/);
    expect(globals).toMatch(/inset -1px 0 0 var\(--color-border-default\)/);
    expect(globals).toMatch(
      /\[data-slot='sidebar-input'\]\[class~='nx:focus-visible:outline-focus-default'\]:focus-visible[\s\S]*?\{[\s\S]*?border-color:\s*transparent\s*!important;[\s\S]*?border-width:\s*0;[\s\S]*?box-shadow:\s*[\s\S]*?inset 0 0 0 1px var\(--color-focus-default\),[\s\S]*?0 0 0 1px var\(--color-focus-default\);[\s\S]*?\}/
    );
    expect(globals).toMatch(
      /\[data-slot='button'\]\[class~='nx:focus-visible:outline-focus-default'\]:focus-visible/
    );
    expect(globals).toMatch(/border-color:\s*transparent\s*!important;/);
    expect(globals).toMatch(
      /\[data-slot='sidebar-input'\]\[class~='nx:aria-invalid:focus-visible:outline-focus-error'\]\[aria-invalid='true'\]:focus-visible[\s\S]*?\{[\s\S]*?border-color:\s*transparent\s*!important;[\s\S]*?border-width:\s*0;[\s\S]*?box-shadow:\s*[\s\S]*?inset 0 0 0 1px var\(--color-focus-error\),[\s\S]*?0 0 0 1px var\(--color-focus-error\);[\s\S]*?\}/
    );
    expect(globals).toMatch(
      /\[data-slot='input-group-control'\]\[class~='nx:focus-visible:outline-focus-default'\]:focus-visible[\s\S]*?\{[\s\S]*?outline-style:\s*none\s*!important;[\s\S]*?box-shadow:\s*none;[\s\S]*?\}/
    );
    expect(globals).toMatch(/outline-style:\s*none\s*!important;/);
    expect(globals).toMatch(/0 0 0 2px var\(--color-focus-default\);/);
    expect(globals).toMatch(/inset 0 0 0 1px var\(--color-focus-default\),/);
    expect(globals).toMatch(/0 0 0 1px var\(--color-focus-default\);/);
    expect(globals).toMatch(/inset 0 0 0 1px var\(--color-focus-error\),/);
    expect(globals).toMatch(/0 0 0 1px var\(--color-focus-error\);/);
    expect(globals).toMatch(/border-width:\s*0;/);
    expect(globals).not.toMatch(/border-width:\s*2px;/);
    expect(globals).toMatch(/0 0 0 2px var\(--color-background\),/);
    expect(globals).toMatch(/0 0 0 4px var\(--color-focus-default\);/);
    expect(globals).not.toMatch(/0 0 0 8px var\(--color-focus-default\);/);
    expect(globals).toMatch(/@media \(forced-colors: active\)/);
    expect(globals).toMatch(/border-color:\s*CanvasText\s*!important;/);
    expect(globals).toMatch(/outline-color:\s*Highlight\s*!important;/);
    expect(globals).toMatch(/outline-style:\s*solid\s*!important;/);
  });

  // -----------------------------------------------------------------------
  // Spacing migration (#119) — per-mode blocks + sibling spacing-utilities.css
  // -----------------------------------------------------------------------

  it('emits all 6 per-mode [data-density="X"] blocks in globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    const matches = globals.match(/\[data-density=['"][a-z]+['"]\]/g) ?? [];
    expect(matches).toHaveLength(6);

    const modes = new Set(matches.map((m) => m.match(/['"]([a-z]+)['"]/)[1]));
    expect(modes).toEqual(
      new Set([
        'tight',
        'relaxed',
        'default',
        'compact',
        'comfortable',
        'spacious',
      ])
    );
  });

  it('emits Default numerics in @theme as direct px (not var refs)', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/--spacing-4:\s*16px;/);
    expect(globals).toMatch(/--spacing-6:\s*24px;/);
    expect(globals).not.toMatch(/--spacing-0:\s*var\(/);
  });

  it('emits role and motion @utility declarations into sibling utility files', () => {
    // Symmetric with the bundled-tailwind build: globals.css @imports sibling
    // utility files so modular consumers can serve the same utility layer.
    const files = fs.readdirSync(distDir);
    expect(files).toContain('spacing-utilities.css');
    expect(files).toContain('motion-utilities.css');
    expect(files).toContain('border-color-aliases.css');

    const spacingUtilities = fs.readFileSync(
      path.join(distDir, 'spacing-utilities.css'),
      'utf8'
    );
    expect(spacingUtilities).toMatch(/@utility p-container \{/);
    expect(spacingUtilities).toMatch(/@utility gap-layout-section \{/);

    const motionUtilities = fs.readFileSync(
      path.join(distDir, 'motion-utilities.css'),
      'utf8'
    );
    expect(motionUtilities).toMatch(/@utility duration-fast \{/);
    expect(motionUtilities).toMatch(
      /transition-duration:\s*var\(--nx-motion-duration-fast\);/
    );
    expect(motionUtilities).toMatch(/@keyframes overlay-presence-exit \{/);
    expect(motionUtilities).toMatch(
      /@utility animate-overlay-presence-exit \{/
    );

    const borderColorAliases = fs.readFileSync(
      path.join(distDir, 'border-color-aliases.css'),
      'utf8'
    );
    expect(borderColorAliases).toMatch(/@utility border-color-default \{/);
    expect(borderColorAliases).toMatch(
      /border-color:\s*var\(--color-border-default\);/
    );

    // globals.css does NOT inline sibling utilities — it @imports them.
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).not.toMatch(/@utility p-container \{/);
    expect(globals).not.toMatch(/@utility duration-fast \{/);
    expect(globals).not.toMatch(/@utility border-color-default \{/);
    expect(globals).toMatch(/@import\s+['"]\.\/spacing-utilities\.css['"]/);
    expect(globals).toMatch(/@import\s+['"]\.\/motion-utilities\.css['"]/);
    expect(globals).toMatch(/@import\s+['"]\.\/border-color-aliases\.css['"]/);
  });

  it('@utility declarations bind the right prefixed CSS vars', () => {
    const spacingUtilities = fs.readFileSync(
      path.join(distDir, 'spacing-utilities.css'),
      'utf8'
    );
    expect(spacingUtilities).toMatch(
      /@utility p-container \{[\s\S]*?padding:\s*var\(--nx-container-p\);/
    );
    expect(spacingUtilities).toMatch(
      /@utility gap-layout-stack \{[\s\S]*?gap:\s*var\(--nx-layout-stack-gap\);/
    );
  });

  it('per-mode override blocks use --nx- prefix (Tailwind only rewrites @theme)', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    // Both numeric AND role tokens inside [data-density="X"] blocks must be
    // already-prefixed since they live outside @theme.
    expect(globals).toMatch(
      /\[data-density=['"]default['"]\] \{[\s\S]*?--nx-spacing-4:\s*16px;/
    );
    expect(globals).toMatch(
      /\[data-density=['"]default['"]\] \{[\s\S]*?--nx-container-p:\s*24px;/
    );
  });

  it('spacingDefault option shifts which mode lands under :root, [data-density="X"]', async () => {
    // Same contract as the bundled-tailwind build: pass a non-default mode
    // and confirm the :root combinator moves to it. All 6 mode blocks still
    // emit; only the `:root` half of the dual selector changes.
    const dir = makeTmpDir();
    const originalLog = console.log;
    console.log = () => {};
    try {
      await generateModular({ distDir: dir, spacingDefault: 'relaxed' });
    } finally {
      console.log = originalLog;
    }
    const globals = fs.readFileSync(path.join(dir, 'globals.css'), 'utf8');

    expect(globals).toMatch(
      /:root,\s*\n\s*\[data-density=['"]relaxed['"]\] \{/
    );
    expect(globals).not.toMatch(
      /:root,\s*\n\s*\[data-density=['"]default['"]\] \{/
    );
    const matches = globals.match(/\[data-density=['"][a-z]+['"]\]/g) ?? [];
    expect(matches).toHaveLength(6);
  });
});
