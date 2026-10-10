import { notFound } from 'next/navigation';

import { BlockPage } from '../../../_components/BlockPage';
import { Breadcrumb } from '../../../_components/Breadcrumb';
import { ComponentPage } from '../../../_components/ComponentPage';
import { PageWireframeView } from '../../../_components/PageWireframeView';
import {
  getSection,
  type ManifestPage,
  PAGE_MANIFEST,
} from '../../../_lib/manifest';
import { PAGE_LOADERS } from '../../../_lib/page-content.generated';

export function generateStaticParams() {
  return PAGE_MANIFEST.flatMap((section) =>
    section.pages.map((page) => ({ section: section.slug, page: page.slug }))
  );
}

export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ section: string; page: string }>;
}) {
  const { section: sectionSlug, page: pageSlug } = await params;
  const section = getSection(sectionSlug);
  const page = section?.pages.find((entry) => entry.slug === pageSlug);
  if (!section || !page) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: section.title, href: section.href },
          ...('group' in page ? [{ label: page.group }] : []),
          { label: page.label },
        ]}
      />
      <PageContent page={page} />
    </>
  );
}

function PageContent({ page }: { page: ManifestPage }) {
  if (page.kind === 'placeholder') return <PageWireframeView page={page} />;
  if (page.kind === 'generated') return <ComponentPage page={page} />;
  if (page.kind === 'block') return <BlockPage page={page} />;
  return <WrittenPage page={page} />;
}

async function WrittenPage({
  page,
}: {
  page: Extract<ManifestPage, { kind: 'mdx' | 'component' }>;
}) {
  const loadPage = PAGE_LOADERS[page.route];
  if (!loadPage) {
    throw new Error(
      `${page.route} is a ${page.kind} page with no PAGE_LOADERS entry — run \`pnpm --filter @nexus_ds/docs generate:manifest\` to resync the generated modules.`
    );
  }
  const { default: Body } = await loadPage();
  return <Body />;
}
