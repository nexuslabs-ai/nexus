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
    'install-the-published-packages',
    'vendor-the-components-and-theme',
    'wire-the-styles',
    'declare-native-color-scheme',
    'render-a-component',
    'next-steps',
  ],
  'getting-started/theme-setup.mdx': [
    'theme-setup',
    'import-the-styles',
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
  value?: string;
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

// MDX_OPTIONS registers plugins by name, optionally paired with options.
type PluginEntry = string | readonly [name: string, options: unknown];

const pluginName = (entry: PluginEntry) =>
  typeof entry === 'string' ? entry : entry[0];

async function loadPlugin(entry: PluginEntry) {
  const resolved = pathToFileURL(
    requireFromContent.resolve(pluginName(entry))
  ).href;
  const mod = await import(/* @vite-ignore */ resolved);
  return typeof entry === 'string' ? mod.default : [mod.default, entry[1]];
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
    elements,
    headings: elements.filter((el) => /^h[1-6]$/.test(el.tagName ?? '')),
    ids: elements
      .map((el) => el.properties?.id)
      .filter((id): id is string => typeof id === 'string'),
  };
}

const CONTENT_FILES = await contentFiles();

describe('MDX heading ids', () => {
  it('registers rehype-slug where the loader can resolve it', () => {
    expect(MDX_OPTIONS.rehypePlugins).toContain('rehype-slug');

    for (const entry of [
      ...MDX_OPTIONS.remarkPlugins,
      ...MDX_OPTIONS.rehypePlugins,
    ]) {
      expect(() => requireFromContent.resolve(pluginName(entry))).not.toThrow();
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

const FENCE_LANGUAGE = /^```[\w-]+/gm;

// The languages the docs fence today, plus `json` for the manifest snippets the
// install guide is heading towards. A grammar that stops resolving fails here
// rather than silently rendering as plain text.
const FENCE_LANGUAGES = [
  ...new Set([
    // `json` is not fenced in content yet; the ticket pins it alongside the rest.
    'json',
    ...(
      await Promise.all(
        CONTENT_FILES.map((file) =>
          readFile(path.join(CONTENT_DIR, file), 'utf8')
        )
      )
    ).flatMap((source) =>
      (source.match(FENCE_LANGUAGE) ?? []).map((match) => match.slice(3))
    ),
  ]),
].sort();

const fence = (lang: string, code: string) => `\`\`\`${lang}
${code}
\`\`\``;

const TSX_SOURCE = `export function Hello({ name }: { name: string }) {
  return <Button variant="primary">{name}</Button>;
}`;

function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

async function compileBlock(source: string) {
  const { elements } = await compileMdx(source);
  const pre = elements.find((el) => el.tagName === 'pre');
  const code = elements.find((el) => el.tagName === 'code');

  if (!pre || !code) throw new Error('no code block in compiled output');

  return {
    figure: elements.find(
      (el) => el.properties?.['data-rehype-pretty-code-figure'] !== undefined
    ),
    pre,
    code,
    tokens: collectElements(code).filter((el) => el.tagName === 'span'),
    text: textOf(code),
  };
}

describe('MDX code blocks', () => {
  it('registers rehype-pretty-code in dual-theme mode', () => {
    expect(MDX_OPTIONS.rehypePlugins).toContainEqual([
      'rehype-pretty-code',
      expect.objectContaining({
        theme: { light: expect.any(String), dark: expect.any(String) },
        keepBackground: false,
      }),
    ]);
  });

  it('tokenises a tsx block into both palettes at build time', async () => {
    const { figure, pre, code, tokens, text } = await compileBlock(
      fence('tsx', TSX_SOURCE)
    );

    expect(figure).toBeDefined();
    expect(pre.properties?.['data-language']).toBe('tsx');
    expect(text).toBe(TSX_SOURCE);

    const coloured = tokens.filter((token) =>
      String(token.properties?.style ?? '').includes('--shiki-light:')
    );

    // More than one colour means the grammar tokenised rather than falling
    // through to a single plaintext run.
    const lightColours = new Set(
      coloured.map(
        (token) =>
          /--shiki-light:([^;]+)/.exec(String(token.properties?.style))?.[1]
      )
    );

    expect(coloured.length).toBeGreaterThan(1);
    expect(lightColours.size).toBeGreaterThan(1);

    // Every colour is carried as a custom-property pair, never as a resolved
    // `color`: that is what lets the appearance toggle recolour code from CSS.
    for (const token of coloured) {
      expect(String(token.properties?.style)).toMatch(/--shiki-dark:/);
    }
    for (const el of [pre, code, ...tokens]) {
      expect(String(el.properties?.style ?? '')).not.toMatch(/(^|;)\s*color:/);
    }
  });

  it('keeps the scroll container reachable by keyboard', async () => {
    const { pre } = await compileBlock(fence('tsx', TSX_SOURCE));

    // Shiki adds the tab stop; mdx-components.tsx pairs it with a focus ring.
    expect(pre.properties?.tabIndex).toBe(0);
  });

  it('leaves the surface to the Nexus tokens', async () => {
    const { pre, code } = await compileBlock(fence('tsx', TSX_SOURCE));

    expect(pre.properties?.style).toBeUndefined();
    expect(String(code.properties?.style ?? '')).not.toMatch(/background|grid/);
  });

  it.each(FENCE_LANGUAGES)('tokenises the %s fences docs use', async (lang) => {
    const { pre, tokens } = await compileBlock(fence(lang, 'const a = 1'));

    expect(pre.properties?.['data-language']).toBe(lang);
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('degrades an unknown or missing language to plain text', async () => {
    const nonsense = await compileBlock(fence('not-a-language', 'plain body'));
    expect(nonsense.text).toBe('plain body');

    const unlabelled = await compileBlock(fence('', 'plain body'));
    expect(unlabelled.pre.properties?.['data-language']).toBe('plaintext');
    expect(unlabelled.text).toBe('plain body');
  });

  it('leaves inline code to the MDX component styling', async () => {
    const { elements } = await compileMdx('Run `pnpm build` first.');
    const inline = elements.find((el) => el.tagName === 'code');

    expect(inline?.children?.every((child) => child.type === 'text')).toBe(
      true
    );
    expect(
      elements.some(
        (el) => el.properties?.['data-rehype-pretty-code-figure'] !== undefined
      )
    ).toBe(false);
  });
});
