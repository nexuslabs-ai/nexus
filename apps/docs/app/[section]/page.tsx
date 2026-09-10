import { notFound, redirect } from 'next/navigation';

import { getSection } from '../_lib/manifest';
import { PAGE_MANIFEST } from '../_lib/page-manifest.generated';

export function generateStaticParams() {
  return PAGE_MANIFEST.map((section) => ({ section: section.slug }));
}

export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const first = getSection(section)?.pages[0];
  if (!first) notFound();
  redirect(first.route);
}
