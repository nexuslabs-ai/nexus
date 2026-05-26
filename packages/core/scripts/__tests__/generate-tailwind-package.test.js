import fs from 'fs';
import os from 'os';
import path from 'path';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generateTailwindPackage } from '../generate-tailwind-package.js';
import { DEFAULT_CONFIG } from '../utils.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const SEMANTIC_DIR = path.resolve(TEST_DIR, '..', '..', 'tokens', 'semantic');

const SPACING_MODES = ['vega', 'lyra', 'maia', 'mira', 'nova', 'luma', 'sera'];

function readSpacingModeJson(mode) {
  return JSON.parse(
    fs.readFileSync(path.join(SEMANTIC_DIR, `spacing-${mode}.json`), 'utf8')
  );
}

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

// Per-mode spacing blocks open with `[data-style='X']` (single-quoted by
// prettier). Vega's selector is `:root,\n[data-style='vega']` — multi-line.
// Match by attribute-selector only since Vega's leading `:root,\n` would
// otherwise need separate handling for prettier output variance.
function extractDataStyleBlock(css, mode) {
  const pattern = new RegExp(
    `\\[data-style=['"]${mode}['"]\\] \\{\\n([\\s\\S]*?)^\\}`,
    'm'
  );
  const match = css.match(pattern);
  if (!match) {
    throw new Error(`Per-mode block "[data-style='${mode}']" not found in CSS`);
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
  let spacingUtilitiesCSS;
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
    spacingUtilitiesCSS = read(distDir, 'spacing-utilities.css');
  });

  it('emits a :root block in variables.css', () => {
    expect(variablesCSS).toMatch(/^:root \{/m);
  });

  it('emits focus colour primitives but no geometry in :root (light values)', () => {
    const rootBlock = extractBlock(variablesCSS, ':root');
    expect(rootBlock).toMatch(/--nx-shadow-2xs-layer-1-x: 0px;/);
    expect(rootBlock).toMatch(/--nx-focus-color-default:/);
    expect(rootBlock).toMatch(/--nx-focus-color-error:/);
    // Focus is an outline ring; the geometry primitives were dropped.
    expect(rootBlock).not.toMatch(/--nx-focus-geometry-/);
  });

  // Focus colours are promoted to the --color-* namespace so Tailwind emits
  // outline-focus-* utilities. The ring is outline-only — no focus box-shadow
  // tokens of any kind (the geometry-composed --shadow-focus-* are gone).
  // The 2px C40 offset is also tokenised so components share one tune-point.
  // Count-based assertion on --focus-offset guards against duplicate emission
  // through the standalone-semantic dimension scan colliding with a dedicated
  // collector (the same trap that broke --breakpoint-*).
  it('promotes focus colours to --color-* and emits --focus-offset exactly once; no focus box-shadow', () => {
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).toMatch(
      /--color-focus-default: var\(--nx-focus-color-default\);/
    );
    expect(themeBlock).toMatch(
      /--color-focus-error: var\(--nx-focus-color-error\);/
    );
    expect(themeBlock.match(/--focus-offset:/g)).toHaveLength(1);
    expect(themeBlock).toMatch(/--focus-offset: 2px;/);
    expect(nexusCSS).not.toMatch(/--shadow-focus-/);
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

  // The breakpoint tokens are owned by collectBreakpointsTokens; the generic
  // standalone-semantic dimension scan must skip breakpoints.json to avoid
  // double-emission. Asserting exactly one declaration per breakpoint guards
  // that boundary.
  it('emits breakpoint tokens (with reset) in @theme exactly once', () => {
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).toMatch(/--breakpoint-\*: initial;/);
    for (const name of ['sm', 'md', 'lg', 'xl', '2xl']) {
      const matches = themeBlock.match(
        new RegExp(`--breakpoint-${name}:`, 'g')
      );
      expect(matches, `--breakpoint-${name}`).toHaveLength(1);
    }
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

  // -----------------------------------------------------------------------
  // Spacing migration (#119) — the per-mode semantic spacing pipeline
  // -----------------------------------------------------------------------

  it('removes the --nx-size-* primitive layer entirely', () => {
    // The whole point of the migration is that --nx-size-* primitives don't
    // exist anymore — spacing values flow directly from semantic per-mode
    // files into [data-style="X"] blocks. Any residual --nx-size- would
    // indicate the deletion was incomplete or the build regressed.
    expect(variablesCSS).not.toMatch(/--nx-size-/);
    expect(nexusCSS).not.toMatch(/--nx-size-/);
  });

  it('preserves the --spacing-*: initial reset in @theme', () => {
    // Required so Tailwind v4 base defaults don't leak through and pollute
    // the named scale. Also load-bearing for tw-animate-css (see project
    // memory: nexus-spacing-reset-tw-animate).
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).toMatch(/--spacing-\*:\s*initial;/);
  });

  it('registers numeric --spacing-N in @theme with direct px (not var() refs)', () => {
    // The numeric subset seeds @theme so Tailwind codegens nx:p-N / nx:m-N /
    // nx:h-N / nx:gap-N. After migration these are direct px values, not
    // var(--nx-size-N) passthroughs. Tailwind v4's prefix(nx) rewrites these
    // to --nx-spacing-N at consumer build time.
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).toMatch(/--spacing-0:\s*0px;/);
    expect(themeBlock).toMatch(/--spacing-4:\s*16px;/);
    expect(themeBlock).toMatch(/--spacing-6:\s*24px;/);
    expect(themeBlock).not.toMatch(/--spacing-0:\s*var\(/);
  });

  it('does not register role tokens in @theme (avoids --container-* namespace collision)', () => {
    // Tailwind v4's --container-* namespace is consumed by nx:w-*, nx:max-w-*,
    // and container queries. Putting --container-p in @theme would
    // auto-codegen nx:w-p (resolving to 24px width — wrong UX). Role tokens
    // live only in per-mode blocks outside @theme, with custom @utility
    // declarations driving the targeted utility names.
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).not.toMatch(/--container-p:/);
    expect(themeBlock).not.toMatch(/--control-h-md:/);
    expect(themeBlock).not.toMatch(/--layout-section-gap:/);
  });

  it('emits exactly 7 [data-style="X"] selectors (one per mode)', () => {
    // Vega's selector is `:root, [data-style='vega']` so it contributes one
    // [data-style=...] match; the other 6 modes each contribute one. Total: 7.
    const matches = nexusCSS.match(/\[data-style=['"][a-z]+['"]\]/g) ?? [];
    expect(matches).toHaveLength(7);

    const modes = new Set(matches.map((m) => m.match(/['"]([a-z]+)['"]/)[1]));
    expect(modes).toEqual(new Set(SPACING_MODES));
  });

  it('emits Vega block under :root selector so it is the no-data-style default', () => {
    // Without the :root half, a document with no data-style attribute would
    // miss the role-token defaults (which only live in per-mode blocks, not
    // @theme). The :root, [data-style="vega"] form keeps Vega live in both
    // configurations.
    expect(nexusCSS).toMatch(/:root,\s*\n\s*\[data-style=['"]vega['"]\] \{/);
  });

  it.each(SPACING_MODES)(
    '[data-style="%s"] block values match spacing-%s.json source',
    (mode) => {
      const block = extractDataStyleBlock(nexusCSS, mode);
      const source = readSpacingModeJson(mode);

      // Sample one key from each subtree — full per-mode parity is verified
      // by the cross-mode variable-name parity test below.
      const spacing4 = source.spacing['4'].$value.value;
      const controlHmd = source.control.h.md.$value.value;
      const containerP = source.container.p.$value.value;
      const layoutSectionGap = source.layout['section-gap'].$value.value;

      expect(block).toMatch(new RegExp(`--nx-spacing-4:\\s*${spacing4}px;`));
      expect(block).toMatch(
        new RegExp(`--nx-control-h-md:\\s*${controlHmd}px;`)
      );
      expect(block).toMatch(
        new RegExp(`--nx-container-p:\\s*${containerP}px;`)
      );
      expect(block).toMatch(
        new RegExp(`--nx-layout-section-gap:\\s*${layoutSectionGap}px;`)
      );
    }
  );

  // Vega numeric baseline — locks in the pre-migration shipped values.
  // Drift here means the migration changed numeric Vega output; any change
  // requires explicit reviewer acknowledgement by updating this table.
  it('Vega numeric values are byte-identical to the pre-#119 shipped scale', () => {
    const VEGA_BASELINE = {
      'spacing-0': '0px',
      'spacing-0_5': '2px',
      'spacing-1': '4px',
      'spacing-1_5': '6px',
      'spacing-2': '8px',
      'spacing-2_5': '10px',
      'spacing-3': '12px',
      'spacing-3_5': '14px',
      'spacing-4': '16px',
      'spacing-5': '20px',
      'spacing-6': '24px',
      'spacing-7': '28px',
      'spacing-8': '32px',
      'spacing-9': '36px',
      'spacing-10': '40px',
      'spacing-11': '44px',
      'spacing-12': '48px',
      'spacing-14': '56px',
      'spacing-16': '64px',
      'spacing-20': '80px',
      'spacing-24': '96px',
      'spacing-28': '112px',
      'spacing-32': '128px',
      'spacing-36': '144px',
      'spacing-40': '160px',
      'spacing-44': '176px',
      'spacing-48': '192px',
      'spacing-52': '208px',
      'spacing-56': '224px',
      'spacing-60': '240px',
      'spacing-64': '256px',
      'spacing-72': '288px',
      'spacing-80': '320px',
      'spacing-96': '384px',
    };
    const block = extractDataStyleBlock(nexusCSS, 'vega');
    for (const [name, expected] of Object.entries(VEGA_BASELINE)) {
      const match = block.match(new RegExp(`--nx-${name}:\\s*([^;]+);`));
      expect(match, `--nx-${name} missing from Vega block`).not.toBeNull();
      expect(match[1].trim(), `--nx-${name} drifted from baseline`).toBe(
        expected
      );
    }
  });

  it('every [data-style="X"] block declares the same set of CSS variable names', () => {
    // Cross-mode parity: a mode missing a key silently breaks only that mode
    // when data-style switches to it. Schema validation (#125) will codify
    // this at the JSON layer; this is the emit-side guarantee.
    const blocks = SPACING_MODES.map((mode) => {
      const block = extractDataStyleBlock(nexusCSS, mode);
      const vars = [...block.matchAll(/^\s*(--[a-z0-9-_]+):/gm)]
        .map((m) => m[1])
        .sort();
      return [mode, vars];
    });

    const [, vegaVars] = blocks[0];
    expect(vegaVars.length).toBeGreaterThan(0);
    for (const [mode, vars] of blocks.slice(1)) {
      expect(
        vars,
        `mode "${mode}" CSS variable set diverges from vega`
      ).toEqual(vegaVars);
    }
  });

  it('nexus.css imports ./spacing-utilities.css and the file resolves', () => {
    const importMatch = nexusCSS.match(
      /@import\s+['"](\.\/spacing-utilities\.css)['"]/
    );
    expect(
      importMatch,
      'nexus.css must @import ./spacing-utilities.css'
    ).not.toBeNull();
    const resolved = path.resolve(distDir, importMatch[1]);
    expect(
      fs.existsSync(resolved),
      `imported file ${importMatch[1]} must exist`
    ).toBe(true);
  });

  it('spacing-utilities.css declares all 14 role utilities with correct property bindings', () => {
    // Each @utility binds the right CSS property to the right --nx-* variable.
    // A buggy emitter could pass "utility exists" tests but bind the wrong
    // var (e.g. h-control-sm reading --nx-control-h-md).
    const ROLE_UTILITY_BINDINGS = [
      { utility: 'h-control-sm', prop: 'height', cssVar: 'nx-control-h-sm' },
      { utility: 'h-control-md', prop: 'height', cssVar: 'nx-control-h-md' },
      { utility: 'h-control-lg', prop: 'height', cssVar: 'nx-control-h-lg' },
      {
        utility: 'px-control-sm',
        prop: 'padding-left',
        cssVar: 'nx-control-padding-x-sm',
      },
      {
        utility: 'px-control-md',
        prop: 'padding-left',
        cssVar: 'nx-control-padding-x-md',
      },
      {
        utility: 'px-control-lg',
        prop: 'padding-left',
        cssVar: 'nx-control-padding-x-lg',
      },
      {
        utility: 'py-control-sm',
        prop: 'padding-top',
        cssVar: 'nx-control-padding-y-sm',
      },
      {
        utility: 'py-control-md',
        prop: 'padding-top',
        cssVar: 'nx-control-padding-y-md',
      },
      {
        utility: 'py-control-lg',
        prop: 'padding-top',
        cssVar: 'nx-control-padding-y-lg',
      },
      { utility: 'gap-control', prop: 'gap', cssVar: 'nx-control-gap' },
      { utility: 'p-container', prop: 'padding', cssVar: 'nx-container-p' },
      { utility: 'gap-container', prop: 'gap', cssVar: 'nx-container-gap' },
      {
        utility: 'gap-layout-section',
        prop: 'gap',
        cssVar: 'nx-layout-section-gap',
      },
      {
        utility: 'gap-layout-stack',
        prop: 'gap',
        cssVar: 'nx-layout-stack-gap',
      },
    ];

    expect(ROLE_UTILITY_BINDINGS).toHaveLength(14);
    for (const { utility, prop, cssVar } of ROLE_UTILITY_BINDINGS) {
      const block = extractBlock(spacingUtilitiesCSS, `@utility ${utility}`);
      expect(block, `@utility ${utility} body`).toMatch(
        new RegExp(`${prop}:\\s*var\\(--${cssVar}\\);`)
      );
    }
  });

  it('role @utility names match the role-token set 1:1 (drift guard)', () => {
    // If a new role key lands in spacing-vega.json without a matching emitter
    // row, this catches it — utility set must equal the role-token set.
    const utilityMatches = [
      ...spacingUtilitiesCSS.matchAll(/@utility ([a-z-]+) \{/g),
    ].map((m) => m[1]);
    const utilities = new Set(utilityMatches);

    // Derive expected utility names from spacing-vega.json's role subtrees.
    const vega = readSpacingModeJson('vega');
    const expected = new Set();
    function walk(node, pathParts) {
      if (
        typeof node === 'object' &&
        node !== null &&
        '$value' in node &&
        '$type' in node
      ) {
        // Mirror deriveRoleUtility's name derivation. The contract is:
        //   [role, family, size]  → <familyPrefix>-<role>-<size>
        //   [role, 'p']           → p-<role>
        //   [role, 'gap']         → gap-<role>
        //   [role, '<x>-gap']     → gap-<role>-<x>
        const [role, second, third] = pathParts;
        if (third !== undefined) {
          const prefix = { h: 'h', 'padding-x': 'px', 'padding-y': 'py' }[
            second
          ];
          expected.add(`${prefix}-${role}-${third}`);
        } else if (second === 'gap') {
          expected.add(`gap-${role}`);
        } else if (second === 'p') {
          expected.add(`p-${role}`);
        } else if (/-gap$/.test(second)) {
          const qualifier = second.replace(/-gap$/, '');
          expected.add(`gap-${role}-${qualifier}`);
        }
        return;
      }
      if (typeof node === 'object' && node !== null) {
        for (const [key, value] of Object.entries(node)) {
          if (key.startsWith('$')) continue;
          walk(value, [...pathParts, key]);
        }
      }
    }
    for (const group of ['control', 'container', 'layout']) {
      if (group in vega) walk(vega[group], [group]);
    }

    expect(utilities).toEqual(expected);
  });

  it('emits 7 per-mode spacing blocks in deterministic alphabetical order (non-default modes)', () => {
    // Filesystem order isn't portable; the emitter sorts non-default modes
    // alphabetically. Luma < Lyra, so luma must appear before lyra.
    const ordered = [...nexusCSS.matchAll(/\[data-style=['"]([a-z]+)['"]\]/g)]
      .map((m) => m[1])
      // De-dup in case `:root, [data-style="vega"]` produces two captures.
      .filter((m, i, arr) => arr.indexOf(m) === i);
    expect(ordered[0]).toBe('vega');
    // Other six in alphabetical order:
    expect(ordered.slice(1)).toEqual([
      'luma',
      'lyra',
      'maia',
      'mira',
      'nova',
      'sera',
    ]);
  });

  it('does not codegen nx:w-p from --nx-container-p (Tailwind v4 namespace collision avoided)', () => {
    // The role token --nx-container-p lives in per-mode blocks only, never
    // in @theme. Tailwind v4 only scans @theme for namespace codegen, so
    // nx:w-p (which would read --container-p) is never emitted. This is the
    // load-bearing assertion that validates the architectural choice.
    // We grep nexus.css because the only place `nx:w-*` utilities could
    // appear is the generated output Tailwind ships back to consumers; here
    // we're checking the source we hand Tailwind — it should contain no
    // such utility reference and (more importantly) no @theme registration
    // that would trigger Tailwind to generate one.
    expect(nexusCSS).not.toMatch(/\bnx\\:w-p\b/);
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).not.toMatch(/--container-p:/);
  });

  it('emits byte-identical CSS across two consecutive runs (determinism)', async () => {
    // Non-determinism in filesystem-iteration order would surface here. Two
    // runs into separate tmp dirs should produce identical bytes for the
    // spacing-touched files.
    const dirA = makeTmpDir();
    const dirB = makeTmpDir();
    await generateTailwindPackage(DEFAULT_CONFIG, { distDir: dirA });
    await generateTailwindPackage(DEFAULT_CONFIG, { distDir: dirB });

    for (const file of [
      'variables.css',
      'nexus.css',
      'spacing-utilities.css',
    ]) {
      expect(read(dirA, file), `${file} differs across runs`).toBe(
        read(dirB, file)
      );
    }
  });
});
