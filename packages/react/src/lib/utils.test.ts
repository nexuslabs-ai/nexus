import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { cn, NEXUS_CLASS_GROUPS, ROLE_CLASS_GROUPS } from './utils';

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

describe('cn — border width token utilities', () => {
  it('keeps Nexus stroke width utilities alongside border color utilities', () => {
    expect(cn('nx:border-default', 'nx:border-border-default')).toBe(
      'nx:border-default nx:border-border-default'
    );
    expect(cn('nx:border-default', 'nx:border-border-primary')).toBe(
      'nx:border-default nx:border-border-primary'
    );
    expect(cn('nx:border-b-default', 'nx:border-border-default')).toBe(
      'nx:border-b-default nx:border-border-default'
    );
    expect(cn('nx:border-t-default', 'nx:border-border-default')).toBe(
      'nx:border-t-default nx:border-border-default'
    );
    expect(cn('nx:border-default', 'nx:border-transparent')).toBe(
      'nx:border-default nx:border-transparent'
    );
  });

  it('collapses Nexus stroke width utilities with Tailwind-like side precedence', () => {
    expect(
      cn('nx:border-default', 'nx:border-thick', 'nx:border-border-default')
    ).toBe('nx:border-thick nx:border-border-default');
    expect(
      cn('nx:border-default', 'nx:border-b-thick', 'nx:border-border-default')
    ).toBe('nx:border-default nx:border-b-thick nx:border-border-default');
    expect(
      cn('nx:border-b-thick', 'nx:border-default', 'nx:border-border-default')
    ).toBe('nx:border-default nx:border-border-default');
    expect(
      cn('nx:border-x-default', 'nx:border-l-thick', 'nx:border-border-default')
    ).toBe('nx:border-x-default nx:border-l-thick nx:border-border-default');
    expect(
      cn('nx:border-l-thick', 'nx:border-x-default', 'nx:border-border-default')
    ).toBe('nx:border-x-default nx:border-border-default');
  });

  it('collapses Nexus stroke utilities against native border-width overrides', () => {
    expect(cn('nx:border-default', 'nx:border-0')).toBe('nx:border-0');
    expect(cn('nx:border-0', 'nx:border-default')).toBe('nx:border-default');
    expect(cn('nx:border-b-default', 'nx:border-b-0')).toBe('nx:border-b-0');
    expect(cn('nx:border-b-0', 'nx:border-b-default')).toBe(
      'nx:border-b-default'
    );
    expect(cn('nx:border-x-default', 'nx:border-l-0')).toBe(
      'nx:border-x-default nx:border-l-0'
    );
    expect(cn('nx:border-l-0', 'nx:border-x-default')).toBe(
      'nx:border-x-default'
    );
  });
});

describe('cn — custom utility class group parity', () => {
  it('classGroups cover exactly the border width utilities emitted by @nexus/core', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const borderWidthUtilitiesCss = readFileSync(
      resolve(here, '../../../tailwind/borderwidth-utilities.css'),
      'utf8'
    );
    const emitted = new Set(
      [...borderWidthUtilitiesCss.matchAll(/@utility ([a-z-]+) \{/g)].map(
        (m) => m[1]
      )
    );
    const configured = new Set(
      Object.entries(NEXUS_CLASS_GROUPS)
        .filter(
          ([group]) => group === 'border-w' || group.startsWith('border-w-')
        )
        .flatMap(([, values]) => values)
    );

    expect([...configured].sort()).toEqual([...emitted].sort());
  });
});
