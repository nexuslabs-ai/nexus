import { compile } from '@mdx-js/mdx';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

import { MDX_PAGES } from './app/_lib/mdx-pages';
import {
  sectionHref,
  sectionParams,
  subPageHref,
  subPageParams,
} from './app/_lib/routes';
import { MDX_OPTIONS } from './mdx-options';

const DOCS_DIR = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(DOCS_DIR, 'content');
const APP_DIR = path.join(DOCS_DIR, 'app');

// Next's default pageExtensions, which next.config leaves unset.
const PAGE_FILENAMES = new Set(
  ['tsx', 'ts', 'jsx', 'js'].map((ext) => `page.${ext}`)
);

const SUB_PAGE_KEYS = new Set(
  subPageParams().map(({ section, sub }) => `${section}/${sub}`)
);

// remark-rehype's clobber prefix on the ids it generates for footnotes.
const FOOTNOTE_ID_PREFIX = 'user-content-fn';

// `footnote-label` comes from remark-rehype: rehype-slug skips headings that
// already carry an id.
const EXPECTED_HEADING_IDS: Record<string, string[]> = {
  'getting-started/install.mdx': [
    'install',
    'where-the-files-come-from',
    'step-1-tailwind-4',
    'step-2-the-token-css-layer',
    'step-3-the-appearance-provider',
    'step-4-the-cn-helper',
    'paste-a-component',
    'lint-guardrails',
    'next-steps',
  ],
  'getting-started/theme-setup.mdx': [
    'theme-setup',
    'before-you-start',
    'pick-a-default-appearance',
    'nextjs-app-router',
    'vite',
    'check-your-setup',
    'footnote-label',
  ],
  'theming/appearance.mdx': [
    'appearance',
    'the-model',
    'brand-and-surface-tone',
    'reading-and-updating',
    'first-paint-and-persistence',
  ],
};

const FIXTURE = `# Title

## Section

### Subsection

#### Deep heading

## Section
`;

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

// Resolves plugin strings from content/, the way @next/mdx's loader does.
// createRequire takes a file, not a directory, and resolves from its parent.
const requireFromContent = createRequire(path.join(CONTENT_DIR, 'page.mdx'));

async function contentFiles() {
  const entries = await readdir(CONTENT_DIR, {
    withFileTypes: true,
    recursive: true,
  });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
    .map((entry) =>
      path
        .relative(CONTENT_DIR, path.join(entry.parentPath, entry.name))
        .split(path.sep)
        .join('/')
    );
}

// Segments App Router keeps out of the served path entirely: `_private` opts
// out of routing, `@slot` renders into a layout slot, and `(.)`/`(..)`
// intercept another route.
const OPT_OUT_PREFIXES = ['_', '@', '(.'];

function isServed(segment: string) {
  return !OPT_OUT_PREFIXES.some((prefix) => segment.startsWith(prefix));
}

// Every directory holding a page file, split by how its routes are known. A
// `[dynamic]` directory serves whatever its own generateStaticParams emits, so
// it is returned by name for the pin below; every other directory is its own
// path, minus route groups — `(marketing)` — which nest without contributing a
// segment.
async function pageDirectories() {
  const entries = await readdir(APP_DIR, {
    withFileTypes: true,
    recursive: true,
  });
  const staticRoutes = new Set<string>();
  const dynamicDirs = new Set<string>();

  for (const entry of entries) {
    if (!entry.isFile() || !PAGE_FILENAMES.has(entry.name)) continue;

    const segments = path
      .relative(APP_DIR, entry.parentPath)
      .split(path.sep)
      .filter((segment) => segment !== '');

    if (!segments.every(isServed)) continue;

    if (segments.some((segment) => segment.startsWith('['))) {
      dynamicDirs.add(segments.join('/'));
      continue;
    }

    const served = segments.filter((segment) => !segment.startsWith('('));
    staticRoutes.add(`/${served.join('/')}`);
  }

  return { staticRoutes, dynamicDirs };
}

// An href leaves the docs app when it names a scheme (`https:`, `mailto:`) or a
// host (`//cdn...`).
function isInRepo(href: string) {
  return !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

// Returns '' for a bare `#id`; a relative route resolves against the linking
// page's own directory.
function resolveRoute(from: string, route: string) {
  const withoutQuery = route.replace(/\?.*$/, '');
  const clean =
    withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, '') : withoutQuery;
  if (clean === '' || clean.startsWith('/')) return clean;
  return path.posix.join('/', path.posix.dirname(from), clean);
}

async function loadPlugin(name: string) {
  const resolved = pathToFileURL(requireFromContent.resolve(name)).href;
  const mod = await import(/* @vite-ignore */ resolved);
  return mod.default;
}

function collectElements(node: HastNode, found: HastNode[] = []) {
  if (node.type === 'element') found.push(node);
  for (const child of node.children ?? []) collectElements(child, found);
  return found;
}

async function compileMdx(source: string) {
  let tree: HastNode | undefined;
  const capture = () => (captured: HastNode) => {
    tree = captured;
  };

  await compile(source, {
    remarkPlugins: await Promise.all(MDX_OPTIONS.remarkPlugins.map(loadPlugin)),
    rehypePlugins: [
      ...(await Promise.all(MDX_OPTIONS.rehypePlugins.map(loadPlugin))),
      capture,
    ],
    remarkRehypeOptions: MDX_OPTIONS.remarkRehypeOptions,
  });

  if (!tree) throw new Error('capture plugin did not run');

  const elements = collectElements(tree);
  return {
    headings: elements.filter((el) => /^h[1-6]$/.test(el.tagName ?? '')),
    ids: elements
      .map((el) => el.properties?.id)
      .filter((id): id is string => typeof id === 'string'),
    hrefs: elements
      .filter((el) => el.tagName === 'a')
      .map((el) => el.properties?.href)
      .filter((href): href is string => typeof href === 'string'),
  };
}

const CONTENT_FILES = await contentFiles();
const { staticRoutes: STATIC_ROUTES, dynamicDirs: DYNAMIC_PAGE_DIRS } =
  await pageDirectories();

// Compiled once here; every test body below reads this instead of recompiling.
const COMPILED = new Map(
  await Promise.all(
    CONTENT_FILES.map(async (contentPath) => {
      const source = await readFile(
        path.join(CONTENT_DIR, contentPath),
        'utf8'
      );
      try {
        return [contentPath, await compileMdx(source)] as const;
      } catch (cause) {
        // The compile error names a line and column, not the file.
        throw new Error(`failed to compile ${contentPath}`, { cause });
      }
    })
  )
);

function compiled(contentPath: string) {
  const result = COMPILED.get(contentPath);
  if (!result) throw new Error(`${contentPath} is not under content/`);
  return result;
}

// Every route the app serves: literal page files, plus each dynamic route's own
// generateStaticParams output.
const ROUTES = new Set([
  ...STATIC_ROUTES,
  ...sectionParams().map(({ section }) => sectionHref(section)),
  ...subPageParams().map(({ section, sub }) => subPageHref(section, sub)),
]);

describe('docs MDX pipeline and link integrity', () => {
  it('registers rehype-slug where the loader can resolve it', () => {
    expect(MDX_OPTIONS.rehypePlugins).toContain('rehype-slug');

    for (const name of [
      ...MDX_OPTIONS.remarkPlugins,
      ...MDX_OPTIONS.rehypePlugins,
    ]) {
      expect(() => requireFromContent.resolve(name)).not.toThrow();
    }
  });

  it('ships MDX_OPTIONS through next.config', async () => {
    // @next/mdx only emits turbopack.rules when TURBOPACK is set, and the
    // config module is cached — reset so this does not depend on being the
    // first importer.
    vi.stubEnv('TURBOPACK', '1');
    vi.resetModules();
    const { default: config } = await import('./next.config');

    const rules = config.turbopack?.rules as
      | Record<string, { loaders: { options: Record<string, unknown> }[] }>
      | undefined;

    expect(rules?.['#next-mdx']?.loaders[0]?.options).toMatchObject(
      MDX_OPTIONS
    );
  });

  it('leaves pageExtensions at the default PAGE_FILENAMES assumes', async () => {
    const { default: config } = await import('./next.config');

    expect(config.pageExtensions).toBeUndefined();
  });

  it('discovers the routes App Router serves from a literal path', () => {
    expect([...STATIC_ROUTES].sort()).toEqual([
      '/',
      '/appearance-ssr',
      '/changelog',
    ]);
  });

  // ROUTES builds these two from sectionParams and subPageParams. Pinning the
  // walk's output means a third dynamic route fails here until its params
  // source is registered there.
  it('pins every dynamic route to a registered params source', () => {
    expect([...DYNAMIC_PAGE_DIRS].sort()).toEqual([
      '[section]',
      '[section]/[sub]',
    ]);
  });

  it('pins every .mdx under content/', () => {
    expect(CONTENT_FILES.length).toBeGreaterThan(0);
    expect([...CONTENT_FILES].sort()).toEqual(
      Object.keys(EXPECTED_HEADING_IDS).sort()
    );
  });

  it('agrees with SECTIONS and content/ on every MDX page', () => {
    expect(
      Object.keys(MDX_PAGES)
        .map((key) => `${key}.mdx`)
        .sort()
    ).toEqual([...CONTENT_FILES].sort());

    for (const key of Object.keys(MDX_PAGES)) {
      expect(
        SUB_PAGE_KEYS.has(key),
        `MDX_PAGES key ${key} is not a route generateStaticParams emits`
      ).toBe(true);
    }
  });

  it.each(Object.entries(EXPECTED_HEADING_IDS))(
    'pins the heading ids of %s',
    (contentPath, expected) => {
      const { headings } = compiled(contentPath);

      expect(headings.map((h) => h.properties?.id)).toEqual(expected);
    }
  );

  it.each(CONTENT_FILES)(
    'gives %s unique, addressable heading ids',
    (contentPath) => {
      const { headings, ids } = compiled(contentPath);

      expect(headings.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);

      for (const id of ids) {
        expect(id).not.toBe('');
        // Guards ids querySelector cannot parse, e.g. a leading digit.
        expect(() => document.querySelector(`#${id}`)).not.toThrow();
      }
    }
  );

  it('points every in-repo link at a route and an id that exist', () => {
    const links = CONTENT_FILES.flatMap((from) =>
      compiled(from)
        .hrefs.filter(isInRepo)
        .map((href) => ({ from, href }))
    );

    // Footnote refs are same-page links this loop verifies, but they appear
    // wherever a page has a footnote, so they cannot stand in for an authored
    // anchor.
    let authoredSamePageChecked = 0;
    let crossPageChecked = 0;

    for (const { from, href } of links) {
      const hashIndex = href.indexOf('#');
      const fragment = hashIndex === -1 ? '' : href.slice(hashIndex + 1);
      const route = resolveRoute(
        from,
        hashIndex === -1 ? href : href.slice(0, hashIndex)
      );

      if (route !== '') {
        expect(
          ROUTES.has(route),
          `${from} links to ${href}, which is not a route`
        ).toBe(true);
      }

      // A bare trailing `#` is a valid top-of-page link.
      if (fragment === '') continue;

      // Only MDX pages render heading ids, so a fragment aimed at any other
      // route cannot resolve.
      const targetIds = COMPILED.get(
        route === '' ? from : `${route.slice(1)}.mdx`
      )?.ids;
      expect(
        targetIds,
        `${from} links to ${href}, and only MDX pages render heading ids`
      ).toBeDefined();
      expect(targetIds ?? [], `${from} links to ${href}`).toContain(fragment);

      if (route !== '') crossPageChecked++;
      else if (!fragment.startsWith(FOOTNOTE_ID_PREFIX))
        authoredSamePageChecked++;
    }

    // Without these, every anchor link could be deleted from content/ and each
    // assertion above would still pass.
    expect(
      authoredSamePageChecked,
      'no authored same-page anchor checked'
    ).toBeGreaterThan(0);
    expect(crossPageChecked, 'no cross-page anchor checked').toBeGreaterThan(0);
  });

  it('slugs every heading rank and disambiguates repeated headings', async () => {
    const { headings } = await compileMdx(FIXTURE);

    expect(headings.map((h) => [h.tagName, h.properties?.id])).toEqual([
      ['h1', 'title'],
      ['h2', 'section'],
      ['h3', 'subsection'],
      ['h4', 'deep-heading'],
      ['h2', 'section-1'],
    ]);
  });
});
