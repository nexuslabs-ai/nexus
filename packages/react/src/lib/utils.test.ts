import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { cn, NEXUS_CLASS_GROUPS } from './utils';

const TAILWIND_DIR = path.resolve(process.cwd(), 'packages/tailwind');

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

  it('preserves custom utilities in different modifier scopes', () => {
    expect(cn('nx:hover:duration-fast nx:focus:duration-slow')).toBe(
      'nx:hover:duration-fast nx:focus:duration-slow'
    );
  });

  it('registers every emitted custom utility', () => {
    const emittedUtilities = fs
      .readdirSync(TAILWIND_DIR)
      .filter((fileName) => fileName.endsWith('.css'))
      .flatMap((fileName) => {
        const css = fs.readFileSync(path.join(TAILWIND_DIR, fileName), 'utf8');
        return [...css.matchAll(/^@utility ([a-z0-9-]+) \{/gm)]
          .map(([, utility]) => utility)
          .filter((utility): utility is string => utility !== undefined);
      });
    const registeredUtilities = new Set(
      Object.values(NEXUS_CLASS_GROUPS).flat()
    );

    expect(emittedUtilities.length).toBeGreaterThan(0);
    expect(
      emittedUtilities.filter((utility) => !registeredUtilities.has(utility))
    ).toEqual([]);
  });

  it('registers the complete generated z-index scale', () => {
    const nexusCss = fs.readFileSync(
      path.join(TAILWIND_DIR, 'nexus.css'),
      'utf8'
    );
    const emittedZIndexUtilities = [
      ...nexusCss.matchAll(/^ {2}--z-index-([a-z0-9-]+):/gm),
    ]
      .map(([, token]) => token)
      .filter((token): token is string => token !== undefined)
      .map((token) => `z-${token}`);

    expect(emittedZIndexUtilities).toEqual(NEXUS_CLASS_GROUPS.z);
  });
});
