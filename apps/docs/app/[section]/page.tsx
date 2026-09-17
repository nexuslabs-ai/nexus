import { notFound, redirect } from 'next/navigation';

import { sectionParams } from '../_lib/route-params';
import { getDefaultSub, getSection } from '../_lib/sections';

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
  if (!getSection(section)) notFound();
  redirect(`/${section}/${getDefaultSub(section)}`);
}
