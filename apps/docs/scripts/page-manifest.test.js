import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  PAGE_LOADERS,
  PAGE_WIREFRAMES,
} from '../app/_lib/page-content.generated';
import { PAGE_MANIFEST } from '../app/_lib/page-manifest.generated';
import { PAGE_REGISTRY } from '../page-registry';

import {
  buildPageManifest,
  CONTENT_FILE,
  MANIFEST_FILE,
  REGISTRY_FILE,
  resolveFormatOptions,
} from './page-manifest.mjs';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const pages = PAGE_MANIFEST.flatMap((section) => section.pages);

/** Where a page of each sourced kind lives on disk, relative to `apps/docs`. */
const SOURCE = {
  mdx: { dir: 'content', ext: '.mdx' },
  component: { dir: 'app/_pages', ext: '.tsx' },
};

/** Git may check the generated files out as CRLF; prettier always emits LF. */
const toLf = (source) => source.replaceAll('\r\n', '\n');

const readOnDisk = (file) =>
  toLf(fs.readFileSync(path.join(docsRoot, file), 'utf8'));

/**
 * Writes a throwaway docs tree — a page registry plus page files — so the
 * "a file on disk is the only edit" contract can be checked without touching
 * the real sources.
 */
function writeFixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-page-manifest-'));
  for (const [file, contents] of Object.entries(files)) {
    fs.mkdirSync(path.join(root, path.dirname(file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), contents);
  }
  return root;
}

const FIXTURE_REGISTRY = `export const PAGE_REGISTRY = {
  foundations: {
    slug: 'foundations',
    title: 'Foundations',
    href: '/foundations',
    pages: [{ slug: 'color', label: 'Color' }],
  },
} satisfies Record<string, unknown>;
`;

describe('page manifest', () => {
  it('lists every section in registry order', () => {
    const registered = new Set(Object.keys(PAGE_REGISTRY));

    expect(
      PAGE_MANIFEST.map((section) => section.slug).filter((slug) =>
        registered.has(slug)
      )
    ).toEqual(Object.keys(PAGE_REGISTRY));
  });

  it('lists every registry page, with its label, nesting and position', () => {
    const expected = Object.values(PAGE_REGISTRY).flatMap((section) =>
      section.pages.map((page) => ({
        route: `/${section.slug}/${page.slug}`,
        label: page.label,
        nested: page.nested,
      }))
    );

    const registered = new Set(expected.map((page) => page.route));

    expect(
      pages
        .filter((page) => registered.has(page.route))
        .map(({ route, label, nested }) => ({ route, label, nested }))
    ).toEqual(expected);
  });

  it('resolves MDX and hand-built pages to their source files', () => {
    for (const page of pages) {
      if (page.kind === 'placeholder') {
        expect(page.file).toBeNull();
        expect(PAGE_LOADERS[page.route]).toBeUndefined();
        continue;
      }

      const { dir, ext } = SOURCE[page.kind];
      expect(page.file).toBe(`${dir}${page.route}${ext}`);
      expect(fs.existsSync(path.join(docsRoot, page.file))).toBe(true);
      expect(PAGE_LOADERS[page.route]).toBeTypeOf('function');
    }
  });

  it('carries the registry wireframe for exactly the placeholder pages', () => {
    const placeholders = pages.filter((page) => page.kind === 'placeholder');
    expect(Object.keys(PAGE_WIREFRAMES).sort()).toEqual(
      placeholders.map((page) => page.route).sort()
    );

    for (const page of placeholders) {
      const [, sectionSlug] = page.route.split('/');
      const registered = PAGE_REGISTRY[sectionSlug].pages.find(
        (entry) => entry.slug === page.slug
      );
      expect(PAGE_WIREFRAMES[page.route]).toEqual(registered.wireframe);
    }
  });

  it('keeps page bodies out of the client-safe manifest', () => {
    const manifest = readOnDisk(MANIFEST_FILE);
    expect(manifest).not.toContain('import(');
    expect(manifest).not.toContain('lede:');
    expect(readOnDisk(CONTENT_FILE)).toContain("import 'server-only';");
  });

  it('is checked in current, and rebuilds byte-identically', async () => {
    const first = await buildPageManifest(docsRoot);
    const second = await buildPageManifest(docsRoot);

    for (const file of [MANIFEST_FILE, CONTENT_FILE]) {
      expect(first[file]).toBe(readOnDisk(file));
      expect(second[file]).toBe(first[file]);
    }
  });

  it('picks up a page added on disk with no hand-editing', async () => {
    const root = writeFixture({
      [REGISTRY_FILE]: FIXTURE_REGISTRY,
      'content/foundations/color.mdx': '# Color\n',
      'content/foundations/motion.mdx': '# Motion\n',
      'app/_pages/theming/multi-brand.tsx': 'export default function P() {}\n',
    });

    // A throwaway root resolves no prettier config of its own, so the fixture
    // is formatted the way the real manifest is.
    const built = await buildPageManifest(
      root,
      await resolveFormatOptions(docsRoot)
    );
    const manifest = built[MANIFEST_FILE];
    const content = built[CONTENT_FILE];

    // Registry page, backed by MDX.
    expect(manifest).toContain("route: '/foundations/color'");
    expect(content).toContain(
      "'/foundations/color': () => import('../../content/foundations/color.mdx')"
    );
    // Unregistered page in a registry section — appended, label from the slug.
    expect(manifest).toContain("route: '/foundations/motion'");
    expect(manifest).toContain("label: 'Motion'");
    // Unregistered section — appended after the registry sections.
    expect(manifest).toContain("slug: 'theming'");
    expect(content).toContain(
      "'/theming/multi-brand': () => import('../_pages/theming/multi-brand')"
    );
    expect(manifest.indexOf("slug: 'foundations'")).toBeLessThan(
      manifest.indexOf("slug: 'theming'")
    );
  });

  it('rejects a page file that is not at {section}/{slug}', async () => {
    const root = writeFixture({
      [REGISTRY_FILE]: FIXTURE_REGISTRY,
      'content/stray.mdx': '# Stray\n',
    });

    await expect(buildPageManifest(root)).rejects.toThrow(
      'content/stray.mdx is not inside a section folder'
    );
  });

  it('rejects a non-page sibling that would invent a route', async () => {
    const root = writeFixture({
      [REGISTRY_FILE]: FIXTURE_REGISTRY,
      'app/_pages/foundations/color.tsx': 'export default function P() {}\n',
      'app/_pages/foundations/color.test.tsx': 'it("x", () => {});\n',
    });

    await expect(buildPageManifest(root)).rejects.toThrow(
      'would route to /foundations/color.test'
    );
  });

  it('rejects a route claimed by two sources', async () => {
    const root = writeFixture({
      [REGISTRY_FILE]: FIXTURE_REGISTRY,
      'content/foundations/color.mdx': '# Color\n',
      'app/_pages/foundations/color.tsx': 'export default function P() {}\n',
    });

    await expect(buildPageManifest(root)).rejects.toThrow(
      'foundations/color resolves to both'
    );
  });

  it('rejects a registry-only page with no wireframe to render', async () => {
    const root = writeFixture({
      [REGISTRY_FILE]: `export const PAGE_REGISTRY = {
  foundations: {
    slug: 'foundations',
    title: 'Foundations',
    href: '/foundations',
    pages: [{ slug: 'color', label: 'Color' }],
  },
} satisfies Record<string, unknown>;
`,
    });

    await expect(buildPageManifest(root)).rejects.toThrow(
      'foundations/color has no page file'
    );
  });

  it('rejects a wireframe left behind by a page that now has a file', async () => {
    const root = writeFixture({
      [REGISTRY_FILE]: `export const PAGE_REGISTRY = {
  foundations: {
    slug: 'foundations',
    title: 'Foundations',
    href: '/foundations',
    pages: [
      { slug: 'color', label: 'Color', wireframe: { lede: '', blocks: [] } },
    ],
  },
} satisfies Record<string, unknown>;
`,
      'content/foundations/color.mdx': '# Color\n',
    });

    await expect(buildPageManifest(root)).rejects.toThrow(
      'foundations/color is written at content/foundations/color.mdx'
    );
  });

  it('rejects a nested label that now has a page of its own', async () => {
    const root = writeFixture({
      [REGISTRY_FILE]: `export const PAGE_REGISTRY = {
  components: {
    slug: 'components',
    title: 'Components',
    href: '/components',
    pages: [
      { slug: 'overlays', label: 'Overlays', nested: ['DropdownMenu'], wireframe: { lede: '', blocks: [] } },
    ],
  },
} satisfies Record<string, unknown>;
`,
      'app/_pages/components/dropdown-menu.tsx':
        'export default function P() {}\n',
    });

    await expect(buildPageManifest(root)).rejects.toThrow(
      '"DropdownMenu" as a nested label under overlays, but components/dropdown-menu is now a page'
    );
  });

  it('rejects a nested label matching a page whose slug reads differently', async () => {
    const root = writeFixture({
      [REGISTRY_FILE]: `export const PAGE_REGISTRY = {
  components: {
    slug: 'components',
    title: 'Components',
    href: '/components',
    pages: [
      { slug: 'menus', label: 'DropdownMenu', wireframe: { lede: '', blocks: [] } },
      { slug: 'overlays', label: 'Overlays', nested: ['DropdownMenu'], wireframe: { lede: '', blocks: [] } },
    ],
  },
} satisfies Record<string, unknown>;
`,
    });

    await expect(buildPageManifest(root)).rejects.toThrow(
      '"DropdownMenu" as a nested label under overlays, but components/menus is now a page'
    );
  });
});
