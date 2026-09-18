import { notFound } from 'next/navigation';

import { SectionLayout } from '../_components/SectionLayout';
import { isSectionSlug } from '../_lib/sections';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSectionSlug(section)) notFound();
  return <SectionLayout sectionSlug={section}>{children}</SectionLayout>;
}
