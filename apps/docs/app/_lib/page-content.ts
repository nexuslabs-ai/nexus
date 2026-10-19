import { getBlockDocs, getComponentDocs } from '../../__generated__/demo-index';

import type { ManifestPage } from './manifest';
import { PAGE_LOADERS } from './page-content.generated';

import 'server-only';

export type WrittenManifestPage = Extract<
  ManifestPage,
  { kind: 'mdx' | 'component' }
>;

export function loadWrittenPage(page: WrittenManifestPage) {
  const loadPage = PAGE_LOADERS[page.route];
  if (!loadPage) {
    throw new Error(
      `${page.route} is a ${page.kind} page with no PAGE_LOADERS entry — run \`pnpm --filter @nexus_ds/docs generate:manifest\` to resync the generated modules.`
    );
  }
  return loadPage();
}

async function pageDescription(page: ManifestPage) {
  if (page.kind === 'generated') return getComponentDocs(page.slug).description;
  if (page.kind === 'block') return getBlockDocs(page.slug).description;
  return (await loadWrittenPage(page)).description;
}

/**
 * The page's meta description as one plain-text line: the first paragraph,
 * without Markdown code spans.
 */
export async function describePage(page: ManifestPage): Promise<string> {
  const description = await pageDescription(page);
  const firstParagraph = description.trim().split(/\n\s*\n/, 1)[0] ?? '';
  return firstParagraph.replaceAll('`', '').replace(/\s+/g, ' ');
}
