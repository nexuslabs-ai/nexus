import { renderOgImage } from '../../_lib/og-image';
import { SITE_DESCRIPTION } from '../../_lib/site';

export const dynamic = 'force-static';

export function GET() {
  return renderOgImage({
    eyebrow: 'Theme engine and design system',
    title: 'Design once. Ship every brand.',
    description: SITE_DESCRIPTION,
  });
}
