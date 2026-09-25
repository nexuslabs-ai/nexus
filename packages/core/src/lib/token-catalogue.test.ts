import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createTokenCatalogue } from '../catalogue/catalogue';
import type { CatalogueToken } from '../catalogue/types';

import type { Mode } from './palette';

const catalogue = createTokenCatalogue();
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
  const bodies = css
    .split(`\n${selector} {\n`)
    .slice(1)
    .map((rest) => rest.slice(0, rest.indexOf('\n}\n')));
  if (bodies.length === 0) {
    throw new Error(`no top-level "${selector}" block`);
  }
  return new Map(
    bodies.flatMap((body) =>
      [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(
        ([, name, value]) => [name!, collapse(value!)] as const
      )
    )
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

function variantValue(token: CatalogueToken, mode: Mode): string {
  const variant = token.variants.find((candidate) => candidate.mode === mode);
  return only(variant?.declarations ?? []).value;
}

describe('token catalogue', () => {
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
      const { declarations } = only(token.variants);
      expect(root.get(token.name), token.name).toBe(
        collapse(only(declarations).value)
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
});
