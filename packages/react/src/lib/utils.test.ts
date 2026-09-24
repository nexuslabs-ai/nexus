import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  cn,
  NEXUS_CLASS_GROUPS,
  NEXUS_THEME_SCALES,
  TYPOGRAPHY_CONFLICTS,
} from './utils';

/** Every root that can mint a Nexus utility: generated emissions plus co-located component CSS. */
const EMITTING_ROOTS = ['packages/tailwind', 'packages/react/src'];

const EMITTED_CSS = EMITTING_ROOTS.flatMap((root) => {
  const dir = path.resolve(process.cwd(), root);
  return fs
    .readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.css'))
    .map((entry) => fs.readFileSync(path.join(dir, entry), 'utf8'));
});

/** Every border side Tailwind builds from a `--border-width-*` theme key. */
const BORDER_WIDTH_GROUPS = [
  'border-w',
  'border-w-x',
  'border-w-y',
  'border-w-t',
  'border-w-r',
  'border-w-b',
  'border-w-l',
  'border-w-s',
  'border-w-e',
  'border-w-bs',
  'border-w-be',
] as const satisfies readonly (keyof typeof NEXUS_CLASS_GROUPS)[];

/**
 * Namespaces where a Nexus `@theme` key reaches `cn()` through a built-in
 * tailwind-merge group. Each sentinel is a literal member of that group, so a
 * registered token collapses against it and an unregistered one does not.
 */
const THEME_NAMESPACES = [
  {
    cssKey: 'radius',
    utility: 'rounded',
    sentinel: 'nx:rounded-none',
    registered: NEXUS_THEME_SCALES.radius,
  },
  {
    cssKey: 'ease',
    utility: 'ease',
    sentinel: 'nx:ease-initial',
    registered: NEXUS_THEME_SCALES.ease,
  },
  {
    cssKey: 'shadow',
    utility: 'shadow',
    sentinel: 'nx:shadow-none',
    registered: NEXUS_THEME_SCALES.shadow,
  },
  {
    cssKey: 'animate',
    utility: 'animate',
    sentinel: 'nx:animate-none',
    registered: NEXUS_THEME_SCALES.animate,
  },
  {
    cssKey: 'z-index',
    utility: 'z',
    sentinel: 'nx:z-auto',
    registered: NEXUS_CLASS_GROUPS.z.map((utility) =>
      utility.replace(/^z-/, '')
    ),
  },
  {
    cssKey: 'outline-width',
    utility: 'outline',
    sentinel: 'nx:outline-2',
    registered: NEXUS_CLASS_GROUPS['outline-w'].map((utility) =>
      utility.replace(/^outline-/, '')
    ),
  },
  ...BORDER_WIDTH_GROUPS.map((group) => {
    const utility = group.replace(/^border-w/, 'border');
    return {
      cssKey: 'border-width',
      utility,
      sentinel: `nx:${utility}-2`,
      registered: NEXUS_CLASS_GROUPS[group]
        .filter((name) => !name.startsWith('border-width-'))
        .map((name) => name.slice(`${utility}-`.length)),
    };
  }),
];

/** CSS property a `typography-*` composite can declare, mapped to its owning class group. */
const TYPOGRAPHY_PROPERTY_GROUPS = {
  'font-family': 'font-family',
  'font-size': 'font-size',
  'font-weight': 'font-weight',
  'line-height': 'leading',
  'letter-spacing': 'tracking',
  'text-wrap': 'text-wrap',
};

function emittedThemeTokens(cssKey: string) {
  return EMITTED_CSS.flatMap((css) =>
    [...css.matchAll(new RegExp(`^\\s+--${cssKey}-([a-z0-9-]+):`, 'gm'))]
      .map(([, token]) => token)
      .filter((token): token is string => token !== undefined)
  );
}

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
      'logical border width',
      'nx:border-e-default nx:border-e-[2px]',
      'nx:border-e-[2px]',
    ],
    ['outline width', 'nx:outline-thin nx:outline-thick', 'nx:outline-thick'],
    [
      'border color',
      'nx:border-color-default nx:border-color-error',
      'nx:border-color-error',
    ],
    [
      'theme-generated border color',
      'nx:border-border-default nx:border-color-error',
      'nx:border-color-error',
    ],
    [
      'typography',
      'nx:typography-label-small nx:typography-body-default',
      'nx:typography-body-default',
    ],
    [
      'transition',
      'nx:transition-control nx:transition-field',
      'nx:transition-field',
    ],
  ])('uses last-wins merging for the %s group', (_group, input, expected) => {
    expect(cn(input)).toBe(expected);
  });

  it.each([
    ['nx:transition-control', 'nx:transition-colors'],
    ['nx:transition-field', 'nx:transition-none'],
    ['nx:transition-control', 'nx:transition-[color,opacity]'],
  ])('%s is displaced by %s', (nexusUtility, builtIn) => {
    // Without the `transition` group entry these land nowhere and both survive,
    // so a consumer's `className` override would stack rather than replace.
    expect(cn(nexusUtility, builtIn)).toBe(builtIn);
  });

  it('keeps a named outline width beside an outline colour', () => {
    // `outline-default` is a width; without its own group tailwind-merge reads
    // it as a colour and the adjacent `outline-focus-default` drops it, leaving
    // a field with a colour and no ring.
    expect(
      cn(
        'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default'
      )
    ).toBe(
      'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default'
    );
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
    ['text-wrap', 'nx:text-nowrap'],
  ])('lets a typography composite displace the %s atomic', (_group, atomic) => {
    expect(cn(atomic, 'nx:typography-heading-large')).toBe(
      'nx:typography-heading-large'
    );
  });
  /* eslint-enable @nexus_ds/nx-class-conventions */

  it('conflicts with exactly the groups the typography composites declare', () => {
    const declared = new Set(
      EMITTED_CSS.flatMap((css) =>
        [
          ...css.matchAll(/@utility typography-[a-z0-9-]+ \{([^}]*)\}/g),
        ].flatMap(([, block]) =>
          [...(block ?? '').matchAll(/^\s*([a-z-]+):/gm)].map(
            ([, property]) => property
          )
        )
      )
    );

    expect([...declared].sort()).toEqual(
      Object.keys(TYPOGRAPHY_PROPERTY_GROUPS).sort()
    );
    expect([...TYPOGRAPHY_CONFLICTS].sort()).toEqual(
      [...new Set(Object.values(TYPOGRAPHY_PROPERTY_GROUPS))].sort()
    );
  });

  it('registers every emitted custom utility', () => {
    const emittedUtilities = EMITTED_CSS.flatMap((css) =>
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
    'merges every emitted $cssKey theme token as $utility',
    ({ cssKey, utility, sentinel }) => {
      for (const token of emittedThemeTokens(cssKey)) {
        expect(cn(`nx:${utility}-${token}`, sentinel)).toBe(sentinel);
      }
    }
  );

  it.each(THEME_NAMESPACES)(
    'finds every registered $utility $cssKey token in the scanned CSS',
    ({ cssKey, registered }) => {
      expect(emittedThemeTokens(cssKey)).toEqual(
        expect.arrayContaining([...registered])
      );
    }
  );
});
