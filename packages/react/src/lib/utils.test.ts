import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { cn } from './utils';

const BORDER_WIDTH_UTILITIES_CSS = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../tailwind/borderwidth-utilities.css'
);

function generatedBorderWidthUtilities(): string[] {
  const css = fs.readFileSync(BORDER_WIDTH_UTILITIES_CSS, 'utf8');
  return [...css.matchAll(/^@utility (border-[\w-]+) \{/gm)].map(
    ([, name]) => name as string
  );
}

describe('cn', () => {
  // An unregistered custom utility is not inert: tailwind-merge parses
  // `border-e-default` as a border-color and drops it against a later color
  // utility, so the class never reaches the DOM.
  it('registers every generated border width utility', () => {
    const utilities = generatedBorderWidthUtilities();

    expect(utilities.length).toBeGreaterThan(0);

    for (const name of utilities) {
      expect(
        cn(`nx:${name}`, 'nx:border-border-default-alpha'),
        `${name} is missing from BORDER_WIDTH_CLASS_GROUPS`
      ).toContain(`nx:${name}`);
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
