import fs from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';

import { GALLERY } from './gallery';
import evidence from './gallery-evidence.json';
it('covers every public component family with an authored demo and inspection evidence', () => {
  const source = fs.readFileSync(
    path.resolve('packages/react/src/index.ts'),
    'utf8'
  );
  const families = [
    ...source.matchAll(/export \* from '\.\/components\/([^']+)'/g),
  ]
    .map((match) => match[1] ?? '')
    .filter((name) => !name.includes('/'));
  expect(GALLERY.map((entry) => entry.id).sort()).toEqual(
    [...families, 'appearance'].sort()
  );
  for (const entry of GALLERY) {
    expect(
      fs.existsSync(
        path.resolve('apps/docs/app/_create/demos', entry.id + '.tsx')
      ),
      entry.id
    ).toBe(true);
    expect(evidence[entry.id].source, entry.id).toBe(
      fs.readFileSync(
        path.resolve('apps/docs/app/_create/demos', entry.id + '.tsx'),
        'utf8'
      )
    );
  }
  expect(
    [
      ...source.matchAll(
        /export \* from '\.\/components\/appearance\/([^']+)'/g
      ),
    ]
      .map((match) => match[1])
      .sort()
  ).toEqual([
    'appearance-settings',
    'brand-color-field',
    'color-field',
    'config-preview',
    'setting-row',
    'theme-quick-control',
  ]);
});

it('reconciles the gallery with the docs component categories and Storybook families', async () => {
  const { PAGE_REGISTRY } = await import('../../page-registry/index');
  for (const group of PAGE_REGISTRY.components.pages) {
    expect(group.components?.slice().sort()).toEqual(
      GALLERY.filter((entry) => entry.group === group.slug)
        .map((entry) => entry.label)
        .sort()
    );
  }
  for (const entry of GALLERY.filter((entry) => entry.id !== 'appearance')) {
    expect(
      fs
        .readdirSync(path.resolve('packages/react/src/components', entry.id))
        .some((name) => name.endsWith('.stories.tsx')),
      entry.id
    ).toBe(true);
  }
});
