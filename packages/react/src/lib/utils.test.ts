import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { cn } from './utils';

const TAILWIND_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../tailwind'
);

function generatedUtilities(file: string): string[] {
  const css = fs.readFileSync(path.join(TAILWIND_DIR, file), 'utf8');
  return [...css.matchAll(/^@utility ([\w-]+) \{/gm)].map(
    ([, name]) => name as string
  );
}

describe('cn', () => {
  // An unregistered custom utility is not inert: tailwind-merge parses
  // `border-e-default` as a border-color and drops it against a later color
  // utility, so the class never reaches the DOM.
  it('registers every generated border width utility', () => {
    const utilities = generatedUtilities('borderwidth-utilities.css');

    expect(utilities.length).toBeGreaterThan(0);

    for (const name of utilities) {
      // Unregistered, tailwind-merge reads the name as a border-color and drops
      // it against a later color utility.
      expect(
        cn(`nx:${name}`, 'nx:border-border-default-alpha'),
        `${name} is missing from BORDER_WIDTH_CLASS_GROUPS`
      ).toContain(`nx:${name}`);
    }
  });

  it('registers every generated spacing role utility', () => {
    const utilities = generatedUtilities('spacing-utilities.css');

    expect(utilities.length).toBeGreaterThan(0);

    for (const name of utilities) {
      // Unregistered, the role utility and its core counterpart both survive
      // instead of collapsing to the last one.
      const core = `nx:${name.split('-')[0]}-4`;

      expect(
        cn(`nx:${name}`, core),
        `${name} is missing from ROLE_CLASS_GROUPS`
      ).toBe(core);
    }
  });

  it('collapses same-group border widths to the last one', () => {
    expect(cn('nx:border-e-default', 'nx:border-e-thick')).toBe(
      'nx:border-e-thick'
    );
    expect(cn('nx:border-e-default', 'nx:border-e-[2px]')).toBe(
      'nx:border-e-[2px]'
    );
  });
});
