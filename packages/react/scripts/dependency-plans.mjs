// @ts-check
/**
 * What installing each React component and block takes: the files and
 * packages it reaches, and the plan its docs page shows.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { createInstallPlanner } from '../../catalog/scripts/install-plans.ts';
import {
  blockSources,
  componentSlugs,
  exportedComponentSlugs,
  isModuleSource,
  linkedComponentSlug,
} from './react-sources.mjs';
import { componentsRoot, reactRoot, reactSrc } from './roots.mjs';

export const react = createInstallPlanner({
  root: reactRoot,
  src: reactSrc,
  componentsRoot,
  framework: 'react',
  isModuleSource,
  readScript: (file) => readFileSync(file, 'utf8'),
  linkedComponentSlug,
});

/**
 * A block page shows its minimal example if it has one, else its source.
 * @param {import('./react-sources.mjs').BlockSource} block
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
 * @param {import('../../catalog/scripts/install-plans.ts').Walk} walked
 * @param {Map<string, import('../../catalog/scripts/install-plans.ts').Walk>} closures
 * @param {Set<string>} exported
 */
function blockEntry(walked, closures, exported) {
  const linked = [...react.linkedSlugs(walked.files, exported)];
  const reached = new Set(
    linked.flatMap((slug) =>
      [
        ...react.linkedSlugs(
          /** @type {import('../../catalog/scripts/install-plans.ts').Walk} */ (
            closures.get(slug)
          ).files,
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
