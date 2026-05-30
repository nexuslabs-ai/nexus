import type { ComponentType } from 'react';

import { ColorShowcase } from '../_pages/ColorShowcase';

/**
 * Hand-built "real" pages, keyed by `${section}/${sub}`. The dynamic route
 * renders one of these if present, otherwise falls back to the registry
 * placeholder view (SubPageView). This is the page-by-page migration path:
 * a placeholder becomes real by adding an entry here (or, later, an MDX file).
 */
export const REAL_PAGES: Record<string, ComponentType> = {
  'foundations/color': ColorShowcase,
};
