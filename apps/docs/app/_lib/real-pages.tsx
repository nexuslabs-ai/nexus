import type { ComponentType } from 'react';

import { ColorShowcase } from '../_pages/ColorShowcase';
import { Layering } from '../_pages/Layering';
import { Radius } from '../_pages/Radius';
import { Responsive } from '../_pages/Responsive';
import { Spacing } from '../_pages/Spacing';
import { Typography } from '../_pages/Typography';

/**
 * Hand-built "real" pages, keyed by `${section}/${sub}`. The dynamic route
 * renders one of these if present, otherwise falls back to the registry
 * placeholder view (SubPageView). This is the page-by-page migration path:
 * a placeholder becomes real by adding an entry here (or, later, an MDX file).
 */
export const REAL_PAGES: Record<string, ComponentType> = {
  'foundations/color': ColorShowcase,
  'foundations/typography': Typography,
  'foundations/spacing': Spacing,
  'foundations/radius': Radius,
  'foundations/layering': Layering,
  'foundations/responsive': Responsive,
};

/**
 * MDX content pages, keyed by `${section}/${sub}`. Lazy thunks so each page
 * code-splits; the dynamic route awaits the import at build time (SSG). Add a
 * page by dropping content/{section}/{sub}.mdx and an entry here.
 */
export const MDX_PAGES: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  'getting-started/install': () =>
    import('../../content/getting-started/install.mdx'),
};
