import { OG_IMAGE_SIZE, renderOgImage } from './_lib/og-image';
import { SITE_DESCRIPTION, SITE_TITLE } from './_lib/site';

export const dynamic = 'force-static';
export const alt = SITE_TITLE;
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return renderOgImage({
    eyebrow: 'Theme engine and design system',
    title: 'Design once. Ship every brand.',
    description: SITE_DESCRIPTION,
  });
}
