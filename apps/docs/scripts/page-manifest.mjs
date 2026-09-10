/**
 * Builds the docs page manifest from the filesystem.
 *
 * Sources:
 *   - `app/_lib/sections.ts` — section order, titles, sub-page order and
 *     labels, and the wireframe content (`lede` / `blocks`) placeholder pages
 *     render until a real page file lands
 *   - `content/{section}/{slug}.mdx` — MDX content pages
 *   - `app/_pages/{section}/{slug}.tsx` — hand-built React pages
 *
 * A page's route is its path on disk, so dropping in a file is the only step
 * needed to add a page. Pages the registry does not list are appended to their
 * section in slug order with a label derived from the slug.
 *
 * Routes are exactly two levels deep and a slug is a single path segment — a
 * file at any other depth, or one whose name carries a second dot, fails the
 * generator rather than silently dropping out of the manifest or inventing a
 * route. So the component pages behind the registry's `nested` labels land
 * flat, at `components/{name}`. Entries prefixed with `_` are skipped, which is
 * how a page-local island co-locates with the page that uses it instead of
 * moving to `app/_components/`.
 *
 * Two modules come out, split by which side of the client boundary each half
 * belongs on:
 *   - `MANIFEST_FILE` — the IA: routes, labels, nav order. Serializable, and
 *     imported at module scope by `'use client'` nav components.
 *   - `CONTENT_FILE` — where a route's body comes from, either a dynamic import
 *     or the registry wireframe. Server-only.
 *
 * `generate-page-manifest.mjs` is the CLI that writes both.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createJiti } from 'jiti';
import prettier from 'prettier';

/** Output paths, relative to the docs app root. */
export const MANIFEST_FILE = 'app/_lib/page-manifest.generated.ts';
export const CONTENT_FILE = 'app/_lib/page-content.generated.ts';

/** Page sources — each mirrors one arm of the `[section]/[sub]` route. */
const SOURCES = [
  { kind: 'mdx', dir: 'content', ext: '.mdx', keepExtension: true },
  { kind: 'component', dir: 'app/_pages', ext: '.tsx', keepExtension: false },
];

/** `multi-brand` → `Multi brand`. */
function humanize(slug) {
  const spaced = slug.replaceAll('-', ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

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

/**
 * Collects `{section}/{slug}{ext}` files into a `section/slug` → source-file map.
 * Anything at another depth is a routing dead end, so it fails the generator
 * rather than silently dropping out of the manifest.
 */
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

/** A route resolving in two sources means one of them never renders. */
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

/** Folds a label or a slug to one identity — `DropdownMenu` and `dropdown-menu` both give `dropdownmenu`. */
function comparisonKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * The registry's `nested` labels stand in for pages that do not exist yet. Once
 * one does, the label and the page would both show in the left rail.
 */
function assertNestedLabelsHaveNoPage(section) {
  const pageFor = new Map();
  for (const page of section.pages) {
    pageFor.set(comparisonKey(page.slug), page.slug);
    pageFor.set(comparisonKey(page.label), page.slug);
  }

  for (const page of section.pages) {
    for (const label of page.nested ?? []) {
      const existing = pageFor.get(comparisonKey(label));
      if (existing !== undefined) {
        throw new Error(
          `${section.slug} lists "${label}" as a nested label under ${page.slug}, but ${section.slug}/${existing} is now a page — drop the nested label.`
        );
      }
    }
  }
}

/** Import specifier for a docs-root-relative file, resolved from the content module. */
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
  ].join(' ');
  return `{ ${head} pages: [\n${section.pages.map(renderPage).join('\n')}\n] },`;
}

const HEADER = `// AUTO-GENERATED by apps/docs/scripts/generate-page-manifest.mjs — do not edit.
// Regenerate with \`pnpm --filter @nexus_ds/docs generate:manifest\`.`;

function renderManifestModule(manifest) {
  return `${HEADER}

export type ManifestPage = {
  /** Route path, e.g. \`/foundations/color\`. */
  route: string;
  slug: string;
  label: string;
  /** Non-interactive labels rendered under this page in the left rail. */
  nested?: readonly string[];
} & (
  | {
      kind: 'mdx' | 'component';
      /** Source file relative to \`apps/docs\`; the module is \`PAGE_LOADERS[route]\`. */
      file: string;
    }
  | {
      /** No page file yet; the body is \`PAGE_WIREFRAMES[route]\`. */
      kind: 'placeholder';
      file: null;
    }
);

export type ManifestSection = {
  slug: string;
  title: string;
  href: string;
  pages: readonly ManifestPage[];
};

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

import type { Block } from './blocks';

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
 * The repo's prettier config for the generated modules, minus `plugins`:
 * `format` resolves plugin specifiers against `process.cwd()` rather than the
 * config file, and neither module has class strings to sort.
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
 * formatted TypeScript source, keyed by output path. Two runs over unchanged
 * sources return the same strings: output order comes from the registry plus an
 * explicit slug sort, never from directory listing order. Pass `formatOptions`
 * to format against something other than the repo's prettier config.
 */
export async function buildPageManifest(docsRoot, formatOptions) {
  const registryPath = path.join(docsRoot, 'app', '_lib', 'sections.ts');
  const jiti = createJiti(pathToFileURL(registryPath).href);
  const { SECTIONS } = await jiti.import(registryPath);

  const sectionFor = (slug) =>
    Object.hasOwn(SECTIONS, slug) ? SECTIONS[slug] : undefined;
  const subsOf = (slug) => sectionFor(slug)?.subs ?? [];

  const sources = SOURCES.map((source) => ({
    ...source,
    pages: collectPages(docsRoot, source),
  }));
  assertOneSourcePerRoute(sources);
  const keysOnDisk = sources.flatMap((source) => [...source.pages.keys()]);

  /** Registry order first, then slugs that exist only on disk, in slug order. */
  function orderedSlugs(sectionSlug) {
    const registered = subsOf(sectionSlug).map((sub) => sub.slug);
    const extra = keysOnDisk
      .filter((key) => key.startsWith(`${sectionSlug}/`))
      .map((key) => key.slice(sectionSlug.length + 1))
      .filter((slug) => !registered.includes(slug))
      .sort();
    return [...registered, ...extra];
  }

  function buildPage(sectionSlug, slug) {
    const key = `${sectionSlug}/${slug}`;
    const sub = subsOf(sectionSlug).find((entry) => entry.slug === slug);
    const page = {
      route: `/${key}`,
      slug,
      label: sub?.label ?? humanize(slug),
    };
    if (sub?.nested) {
      page.nested = sub.nested;
    }

    const source = sources.find((candidate) => candidate.pages.has(key));
    if (!source) {
      // No file on disk, so the page is registry-only and renders its wireframe.
      if (sub?.lede === undefined || sub?.blocks === undefined) {
        throw new Error(
          `${key} has no page file, so it renders its registry wireframe — but its registry entry has no \`lede\` or \`blocks\`.`
        );
      }
      Object.assign(page, { kind: 'placeholder', file: null });
      return { page, wireframe: { lede: sub.lede, blocks: sub.blocks } };
    }

    const file = source.pages.get(key);
    Object.assign(page, { kind: source.kind, file });
    return { page, specifier: specifierFor(file, source.keepExtension) };
  }

  /** Registry order first, then sections that exist only on disk, in slug order. */
  const extraSections = [...new Set(keysOnDisk.map((key) => key.split('/')[0]))]
    .filter((slug) => !Object.hasOwn(SECTIONS, slug))
    .sort();

  const built = [...Object.keys(SECTIONS), ...extraSections].map(
    (sectionSlug) => ({
      slug: sectionSlug,
      title: sectionFor(sectionSlug)?.title ?? humanize(sectionSlug),
      href: sectionFor(sectionSlug)?.href ?? `/${sectionSlug}`,
      entries: orderedSlugs(sectionSlug).map((slug) =>
        buildPage(sectionSlug, slug)
      ),
    })
  );

  const manifest = built.map(({ entries, ...section }) => ({
    ...section,
    pages: entries.map((entry) => entry.page),
  }));
  manifest.forEach(assertNestedLabelsHaveNoPage);

  const entries = built.flatMap((section) => section.entries);
  const loaders = entries
    .filter((entry) => entry.specifier)
    .map((entry) => ({ route: entry.page.route, specifier: entry.specifier }));
  const wireframes = entries
    .filter((entry) => entry.wireframe)
    .map((entry) => ({ route: entry.page.route, ...entry.wireframe }));

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
