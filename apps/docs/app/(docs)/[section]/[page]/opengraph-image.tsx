import { notFound } from 'next/navigation';

import { docsPageParams, findDocsPage } from '../../../_lib/manifest';
import { OG_IMAGE_SIZE, renderOgImage } from '../../../_lib/og-image';
import { describePage } from '../../../_lib/page-content';
import { SITE_NAME } from '../../../_lib/site';

export const dynamic = 'force-static';
export const generateStaticParams = docsPageParams;
export const alt = `${SITE_NAME} docs page`;
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default async function OpenGraphImage({
  params,
}: {
  params: { section: string; page: string };
}) {
  const found = findDocsPage(params.section, params.page);
  if (!found) notFound();
  return renderOgImage({
    eyebrow: found.section.title,
    title: found.page.label,
    description: await describePage(found.page),
  });
}
