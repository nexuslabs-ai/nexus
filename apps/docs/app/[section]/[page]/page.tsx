import { notFound } from 'next/navigation';

import { Breadcrumb } from '../../_components/Breadcrumb';
import { PageWireframeView } from '../../_components/PageWireframeView';
import { getSection, PAGE_MANIFEST } from '../../_lib/manifest';
import { PAGE_LOADERS } from '../../_lib/page-content.generated';

export function generateStaticParams() {
  return PAGE_MANIFEST.flatMap((section) =>
    section.pages.map((page) => ({ section: section.slug, page: page.slug }))
  );
}

export const dynamicParams = false;

/**
 * A page with a source file renders that module; one without renders the
 * wireframe the manifest carries for it. MDX pages get a route-provided
 * breadcrumb so authors write content only — hand-built pages render their own.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ section: string; page: string }>;
}) {
  const { section: sectionSlug, page: pageSlug } = await params;
  const section = getSection(sectionSlug);
  const page = section?.pages.find((entry) => entry.slug === pageSlug);
  if (!section || !page) notFound();

  if (page.kind === 'placeholder') {
    return <PageWireframeView section={section} page={page} />;
  }

  const loadPage = PAGE_LOADERS[page.route];
  if (!loadPage) {
    throw new Error(
      `${page.route} is a ${page.kind} page with no PAGE_LOADERS entry — the manifest and the content module have desynced.`
    );
  }
  const { default: Body } = await loadPage();

  if (page.kind === 'component') return <Body />;

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: section.title, href: section.href },
          { label: page.label },
        ]}
      />
      <Body />
    </>
  );
}
