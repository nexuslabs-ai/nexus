import { getBlockDocs, getComponentDocs } from '../../__generated__/demo-index';

import type { ManifestPage } from './manifest';
import { PAGE_LOADERS } from './page-content.generated';
import { plainDescription } from './site';

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

const DESCRIPTION_SOURCE: Record<ManifestPage['kind'], string> = {
  generated: "the stories meta's `docs.description.component`",
  block: "the stories meta's `docs.description.component`",
  mdx: "`export const description = '…'` in the page file",
  component: "`export const description = '…'` in the page file",
};

async function pageDescription(page: ManifestPage) {
  if (page.kind === 'generated') return getComponentDocs(page.slug).description;
  if (page.kind === 'block') return getBlockDocs(page.slug).description;
  return (await loadWrittenPage(page)).description;
}

/** The page's meta description, as one plain-text line. */
export async function describePage(page: ManifestPage): Promise<string> {
  const description = await pageDescription(page);
  if (!description) {
    throw new Error(
      `${page.route} has no description — set ${DESCRIPTION_SOURCE[page.kind]}.`
    );
  }
  return plainDescription(description);
}
