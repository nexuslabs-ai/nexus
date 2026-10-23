import { importSpecifiers } from '@nxds/source-model/files.mjs';
import { exportedComponentSlugs } from '@nxds/source-model/react-sources.mjs';
import { reactRoot, reactSrc } from '@nxds/source-model/roots.mjs';
import { exportedSlugs } from '@nxds/source-model/vue-sources.ts';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { planned, shared } from './parity.ts';

const EDITOR_SPECIFIER = './components/appearance/';

/**
 * React's components by slug. Each appearance editor counts on its own, and
 * `appearance` is the `./appearance` provider entry, which Vue's plugin ports.
 */
function reactComponents() {
  const index = readFileSync(path.join(reactSrc, 'index.ts'), 'utf8');
  const editors = importSpecifiers(index).flatMap((specifier) => {
    if (!specifier.startsWith(EDITOR_SPECIFIER)) return [];
    const [slug] = specifier.slice(EDITOR_SPECIFIER.length).split('/');
    return slug ? [slug] : [];
  });
  const manifest = JSON.parse(
    readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
  );

  const slugs = new Set([...exportedComponentSlugs(), ...editors]);
  slugs.delete('appearance');
  if (manifest.exports['./appearance']) slugs.add('appearance');
  return slugs;
}

const react = reactComponents();
const vue = new Set(exportedSlugs());
const plannedSet = new Set(planned);

describe('component coverage', () => {
  it('ports every React component to Vue or lists it as planned', () => {
    const unrecorded = [...react].filter(
      (slug) => !vue.has(slug) && !plannedSet.has(slug)
    );
    expect(unrecorded).toEqual([]);
  });

  it('lists no component as planned that Vue already ships', () => {
    expect(planned.filter((slug) => vue.has(slug))).toEqual([]);
  });

  it('lists only components React still exports as planned', () => {
    expect(planned.filter((slug) => !react.has(slug))).toEqual([]);
  });

  it('ships no Vue component that React lacks', () => {
    expect([...vue].filter((slug) => !react.has(slug))).toEqual([]);
  });

  it('names every component both packages ship as shared', () => {
    const both = [...vue].filter(
      (slug) => react.has(slug) && slug !== 'appearance'
    );
    expect(both.sort()).toEqual([...shared].sort());
  });
});
