import { notFound } from 'next/navigation';

import { docsPageParams, findDocsPage } from '../../../_lib/manifest';
import { renderOgImage } from '../../../_lib/og-image';
import { describePage } from '../../../_lib/page-content';

type CardParams = { section: string; card: string };

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams(): CardParams[] {
  return docsPageParams().map(({ section, page }) => ({
    section,
    card: `${page}.png`,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<CardParams> }
) {
  const { section, card } = await params;
  const found = findDocsPage(section, card.replace(/\.png$/, ''));
  if (!found) notFound();
  return renderOgImage({
    eyebrow: found.section.title,
    title: found.page.label,
    description: await describePage(found.page),
  });
}
