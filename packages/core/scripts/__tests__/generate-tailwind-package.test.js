import fs from 'fs';
import { createRequire } from 'module';
import os from 'os';
import path from 'path';
import * as prettier from 'prettier';
import { compile } from 'tailwindcss';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generateTailwindPackage } from '../generate-tailwind-package.js';
import {
  DEFAULT_CONFIG,
  generateBorderColorAliasUtilitiesCSS,
  generateBorderWidthUtilitiesCSS,
} from '../utils.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const SEMANTIC_DIR = path.resolve(TEST_DIR, '..', '..', 'tokens', 'semantic');
const require = createRequire(import.meta.url);
const TAILWIND_ENTRY = require.resolve('tailwindcss/index.css');

const SPACING_MODES = [
  'tight',
  'relaxed',
  'default',
  'compact',
  'comfortable',
  'spacious',
];
const RADIUS_MODES = ['extra-round', 'round', 'smooth', 'square', 'subtle'];
const SHADOW_MODES = ['flat', 'quiet', 'soft', 'standard', 'strong'];
const BORDERWIDTH_MODES = ['fine', 'normal', 'strong'];

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
  const open = openSelector === '@theme' ? '@theme(?: inline)?' : escaped;
  const pattern = new RegExp(`^${open} \\{\\n([\\s\\S]*?)^\\}`, 'm');
  const match = css.match(pattern);
  if (!match) {
    throw new Error(`Block "${openSelector}" not found in CSS`);
  }
  return match[1];
}

// Per-mode spacing blocks open with `[data-density='X']` (single-quoted by
// prettier). The configured default selector is multi-line because it includes
// `:root`. Match by attribute-selector only so the leading `:root,\n` does
// not need separate handling for prettier output variance.
function extractDataStyleBlock(css, mode) {
  return extractDataAttrBlock(css, 'data-density', mode);
}

function extractDataAttrBlock(css, attrName, mode) {
  const pattern = new RegExp(
    `\\[${attrName}=['"]${mode}['"]\\] \\{\\n([\\s\\S]*?)^\\}`,
    'm'
  );
  const match = css.match(pattern);
  if (!match) {
    throw new Error(
      `Per-mode block "[${attrName}='${mode}']" not found in CSS`
    );
  }
  return match[1];
}

function extractDarkDataAttrBlock(css, attrName, mode) {
  const pattern = new RegExp(
    `\\.dark(?:\\[${attrName}=['"]${mode}['"]\\]| \\[${attrName}=['"]${mode}['"]\\]) \\{\\n([\\s\\S]*?)^\\}`,
    'm'
  );
  const match = css.match(pattern);
  if (!match) {
    throw new Error(
      `Dark per-mode block ".dark[${attrName}='${mode}']" not found in CSS`
    );
  }
  return match[1];
}

function cssVarNames(block) {
  return [...block.matchAll(/^\s*(--[a-z0-9-_]+):/gm)]
    .map((match) => match[1])
    .sort();
}

function cssDeclarations(block) {
  return Object.fromEntries(
    [...block.matchAll(/^\s*(--[a-z0-9-_]+):\s*([^;]+);/gm)].map(
      ([, name, value]) => [name, compactCss(value)]
    )
  );
}

function themeColorLines(themeBlock) {
  return [...themeBlock.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/g)];
}

function compactCss(value) {
  return value.replace(/\s+/g, ' ').trim();
}

async function compileGeneratedTailwind(distDir, candidates) {
  const source = [
    `@import './nexus.css';`,
    `@source inline("${candidates.join(' ')}");`,
  ].join('\n');

  const compiler = await compile(source, {
    base: distDir,
    loadStylesheet: async (id, base) => {
      const filePath =
        id === 'tailwindcss' ? TAILWIND_ENTRY : path.resolve(base, id);

      return {
        content: fs.readFileSync(filePath, 'utf8'),
        path: filePath,
        base: path.dirname(filePath),
      };
    },
  });

  return compiler.build([]);
}

afterAll(() => {
  while (tmpDirs.length > 0) {
    const dir = tmpDirs.pop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('border alias utility generators', () => {
  it('reports the actual number of emitted border width utilities', () => {
    const result = generateBorderWidthUtilitiesCSS([
      { cssName: 'nx-borderwidth-default' },
      { cssName: 'nx-borderwidth-thick' },
    ]);

    expect(result.count).toBe(28);
    expect(result.css.match(/^@utility /gm)).toHaveLength(result.count);
  });

  it('emits color aliases only for approved semantic border names', () => {
    const result = generateBorderColorAliasUtilitiesCSS([
      { cssName: 'color-border-default' },
      { cssName: 'color-border-radius-sm' },
      { cssName: 'color-nav-border' },
    ]);

    expect(result.count).toBe(1);
    expect(result.css).toMatch(/@utility border-color-default \{/);
    expect(result.css).not.toMatch(/border-color-radius-sm/);
    expect(result.css).not.toMatch(/border-color-nav-border/);
  });
});

describe('generateTailwindPackage', () => {
  let distDir;
  let variablesCSS;
  let nexusCSS;
  let typographyCSS;
  let motionUtilitiesCSS;
  let spacingUtilitiesCSS;
  let borderWidthUtilitiesCSS;
  let borderColorAliasesCSS;
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
    motionUtilitiesCSS = read(distDir, 'motion-utilities.css');
    spacingUtilitiesCSS = read(distDir, 'spacing-utilities.css');
    borderWidthUtilitiesCSS = read(distDir, 'borderwidth-utilities.css');
    borderColorAliasesCSS = read(distDir, 'border-color-aliases.css');
  });

  it('emits a :root block in variables.css', () => {
    expect(variablesCSS).toMatch(/^:root \{/m);
  });

  it('emits focus error primitive but no default focus primitive or geometry in :root', () => {
    const rootBlock = extractBlock(variablesCSS, ':root');
    expect(rootBlock).toMatch(/--nx-shadow-2xs-layer-1-x: 0px;/);
    expect(rootBlock).not.toMatch(/--nx-focus-color-default:/);
    expect(rootBlock).toMatch(/--nx-focus-color-error:/);
    // Focus is an outline ring; default focus follows primary accent, and the old
    // geometry primitives were dropped.
    expect(rootBlock).not.toMatch(/--nx-focus-geometry-/);
  });

  // Focus colours are promoted to the --color-* namespace so Tailwind emits
  // outline-focus-* utilities. Default focus falls through to primary accent; error
  // focus keeps its primitive-backed token. The halo paint is shared CSS, while
  // the outline remains the forced-colors fallback.
  // The outline offset is also tokenised so components share one tune-point.
  // --focus-offset emits once at :root (not @theme: Tailwind tree-shakes @theme
  // vars referenced only via arbitrary utilities, #506). The count guard also
  // catches duplicate emission via the dimension scan (the --breakpoint-* trap).
  it('promotes focus colours to --color-* and emits --focus-offset plus halo CSS', () => {
    const themeBlock = compactCss(extractBlock(nexusCSS, '@theme inline'));
    expect(themeBlock).toMatch(
      /--color-focus-default: var\(\s*--nx-color-focus-default,\s*var\(--color-primary-subtle-foreground\)\s*\);/
    );
    expect(themeBlock).toMatch(
      /--color-focus-error: var\(\s*--nx-color-focus-error,\s*var\(--nx-focus-color-error\)\s*\);/
    );
    expect(nexusCSS.match(/--focus-offset:/g)).toHaveLength(1);
    expect(themeBlock).not.toMatch(/--focus-offset/);
    expect(nexusCSS).toMatch(/:root\s*\{[^}]*--focus-offset: 2px;[^}]*\}/);
    expect(nexusCSS).toMatch(/\/\* ===== FOCUS HALO ===== \*\//);
    expect(nexusCSS).toMatch(
      /\[class~='nx:focus-visible:outline-focus-default'\]:focus-visible/
    );
    expect(nexusCSS).toMatch(/box-shadow:[\s\S]*var\(--color-focus-default\)/);
    expect(nexusCSS).toMatch(/@media \(forced-colors: active\)/);
    expect(nexusCSS).not.toMatch(/--shadow-focus-/);
  });

  it('bridges every semantic color utility to its runtime override with a static fallback', () => {
    const themeBlock = extractBlock(nexusCSS, '@theme inline');
    const colorLines = themeColorLines(themeBlock);

    expect(colorLines).toHaveLength(106);

    for (const [, name, value] of colorLines) {
      expect(compactCss(value), `--color-${name}`).toMatch(
        new RegExp(`^var\\(\\s*--nx-color-${name},\\s*.+\\)$`)
      );
    }
  });

  it('aliases semantic colors at :root for non-utility CSS consumers', () => {
    expect(nexusCSS).toMatch(
      /:root\s*\{[\s\S]*--color-background:\s*var\(--nx-color-background,\s*var\(--nx-color-white-base\)\);[\s\S]*\}/
    );
    expect(nexusCSS).toMatch(
      /:root\s*\{[\s\S]*--color-focus-default:\s*var\(\s*--nx-color-focus-default,\s*var\(--color-primary-subtle-foreground\)\s*\);[\s\S]*\}/
    );
  });

  it('compiles semantic color utilities through the bridged theme variables', async () => {
    const css = compactCss(
      await compileGeneratedTailwind(distDir, [
        'nx:bg-background',
        'nx:outline-focus-default',
      ])
    );

    expect(css).toMatch(
      /background-color:\s*var\(--nx-color-background,\s*var\(--nx-color-white-base\)\);/
    );
    expect(css).toMatch(
      /outline-color:\s*var\(\s*--nx-color-focus-default,\s*var\(--color-primary-subtle-foreground\)\s*\);/
    );
  });

  // Every var(--nx-shadow-*) or var(--nx-focus-*) ref in nexus.css must have a
  // matching decl in :root of variables.css; missing decls render the utility
  // flat. Error focus still points at --nx-focus-* primitives directly.
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
  // their `:root` counterpart by cssName. Error focus lives in the focus
  // primitive category and supplies the focus divergence.
  // Default elevation shadows now also carry dark-only color tuning; geometry
  // stays shared, so only the diverging shadow colour leaves should appear.
  it('.dark block contains only tokens that diverge from :root by value', () => {
    const darkBlock = extractBlock(variablesCSS, '.dark');

    expect(darkBlock).not.toMatch(/--nx-focus-color-default:/);
    expect(darkBlock).toMatch(/--nx-focus-color-error:/);
    expect(darkBlock).toMatch(/--nx-shadow-2xs-layer-1-color:/);
    expect(darkBlock).toMatch(/--nx-shadow-sm-layer-1-color:/);

    expect(darkBlock).not.toMatch(/--nx-shadow-focus-default-color:/);
    expect(darkBlock).not.toMatch(/--nx-shadow-focus-error-color:/);
    expect(darkBlock).not.toMatch(/--nx-shadow-2xs-layer-1-x:/);
    expect(darkBlock).not.toMatch(/--nx-shadow-2xs-layer-1-y:/);
  });

  it('emits chart.categorical tokens in @theme (light) and .dark (dark override)', () => {
    const themeBlock = compactCss(extractBlock(nexusCSS, '@theme inline'));
    expect(themeBlock).toMatch(
      /--color-chart-categorical-1: var\(\s*--nx-color-chart-categorical-1,\s*var\(--nx-color-teal-600\)\s*\);/
    );
    expect(themeBlock).toMatch(
      /--color-chart-categorical-5: var\(\s*--nx-color-chart-categorical-5,\s*var\(--nx-color-indigo-600\)\s*\);/
    );

    const darkBlock = extractBlock(nexusCSS, '.dark');
    expect(darkBlock).toMatch(
      /--nx-color-chart-categorical-1: var\(--nx-color-teal-200\);/
    );
    expect(darkBlock).toMatch(
      /--nx-color-chart-categorical-5: var\(--nx-color-indigo-200\);/
    );
  });

  it('emits a class-driven native browser UI theme policy', () => {
    expect(nexusCSS).toMatch(/:root \{\n\s*color-scheme:\s*light dark;\n\s*\}/);
    expect(nexusCSS).toMatch(
      /:root:not\(\.dark\) \{\n\s*color-scheme:\s*light;\n\s*\}/
    );
    expect(nexusCSS).toMatch(/\.dark \{\n\s*color-scheme:\s*dark;\n\s*\}/);
    expect(nexusCSS).toMatch(
      /:where\([\s\S]*input\[type='checkbox'\],[\s\S]*input\[type='radio'\],[\s\S]*input\[type='range'\],[\s\S]*progress[\s\S]*\) \{\n\s*accent-color:\s*var\(--color-primary-background\);\n\s*\}/
    );
    expect(nexusCSS).not.toMatch(/light-dark\(/);
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

  it('emits balanced wrapping on heading typography utilities', () => {
    const block = extractBlock(
      typographyCSS,
      '@utility typography-heading-large'
    );
    expect(block).toMatch(/text-wrap: balance;/);
  });

  it('emits typography-shortcut from the shortcut composite token', () => {
    const block = extractBlock(typographyCSS, '@utility typography-shortcut');
    expect(block).toMatch(
      /font-family: var\(--nx-typography-family-font-sans\);/
    );
    expect(block).toMatch(/font-size: var\(--nx-typography-size-xs\);/);
    expect(block).toMatch(/font-weight: var\(--nx-typography-weight-normal\);/);
    expect(block).toMatch(
      /line-height: var\(--nx-typography-line-height-xs\);/
    );
    expect(block).toMatch(
      /letter-spacing: var\(--nx-typography-letterspacing-widest\);/
    );
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
    // files into [data-density="X"] blocks. Any residual --nx-size- would
    // indicate the deletion was incomplete or the build regressed.
    expect(variablesCSS).not.toMatch(/--nx-size-/);
    expect(nexusCSS).not.toMatch(/--nx-size-/);
    expect(spacingUtilitiesCSS).not.toMatch(/--nx-size-/);
  });

  it('preserves the --spacing-*: initial reset in @theme', () => {
    // Required so Tailwind v4 base defaults don't leak through and pollute
    // the named scale. Also load-bearing for tw-animate-css (see project
    // memory: nexus-spacing-reset-tw-animate).
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).toMatch(/--spacing-\*:\s*initial;/);
  });

  it('preserves the --text-*: initial reset in @theme', () => {
    // Raw named Tailwind font-size utilities must not leak around the
    // typography composites that own type sizing.
    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).toMatch(/--text-\*:\s*initial;/);
  });

  it('emits named motion tokens without resetting Tailwind default motion namespaces yet', () => {
    const rootBlock = extractBlock(variablesCSS, ':root');
    expect(rootBlock).toMatch(/--nx-motion-duration-fast:\s*150ms;/);
    expect(rootBlock).toMatch(/--nx-motion-duration-default:\s*200ms;/);
    expect(rootBlock).toMatch(
      /--nx-motion-ease-enter:\s*cubic-bezier\(0\.23, 1, 0\.32, 1\);/
    );
    expect(rootBlock).toMatch(
      /--nx-motion-ease-move:\s*cubic-bezier\(0\.77, 0, 0\.175, 1\);/
    );

    const themeBlock = extractBlock(nexusCSS, '@theme');
    expect(themeBlock).not.toMatch(/--duration-fast:/);
    expect(themeBlock).not.toMatch(/--duration-default:/);
    expect(themeBlock).toMatch(
      /--ease-enter:\s*var\(--nx-motion-ease-enter\);/
    );
    expect(themeBlock).toMatch(/--ease-move:\s*var\(--nx-motion-ease-move\);/);

    // The repo-wide motion migration is tracked separately (#530). Until
    // hardcoded consumers are migrated, keep Tailwind's default duration/ease
    // utilities available so existing classes do not silently lose motion.
    expect(themeBlock).not.toMatch(/--duration-\*:\s*initial;/);
    expect(themeBlock).not.toMatch(/--ease-\*:\s*initial;/);
    expect(themeBlock).not.toMatch(/--animate-\*:\s*initial;/);

    const fastBlock = extractBlock(
      motionUtilitiesCSS,
      '@utility duration-fast'
    );
    expect(fastBlock).toMatch(
      /--tw-duration:\s*var\(--nx-motion-duration-fast\);/
    );
    expect(fastBlock).toMatch(
      /transition-duration:\s*var\(--nx-motion-duration-fast\);/
    );

    const defaultBlock = extractBlock(
      motionUtilitiesCSS,
      '@utility duration-default'
    );
    expect(defaultBlock).toMatch(
      /--tw-duration:\s*var\(--nx-motion-duration-default\);/
    );
    expect(defaultBlock).toMatch(
      /transition-duration:\s*var\(--nx-motion-duration-default\);/
    );

    expect(motionUtilitiesCSS).toMatch(/@keyframes overlay-presence-exit \{/);
    const presenceExitBlock = extractBlock(
      motionUtilitiesCSS,
      '@utility animate-overlay-presence-exit'
    );
    expect(presenceExitBlock).toMatch(
      /animation-name:\s*overlay-presence-exit;/
    );
    expect(presenceExitBlock).toMatch(
      /animation-duration:\s*var\(--tw-duration,\s*var\(--nx-motion-duration-fast\)\);/
    );

    // Regression guard (#609): the presence bridge exists only to fire
    // `animationend` for Radix Presence; it must animate an inert custom
    // property, never a transitioned one. Animating opacity/scale/translate
    // would override the exit transition and the visible fade would never
    // render — the bug that shipped green because no test read the keyframe body.
    const presenceExitKeyframe = extractBlock(
      motionUtilitiesCSS,
      '@keyframes overlay-presence-exit'
    );
    expect(presenceExitKeyframe).toMatch(/--overlay-presence-phase:/);
    expect(presenceExitKeyframe).not.toMatch(
      /opacity|scale|translate|transform/
    );
  });

  it('compiles named motion utilities through Tailwind', async () => {
    const compiledCSS = await compileGeneratedTailwind(distDir, [
      'nx:duration-fast',
      'nx:duration-default',
      'nx:duration-150',
      'nx:duration-(--nx-motion-duration-fast)',
      'nx:ease-enter',
      'nx:animate-overlay-presence-exit',
    ]);

    expect(compiledCSS).toMatch(
      /\.nx\\:duration-fast\s*\{[\s\S]*?--tw-duration:\s*var\(--nx-motion-duration-fast\);[\s\S]*?transition-duration:\s*var\(--nx-motion-duration-fast\);/
    );
    expect(compiledCSS).toMatch(
      /\.nx\\:duration-default\s*\{[\s\S]*?--tw-duration:\s*var\(--nx-motion-duration-default\);[\s\S]*?transition-duration:\s*var\(--nx-motion-duration-default\);/
    );
    expect(compiledCSS).toMatch(
      /\.nx\\:duration-150\s*\{[\s\S]*?transition-duration:\s*150ms;/
    );
    expect(compiledCSS).toMatch(
      /\.nx\\:duration-\\\(--nx-motion-duration-fast\\\)\s*\{[\s\S]*?transition-duration:\s*var\(--nx-motion-duration-fast\);/
    );
    expect(compiledCSS).toMatch(
      /\.nx\\:ease-enter\s*\{[\s\S]*?transition-timing-function:\s*var\(--nx-ease-enter\);/
    );
    expect(compiledCSS).toMatch(
      /\.nx\\:animate-overlay-presence-exit\s*\{[\s\S]*?animation-name:\s*overlay-presence-exit;/
    );
  });

  it('compiles shadow utilities through runtime shadow variables', async () => {
    const compiledCSS = await compileGeneratedTailwind(distDir, [
      'nx:shadow-sm',
      'nx:shadow-lg',
      'nx:shadow-xl',
      'nx:shadow-2xl',
    ]);

    for (const tier of ['sm', 'lg', 'xl', '2xl']) {
      expect(compiledCSS).toMatch(
        new RegExp(
          `\\.nx\\\\:shadow-${tier}\\s*\\{[\\s\\S]*?--tw-shadow:\\s*var\\(--nx-shadow-${tier}-`
        )
      );
      expect(compiledCSS).toMatch(
        new RegExp(
          `\\.nx\\\\:shadow-${tier}\\s*\\{[\\s\\S]*?box-shadow:[\\s\\S]*?var\\(--tw-shadow\\);`
        )
      );
    }
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
    expect(themeBlock).not.toMatch(/--layout-section-gap:/);
  });

  it('emits exactly 6 [data-density="X"] selectors (one per mode)', () => {
    // The configured default selector is `:root, [data-density='<mode>']`, so it contributes one
    // [data-density=...] match; the other 5 modes each contribute one. Total: 6.
    const matches = nexusCSS.match(/\[data-density=['"][a-z]+['"]\]/g) ?? [];
    expect(matches).toHaveLength(6);

    const modes = new Set(matches.map((m) => m.match(/['"]([a-z]+)['"]/)[1]));
    expect(modes).toEqual(new Set(SPACING_MODES));
  });

  it('emits configured spacing default under :root selector', () => {
    // Without the :root half, a document with no data-density attribute would
    // miss the role-token defaults (which only live in per-mode blocks, not
    // @theme). The :root selector keeps the configured default live in both
    // no-attribute and explicit data-density configurations.
    expect(nexusCSS).toMatch(
      /:root,\s*\n\s*\[data-density=['"]default['"]\] \{/
    );
  });

  it('emits runtime mode selectors for radius, shadow, and border width', () => {
    expect(nexusCSS).toMatch(/:root,\s*\n\s*\[data-radius=['"]square['"]\] \{/);
    expect(nexusCSS).toMatch(/:root,\s*\n\s*\[data-shadow=['"]quiet['"]\] \{/);
    expect(nexusCSS).toMatch(
      /:root,\s*\n\s*\[data-borderwidth=['"]normal['"]\] \{/
    );
    expect(nexusCSS).toContain("[data-radius='extra-round']");
    expect(nexusCSS).toContain("[data-shadow='soft']");
    expect(nexusCSS).toContain("[data-borderwidth='strong']");
    expect(nexusCSS).not.toContain('light-dark(');
  });

  it('each runtime mode block declares the same variable names per family', () => {
    const families = [
      { attrName: 'data-radius', modes: RADIUS_MODES, baseline: 'square' },
      {
        attrName: 'data-borderwidth',
        modes: BORDERWIDTH_MODES,
        baseline: 'normal',
      },
    ];

    for (const { attrName, modes, baseline } of families) {
      const baselineVars = cssVarNames(
        extractDataAttrBlock(nexusCSS, attrName, baseline)
      );
      expect(baselineVars.length).toBeGreaterThan(0);
      for (const mode of modes) {
        expect(
          cssVarNames(extractDataAttrBlock(nexusCSS, attrName, mode)),
          `${attrName}="${mode}"`
        ).toEqual(baselineVars);
      }
    }

    const lightBaselineVars = cssVarNames(
      extractDataAttrBlock(nexusCSS, 'data-shadow', 'quiet')
    );
    const darkBaselineVars = cssVarNames(
      extractDarkDataAttrBlock(nexusCSS, 'data-shadow', 'quiet')
    );
    expect(lightBaselineVars.length).toBeGreaterThan(0);
    expect(darkBaselineVars).toEqual(lightBaselineVars);

    for (const mode of SHADOW_MODES) {
      expect(
        cssVarNames(extractDataAttrBlock(nexusCSS, 'data-shadow', mode)),
        `data-shadow="${mode}" light`
      ).toEqual(lightBaselineVars);
      expect(
        cssVarNames(extractDarkDataAttrBlock(nexusCSS, 'data-shadow', mode)),
        `data-shadow="${mode}" dark`
      ).toEqual(darkBaselineVars);
    }
  });

  it('calibrates public shadow runtime blocks by mode and scheme', () => {
    const publicModes = ['quiet', 'standard', 'strong'];

    for (const mode of publicModes) {
      const light = cssDeclarations(
        extractDataAttrBlock(nexusCSS, 'data-shadow', mode)
      );
      const dark = cssDeclarations(
        extractDarkDataAttrBlock(nexusCSS, 'data-shadow', mode)
      );
      const colorDiffs = Object.keys(light).filter(
        (name) => name.startsWith('--nx-shadow-') && light[name] !== dark[name]
      );

      expect(colorDiffs.length, `${mode} light/dark`).toBeGreaterThan(0);
      expect(colorDiffs, `${mode} color calibration`).toContain(
        '--nx-shadow-sm-layer-1-color'
      );
    }

    for (const scheme of ['light', 'dark']) {
      const blocks = publicModes.map((mode) =>
        scheme === 'light'
          ? cssDeclarations(extractDataAttrBlock(nexusCSS, 'data-shadow', mode))
          : cssDeclarations(
              extractDarkDataAttrBlock(nexusCSS, 'data-shadow', mode)
            )
      );

      expect(blocks[0]).not.toEqual(blocks[1]);
      expect(blocks[1]).not.toEqual(blocks[2]);
    }

    expect(nexusCSS).not.toMatch(/\{[a-z0-9_.-]+\}/);
  });

  it.each(SPACING_MODES)(
    '[data-density="%s"] block values match spacing-%s.json source',
    (mode) => {
      const block = extractDataStyleBlock(nexusCSS, mode);
      const source = readSpacingModeJson(mode);

      // Sample one key from each subtree — full per-mode parity is verified
      // by the cross-mode variable-name parity test below.
      const spacing4 = source.spacing['4'].$value.value;
      const containerP = source.container.p.$value.value;
      const layoutSectionGap = source.layout['section-gap'].$value.value;

      expect(block).toMatch(new RegExp(`--nx-spacing-4:\\s*${spacing4}px;`));
      expect(block).toMatch(
        new RegExp(`--nx-container-p:\\s*${containerP}px;`)
      );
      expect(block).toMatch(
        new RegExp(`--nx-layout-section-gap:\\s*${layoutSectionGap}px;`)
      );
    }
  );

  // Default numeric baseline — locks in the bundled shipped values.
  // Drift here means the migration changed numeric Default output; any change
  // requires explicit reviewer acknowledgement by updating this table.
  it('Default numeric values are byte-identical to the pre-#119 shipped scale', () => {
    const REGULAR_BASELINE = {
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
    const block = extractDataStyleBlock(nexusCSS, 'default');
    for (const [name, expected] of Object.entries(REGULAR_BASELINE)) {
      const match = block.match(new RegExp(`--nx-${name}:\\s*([^;]+);`));
      expect(match, `--nx-${name} missing from Default block`).not.toBeNull();
      expect(match[1].trim(), `--nx-${name} drifted from baseline`).toBe(
        expected
      );
    }
  });

  it('every [data-density="X"] block declares the same set of CSS variable names', () => {
    // Cross-mode parity: a mode missing a key silently breaks only that mode
    // when data-density switches to it. Schema validation (#125) will codify
    // this at the JSON layer; this is the emit-side guarantee.
    const blocks = SPACING_MODES.map((mode) => {
      const block = extractDataStyleBlock(nexusCSS, mode);
      const vars = [...block.matchAll(/^\s*(--[a-z0-9-_]+):/gm)]
        .map((m) => m[1])
        .sort();
      return [mode, vars];
    });

    const [, defaultVars] = blocks[0];
    expect(defaultVars.length).toBeGreaterThan(0);
    for (const [mode, vars] of blocks.slice(1)) {
      expect(
        vars,
        `mode "${mode}" CSS variable set diverges from default`
      ).toEqual(defaultVars);
    }
  });

  it('nexus.css imports generated utility files and each import resolves', () => {
    for (const fileName of [
      'motion-utilities.css',
      'spacing-utilities.css',
      'borderwidth-utilities.css',
      'border-color-aliases.css',
    ]) {
      const importMatch = nexusCSS.match(
        new RegExp(`@import\\s+['"](\\./${fileName})['"]`)
      );
      expect(
        importMatch,
        `nexus.css must @import ./${fileName}`
      ).not.toBeNull();
      const resolved = path.resolve(distDir, importMatch[1]);
      expect(
        fs.existsSync(resolved),
        `imported file ${importMatch[1]} must exist`
      ).toBe(true);
    }
  });

  it('borderwidth-utilities.css declares all-side and one-side stroke utilities', () => {
    const defaultBlock = extractBlock(
      borderWidthUtilitiesCSS,
      '@utility border-default'
    );
    expect(defaultBlock).toMatch(
      /border-width:\s*var\(--nx-borderwidth-default\);/
    );

    const bottomBlock = extractBlock(
      borderWidthUtilitiesCSS,
      '@utility border-b-default'
    );
    expect(bottomBlock).toMatch(
      /border-bottom-style:\s*var\(--tw-border-style, solid\);/
    );
    expect(bottomBlock).toMatch(
      /border-bottom-width:\s*var\(--nx-borderwidth-default\);/
    );

    const inlineBlock = extractBlock(
      borderWidthUtilitiesCSS,
      '@utility border-x-thick'
    );
    expect(inlineBlock).toMatch(
      /border-inline-style:\s*var\(--tw-border-style, solid\);/
    );
    expect(inlineBlock).toMatch(
      /border-inline-width:\s*var\(--nx-borderwidth-thick\);/
    );
  });

  it('borderwidth-utilities.css declares self-describing stroke width aliases', () => {
    const defaultBlock = extractBlock(
      borderWidthUtilitiesCSS,
      '@utility border-width-default'
    );
    expect(defaultBlock).toMatch(
      /border-width:\s*var\(--nx-borderwidth-default\);/
    );

    const bottomBlock = extractBlock(
      borderWidthUtilitiesCSS,
      '@utility border-width-b-default'
    );
    expect(bottomBlock).toMatch(
      /border-bottom-style:\s*var\(--tw-border-style, solid\);/
    );
    expect(bottomBlock).toMatch(
      /border-bottom-width:\s*var\(--nx-borderwidth-default\);/
    );

    const inlineBlock = extractBlock(
      borderWidthUtilitiesCSS,
      '@utility border-width-x-thick'
    );
    expect(inlineBlock).toMatch(
      /border-inline-style:\s*var\(--tw-border-style, solid\);/
    );
    expect(inlineBlock).toMatch(
      /border-inline-width:\s*var\(--nx-borderwidth-thick\);/
    );
  });

  it('border-color-aliases.css declares aliases for border semantic colors', () => {
    const aliases = [
      ...borderColorAliasesCSS.matchAll(
        /^@utility border-color-([a-z0-9-]+) \{/gm
      ),
    ].map((match) => match[1]);
    expect(aliases).toEqual([
      'default',
      'default-alpha',
      'active',
      'disabled',
      'warning',
      'warning-active',
      'success',
      'success-active',
      'error',
      'error-active',
      'information',
      'information-active',
      'primary',
      'primary-active',
    ]);

    const defaultBlock = extractBlock(
      borderColorAliasesCSS,
      '@utility border-color-default'
    );
    expect(defaultBlock).toMatch(
      /border-color:\s*var\(--color-border-default\);/
    );

    const errorBlock = extractBlock(
      borderColorAliasesCSS,
      '@utility border-color-error'
    );
    expect(errorBlock).toMatch(/border-color:\s*var\(--color-border-error\);/);

    const informationActiveBlock = extractBlock(
      borderColorAliasesCSS,
      '@utility border-color-information-active'
    );
    expect(informationActiveBlock).toMatch(
      /border-color:\s*var\(--color-border-information-active\);/
    );
  });

  it('compiles runtime stroke utilities for all-side and one-side borders', async () => {
    const css = compactCss(
      await compileGeneratedTailwind(distDir, [
        'nx:border-default',
        'nx:border-width-default',
        'nx:border-b-default',
        'nx:border-width-b-default',
        'nx:border-x-thick',
        'nx:border-width-x-thick',
        'nx:border-color-default',
        'nx:border-color-error',
      ])
    );

    expect(css).toMatch(/border-width:\s*var\(--nx-borderwidth-default\);/);
    expect(css).toMatch(
      /border-bottom-width:\s*var\(--nx-borderwidth-default\);/
    );
    expect(css).toMatch(
      /border-inline-width:\s*var\(--nx-borderwidth-thick\);/
    );
    expect(css).toMatch(/border-color:\s*var\(--color-border-default\);/);
    expect(css).toMatch(/border-color:\s*var\(--color-border-error\);/);
  });

  it('spacing-utilities.css declares all 4 role utilities with correct property bindings', () => {
    // Each @utility binds the right CSS property to the right --nx-* variable.
    // A buggy emitter could pass "utility exists" tests but bind the wrong var.
    const ROLE_UTILITY_BINDINGS = [
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

    expect(ROLE_UTILITY_BINDINGS).toHaveLength(4);
    for (const { utility, prop, cssVar } of ROLE_UTILITY_BINDINGS) {
      const block = extractBlock(spacingUtilitiesCSS, `@utility ${utility}`);
      expect(block, `@utility ${utility} body`).toMatch(
        new RegExp(`${prop}:\\s*var\\(--${cssVar}\\);`)
      );
    }
  });

  it('role @utility names match the role-token set 1:1 (drift guard)', () => {
    // If a new role key lands in the canonical spacing mode without a matching emitter
    // row, this catches it — utility set must equal the role-token set.
    const utilityMatches = [
      ...spacingUtilitiesCSS.matchAll(/@utility ([a-z-]+) \{/g),
    ].map((m) => m[1]);
    const utilities = new Set(utilityMatches);

    // Derive expected utility names from spacing-default.json's role subtrees.
    const defaultMode = readSpacingModeJson('default');
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
          const prefix = { 'padding-x': 'px', 'padding-y': 'py', gap: 'gap' }[
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
      if (group in defaultMode) walk(defaultMode[group], [group]);
    }

    expect(utilities).toEqual(expected);
  });

  it('emits 6 per-mode spacing blocks in deterministic alphabetical order (non-default modes)', () => {
    // Filesystem order isn't portable; the emitter sorts non-default modes
    // alphabetically.
    const ordered = [
      ...nexusCSS.matchAll(/\[data-density=['"]([a-z-]+)['"]\]/g),
    ]
      .map((m) => m[1])
      // De-dup in case `:root, [data-density="<default>"]` produces two captures.
      .filter((m, i, arr) => arr.indexOf(m) === i);
    expect(ordered[0]).toBe('default');
    // Other five in alphabetical order:
    expect(ordered.slice(1)).toEqual([
      'comfortable',
      'compact',
      'relaxed',
      'spacious',
      'tight',
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
      'motion-utilities.css',
      'spacing-utilities.css',
    ]) {
      expect(read(dirA, file), `${file} differs across runs`).toBe(
        read(dirB, file)
      );
    }
  });

  it('throws when the selected brand mode is unavailable', async () => {
    const dir = makeTmpDir();
    await expect(
      generateTailwindPackage(
        { ...DEFAULT_CONFIG, brand: 'neutral' },
        { distDir: dir }
      )
    ).rejects.toThrow(
      'getSemanticFiles: themed type "brands" has no mode "neutral"'
    );
  });

  it('config.spacingDefault shifts which mode lands under :root, [data-density="X"]', async () => {
    // Build with a non-default spacing mode. All 6 mode blocks still emit;
    // only the `:root` half of the dual selector moves from Default to Relaxed.
    const dir = makeTmpDir();
    await generateTailwindPackage(
      { ...DEFAULT_CONFIG, spacingDefault: 'relaxed' },
      { distDir: dir }
    );
    const css = read(dir, 'nexus.css');

    // :root must combine with [data-density="relaxed"], not default.
    expect(css).toMatch(/:root,\s*\n\s*\[data-density=['"]relaxed['"]\] \{/);
    // Default becomes a plain attribute selector (no :root combinator).
    expect(css).not.toMatch(
      /:root,\s*\n\s*\[data-density=['"]default['"]\] \{/
    );
    // Both blocks still present — the bundle still ships all 6 modes; only
    // the cascade default moves.
    const matches = css.match(/\[data-density=['"][a-z]+['"]\]/g) ?? [];
    expect(matches).toHaveLength(6);
  });
});
