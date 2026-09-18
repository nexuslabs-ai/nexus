import { notFound, redirect } from 'next/navigation';

import { sectionParams, subPageHref } from '../_lib/routes';
import { getDefaultSub, isSectionSlug } from '../_lib/sections';

export function generateStaticParams() {
  return sectionParams();
}

export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSectionSlug(section)) notFound();

  const sub = getDefaultSub(section);
  if (!sub) notFound();

  redirect(subPageHref(section, sub));
}
