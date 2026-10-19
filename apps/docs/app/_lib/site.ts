export const SITE_URL = 'https://nexusui.so';
export const SITE_NAME = 'Nexus UI';
export const SITE_TITLE = 'Nexus UI — theme engine and design system';
export const SITE_DESCRIPTION =
  'Nexus UI is a framework-agnostic theme engine and design system. Set one appearance object, and every component follows your brand, density and corners.';

export const REPO_URL = 'https://github.com/nexuslabs-ai/nexus';
export const STORYBOOK_URL = 'https://storybook.nexusui.so';
export const NPM_CORE_URL = 'https://www.npmjs.com/package/@nexus_ds/core';

/**
 * A docs description as one plain-text line: the first paragraph, without
 * Markdown code spans, so it fits a `<meta name="description">`.
 */
export function plainDescription(text: string): string {
  const firstParagraph = text.trim().split(/\n\s*\n/, 1)[0] ?? '';
  return firstParagraph.replaceAll('`', '').replace(/\s+/g, ' ');
}
