import { describe, expect, it } from 'vitest';

import typographyStyles from '../../../core/tokens/styles/typography.json';

import {
  collectTypographyUtilityClasses,
  COMPOSITE_UTILITIES,
} from './typography-utilities';

describe('COMPOSITE_UTILITIES', () => {
  it('matches the typography token source of truth', () => {
    const rendered = COMPOSITE_UTILITIES.flatMap((group) =>
      group.items.map((item) => item.cls)
    ).sort();
    const expected = collectTypographyUtilityClasses(
      typographyStyles as Record<string, unknown>
    ).sort();

    expect(rendered).toEqual(expected);
  });
});
