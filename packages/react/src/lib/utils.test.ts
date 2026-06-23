import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { cn, ROLE_CLASS_GROUPS } from './utils';

describe('cn — gap class group', () => {
  it('collapses two role gap utilities with last-one-wins semantics', () => {
    expect(cn('nx:gap-container', 'nx:gap-layout-section')).toBe(
      'nx:gap-layout-section'
    );
  });

  it('collapses a role gap utility against a native gap utility in both orders', () => {
    expect(cn('nx:gap-container', 'nx:gap-2')).toBe('nx:gap-2');
    expect(cn('nx:gap-2', 'nx:gap-container')).toBe('nx:gap-container');
  });
});

describe('cn — role-utility class group parity', () => {
  it('classGroups cover exactly the role utilities emitted by @nexus/core', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const spacingUtilitiesCss = readFileSync(
      resolve(here, '../../../tailwind/spacing-utilities.css'),
      'utf8'
    );
    const emitted = new Set(
      [...spacingUtilitiesCss.matchAll(/@utility ([a-z-]+) \{/g)].map(
        (m) => m[1]
      )
    );
    const configured = new Set(Object.values(ROLE_CLASS_GROUPS).flat());

    expect([...configured].sort()).toEqual([...emitted].sort());
  });
});
