import { notFound } from 'next/navigation';

import { Breadcrumb } from '../../_components/Breadcrumb';
import { SubPageView } from '../../_components/SubPageView';
import { MDX_PAGES, REAL_PAGES } from '../../_lib/real-pages';
import { getSection, getSubPage, SECTIONS } from '../../_lib/sections';

export function generateStaticParams() {
  return Object.values(SECTIONS).flatMap((section) =>
    section.subs.map((sub) => ({ section: section.slug, sub: sub.slug }))
  );
}

export const dynamicParams = false;

/**
 * Resolution order for a sub-page: MDX content → hand-built real page →
 * registry placeholder. MDX pages get a route-provided breadcrumb so authors
 * write content only.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ section: string; sub: string }>;
}) {
  const { section, sub } = await params;
  const sec = getSection(section);
  if (!sec) notFound();

  const key = `${section}/${sub}`;

  const mdxLoader = MDX_PAGES[key];
  if (mdxLoader) {
    const { default: Mdx } = await mdxLoader();
    const subPage = getSubPage(section, sub);
    return (
      <>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: sec.title, href: sec.href },
            { label: subPage?.label ?? sub },
          ]}
        />
        <Mdx />
      </>
    );
  }

  const Real = REAL_PAGES[key];
  if (Real) return <Real />;

  return <SubPageView sectionSlug={section} subSlug={sub} />;
}
