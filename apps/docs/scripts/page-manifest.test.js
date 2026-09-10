import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { PAGE_MANIFEST } from '../app/_lib/page-manifest.generated';
import { MDX_PAGES, REAL_PAGES } from '../app/_lib/real-pages';
import { SECTIONS } from '../app/_lib/sections';

import { buildPageManifest, MANIFEST_FILE } from './page-manifest.mjs';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const pages = PAGE_MANIFEST.flatMap((section) => section.pages);
const routesOfKind = (kind) =>
  pages.filter((page) => page.kind === kind).map((page) => page.route);

/**
 * Writes a throwaway docs tree — a section registry plus page files — so the
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

const FIXTURE_REGISTRY = `export const SECTIONS = {
  foundations: {
    slug: 'foundations',
    title: 'Foundations',
    href: '/foundations',
    subs: [{ slug: 'color', label: 'Color', lede: '', blocks: [] }],
  },
} satisfies Record<string, unknown>;
`;

describe('page manifest', () => {
  it('lists every section in registry order', () => {
    expect(PAGE_MANIFEST.map((section) => section.slug)).toEqual(
      Object.keys(SECTIONS)
    );
    expect(PAGE_MANIFEST.map((section) => section.order)).toEqual(
      PAGE_MANIFEST.map((_, index) => index)
    );
  });

  it('lists every registry page, with its label and position', () => {
    const expected = Object.values(SECTIONS).flatMap((section) =>
      section.subs.map((sub, index) => ({
        route: `/${section.slug}/${sub.slug}`,
        label: sub.label,
        order: index,
      }))
    );

    expect(
      pages.map(({ route, label, order }) => ({ route, label, order }))
    ).toEqual(expected);
  });

  it('resolves MDX and hand-built pages to their source files', () => {
    expect(routesOfKind('mdx')).toEqual(
      Object.keys(MDX_PAGES).map((key) => `/${key}`)
    );
    expect(routesOfKind('component')).toEqual(
      Object.keys(REAL_PAGES).map((key) => `/${key}`)
    );

    for (const page of pages) {
      if (page.kind === 'placeholder') {
        expect(page.file).toBeNull();
        expect(page.load).toBeNull();
      } else {
        expect(fs.existsSync(path.join(docsRoot, page.file))).toBe(true);
        expect(page.load).toBeTypeOf('function');
      }
    }
  });

  it('is checked in current, and rebuilds byte-identically', async () => {
    const committed = fs.readFileSync(
      path.join(docsRoot, MANIFEST_FILE),
      'utf8'
    );
    const first = await buildPageManifest(docsRoot);
    const second = await buildPageManifest(docsRoot);

    expect(first).toBe(committed);
    expect(second).toBe(first);
  });

  it('picks up a page added on disk with no hand-editing', async () => {
    const root = writeFixture({
      'app/_lib/sections.ts': FIXTURE_REGISTRY,
      'content/foundations/color.mdx': '# Color\n',
      'content/foundations/motion.mdx': '# Motion\n',
      'app/_pages/theming/multi-brand.tsx': 'export default function P() {}\n',
    });

    // A throwaway root has no prettier config to resolve, so the emitted
    // quotes are prettier's double-quote default rather than the repo's.
    const source = (await buildPageManifest(root)).replaceAll('"', "'");

    // Registry page, backed by MDX.
    expect(source).toContain("route: '/foundations/color'");
    expect(source).toContain(
      "load: () => import('../../content/foundations/color.mdx')"
    );
    // Unregistered page in a registry section — appended, label from the slug.
    expect(source).toContain("route: '/foundations/motion'");
    expect(source).toContain("label: 'Motion'");
    // Unregistered section — appended after the registry sections.
    expect(source).toContain("slug: 'theming'");
    expect(source).toContain(
      "load: () => import('../_pages/theming/multi-brand')"
    );
    expect(source.indexOf("slug: 'foundations'")).toBeLessThan(
      source.indexOf("slug: 'theming'")
    );
  });

  it('rejects a page file that is not at {section}/{slug}', async () => {
    const root = writeFixture({
      'app/_lib/sections.ts': FIXTURE_REGISTRY,
      'content/stray.mdx': '# Stray\n',
    });

    await expect(buildPageManifest(root)).rejects.toThrow(
      'content/stray.mdx is not inside a section folder'
    );
  });
});
