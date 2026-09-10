import { notFound } from 'next/navigation';

import { Breadcrumb } from '../../_components/Breadcrumb';
import { PageWireframeView } from '../../_components/PageWireframeView';
import { getPage, getSection } from '../../_lib/manifest';
import { PAGE_LOADERS } from '../../_lib/page-content.generated';
import { PAGE_MANIFEST } from '../../_lib/page-manifest.generated';

export function generateStaticParams() {
  return PAGE_MANIFEST.flatMap((section) =>
    section.pages.map((page) => ({ section: section.slug, sub: page.slug }))
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
  params: Promise<{ section: string; sub: string }>;
}) {
  const { section, sub } = await params;
  const sec = getSection(section);
  const page = getPage(section, sub);
  if (!sec || !page) notFound();

  if (page.kind === 'placeholder') {
    return <PageWireframeView section={sec} page={page} />;
  }

  const loadPage = PAGE_LOADERS[page.route];
  if (!loadPage) notFound();
  const { default: Body } = await loadPage();

  if (page.kind === 'component') return <Body />;

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: sec.title, href: sec.href },
          { label: page.label },
        ]}
      />
      <Body />
    </>
  );
}
