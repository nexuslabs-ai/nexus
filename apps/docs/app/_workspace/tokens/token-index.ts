import type {
  CatalogueFamily,
  CatalogueSource,
  CatalogueToken,
  CatalogueVariant,
  TokenValue,
} from '@nexus_ds/core/catalogue';

/** Family labels, in the order the filters list them. */
const FAMILY_LABELS: Record<CatalogueFamily, string> = {
  color: 'Color',
  typography: 'Typography',
  spacing: 'Spacing',
  radius: 'Radius',
  borderwidth: 'Border width',
  shadow: 'Shadow',
  motion: 'Motion',
  'z-index': 'Z-index',
  breakpoint: 'Breakpoint',
};

const LAYER_LABELS: Record<string, string> = {
  runtime: 'Runtime semantic',
  primitives: 'Primitive',
  semantic: 'Semantic',
  styles: 'Style',
};

const SOURCE_ROOT =
  'https://github.com/nexuslabs-ai/nexus/blob/main/packages/core/tokens';

/** The catalogue plus the lookups the explorer reads on every render. */
export interface TokenIndex {
  tokens: readonly CatalogueToken[];
  byName: ReadonlyMap<string, CatalogueToken>;
  /** Tokens whose value references each token, keyed by the referenced name. */
  referencedBy: ReadonlyMap<string, readonly CatalogueToken[]>;
  searchText: ReadonlyMap<string, string>;
}

function tokenSearchText(token: CatalogueToken): string {
  return [
    token.name,
    token.family,
    FAMILY_LABELS[token.family],
    token.group,
    token.type,
    token.description,
    ...token.aliases.map((alias) => alias.name),
    ...token.variants.flatMap((variant) => [
      variant.preset,
      variant.mode,
      JSON.stringify(variant.authoredValue),
      ...variant.declarations.map((declaration) => declaration.value),
    ]),
  ]
    .join(' ')
    .toLowerCase();
}

export function indexTokens(tokens: readonly CatalogueToken[]): TokenIndex {
  const referencedBy = new Map<string, CatalogueToken[]>();
  for (const token of tokens) {
    const targets = new Set(
      token.variants.flatMap((variant) =>
        variant.references.map((reference) => reference.target)
      )
    );
    for (const target of targets) {
      const readers = referencedBy.get(target) ?? [];
      readers.push(token);
      referencedBy.set(target, readers);
    }
  }
  return {
    tokens,
    byName: new Map(tokens.map((token) => [token.name, token])),
    referencedBy,
    searchText: new Map(
      tokens.map((token) => [token.name, tokenSearchText(token)])
    ),
  };
}

export interface ExploreSearch {
  q?: string;
  family?: string;
  group?: string;
  preset?: string;
  mode?: string;
  /** The selected token's `--nx-*` name. */
  token?: string;
  /** The selected token's variant, by its `variantKey`. */
  variant?: string;
  page?: number;
}

const SEARCH_TEXT_KEYS = [
  'q',
  'family',
  'group',
  'preset',
  'mode',
  'token',
  'variant',
] as const;

export function parseExploreSearch(params: URLSearchParams): ExploreSearch {
  const result: ExploreSearch = {};
  for (const key of SEARCH_TEXT_KEYS) {
    const value = params.get(key);
    if (value) result[key] = value;
  }
  const page = Number(params.get('page'));
  if (Number.isSafeInteger(page) && page > 1) result.page = page;
  return result;
}

export function familyLabel(family: CatalogueFamily): string {
  return FAMILY_LABELS[family];
}

/** Where a token comes from: the engine, or the token folder of its source file. */
export function layerLabel(token: CatalogueToken): string {
  const layer = token.variants[0]?.source?.file.split('/')[0] ?? 'runtime';
  return LAYER_LABELS[layer] ?? layer;
}

export function isRuntime(token: CatalogueToken): boolean {
  return token.variants.every((variant) => variant.source === null);
}

/** A variant's URL key: `compact`, `dark`, or `quiet.dark` for both axes. */
export function variantKey(variant: CatalogueVariant): string {
  return [variant.preset, variant.mode].filter(Boolean).join('.');
}

export function variantLabel(variant: CatalogueVariant): string {
  const axes = [variant.preset, variant.mode].filter(Boolean);
  return axes.length > 0 ? axes.join(' · ') : 'Single value';
}

function distinct(values: readonly (string | null)[]): string[] {
  return [
    ...new Set(values.filter((value): value is string => value !== null)),
  ].sort();
}

/** How many presets and theme modes a token's variants span. */
export function variantSummary(token: CatalogueToken): string | null {
  const counts = [
    [distinct(token.variants.map(({ preset }) => preset)).length, 'preset'],
    [distinct(token.variants.map(({ mode }) => mode)).length, 'mode'],
  ] as const;
  const parts = counts
    .filter(([count]) => count > 1)
    .map(([count, noun]) => `${count} ${noun}s`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function sourceUrl(source: CatalogueSource): string {
  return `${SOURCE_ROOT}/${source.file}`;
}

function isRecord(
  value: TokenValue
): value is { readonly [key: string]: TokenValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function formatValue(value: TokenValue): string {
  if (value === null) return 'No authored value';
  if (typeof value !== 'object') return String(value);
  if (
    isRecord(value) &&
    typeof value.value === 'number' &&
    typeof value.unit === 'string'
  )
    return `${value.value}${value.unit}`;
  return JSON.stringify(value, null, 2);
}

function matchesQuery(
  index: TokenIndex,
  token: CatalogueToken,
  query?: string
): boolean {
  const terms = (query ?? '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  const text = index.searchText.get(token.name) ?? '';
  return terms.every((term) => text.includes(term));
}

function hasVariant(
  token: CatalogueToken,
  { preset, mode }: Pick<ExploreSearch, 'preset' | 'mode'>
): boolean {
  return token.variants.some(
    (variant) =>
      (!preset || variant.preset === preset) && (!mode || variant.mode === mode)
  );
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

/**
 * Filter choices for the current search. Families and groups always list the
 * whole catalogue; their counts follow the query. Presets and modes follow
 * every filter above them.
 */
export function tokenFilterOptions(index: TokenIndex, search: ExploreSearch) {
  const matches = index.tokens.filter((token) =>
    matchesQuery(index, token, search.q)
  );
  const families = (Object.keys(FAMILY_LABELS) as CatalogueFamily[])
    .filter((family) => index.tokens.some((token) => token.family === family))
    .map((family) => ({
      value: family,
      label: FAMILY_LABELS[family],
      count: matches.filter((token) => token.family === family).length,
    }));
  const familyTokens = index.tokens.filter(
    (token) => token.family === search.family
  );
  const groups = [...new Set(familyTokens.map((token) => token.group))].map(
    (group) => ({
      value: group,
      label: group,
      count: matches.filter(
        (token) => token.family === search.family && token.group === group
      ).length,
    })
  );
  const variants = matches
    .filter((token) => !search.family || token.family === search.family)
    .filter((token) => !search.group || token.group === search.group)
    .flatMap((token) => token.variants);
  const presets = distinct(variants.map(({ preset }) => preset));
  const modes = distinct(
    variants
      .filter(({ preset }) => !search.preset || preset === search.preset)
      .map(({ mode }) => mode)
  );
  return { families, groups, presets, modes };
}

/**
 * Changing a filter clears the filters below it, and a preset or mode the new
 * query no longer matches.
 */
export function updateExploreFilters(
  index: TokenIndex,
  search: ExploreSearch,
  patch: Partial<ExploreSearch>
): ExploreSearch {
  const next = { ...search, ...patch, page: undefined };
  if ('family' in patch || 'group' in patch) {
    next.preset = undefined;
    next.mode = undefined;
  }
  if ('family' in patch) next.group = undefined;
  if (!('q' in patch) && !('preset' in patch)) return next;

  const { presets, modes } = tokenFilterOptions(index, next);
  if (next.preset && !presets.includes(next.preset)) next.preset = undefined;
  if (next.mode && !modes.includes(next.mode)) next.mode = undefined;
  return next;
}

export function filterTokens(
  index: TokenIndex,
  search: ExploreSearch
): CatalogueToken[] {
  return index.tokens.filter(
    (token) =>
      (!search.family || token.family === search.family) &&
      (!search.group || token.group === search.group) &&
      hasVariant(token, search) &&
      matchesQuery(index, token, search.q)
  );
}
