import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlockPage } from '../../../_components/BlockPage';
import { Breadcrumb } from '../../../_components/Breadcrumb';
import { ComponentPage } from '../../../_components/ComponentPage';
import {
  docsPageParams,
  findDocsPage,
  type ManifestPage,
} from '../../../_lib/manifest';
import {
  describePage,
  loadWrittenPage,
  type WrittenManifestPage,
} from '../../../_lib/page-content';
import { docsPageImage, pageMetadata } from '../../../_lib/site';

type PageProps = { params: Promise<{ section: string; page: string }> };

export const generateStaticParams = docsPageParams;

export const dynamicParams = false;

async function resolvePage({ params }: PageProps) {
  const { section, page } = await params;
  const found = findDocsPage(section, page);
  if (!found) notFound();
  return found;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { page } = await resolvePage(props);
  return pageMetadata({
    title: page.label,
    description: await describePage(page),
    route: page.route,
    image: docsPageImage(page),
  });
}

export default async function Page(props: PageProps) {
  const { section, page } = await resolvePage(props);

  // The `.md` files are written after `next build`, so `next dev` has none.
  const markdownHref =
    process.env.NODE_ENV === 'production' ? `${page.route}.md` : undefined;

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: section.title, href: section.href },
          ...('group' in page ? [{ label: page.group }] : []),
          { label: page.label },
        ]}
        markdownHref={markdownHref}
      />
      <PageContent page={page} />
    </>
  );
}

function PageContent({ page }: { page: ManifestPage }) {
  if (page.kind === 'generated') return <ComponentPage page={page} />;
  if (page.kind === 'block') return <BlockPage page={page} />;
  return <WrittenPage page={page} />;
}

async function WrittenPage({ page }: { page: WrittenManifestPage }) {
  const { default: Body } = await loadWrittenPage(page);
  return <Body />;
}
