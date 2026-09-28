import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createTokenCatalogue } from '../catalogue/catalogue';
import type {
  CatalogueAlias,
  CatalogueFamily,
  CatalogueToken,
} from '../catalogue/types';

import type { Mode } from './palette';

const catalogue = createTokenCatalogue();
const runtimeColors = catalogue.filter((token) =>
  token.variants.some((variant) => variant.appearance)
);
const authored = catalogue.filter((token) => !runtimeColors.includes(token));
const primitives = authored.filter((token) =>
  token.variants.every((variant) =>
    variant.source?.file.startsWith('primitives/')
  )
);

/** The attribute that swaps each moded family at runtime. */
const MODE_ATTRIBUTES: Partial<Record<CatalogueFamily, string>> = {
  spacing: 'data-density',
  radius: 'data-radius',
  borderwidth: 'data-borderwidth',
  shadow: 'data-shadow',
};

/** Hand-written utilities in the generated files that no token feeds. */
const STATIC_UTILITIES = [
  'nx:transition-control',
  'nx:transition-field',
  'nx:animate-overlay-presence-exit',
];

/** The generated files that declare `@utility` rules for tokens. */
const UTILITY_FILES = [
  'typography-utilities.css',
  'borderwidth-utilities.css',
  'border-color-aliases.css',
  'spacing-utilities.css',
  'motion-utilities.css',
];

function generated(file: string): string {
  return readFileSync(
    resolve(process.cwd(), 'packages/tailwind', file),
    'utf8'
  );
}

const nexusCss = generated('nexus.css');
const variablesCss = generated('variables.css');

/** Undo prettier's line wrapping so a value compares as one line. */
const collapse = (value: string) =>
  value.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim();

function customProperties(body: string): Map<string, string> {
  return new Map(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name!,
      collapse(value!),
    ])
  );
}

/** Declarations of every top-level block opened by exactly `selector {`. */
function blockDeclarations(css: string, selector: string): Map<string, string> {
  const bodies = css
    .split(`\n${selector} {\n`)
    .slice(1)
    .map((rest) => rest.slice(0, rest.indexOf('\n}\n')));
  if (bodies.length === 0) {
    throw new Error(`no top-level "${selector}" block`);
  }
  return new Map(bodies.flatMap((body) => [...customProperties(body)]));
}

/** Every top-level rule with a flat body, keyed by its selector list. */
function selectorBlocks(css: string) {
  return [...css.matchAll(/\n([^\s{}@/][^{}]*?) \{\n([^{}]*?)\n\}/g)].map(
    ([, selector, body]) => ({
      selectors: selector!.split(',').map((part) => part.trim()),
      declarations: customProperties(body!),
    })
  );
}

const nexusBlocks = selectorBlocks(nexusCss);

function modeBlock(selector: string): Map<string, string> {
  const block = nexusBlocks.find(({ selectors }) =>
    selectors.includes(selector)
  );
  if (!block) throw new Error(`no block selects "${selector}"`);
  return block.declarations;
}

/** Modes the generated CSS declares for an attribute, and the one on `:root`. */
function cssModes(attribute: string) {
  const pattern = new RegExp(`^\\[${attribute}='([\\w-]+)'\\]$`);
  const modes = nexusBlocks.flatMap(({ selectors }) =>
    selectors.flatMap((selector) => selector.match(pattern)?.[1] ?? [])
  );
  const rootBlock = nexusBlocks.find(
    ({ selectors }) =>
      selectors.includes(':root') &&
      selectors.some((selector) => pattern.test(selector))
  );
  const root = rootBlock?.selectors
    .map((selector) => selector.match(pattern)?.[1])
    .find((mode) => mode !== undefined);
  if (!root) throw new Error(`no :root block for ${attribute}`);
  return { modes: [...new Set(modes)].sort(), root };
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

/** Which variant to read: a preset, a theme mode, or both. */
interface VariantKey {
  preset: string | null;
  mode: Mode | null;
}

function variantValue(
  token: CatalogueToken,
  { preset, mode }: VariantKey
): string {
  const variant = token.variants.find(
    (candidate) => candidate.preset === preset && candidate.mode === mode
  );
  if (!variant) {
    throw new Error(`${token.name} has no ${preset}/${mode} variant`);
  }
  return collapse(only(variant.declarations).value);
}

function aliasesOf(token: CatalogueToken, kind: CatalogueAlias['kind']) {
  return token.aliases
    .filter((alias) => alias.kind === kind)
    .map(({ name }) => name);
}

function familyTokens(family: CatalogueFamily): CatalogueToken[] {
  return authored.filter((token) => token.family === family);
}

/** The variant `:root` carries: the root preset, in light for shadows. */
function rootVariant(token: CatalogueToken): VariantKey {
  const attribute = MODE_ATTRIBUTES[token.family];
  if (!attribute || token.variants.length === 1) return token.variants[0]!;
  const { root } = cssModes(attribute);
  return { preset: root, mode: token.family === 'shadow' ? 'light' : null };
}

/** `{ name → value }` for every token of a family in one preset and mode. */
function cataloguePreset(family: CatalogueFamily, key: VariantKey) {
  return new Map(
    familyTokens(family)
      .filter((token) =>
        token.variants.some(
          (v) => v.preset === key.preset && v.mode === key.mode
        )
      )
      .map((token) => [token.name, variantValue(token, key)])
  );
}

describe('token catalogue', () => {
  it('agrees with the generated runtime colour fallbacks and dark overrides', () => {
    const theme = blockDeclarations(nexusCss, '@theme inline');
    const dark = blockDeclarations(nexusCss, '.dark');
    for (const token of runtimeColors) {
      const alias = only(aliasesOf(token, 'css-variable'));
      expect(theme.get(alias), alias).toBe(
        `var(${token.name}, ${variantValue(token, { preset: null, mode: 'light' })})`
      );
      expect(dark.get(token.name), token.name).toBe(
        variantValue(token, { preset: null, mode: 'dark' })
      );
    }
  });

  it('declares exactly the primitives in variables.css, in their root mode', () => {
    const root = blockDeclarations(variablesCss, ':root');
    expect([...root.keys()].sort()).toEqual(
      primitives.map((token) => token.name).sort()
    );
    for (const token of primitives) {
      expect(root.get(token.name), token.name).toBe(
        variantValue(token, rootVariant(token))
      );
    }
  });

  it('overrides only the diverging dark shadow primitives in variables.css', () => {
    const light = blockDeclarations(variablesCss, ':root');
    const dark = blockDeclarations(variablesCss, '.dark');
    const { root } = cssModes('data-shadow');
    const rootDark: VariantKey = { preset: root, mode: 'dark' };
    const diverging = familyTokens('shadow').filter(
      (token) =>
        token.variants.some((v) => v.preset === root && v.mode === 'dark') &&
        variantValue(token, rootDark) !== light.get(token.name)
    );
    expect([...dark.keys()].sort()).toEqual(
      diverging.map((token) => token.name).sort()
    );
    for (const token of diverging) {
      expect(dark.get(token.name), token.name).toBe(
        variantValue(token, rootDark)
      );
    }
  });

  it.each(['spacing', 'radius', 'borderwidth'] as const)(
    'agrees with every generated %s mode block',
    (family) => {
      const attribute = MODE_ATTRIBUTES[family]!;
      const presets = [
        ...new Set(
          familyTokens(family).flatMap((token) =>
            token.variants.map(({ preset }) => preset ?? '')
          )
        ),
      ].sort();
      expect(presets).toEqual(cssModes(attribute).modes);
      for (const preset of presets) {
        expect(modeBlock(`[${attribute}='${preset}']`), preset).toEqual(
          cataloguePreset(family, { preset, mode: null })
        );
      }
    }
  );

  it('agrees with every generated light and dark shadow preset block', () => {
    const { modes } = cssModes('data-shadow');
    for (const preset of modes) {
      expect(modeBlock(`[data-shadow='${preset}']`), preset).toEqual(
        cataloguePreset('shadow', { preset, mode: 'light' })
      );
      expect(modeBlock(`.dark[data-shadow='${preset}']`), preset).toEqual(
        cataloguePreset('shadow', { preset, mode: 'dark' })
      );
    }
  });

  it('maps every @theme variable to the token it reads or declares', () => {
    const theme = new Map([
      ...blockDeclarations(nexusCss, '@theme'),
      ...blockDeclarations(nexusCss, '@theme inline'),
    ]);
    const aliased = catalogue.flatMap((token) =>
      aliasesOf(token, 'css-variable').map((alias) => ({ alias, token }))
    );
    expect(aliased.map(({ alias }) => alias).sort()).toEqual(
      [...theme.keys()].filter((name) => !name.endsWith('-*')).sort()
    );
    for (const { alias, token } of aliased) {
      if (runtimeColors.includes(token)) continue;
      const expected = primitives.includes(token)
        ? `var(${token.name})`
        : variantValue(token, rootVariant(token));
      expect(theme.get(alias), alias).toBe(expected);
    }
  });

  it('maps every data-driven generated utility to the token it reads', () => {
    const utilities = new Map(
      UTILITY_FILES.flatMap((file) => [...utilityDeclarations(generated(file))])
    );
    const aliased = catalogue.flatMap((token) =>
      aliasesOf(token, 'utility').map((alias) => ({ alias, token }))
    );
    expect(aliased.map(({ alias }) => alias).sort()).toEqual(
      [...utilities.keys()]
        .filter((name) => !STATIC_UTILITIES.includes(name))
        .sort()
    );
    for (const { alias, token } of aliased) {
      if (token.type === 'typography') continue;
      const reads = new RegExp(`var\\(${token.name}[),]`);
      expect(
        utilities.get(alias)?.some((line) => reads.test(line)),
        alias
      ).toBe(true);
    }
  });

  it('declares only custom properties the generated CSS declares', () => {
    const declared = new Set(
      ['variables.css', 'nexus.css', ...UTILITY_FILES].flatMap((file) =>
        [...generated(file).matchAll(/(--[\w-]+):/g)].map(([, name]) => name)
      )
    );
    const properties = catalogue.flatMap((token) =>
      token.variants.flatMap((variant) =>
        variant.declarations
          .map(({ property }) => property)
          .filter((property) => property.startsWith('--'))
      )
    );
    expect(properties.length).toBeGreaterThan(0);
    for (const property of new Set(properties)) {
      expect(declared.has(property), property).toBe(true);
    }
  });

  it('agrees with the generated typography utilities', () => {
    const utilities = utilityDeclarations(
      generated('typography-utilities.css')
    );
    for (const token of authored.filter(
      (candidate) => candidate.type === 'typography'
    )) {
      const utility = only(aliasesOf(token, 'utility'));
      expect(
        only(token.variants).declarations.map(
          ({ property, value }) => `${property}: ${value}`
        ),
        utility
      ).toEqual(utilities.get(utility));
    }
  });
});
