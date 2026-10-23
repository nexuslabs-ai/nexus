// @ts-check
/**
 * What installing each React and Vue component, and each React block, takes:
 * the files and packages it reaches, and the plan its docs page shows.
 */
import {
  blockSources,
  componentSlugs,
  exportedComponentSlugs,
  isModuleSource,
  linkedComponentSlug,
} from '@nxds/source-model/react-sources.mjs';
import {
  componentsRoot,
  reactRoot,
  reactSrc,
  vueComponentsRoot,
  vueRoot,
  vueSrc,
} from '@nxds/source-model/roots.mjs';
import {
  isVueModuleSource,
  linkedVueSlug,
  readVueScript,
} from '@nxds/source-model/vue-sources.ts';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { createInstallPlanner } from './install-plans.ts';

export const react = createInstallPlanner({
  root: reactRoot,
  src: reactSrc,
  componentsRoot,
  framework: 'react',
  isModuleSource,
  readScript: (file) => readFileSync(file, 'utf8'),
  linkedComponentSlug,
});

export const vue = createInstallPlanner({
  root: vueRoot,
  src: vueSrc,
  componentsRoot: vueComponentsRoot,
  framework: 'vue',
  isModuleSource: isVueModuleSource,
  readScript: readVueScript,
  linkedComponentSlug: linkedVueSlug,
});

/**
 * Each slug's walked files and packages, by slug, once every package they import is declared.
 * @param {string[]} slugs
 */
export function vueWalks(slugs) {
  const walks = slugs.map(vue.walkSlug).filter((walked) => walked !== null);
  vue.assertDeclaredPackages(walks);
  return new Map(walks.map((walked) => [walked.name, walked]));
}

/**
 * A block page shows its minimal example if it has one, else its source.
 * @param {import('@nxds/source-model/react-sources.mjs').BlockSource} block
 */
function walkBlock(block) {
  const example = path.join(
    path.dirname(block.source),
    `${block.slug}-example.tsx`
  );
  return react.walkRoots(block.slug, [
    existsSync(example) ? example : block.source,
  ]);
}

/**
 * A block page links only the components no other link brings.
 * @param {import('./install-plans.ts').Walk} walked
 * @param {Map<string, import('./install-plans.ts').Walk>} closures
 * @param {Set<string>} exported
 */
function blockEntry(walked, closures, exported) {
  const linked = [...react.linkedSlugs(walked.files, exported)];
  const reached = new Set(
    linked.flatMap((slug) =>
      [
        ...react.linkedSlugs(
          /** @type {import('./install-plans.ts').Walk} */ (closures.get(slug))
            .files,
          exported
        ),
      ].filter((other) => other !== slug)
    )
  );
  const direct = linked.filter((slug) => !reached.has(slug));

  return {
    slug: walked.name,
    plan: react.installPlan(walked, direct.sort(), closures),
  };
}

/**
 * Every component's and block's dependency entry: what its page tells the
 * reader to install (`plan`), and for components, everything it needs on disk
 * (`closure`).
 */
export function dependencyEntries() {
  const exported = exportedComponentSlugs();
  const componentWalks = componentSlugs()
    .map(react.walkSlug)
    .filter((walked) => walked !== null);
  const blockWalks = blockSources().map(walkBlock);

  react.assertDeclaredPackages([...componentWalks, ...blockWalks]);

  const closures = new Map(
    componentWalks.map((walked) => [walked.name, walked])
  );
  return {
    components: componentWalks.map((walked) =>
      react.componentEntry(walked, closures, exported)
    ),
    blocks: blockWalks.map((walked) => blockEntry(walked, closures, exported)),
  };
}
