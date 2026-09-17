import { compile } from '@mdx-js/mdx';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

import { MDX_PAGES } from './app/_lib/mdx-pages';
import { SECTIONS } from './app/_lib/sections';
import { generateStaticParams as subPageParams } from './app/[section]/[sub]/page';
import { generateStaticParams as sectionParams } from './app/[section]/page';
import { MDX_OPTIONS } from './mdx-options';
import { PAGE_EXTENSIONS } from './page-extensions';

const DOCS_DIR = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(DOCS_DIR, 'content');
const APP_DIR = path.join(DOCS_DIR, 'app');

const PAGE_FILENAMES = new Set(PAGE_EXTENSIONS.map((ext) => `page.${ext}`));

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

// Segments App Router does not serve at their literal path: `[dynamic]` paths
// come from SECTIONS, `_private` opts out of routing, `@slot` renders into a
// layout slot, and `(.)`/`(..)` intercept another route.
const NON_ROUTABLE_PREFIXES = ['[', '_', '@', '(.'];

function isRoutable(segment: string) {
  return !NON_ROUTABLE_PREFIXES.some((prefix) => segment.startsWith(prefix));
}

// Every directory holding a page file, minus the ones a naming convention takes
// out of the path. Route groups — `(marketing)` — nest without contributing a
// path segment, so they are dropped after the routable check.
async function staticRoutes() {
  const entries = await readdir(APP_DIR, {
    withFileTypes: true,
    recursive: true,
  });
  const routes = new Set<string>();

  for (const entry of entries) {
    if (!entry.isFile() || !PAGE_FILENAMES.has(entry.name)) continue;

    const segments = path
      .relative(APP_DIR, entry.parentPath)
      .split(path.sep)
      .filter((segment) => segment !== '');

    if (!segments.every(isRoutable)) continue;

    const served = segments.filter((segment) => !segment.startsWith('('));
    routes.add(`/${served.join('/')}`);
  }

  return routes;
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
const STATIC_ROUTES = await staticRoutes();

// Every route the app serves: literal page files, plus the two dynamic routes'
// own generateStaticParams output.
const ROUTES = new Set([
  ...STATIC_ROUTES,
  ...sectionParams().map(({ section }) => `/${section}`),
  ...[...SUB_PAGE_KEYS].map((key) => `/${key}`),
]);

describe('MDX heading ids', () => {
  it('registers rehype-slug where the loader can resolve it', () => {
    expect(MDX_OPTIONS.rehypePlugins).toContain('rehype-slug');

    for (const name of [
      ...MDX_OPTIONS.remarkPlugins,
      ...MDX_OPTIONS.rehypePlugins,
    ]) {
      expect(() => requireFromContent.resolve(name)).not.toThrow();
    }
  });

  it('ships MDX_OPTIONS and pageExtensions through next.config', async () => {
    // @next/mdx only emits turbopack.rules when TURBOPACK is set.
    vi.stubEnv('TURBOPACK', '1');
    const { default: config } = await import('./next.config');

    const rules = config.turbopack?.rules as
      | Record<string, { loaders: { options: Record<string, unknown> }[] }>
      | undefined;

    expect(rules?.['#next-mdx']?.loaders[0]?.options).toMatchObject(
      MDX_OPTIONS
    );
    expect(config.pageExtensions).toEqual(['ts', 'tsx', 'js', 'jsx', 'mdx']);
  });

  it('discovers the routes App Router serves from a literal path', () => {
    expect([...STATIC_ROUTES].sort()).toEqual([
      '/',
      '/appearance-ssr',
      '/changelog',
    ]);
  });

  // `[section]` emits object keys and `[sub]` emits `section.slug`, while every
  // lookup indexes SECTIONS by object key. A diverged pair builds a route that
  // 404s.
  it('keys every section by its own slug', () => {
    for (const [key, section] of Object.entries(SECTIONS)) {
      expect(section.slug, `SECTIONS key ${key}`).toBe(key);
    }
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
    async (contentPath, expected) => {
      const source = await readFile(
        path.join(CONTENT_DIR, contentPath),
        'utf8'
      );
      const { headings } = await compileMdx(source);

      expect(headings.map((h) => h.properties?.id)).toEqual(expected);
    }
  );

  it.each(CONTENT_FILES)(
    'gives %s unique, addressable heading ids',
    async (contentPath) => {
      const source = await readFile(
        path.join(CONTENT_DIR, contentPath),
        'utf8'
      );
      const { headings, ids } = await compileMdx(source);

      expect(headings.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);

      for (const id of ids) {
        expect(id).not.toBe('');
        // Guards ids querySelector cannot parse, e.g. a leading digit.
        expect(() => document.querySelector(`#${id}`)).not.toThrow();
      }
    }
  );

  it('points every in-repo link at a route and an id that exist', async () => {
    const idsByFile = new Map<string, Set<string>>();
    const links: { from: string; href: string }[] = [];

    for (const contentPath of CONTENT_FILES) {
      const source = await readFile(
        path.join(CONTENT_DIR, contentPath),
        'utf8'
      );
      const { ids, hrefs } = await compileMdx(source);

      idsByFile.set(contentPath, new Set(ids));
      for (const href of hrefs.filter(isInRepo)) {
        links.push({ from: contentPath, href });
      }
    }

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
      const ids = idsByFile.get(route === '' ? from : `${route.slice(1)}.mdx`);
      expect(
        ids,
        `${from} links to ${href}, and only MDX pages render heading ids`
      ).toBeDefined();
      expect([...(ids ?? [])], `${from} links to ${href}`).toContain(fragment);

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
