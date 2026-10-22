import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createInstallPlanner, writeEntries } from './install-plans.ts';
import {
  blockSources,
  componentSlugs,
  exportedComponentSlugs,
  isModuleSource,
  linkedComponentSlug,
} from '@nxds/source-model/react-sources.mjs';
import {
  componentsRoot,
  docsRoot,
  reactRoot,
  reactSrc,
  toRepoPath,
} from '@nxds/source-model/roots.mjs';

const outputDir = path.join(docsRoot, 'generated', 'dependencies');
const blocksOutputDir = path.join(outputDir, 'blocks');

const react = createInstallPlanner({
  root: reactRoot,
  src: reactSrc,
  componentsRoot,
  framework: 'react',
  isModuleSource,
  readScript: (file) => readFileSync(file, 'utf8'),
  linkedComponentSlug,
});

// A block page shows its minimal example if it has one, else its source.
function walkBlock(block) {
  const example = path.join(
    path.dirname(block.source),
    `${block.slug}-example.tsx`
  );
  return react.walkRoots(block.slug, [
    existsSync(example) ? example : block.source,
  ]);
}

// A block page links only the components no other link brings.
function blockEntry(walked, closures, exported) {
  const linked = [...react.linkedSlugs(walked.files, exported)];
  const reached = new Set(
    linked.flatMap((slug) =>
      [...react.linkedSlugs(closures.get(slug).files, exported)].filter(
        (other) => other !== slug
      )
    )
  );
  const direct = linked.filter((slug) => !reached.has(slug));

  return {
    slug: walked.name,
    plan: react.installPlan(walked, direct.sort(), closures),
  };
}

/** Writes each component's and block's JSON; returns how many of each. */
export function generateDependencies() {
  const exported = exportedComponentSlugs();
  const componentWalks = componentSlugs().map(react.walkSlug).filter(Boolean);
  const blockWalks = blockSources().map(walkBlock);

  react.assertDeclaredPackages([...componentWalks, ...blockWalks]);

  const closures = new Map(
    componentWalks.map((walked) => [walked.name, walked])
  );
  const entries = componentWalks.map((walked) =>
    react.componentEntry(walked, closures, exported)
  );
  const blockEntries = blockWalks.map((walked) =>
    blockEntry(walked, closures, exported)
  );

  writeEntries(outputDir, entries);
  writeEntries(blocksOutputDir, blockEntries);

  return { components: entries.length, blocks: blockEntries.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { components, blocks } = generateDependencies();
  console.log(
    `dependencies: ${components} components, ${blocks} blocks -> ${toRepoPath(outputDir)}`
  );
}
