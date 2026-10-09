/**
 * Builds the docs page manifest from the filesystem.
 *
 * Sources:
 *   - `page-registry/` — section and page order, labels, and the
 *     `wireframe` a page renders until its own file lands
 *   - `content/{section}/{slug}.mdx` — MDX pages
 *   - `app/_pages/{section}/{slug}.tsx` — hand-built pages
 *   - `@nexus_ds/react`'s exports — one `components/` page per exported
 *     component, generated from its stories tagged `docs`
 *   - `blocks/` — one `blocks/` page per block folder with stories,
 *     generated from its story tagged `docs`
 *
 * A page's route is its path on disk, so adding a page means adding a file.
 * Pages the registry does not list are appended to their section in slug
 * order. `components/` and `blocks/` are sorted by label. Routes are exactly two levels
 * deep and a slug is one path segment; a file anywhere else fails the
 * generator. Entries prefixed with `_` are skipped, so a page-local island
 * can sit beside the page that uses it.
 *
 * Output is two modules, split across the client boundary:
 *   - `MANIFEST_FILE` — routes, labels, nav order. Imported by client nav.
 *   - `CONTENT_FILE` — page bodies: dynamic imports and wireframes. Server-only.
 *
 * `generate-page-manifest.mjs` is the CLI that writes both.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createJiti } from 'jiti';
import prettier from 'prettier';

import { DOCS_TAG } from './docs-stories.mjs';
import { humanize, pascal } from './humanize.mjs';
import { blockSources, exportedComponentSlugs } from './react-sources.mjs';
import { reactSrc } from './roots.mjs';

/** Nav metadata source, relative to the docs app root. */
export const REGISTRY_FILE = 'page-registry/index.ts';

/** Wireframe block types the generated content module imports, relative to the docs app root. */
const BLOCKS_FILE = 'page-registry/blocks.ts';

/** Output paths, relative to the docs app root. */
export const MANIFEST_FILE = 'app/_lib/page-manifest.generated.ts';
export const CONTENT_FILE = 'app/_lib/page-content.generated.ts';

const SOURCES = [
  { kind: 'mdx', dir: 'content', ext: '.mdx', keepExtension: true },
  { kind: 'component', dir: 'app/_pages', ext: '.tsx', keepExtension: false },
];

function toPosix(relative) {
  return relative.split(path.sep).join('/');
}

function readDirEntries(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => !entry.name.startsWith('_') && !entry.name.startsWith('.')
    );
}

/** Collects `{section}/{slug}{ext}` files into a `section/slug` → source-file map. */
function collectPages(docsRoot, { dir, ext }) {
  const found = new Map();
  const root = path.join(docsRoot, dir);
  if (!fs.existsSync(root)) {
    return found;
  }

  for (const entry of readDirEntries(root)) {
    if (!entry.isDirectory()) {
      throw new Error(
        `${dir}/${entry.name} is not inside a section folder — docs pages live at {section}/{slug}${ext}.`
      );
    }

    for (const file of readDirEntries(path.join(root, entry.name))) {
      const where = `${dir}/${entry.name}/${file.name}`;
      if (!file.isFile()) {
        throw new Error(
          `${where} is a directory — docs pages live at {section}/{slug}${ext}, two levels deep.`
        );
      }
      if (!file.name.endsWith(ext)) {
        throw new Error(
          `${where} is not a ${ext} page — docs pages live at {section}/{slug}${ext}.`
        );
      }
      const slug = file.name.slice(0, -ext.length);
      if (slug.includes('.')) {
        throw new Error(
          `${where} would route to /${entry.name}/${slug} — a page slug is one segment, so prefix a non-page sibling with \`_\`.`
        );
      }
      found.set(`${entry.name}/${slug}`, where);
    }
  }

  return found;
}

function assertOneSourcePerRoute(sources) {
  const seen = new Map();
  for (const source of sources) {
    for (const [key, file] of source.pages) {
      const existing = seen.get(key);
      if (existing) {
        throw new Error(
          `${key} resolves to both ${existing} and ${file} — a route has one source file.`
        );
      }
      seen.set(key, file);
    }
  }
}

const CARD_JOINER = ' · ';

function assertLabelsAvoidTheCardJoiner(section) {
  for (const page of section.pages) {
    if (page.label.includes(CARD_JOINER)) {
      throw new Error(
        `${section.slug}/${page.slug} has "${CARD_JOINER}" inside its label, which is what the home page joins a section's page labels with — the card would read the label as several pages. Name the page without it.`
      );
    }
  }
}

const COMPONENTS_SECTION = 'components';
const BLOCKS_SECTION = 'blocks';

/** A component's name as its own source spells it (`InputOTP`), else its slug in PascalCase. */
function componentLabel(slug) {
  const name = pascal(slug);
  const dir = path.join(reactSrc, 'components', slug);
  const source = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.tsx') && !file.endsWith('.stories.tsx'))
    .map((file) => fs.readFileSync(path.join(dir, file), 'utf8'))
    .join('\n');
  const spelled = source
    .match(/\b[A-Z][A-Za-z0-9]*\b/g)
    ?.find((word) => word.toLowerCase() === name.toLowerCase());
  return spelled ?? name;
}

function assertNoWrittenGeneratedPages(sources) {
  for (const source of sources) {
    for (const [key, file] of source.pages) {
      if (key.startsWith(`${COMPONENTS_SECTION}/`)) {
        throw new Error(
          `${file} is a component page, but component pages are generated from the component's stories tagged \`${DOCS_TAG}\` — delete the file.`
        );
      }
      if (key.startsWith(`${BLOCKS_SECTION}/`)) {
        throw new Error(
          `${file} is a block page, but block pages are generated from the block's story tagged \`${DOCS_TAG}\` — delete the file.`
        );
      }
    }
  }
}

function byLabel(entries) {
  return entries.toSorted((a, b) =>
    a.page.label.localeCompare(b.page.label, 'en')
  );
}

/** Import specifier for a docs-root-relative file, as seen from the content module. */
function specifierFor(file, keepExtension) {
  const relative = toPosix(path.relative(path.dirname(CONTENT_FILE), file));
  return keepExtension
    ? relative
    : relative.slice(0, relative.lastIndexOf('.'));
}

function renderPage(page) {
  const fields = Object.entries(page).map(
    ([key, value]) => `${key}: ${JSON.stringify(value)},`
  );
  return `{ ${fields.join(' ')} },`;
}

function renderSection(section) {
  const head = [
    `slug: ${JSON.stringify(section.slug)},`,
    `title: ${JSON.stringify(section.title)},`,
    `href: ${JSON.stringify(section.href)},`,
  ];
  if (section.unit) {
    head.push(`unit: ${JSON.stringify(section.unit)},`);
  }
  return `{ ${head.join(' ')} pages: [\n${section.pages.map(renderPage).join('\n')}\n] },`;
}

const HEADER = `// AUTO-GENERATED by apps/docs/scripts/generate-page-manifest.mjs — do not edit.
// Regenerate with \`pnpm --filter @nexus_ds/docs generate:manifest\`.`;

function renderManifestModule(manifest) {
  return `${HEADER}

type ManifestPageBase = {
  /** Route path, e.g. \`/foundations/color\`. */
  route: string;
  slug: string;
  label: string;
};

type PlaceholderPage = {
  /** No page file yet; the body is \`PAGE_WIREFRAMES[route]\`. */
  kind: 'placeholder';
  file: null;
};

export type GuideManifestPage = ManifestPageBase &
  (
    | {
        kind: 'mdx' | 'component';
        /** Source file relative to \`apps/docs\`; the module is \`PAGE_LOADERS[route]\`. */
        file: string;
      }
    | PlaceholderPage
  );

/**
 * A component \`@nexus_ds/react\` exports. Its page body is its
 * \`getComponentDocs(slug)\` entry, generated from its stories tagged \`docs\`.
 */
export type ComponentManifestPage = ManifestPageBase & {
  kind: 'generated';
};

/**
 * A copy-source block under \`blocks/{slug}/\`. Its page body is its
 * \`getBlockDocs(slug)\` entry, generated from its story tagged \`docs\`.
 */
export type BlockManifestPage = ManifestPageBase & {
  kind: 'block';
};

export type ManifestPage =
  | GuideManifestPage
  | ComponentManifestPage
  | BlockManifestPage;

type ManifestSectionBase = {
  slug: string;
  title: string;
  href: string;
};

export type GuideManifestSection = ManifestSectionBase & {
  unit?: never;
  pages: readonly GuideManifestPage[];
};

export type ComponentsManifestSection = ManifestSectionBase & {
  /** What the section is counted in on the home page. Other sections count pages. */
  unit: 'components';
  pages: readonly ComponentManifestPage[];
};

export type BlocksManifestSection = ManifestSectionBase & {
  unit: 'blocks';
  pages: readonly BlockManifestPage[];
};

export type ManifestSection =
  | GuideManifestSection
  | ComponentsManifestSection
  | BlocksManifestSection;

/** The separator the home page's section cards join a section's page labels with. */
export const CARD_JOINER = ${JSON.stringify(CARD_JOINER)};

/** Every docs page, in nav order. Serializable — safe to import from a client component. */
export const PAGE_MANIFEST: readonly ManifestSection[] = [
${manifest.map(renderSection).join('\n')}
];
`;
}

function renderContentModule({ loaders, wireframes }) {
  const loaderEntries = loaders.map(
    ({ route, specifier }) =>
      `${JSON.stringify(route)}: () => import(${JSON.stringify(specifier)}),`
  );
  const wireframeEntries = wireframes.map(
    ({ route, lede, blocks }) =>
      `${JSON.stringify(route)}: { lede: ${JSON.stringify(lede)}, blocks: ${JSON.stringify(blocks)} },`
  );
  return `${HEADER}

import type { ComponentType } from 'react';

import type { Block } from '${specifierFor(BLOCKS_FILE, false)}';

// The thunks below import page and MDX modules, so a \`'use client'\` importer
// would pull the whole docs body into the client bundle.
import 'server-only';

// eslint-disable-next-line @nexus_ds/no-render-prop-types -- \`default: ComponentType\` is the shape of a lazily-imported page module, not a component-as-prop.
export type ManifestPageLoader = () => Promise<{ default: ComponentType }>;

export type PageWireframe = {
  lede: string;
  blocks: readonly Block[];
};

/** Route → page module, for every \`PAGE_MANIFEST\` entry with a source file. */
export const PAGE_LOADERS: Record<string, ManifestPageLoader> = {
${loaderEntries.join('\n')}
};

/** Route → registry wireframe, for every \`kind: 'placeholder'\` entry. */
export const PAGE_WIREFRAMES: Record<string, PageWireframe> = {
${wireframeEntries.join('\n')}
};
`;
}

/**
 * The repo's prettier config, minus `plugins` — `format` resolves plugin
 * specifiers against `process.cwd()` rather than against the config file.
 */
export async function resolveFormatOptions(docsRoot) {
  const config = {
    ...(await prettier.resolveConfig(path.join(docsRoot, MANIFEST_FILE))),
  };
  delete config.plugins;
  return config;
}

/**
 * Reads the docs sources under `docsRoot` and returns both generated modules as
 * formatted TypeScript source, keyed by output path. Output order comes from the
 * registry plus an explicit slug sort, never from directory listing order, so
 * two runs over unchanged sources return the same strings. Pass `formatOptions`
 * to format against something other than the repo's prettier config.
 */
export async function buildPageManifest(docsRoot, formatOptions) {
  const registryPath = path.join(docsRoot, REGISTRY_FILE);
  const jiti = createJiti(pathToFileURL(registryPath).href);
  const { PAGE_REGISTRY } = await jiti.import(registryPath);

  const sectionFor = (slug) =>
    Object.hasOwn(PAGE_REGISTRY, slug) ? PAGE_REGISTRY[slug] : undefined;
  const pagesOf = (slug) => sectionFor(slug)?.pages ?? [];
  const isComponentsSection = (slug) => sectionFor(slug)?.unit === 'components';
  const isBlocksSection = (slug) => sectionFor(slug)?.unit === 'blocks';

  const sources = SOURCES.map((source) => ({
    ...source,
    pages: collectPages(docsRoot, source),
  }));
  assertOneSourcePerRoute(sources);
  assertNoWrittenGeneratedPages(sources);
  const keysOnDisk = sources.flatMap((source) => [...source.pages.keys()]);

  /** Registry order first, then slugs that exist only on disk, in slug order. */
  function orderedSlugs(sectionSlug) {
    const registeredSlugs = pagesOf(sectionSlug).map((entry) => entry.slug);
    const extra = keysOnDisk
      .filter((key) => key.startsWith(`${sectionSlug}/`))
      .map((key) => key.slice(sectionSlug.length + 1))
      .filter((slug) => !registeredSlugs.includes(slug))
      .sort();
    return [...registeredSlugs, ...extra];
  }

  function buildPage(sectionSlug, slug) {
    const key = `${sectionSlug}/${slug}`;
    const entry = pagesOf(sectionSlug).find((page) => page.slug === slug);
    const base = {
      route: `/${key}`,
      slug,
      label: entry?.label ?? humanize(slug),
    };

    const source = sources.find((candidate) => candidate.pages.has(key));
    if (source) {
      const file = source.pages.get(key);
      if (entry?.wireframe) {
        throw new Error(
          `${key} is written at ${file}, so its registry wireframe can never render — drop the \`wireframe\` from its registry entry.`
        );
      }
      return {
        page: { ...base, kind: source.kind, file },
        specifier: specifierFor(file, source.keepExtension),
      };
    }

    if (!entry?.wireframe) {
      throw new Error(
        `${key} has no page file, so it renders its registry wireframe — give its registry entry a \`wireframe\`, or write the page.`
      );
    }
    return {
      page: { ...base, kind: 'placeholder', file: null },
      wireframe: entry.wireframe,
    };
  }

  function buildComponentPage(slug) {
    return {
      page: {
        route: `/${COMPONENTS_SECTION}/${slug}`,
        slug,
        label: componentLabel(slug),
        kind: 'generated',
      },
    };
  }

  function buildBlockPage({ slug }) {
    return {
      page: {
        route: `/${BLOCKS_SECTION}/${slug}`,
        slug,
        label: pascal(slug),
        kind: 'block',
      },
    };
  }

  function orderedEntries(sectionSlug) {
    if (isComponentsSection(sectionSlug)) {
      return byLabel(exportedComponentSlugs().map(buildComponentPage));
    }
    if (isBlocksSection(sectionSlug)) {
      return byLabel(blockSources().map(buildBlockPage));
    }
    return orderedSlugs(sectionSlug).map((slug) =>
      buildPage(sectionSlug, slug)
    );
  }

  /** Sections that exist only on disk, appended after the registry's own. */
  const extraSections = [...new Set(keysOnDisk.map((key) => key.split('/')[0]))]
    .filter((slug) => !Object.hasOwn(PAGE_REGISTRY, slug))
    .sort();

  const built = [...Object.keys(PAGE_REGISTRY), ...extraSections].map(
    (sectionSlug) => ({
      slug: sectionSlug,
      title: sectionFor(sectionSlug)?.title ?? humanize(sectionSlug),
      href: sectionFor(sectionSlug)?.href ?? `/${sectionSlug}`,
      unit: sectionFor(sectionSlug)?.unit,
      entries: orderedEntries(sectionSlug),
    })
  );

  const manifest = built.map((section) => ({
    slug: section.slug,
    title: section.title,
    href: section.href,
    unit: section.unit,
    pages: section.entries.map((entry) => entry.page),
  }));
  manifest.forEach(assertLabelsAvoidTheCardJoiner);

  const entries = built.flatMap((section) => section.entries);
  const loaders = [];
  const wireframes = [];
  for (const { page, specifier, wireframe } of entries) {
    if (specifier) {
      loaders.push({ route: page.route, specifier });
    }
    if (wireframe) {
      wireframes.push({ route: page.route, ...wireframe });
    }
  }

  const format = formatOptions ?? (await resolveFormatOptions(docsRoot));
  const formatModule = (file, source) =>
    prettier.format(source, {
      ...format,
      filepath: path.join(docsRoot, file),
    });

  return {
    [MANIFEST_FILE]: await formatModule(
      MANIFEST_FILE,
      renderManifestModule(manifest)
    ),
    [CONTENT_FILE]: await formatModule(
      CONTENT_FILE,
      renderContentModule({ loaders, wireframes })
    ),
  };
}
