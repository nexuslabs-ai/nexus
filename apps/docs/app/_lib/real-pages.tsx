import type { ComponentType } from 'react';

import { ColorShowcase } from '../_pages/ColorShowcase';
import { Layering } from '../_pages/Layering';
import { MultiBrand } from '../_pages/MultiBrand';
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
  'theming/multi-brand': MultiBrand,
};

/**
 * App Router pages that are intentionally outside the `[section]/[sub]`
 * registry because they need request-time server APIs.
 */
export const SERVER_ROUTE_PAGES = {
  '/appearance-ssr': {
    source: 'apps/docs/app/appearance-ssr/page.tsx',
  },
} as const;
