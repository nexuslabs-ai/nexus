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

/**
 * MDX content pages, keyed by `${section}/${sub}`. Lazy thunks so each page
 * code-splits; the dynamic route awaits the import at build time (SSG). Add a
 * page by dropping content/{section}/{sub}.mdx and an entry here.
 */
export const MDX_PAGES: Record<
  string,
  // eslint-disable-next-line @nexus/no-render-prop-types -- `default: ComponentType` is the shape of a lazily-imported MDX module, not a component-as-prop.
  () => Promise<{ default: ComponentType }>
> = {
  'getting-started/install': () =>
    import('../../content/getting-started/install.mdx'),
  'getting-started/theme-setup': () =>
    import('../../content/getting-started/theme-setup.mdx'),
  'theming/appearance': () => import('../../content/theming/appearance.mdx'),
};
