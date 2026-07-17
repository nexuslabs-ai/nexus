import { describe, expect, it } from 'vitest';

import {
  COMPONENT_TOKEN_MATRIX,
  filterMatrix,
  matrixUnknownTokens,
} from './component-token-matrix';

describe('COMPONENT_TOKEN_MATRIX', () => {
  it('uses only registered semantic token names', () => {
    expect(matrixUnknownTokens()).toEqual([]);
  });

  it('keeps required fields populated', () => {
    for (const entry of COMPONENT_TOKEN_MATRIX) {
      expect(entry.component).not.toBe('');
      expect(entry.part).not.toBe('');
      expect(entry.state).not.toBe('');
      expect(entry.tokens.length).toBeGreaterThan(0);
      expect(entry.sourceFile).not.toBe('');
      expect(entry.storybookCheck).not.toBe('');
    }
  });
});

describe('filterMatrix', () => {
  it('returns all entries for an empty query', () => {
    expect(filterMatrix(COMPONENT_TOKEN_MATRIX, '')).toHaveLength(
      COMPONENT_TOKEN_MATRIX.length
    );
  });

  it('matches query text case-insensitively', () => {
    expect(filterMatrix(COMPONENT_TOKEN_MATRIX, 'SIDEBAR')).toEqual([
      expect.objectContaining({ component: 'Sidebar' }),
    ]);
  });

  it('returns no rows when nothing matches', () => {
    expect(filterMatrix(COMPONENT_TOKEN_MATRIX, 'definitely-not-here')).toEqual(
      []
    );
  });
});
