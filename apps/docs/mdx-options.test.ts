import { compile } from '@mdx-js/mdx';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

import { MDX_OPTIONS } from './mdx-options';

const CONTENT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'content'
);

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

  it('ships MDX_OPTIONS to the loader through next.config', async () => {
    // @next/mdx only emits turbopack.rules when TURBOPACK is set.
    vi.stubEnv('TURBOPACK', '1');
    const { default: config } = await import('./next.config');

    const rules = config.turbopack?.rules as
      | Record<string, { loaders: { options: Record<string, unknown> }[] }>
      | undefined;

    expect(rules?.['#next-mdx']?.loaders[0]?.options).toMatchObject(
      MDX_OPTIONS
    );
  });

  it('pins every .mdx under content/', () => {
    expect(CONTENT_FILES.length).toBeGreaterThan(0);
    expect([...CONTENT_FILES].sort()).toEqual(
      Object.keys(EXPECTED_HEADING_IDS).sort()
    );
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

  // The pin lists above keep ids stable, but a rename that updates a pin still
  // leaves any link pointing at the old id silently dead.
  it('points every anchor link at an id that exists', async () => {
    const idsByFile = new Map<string, Set<string>>();
    const fragmentLinks: { from: string; href: string }[] = [];

    for (const contentPath of CONTENT_FILES) {
      const source = await readFile(
        path.join(CONTENT_DIR, contentPath),
        'utf8'
      );
      const { ids, hrefs } = await compileMdx(source);

      idsByFile.set(contentPath, new Set(ids));
      for (const href of hrefs.filter((h) => h.includes('#'))) {
        fragmentLinks.push({ from: contentPath, href });
      }
    }

    expect(fragmentLinks.length).toBeGreaterThan(0);

    for (const { from, href } of fragmentLinks) {
      const hash = href.indexOf('#');
      const route = href.slice(0, hash);
      const fragment = href.slice(hash + 1);
      // A bare `#id` targets the page the link sits on; `/a/b#id` targets
      // content/a/b.mdx, the mapping MDX_PAGES registers for that route.
      const target = route === '' ? from : `${route.replace(/^\//, '')}.mdx`;
      const ids = idsByFile.get(target);

      expect(
        ids,
        `${from} links to ${href}, which is not an MDX page`
      ).toBeDefined();
      expect([...(ids ?? [])], `${from} links to ${href}`).toContain(fragment);
    }
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
