// @ts-check
/**
 * Writes `generated/catalog.json`: every item the `nxds` CLI installs,
 * with each item's files, packages and the other items it needs.
 *
 * Items are framework-neutral; each carries one variant per framework that
 * has it. A Vue variant exists for setup and for each component @nxds/vue
 * exports.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { vueSrc } from '../../vue/scripts/roots.ts';
import {
  vue,
  vueComponentSlugs,
  vueWalks,
} from '../../vue/scripts/vue-sources.ts';

import {
  dependencyEntries,
  react,
} from '../../react/scripts/dependency-plans.mjs';
import { pascal } from '../../react/scripts/humanize.ts';
import {
  blockSources,
  componentLabel,
  exportedComponentSlugs,
} from '../../react/scripts/react-sources.mjs';
import { reactRoot, reactSrc } from '../../react/scripts/roots.mjs';
import {
  componentDescription,
  componentStoryFiles,
} from '../../react/scripts/stories.ts';
import { readCanonical, writeJson } from './files.mjs';
import { CATALOG_FILE, repoRoot, toRepoPath } from './roots.mjs';

/**
 * @typedef {import('./catalog-schema').Catalog} Catalog
 * @typedef {import('./catalog-schema').CatalogItem} CatalogItem
 * @typedef {import('./catalog-schema').Variant} Variant
 * @typedef {import('./catalog-schema').SetupItem} SetupItem
 * @typedef {import('./catalog-schema').SetupVariant} SetupVariant
 */

const DOCS_URL = 'https://nxds.dev';
const SETUP = 'setup';
const TAILWIND_DIR = path.join(repoRoot, 'packages', 'tailwind');

/**
 * What each framework's setup copies and installs: the appearance provider and
 * `cn`, which every app needs before any component, and the packages the
 * framework's CSS entry imports.
 * @type {Record<'react' | 'vue', { roots: string[]; packages: string[]; steps: import('./catalog-schema').SetupStep[] }>}
 */
const SETUP_SOURCES = {
  react: {
    roots: [
      'components/appearance/provider/index.ts',
      'components/appearance/provider/server.ts',
      'lib/utils.ts',
    ],
    packages: ['tw-animate-css'],
    steps: ['add-css-import', 'add-head-script', 'wrap-root-with-provider'],
  },
  vue: {
    roots: ['components/appearance/index.ts', 'lib/utils.ts'],
    packages: [],
    steps: [],
  },
};

/** Vue's appearance folder is its provider, which setup brings. */
const VUE_SETUP_SLUG = 'appearance';

/** Each framework's install planner and the source tree its paths are relative to. */
const FRAMEWORKS = {
  react: { planner: react, src: reactSrc },
  vue: { planner: vue, src: vueSrc },
};

/**
 * @param {string} src
 * @param {string} srcPath
 */
function sourceFile(src, srcPath) {
  return { path: srcPath, content: readCanonical(path.join(src, srcPath)) };
}

/** @param {{ name: string; range: string }[]} packages */
function packageRecord(packages) {
  return Object.fromEntries(packages.map(({ name, range }) => [name, range]));
}

/** @type {{ version: string; devDependencies: Record<string, string> }} */
const reactPackage = JSON.parse(
  readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
);
const devRanges = reactPackage.devDependencies;

/** Tailwind 4 at the version packages/react builds with, or a newer 4.x. */
function tailwindRange() {
  const version = devRanges.tailwindcss;
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(
      `packages/react pins tailwindcss to an exact version; found "${version}".`
    );
  }
  return `^${version}`;
}

/** The token CSS every framework's setup copies into `tailwind/`. */
function tokenCss() {
  return readdirSync(TAILWIND_DIR)
    .filter((name) => name.endsWith('.css'))
    .sort()
    .map((name) => ({
      path: `tailwind/${name}`,
      content: readCanonical(path.join(TAILWIND_DIR, name)),
    }));
}

/**
 * @param {keyof typeof FRAMEWORKS} framework
 * @returns {SetupVariant}
 */
function setupVariant(framework) {
  const { planner, src } = FRAMEWORKS[framework];
  const { roots, packages, steps } = SETUP_SOURCES[framework];
  const walked = planner.walkRoots(
    SETUP,
    roots.map((file) => path.join(src, file))
  );
  return {
    items: [],
    packages: {
      npm: {
        ...packageRecord(walked.packages.map(planner.toInstall)),
        ...Object.fromEntries(packages.map((name) => [name, devRanges[name]])),
      },
      tailwind: tailwindRange(),
    },
    files: [
      ...tokenCss(),
      ...walked.files
        .map(planner.toSrcPath)
        .sort()
        .map((file) => sourceFile(src, file)),
    ],
    css: [],
    steps,
  };
}

/** @returns {SetupItem & { variants: { react: SetupVariant; vue: SetupVariant } }} */
function setupItem() {
  return {
    name: SETUP,
    kind: 'setup',
    title: 'Setup',
    description:
      'The token CSS, the appearance provider and the cn helper. Every other item needs it.',
    docs: `${DOCS_URL}/getting-started/install`,
    variants: { react: setupVariant('react'), vue: setupVariant('vue') },
  };
}

/**
 * A component or block variant: what its docs plan lists, minus what setup
 * already brings.
 * @param {string} src
 * @param {{ components: string[]; install: { name: string; range: string }[]; files: string[]; styles: string[] }} plan
 * @param {Variant} setup
 * @returns {Variant}
 */
function planVariant(src, plan, setup) {
  const setupFiles = new Set(setup.files.map((file) => file.path));
  return {
    items: [SETUP, ...plan.components],
    packages: {
      npm: packageRecord(
        plan.install.filter(({ name }) => !(name in setup.packages.npm))
      ),
    },
    files: plan.files
      .filter((file) => !setupFiles.has(file))
      .map((file) => sourceFile(src, file)),
    css: plan.styles,
    steps: [],
  };
}

/**
 * Each Vue component's variant, by slug. Vue's appearance folder is left out:
 * it is the provider, which the Vue setup variant brings.
 * @param {SetupVariant} setup
 * @returns {Map<string, Variant>}
 */
function vueVariants(setup) {
  const slugs = vueComponentSlugs().filter((slug) => slug !== VUE_SETUP_SLUG);
  const closures = vueWalks(slugs);
  const exported = new Set(slugs);
  return new Map(
    [...closures.values()].map((walked) => [
      walked.name,
      planVariant(
        vueSrc,
        vue.componentEntry(walked, closures, exported).plan,
        setup
      ),
    ])
  );
}

/** @returns {Catalog} */
export function buildCatalog() {
  const setup = setupItem();
  const entries = dependencyEntries();
  const vueComponents = vueVariants(setup.variants.vue);

  const exported = exportedComponentSlugs();
  for (const slug of vueComponents.keys()) {
    if (!exported.has(slug)) {
      throw new Error(
        `catalog: @nxds/vue exports ${slug}, which @nxds/react doesn't, so it has no catalog item.`
      );
    }
  }

  /** @type {CatalogItem[]} */
  const components = entries.components
    .filter(({ slug }) => exported.has(slug))
    .map(({ slug, plan }) => {
      const vueVariant = vueComponents.get(slug);
      return {
        name: slug,
        kind: 'component',
        title: componentLabel(slug),
        description: componentDescription(
          slug,
          componentStoryFiles(slug)
        ).trim(),
        docs: `${DOCS_URL}/components/${slug}`,
        variants: {
          react: planVariant(reactSrc, plan, setup.variants.react),
          ...(vueVariant && { vue: vueVariant }),
        },
      };
    });

  const blockPlans = new Map(
    entries.blocks.map(({ slug, plan }) => [slug, plan])
  );
  /** @type {CatalogItem[]} */
  const blocks = blockSources().map((block) => ({
    name: block.slug,
    kind: 'block',
    title: pascal(block.slug),
    description: componentDescription(block.slug, [block.stories]).trim(),
    docs: `${DOCS_URL}/blocks/${block.slug}`,
    variants: {
      react: planVariant(
        reactSrc,
        blockPlans.get(block.slug),
        setup.variants.react
      ),
    },
  }));

  return {
    schema: 1,
    version: reactPackage.version,
    frameworks: ['react'],
    items: [setup, ...components, ...blocks],
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalog = buildCatalog();
  writeJson(CATALOG_FILE, catalog);
  console.log(
    `catalog: ${catalog.items.length} items, version ${catalog.version} -> ${toRepoPath(CATALOG_FILE)}`
  );
}
