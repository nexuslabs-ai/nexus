import { compile } from '@mdx-js/mdx';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import { MDX_OPTIONS } from '../../mdx-options';

const CONTENT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'content',
  path.sep
);

/**
 * `footnote-label` on theme-setup comes from remark-rehype, not rehype-slug —
 * rehype-slug skips headings that already carry an id.
 */
const EXPECTED_HEADING_IDS: Record<string, string[]> = {
  'getting-started/install.mdx': [
    'install',
    'install-the-published-packages',
    'vendor-the-components-and-theme',
    'wire-the-styles',
    'declare-native-color-scheme',
    'render-a-component',
    'next-steps',
  ],
  'getting-started/theme-setup.mdx': [
    'theme-setup',
    '1-import-the-styles',
    '2-pick-a-default-appearance',
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

// Mirrors @next/mdx's loader, which resolves plugin strings with
// require.resolve from the directory of the .mdx file being compiled.
const requireFromContent = createRequire(CONTENT_DIR);

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

  const elements = collectElements(tree as HastNode);
  return {
    headings: elements.filter((el) => /^h[1-6]$/.test(el.tagName ?? '')),
    ids: elements
      .map((el) => el.properties?.id)
      .filter((id): id is string => typeof id === 'string'),
  };
}

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

  it.each(Object.entries(EXPECTED_HEADING_IDS))(
    'pins the heading ids of %s',
    async (contentPath, expected) => {
      const source = await readFile(
        path.join(CONTENT_DIR, contentPath),
        'utf8'
      );
      const { headings, ids } = await compileMdx(source);

      expect(headings.map((h) => h.properties?.id)).toEqual(expected);
      expect(new Set(ids).size).toBe(ids.length);
    }
  );

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
