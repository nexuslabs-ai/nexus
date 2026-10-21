import type { Metadata } from 'next';

export const SITE_URL = 'https://nexusui.so';
export const SITE_NAME = 'Nexus UI';
export const SITE_ALTERNATE_NAME = 'Nexus Design System';
export const SITE_TITLE = 'Nexus UI — theme engine and design system';
export const SITE_DESCRIPTION =
  'Nexus UI is a framework-agnostic theme engine and design system. Set one appearance object, and every component follows your brand, density and corners.';

export const REPO_URL = 'https://github.com/nexuslabs-ai/nexus';
export const STORYBOOK_URL = 'https://storybook.nexusui.so';
export const NPM_CORE_URL = 'https://www.npmjs.com/package/@nexus_ds/core';

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

function shareImage(url: string, alt: string) {
  return { url, ...OG_IMAGE_SIZE, alt, type: 'image/png' };
}

type ShareImage = ReturnType<typeof shareImage>;

/** The site-wide share card, rendered by `app/og/site.png/route.tsx`. */
export const SITE_IMAGE = shareImage('/og/site.png', SITE_TITLE);

/** A docs page's share card, rendered by `app/og/[section]/[card]/route.tsx`. */
export function docsPageImage(page: { route: string; label: string }) {
  return shareImage(`/og${page.route}.png`, `${page.label} — ${SITE_NAME}`);
}

export const SITE_OPEN_GRAPH = {
  type: 'website',
  siteName: SITE_NAME,
  locale: 'en_US',
} as const;

/**
 * A page's title, description, canonical URL and Open Graph tags. Next replaces
 * the layout's `openGraph` instead of merging it, so this repeats the site-wide
 * fields.
 */
export function pageMetadata({
  title,
  description,
  route,
  image,
}: {
  title: NonNullable<Metadata['title']>;
  description: string;
  route: string;
  image: ShareImage;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: route },
    openGraph: { ...SITE_OPEN_GRAPH, url: route, images: image },
  };
}
