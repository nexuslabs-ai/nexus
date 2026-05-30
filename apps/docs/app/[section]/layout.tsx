import { notFound } from 'next/navigation';

import { SectionLayout } from '../_components/SectionLayout';
import { getSection } from '../_lib/sections';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const sec = getSection(section);
  if (!sec) notFound();
  return <SectionLayout section={sec}>{children}</SectionLayout>;
}
