import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { cn, NEXUS_CLASS_GROUPS } from './utils';

/** Every root that can mint a Nexus utility: generated emissions plus co-located component CSS. */
const EMITTING_ROOTS = ['packages/tailwind', 'packages/react/src'];

const EMITTED_STYLESHEETS = EMITTING_ROOTS.flatMap((root) => {
  const dir = path.resolve(process.cwd(), root);
  return fs
    .readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.css'))
    .map((entry) => ({
      root,
      css: fs.readFileSync(path.join(dir, entry), 'utf8'),
    }));
});

/**
 * Namespaces where a Nexus `@theme` key reaches `cn()` through a built-in
 * tailwind-merge group. Each sentinel is a literal member of that group, so a
 * registered token collapses against it and an unregistered one does not.
 */
const THEME_NAMESPACES = [
  { cssKey: 'radius', utility: 'rounded', sentinel: 'nx:rounded-none' },
  { cssKey: 'ease', utility: 'ease', sentinel: 'nx:ease-initial' },
  { cssKey: 'shadow', utility: 'shadow', sentinel: 'nx:shadow-none' },
  { cssKey: 'animate', utility: 'animate', sentinel: 'nx:animate-none' },
  { cssKey: 'z-index', utility: 'z', sentinel: 'nx:z-auto' },
];

describe('cn', () => {
  it.each([
    ['radius base', 'nx:rounded-base', 'nx:rounded-md'],
    ['ease enter', 'nx:ease-enter', 'nx:ease-linear'],
    ['ease exit', 'nx:ease-exit', 'nx:ease-linear'],
    ['ease move', 'nx:ease-move', 'nx:ease-linear'],
    ['shadow base', 'nx:shadow-base', 'nx:shadow-sm'],
    ['shadow inner', 'nx:shadow-inner', 'nx:shadow-sm'],
  ])(
    'merges the custom %s theme value in both orders',
    (_name, custom, standard) => {
      expect(cn(custom, standard)).toBe(standard);
      expect(cn(standard, custom)).toBe(custom);
    }
  );

  it.each([
    [
      'motion duration',
      'nx:duration-fast nx:duration-slower',
      'nx:duration-slower',
    ],
    [
      'motion animation',
      'nx:animate-overlay-presence-exit nx:animate-none',
      'nx:animate-none',
    ],
    ['z-index', 'nx:z-overlay nx:z-popover', 'nx:z-popover'],
    [
      'spacing role',
      'nx:gap-container nx:gap-layout-stack',
      'nx:gap-layout-stack',
    ],
    ['border width', 'nx:border-thin nx:border-thick', 'nx:border-thick'],
    [
      'border color',
      'nx:border-color-default nx:border-color-error',
      'nx:border-color-error',
    ],
    [
      'typography',
      'nx:typography-label-small nx:typography-body-default',
      'nx:typography-body-default',
    ],
  ])('uses last-wins merging for the %s group', (_group, input, expected) => {
    expect(cn(input)).toBe(expected);
  });

  it('merges custom utilities within the same modifier scope', () => {
    expect(cn('nx:hover:duration-fast nx:hover:duration-slow')).toBe(
      'nx:hover:duration-slow'
    );
  });

  /* eslint-disable @nexus_ds/nx-class-conventions -- the raw atomics are the
     subject under test: they are what the composite has to displace. */
  it.each([
    ['font-family', 'nx:font-mono'],
    ['font-size', 'nx:text-lg'],
    ['font-weight', 'nx:font-bold'],
    ['leading', 'nx:leading-none'],
    ['tracking', 'nx:tracking-wide'],
  ])('lets a typography composite displace the %s atomic', (_group, atomic) => {
    expect(cn(atomic, 'nx:typography-label-default')).toBe(
      'nx:typography-label-default'
    );
  });
  /* eslint-enable @nexus_ds/nx-class-conventions */

  it.each(EMITTING_ROOTS)('scans the %s stylesheets', (root) => {
    expect(
      EMITTED_STYLESHEETS.filter((stylesheet) => stylesheet.root === root)
    ).not.toHaveLength(0);
  });

  it('registers every emitted custom utility', () => {
    const emittedUtilities = EMITTED_STYLESHEETS.flatMap(({ css }) =>
      [...css.matchAll(/^@utility ([a-z0-9-]+\*?) \{/gm)]
        .map(([, utility]) => utility)
        .filter((utility): utility is string => utility !== undefined)
    );
    const registeredUtilities = new Set(
      Object.values(NEXUS_CLASS_GROUPS).flat()
    );

    expect(emittedUtilities.length).toBeGreaterThan(0);
    expect(
      emittedUtilities.filter((utility) => !registeredUtilities.has(utility))
    ).toEqual([]);
  });

  it.each(THEME_NAMESPACES)(
    'merges every emitted $cssKey theme token',
    ({ cssKey, utility, sentinel }) => {
      const emittedTokens = EMITTED_STYLESHEETS.flatMap(({ css }) =>
        [...css.matchAll(new RegExp(`^\\s+--${cssKey}-([a-z0-9-]+):`, 'gm'))]
          .map(([, token]) => token)
          .filter((token): token is string => token !== undefined)
      );

      expect(emittedTokens.length).toBeGreaterThan(0);
      for (const token of emittedTokens) {
        expect(cn(`nx:${utility}-${token}`, sentinel)).toBe(sentinel);
      }
    }
  );
});
