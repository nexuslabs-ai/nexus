// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

import { generateTokenCatalog } from '../../../../../packages/core/scripts/token-catalog.js';
import * as engine from '../../../../../packages/core/src/index';

import {
  filterTokens,
  type TokenCatalog,
  tokenFilterOptions,
  updateExploreFilters,
  validateExploreSearch,
} from './catalog';

let catalog: TokenCatalog;
beforeAll(async () => {
  catalog = (await generateTokenCatalog({ engine })).catalog;
});

describe('logical token filters', () => {
  it('groups every actual catalog record and combines authored and runtime colors', () => {
    const categories = tokenFilterOptions(catalog, {}).groups.filter((group) =>
      group.value.startsWith('group:')
    );
    const groupedIds = categories.flatMap((group) =>
      filterTokens(catalog, { group: group.value })
        .flat()
        .map((record) => record.id)
    );
    expect(groupedIds.sort()).toEqual(
      catalog.records.map((record) => record.id).sort()
    );
    const colors = filterTokens(catalog, { group: 'group:colors' }).flat();
    expect(colors.some((record) => record.namespace === 'primitives')).toBe(
      true
    );
    expect(colors.some((record) => record.namespace === 'runtime')).toBe(true);
    expect(colors.every((record) => record.type === 'color')).toBe(true);
    expect(
      filterTokens(catalog, { group: 'group:shadows' })
        .flat()
        .every((record) => ['shadow', 'shadows'].includes(record.family))
    ).toBe(true);
  });

  it('every offered group / type / mode combination has results', () => {
    for (const q of [undefined, 'primary-background', 'font']) {
      const groups = tokenFilterOptions(catalog, { q }).groups.filter(
        (group) => group.count > 0
      );
      for (const group of [undefined, ...groups.map((item) => item.value)]) {
        const types = tokenFilterOptions(catalog, { group, q }).types;
        for (const type of [undefined, ...types]) {
          const modes = tokenFilterOptions(catalog, { group, type, q }).modes;
          for (const mode of [undefined, ...modes]) {
            expect(
              filterTokens(catalog, { group, type, mode, q }).length,
              JSON.stringify({ group, type, mode, q })
            ).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('resets child choices when moving between logical groups or changing type', () => {
    const previous = {
      group: 'group:colors',
      type: 'color',
      mode: 'dark',
      page: 3,
    };
    const spacing = updateExploreFilters(catalog, previous, {
      group: 'group:spacing',
    });
    expect(spacing).toEqual({
      group: 'group:spacing',
      type: undefined,
      mode: undefined,
      page: undefined,
    });
    expect(previous.mode).toBe('dark');
    const options = tokenFilterOptions(catalog, spacing);
    expect(options.types).toEqual(['dimension']);
    expect(options.modes).toContain('compact');
    expect(options.modes).not.toContain('dark');
    const type = updateExploreFilters(
      catalog,
      { mode: 'dark' },
      { type: 'fontFamily' }
    );
    expect(type.mode).toBeUndefined();
    expect(filterTokens(catalog, type).length).toBeGreaterThan(0);
  });

  it('keeps search scope while clearing invalid children and marks groups with no search matches unavailable', () => {
    const next = updateExploreFilters(
      catalog,
      { group: 'group:typography', type: 'fontWeight', mode: 'default' },
      { q: 'font-mono' }
    );
    expect(next.group).toBe('group:typography');
    expect(next.type).toBeUndefined();
    expect(filterTokens(catalog, next).length).toBeGreaterThan(0);
    const radius = tokenFilterOptions(catalog, {
      q: 'primary-background',
    }).groups.find((group) => group.value === 'set:primitives:radius');
    expect(radius?.count).toBe(0);
    expect(filterTokens(catalog, { q: 'definitely-missing-token' })).toEqual(
      []
    );
  });

  it('keeps valid filter and detail links in the URL contract', () => {
    expect(
      validateExploreSearch({
        group: 'set:primitives:radius',
        type: 'dimension',
        mode: 'round',
        token: 'primitives:radius:md',
        variant: 'primitives:radius:md@round:all',
        page: '2',
      })
    ).toEqual({
      group: 'set:primitives:radius',
      type: 'dimension',
      mode: 'round',
      token: 'primitives:radius:md',
      variant: 'primitives:radius:md@round:all',
      page: 2,
    });
  });
});
