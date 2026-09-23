import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createTokenCatalogue } from '../catalogue/catalogue';
import { RUNTIME_COLOR_DESCRIPTIONS } from '../catalogue/descriptions';
import type { CatalogueToken } from '../catalogue/types';

import { DEFAULT_NEXUS_APPEARANCE } from './appearance-model';
import { SEMANTIC_TOKEN_REGISTRY } from './token-registry';

const catalogue = createTokenCatalogue();
const byName = new Map(catalogue.map((token) => [token.name, token]));
const runtimeColors = catalogue.filter((token) =>
  token.variants.some((variant) => variant.appearance)
);
const authored = catalogue.filter((token) => !runtimeColors.includes(token));

function generated(file: string): string {
  return readFileSync(
    resolve(process.cwd(), 'packages/tailwind', file),
    'utf8'
  );
}

/** Undo prettier's line wrapping so a value compares as one line. */
const collapse = (value: string) =>
  value.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim();

/** Declarations of the first top-level block opened by exactly `selector {`. */
function blockDeclarations(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(`\n${selector} {\n`);
  if (start === -1) throw new Error(`no top-level "${selector}" block`);
  const body = css.slice(start, css.indexOf('\n}\n', start));
  return new Map(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name!,
      collapse(value!),
    ])
  );
}

function utilityDeclarations(css: string): Map<string, string[]> {
  return new Map(
    [...css.matchAll(/@utility ([\w-]+) \{([^}]*)\}/g)].map(
      ([, name, body]) => [
        `nx:${name}`,
        [...body!.matchAll(/([\w-]+):\s*([^;]+);/g)].map(
          ([, property, value]) => `${property}: ${collapse(value!)}`
        ),
      ]
    )
  );
}

function only<T>(items: readonly T[]): T {
  expect(items).toHaveLength(1);
  return items[0]!;
}

function variantValue(token: CatalogueToken, mode: string | null): string {
  const variant = token.variants.find((candidate) => candidate.mode === mode);
  return only(variant?.declarations ?? []).value;
}

describe('token catalogue', () => {
  it('names every token by a unique --nx-* custom property', () => {
    expect(byName.size).toBe(catalogue.length);
    for (const token of catalogue) {
      expect(token.name).toMatch(/^--nx-[a-z0-9-]+$/);
    }
  });

  it('lists every registry colour once, derived in explicit light and dark modes', () => {
    expect(runtimeColors.map((token) => token.name)).toEqual(
      SEMANTIC_TOKEN_REGISTRY.map(({ name }) => `--nx-color-${name}`)
    );
    for (const token of runtimeColors) {
      expect(
        token.variants.map(({ mode, appearance }) => ({ mode, appearance }))
      ).toEqual([
        {
          mode: 'light',
          appearance: { ...DEFAULT_NEXUS_APPEARANCE, mode: 'light' },
        },
        {
          mode: 'dark',
          appearance: { ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' },
        },
      ]);
    }
  });

  it('agrees with the generated runtime colour fallbacks and dark overrides', () => {
    const nexusCss = generated('nexus.css');
    const theme = blockDeclarations(nexusCss, '@theme inline');
    const dark = blockDeclarations(nexusCss, '.dark');
    for (const token of runtimeColors) {
      const alias = only(token.aliases).name;
      expect(theme.get(alias), alias).toBe(
        `var(${token.name}, ${variantValue(token, 'light')})`
      );
      expect(dark.get(token.name), token.name).toBe(
        variantValue(token, 'dark')
      );
    }
  });

  it('agrees with the generated primitive colour and typography values', () => {
    const root = blockDeclarations(generated('variables.css'), ':root');
    const primitives = authored.filter((token) => token.type !== 'typography');
    expect(primitives.length).toBeGreaterThan(0);
    for (const token of primitives) {
      expect(root.get(token.name), token.name).toBe(
        collapse(variantValue(token, token.variants[0]!.mode))
      );
    }
  });

  it('agrees with the generated typography utilities', () => {
    const utilities = utilityDeclarations(
      generated('typography-utilities.css')
    );
    const styles = authored.filter((token) => token.type === 'typography');
    expect(styles.map((token) => only(token.aliases).name).sort()).toEqual(
      [...utilities.keys()].sort()
    );
    for (const token of styles) {
      const utility = only(token.aliases).name;
      expect(
        only(token.variants).declarations.map(
          ({ property, value }) => `${property}: ${value}`
        ),
        utility
      ).toEqual(utilities.get(utility));
    }
  });

  it('resolves every reference to a catalogued token', () => {
    const references = catalogue.flatMap((token) =>
      token.variants.flatMap((variant) => variant.references)
    );
    expect(references.length).toBeGreaterThan(0);
    for (const { reference, target } of references) {
      expect(byName.has(target), `${reference} → ${target}`).toBe(true);
    }
  });

  it('carries each runtime colour description on its registry token', () => {
    for (const [name, description] of Object.entries(
      RUNTIME_COLOR_DESCRIPTIONS
    )) {
      expect(byName.get(`--nx-color-${name}`)?.description).toBe(description);
    }
  });
});
