import { describe, expect, it } from 'vitest';

import { storiesImportPath } from './generate-base-variants.mjs';

describe('storiesImportPath', () => {
  it('defaults primitive entries to the resolved sourceDir', () => {
    expect(storiesImportPath({ name: 'Show' }, 'primitives')).toBe(
      '../primitives/Show.stories'
    );
    expect(storiesImportPath({ name: 'Hide' }, 'primitives')).toBe(
      '../primitives/Hide.stories'
    );
  });

  it('uses ui for the standard component subdir', () => {
    expect(storiesImportPath({ name: 'Button' }, 'ui')).toBe(
      '../ui/Button.stories'
    );
  });
});
