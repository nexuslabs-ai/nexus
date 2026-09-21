import type {
  TokenCatalog,
  TokenRecord,
  TokenValue,
} from '../../../../../packages/core/scripts/token-catalog';

export type {
  TokenCatalog,
  TokenEmission,
  TokenRecord,
  TokenValue,
} from '../../../../../packages/core/scripts/token-catalog';

export interface ExploreSearch {
  q?: string;
  group?: string;
  type?: string;
  mode?: string;
  token?: string;
  variant?: string;
  page?: number;
}

export function validateExploreSearch(
  search: Record<string, unknown>
): ExploreSearch {
  const result: ExploreSearch = {};
  for (const key of [
    'q',
    'group',
    'type',
    'mode',
    'token',
    'variant',
  ] as const) {
    if (typeof search[key] === 'string' && search[key])
      result[key] = search[key];
  }
  const page = Number(search.page);
  if (Number.isSafeInteger(page) && page > 1) result.page = page;
  return result;
}

export function formatValue(value: TokenValue): string {
  if (value === null) return 'No authored value';
  if (typeof value !== 'object') return String(value);
  if (
    !Array.isArray(value) &&
    typeof value.value === 'number' &&
    typeof value.unit === 'string'
  )
    return `${value.value}${value.unit}`;
  return JSON.stringify(value, null, 2);
}

export function tokenName(record: TokenRecord) {
  return record.namespace === 'runtime'
    ? `--nx-color-${record.path[0]}`
    : record.path[0] === record.family
      ? record.path.join('.')
      : `${record.family}.${record.path.join('.')}`;
}

export function variantName(record: TokenRecord) {
  return [record.mode, record.variant].filter(Boolean).join(' · ') || 'Shared';
}

const GROUP_LABELS: Record<string, string> = {
  colors: 'Colors',
  typography: 'Typography',
  spacing: 'Spacing',
  shape: 'Shape',
  shadows: 'Shadows',
  motion: 'Motion',
  layout: 'Layout & focus',
  other: 'Other tokens',
};

const SET_LABELS: Record<string, string> = {
  'primitives:color': 'Primitive palette',
  'primitives:typography': 'Font primitives',
  'styles:typography': 'Text styles',
  'semantic:spacing': 'Spacing & density',
  'primitives:radius': 'Corner radius',
  'primitives:borderwidth': 'Border width',
  'primitives:shadow': 'Shadow primitives',
  'styles:shadows': 'Shadow styles',
  'primitives:motion': 'Motion primitives',
  'semantic:breakpoints': 'Breakpoints',
  'semantic:z-index': 'Stacking order',
  'semantic:focus': 'Focus offsets',
};

export interface TokenGroupOption {
  value: string;
  label: string;
  section: string;
  count: number;
}

function designGroup(record: TokenRecord): string {
  if (record.namespace === 'runtime') return 'colors';
  if (record.family === 'typography') return 'typography';
  if (record.family === 'spacing') return 'spacing';
  if (record.family === 'radius' || record.family === 'borderwidth')
    return 'shape';
  if (record.family === 'shadow' || record.family === 'shadows')
    return 'shadows';
  if (record.family === 'motion') return 'motion';
  if (['breakpoints', 'z-index', 'focus'].includes(record.family))
    return 'layout';
  return record.type === 'color' ? 'colors' : 'other';
}

function matchesGroup(record: TokenRecord, group?: string): boolean {
  if (!group) return true;
  if (group === 'runtime') return record.namespace === 'runtime';
  if (group === `group:${designGroup(record)}`) return true;
  return group === `set:${record.namespace}:${record.family}`;
}

function matchesQuery(record: TokenRecord, query?: string): boolean {
  const terms = (query ?? '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = [
    GROUP_LABELS[designGroup(record)],
    record.logicalId,
    record.description,
    record.source,
    JSON.stringify(record.rawValue),
    JSON.stringify(record.resolvedValue),
    ...record.utilityDefinitions,
    ...record.themeExamples,
  ]
    .join(' ')
    .toLowerCase();
  return terms.every((term) => text.includes(term));
}

function setLabel(record: TokenRecord): string {
  if (record.namespace === 'runtime')
    return `${record.family[0]?.toUpperCase()}${record.family.slice(1)} colors`;
  return (
    SET_LABELS[`${record.namespace}:${record.family}`] ??
    `${record.family} · ${record.namespace}`
  );
}

function modesFor(records: TokenRecord[]): string[] {
  return [
    ...new Set(
      records
        .flatMap((record) => [record.mode, record.variant])
        .filter((mode): mode is string => !!mode)
    ),
  ].sort();
}

/** Options come from matching records; presentation groups never replace the inventory. */
export function tokenFilterOptions(
  catalog: TokenCatalog,
  search: ExploreSearch
) {
  const matches = catalog.records.filter((record) =>
    matchesQuery(record, search.q)
  );
  const count = (value: string) =>
    new Set(
      matches
        .filter((record) => matchesGroup(record, value))
        .map((record) => record.logicalId)
    ).size;
  const groups: TokenGroupOption[] = [];
  for (const [key, section] of Object.entries(GROUP_LABELS)) {
    const records = catalog.records.filter(
      (record) => designGroup(record) === key
    );
    if (records.length === 0) continue;
    const value = `group:${key}`;
    groups.push({
      value,
      label: `All ${section.toLowerCase()}`,
      section,
      count: count(value),
    });
    if (
      key === 'colors' &&
      records.some((record) => record.namespace === 'runtime')
    ) {
      groups.push({
        value: 'runtime',
        label: 'Runtime semantic colors',
        section,
        count: count('runtime'),
      });
    }
    const sets = new Map(
      records.map((record) => [
        `set:${record.namespace}:${record.family}`,
        record,
      ])
    );
    for (const [value, record] of sets) {
      groups.push({
        value,
        label: setLabel(record),
        section,
        count: count(value),
      });
    }
  }
  const groupRecords = matches.filter((record) =>
    matchesGroup(record, search.group)
  );
  const types = [...new Set(groupRecords.map((record) => record.type))].sort();
  const typedRecords = groupRecords.filter(
    (record) => !search.type || record.type === search.type
  );
  return { groups, types, modes: modesFor(typedRecords) };
}

/** Parent selections reset their children in the navigation event, without effects. */
export function updateExploreFilters(
  catalog: TokenCatalog,
  search: ExploreSearch,
  patch: Partial<ExploreSearch>
): ExploreSearch {
  const next = { ...search, ...patch, page: undefined };
  if ('group' in patch) {
    next.type = undefined;
    next.mode = undefined;
  }
  if ('type' in patch) next.mode = undefined;
  // A new search can make an old child choice inapplicable; retain the selected group.
  if ('q' in patch) {
    if (
      next.type &&
      !tokenFilterOptions(catalog, next).types.includes(next.type)
    )
      next.type = undefined;
    if (
      next.mode &&
      !tokenFilterOptions(catalog, next).modes.includes(next.mode)
    )
      next.mode = undefined;
  }
  return next;
}

export function filterTokens(catalog: TokenCatalog, search: ExploreSearch) {
  const groups = new Map<string, TokenRecord[]>();
  for (const record of catalog.records) {
    if (!matchesGroup(record, search.group)) continue;
    if (search.type && record.type !== search.type) continue;
    if (
      search.mode &&
      record.mode !== search.mode &&
      record.variant !== search.mode
    )
      continue;
    if (!matchesQuery(record, search.q)) continue;
    const group = groups.get(record.logicalId) ?? [];
    group.push(record);
    groups.set(record.logicalId, group);
  }
  return [...groups.values()];
}
