import { notFound, redirect } from 'next/navigation';

import { getDefaultSub, getSection, SECTIONS } from '../_lib/sections';

export function generateStaticParams() {
  return Object.keys(SECTIONS).map((section) => ({ section }));
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
