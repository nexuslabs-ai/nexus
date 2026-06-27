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

  it('nests ui entries under their per-component folder', () => {
    expect(storiesImportPath({ name: 'Button' }, 'ui')).toBe(
      '../ui/button/Button.stories'
    );
    expect(storiesImportPath({ name: 'DropdownMenu' }, 'ui')).toBe(
      '../ui/dropdown-menu/DropdownMenu.stories'
    );
  });

  it('imports appearance stories from the sibling src/appearance root', () => {
    expect(
      storiesImportPath({ name: 'AppearanceSettings' }, 'appearance')
    ).toBe('../../appearance/AppearanceSettings.stories');
  });
});
