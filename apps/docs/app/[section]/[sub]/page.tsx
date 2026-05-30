import { notFound } from 'next/navigation';

import { SubPageView } from '../../_components/SubPageView';
import { REAL_PAGES } from '../../_lib/real-pages';
import { getSection, SECTIONS } from '../../_lib/sections';

export function generateStaticParams() {
  return Object.values(SECTIONS).flatMap((section) =>
    section.subs.map((sub) => ({ section: section.slug, sub: sub.slug }))
  );
}

export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ section: string; sub: string }>;
}) {
  const { section, sub } = await params;
  if (!getSection(section)) notFound();
  const Real = REAL_PAGES[`${section}/${sub}`];
  if (Real) return <Real />;
  return <SubPageView sectionSlug={section} subSlug={sub} />;
}
