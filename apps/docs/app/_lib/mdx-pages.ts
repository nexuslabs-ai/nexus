import type { ComponentType } from 'react';

/**
 * MDX content pages, keyed by `${section}/${sub}`. Lazy thunks so each page
 * code-splits; the dynamic route awaits the import at build time (SSG). Add a
 * page by dropping content/{section}/{sub}.mdx and an entry here.
 *
 * React-free on purpose: `mdx-options.test.ts` imports this registry to assert
 * it maps 1:1 onto content/, which it could not do through `real-pages.tsx`.
 */
export const MDX_PAGES: Record<
  string,
  // eslint-disable-next-line @nexus_ds/no-render-prop-types -- `default: ComponentType` is the shape of a lazily-imported MDX module, not a component-as-prop.
  () => Promise<{ default: ComponentType }>
> = {
  'getting-started/install': () =>
    import('../../content/getting-started/install.mdx'),
  'getting-started/theme-setup': () =>
    import('../../content/getting-started/theme-setup.mdx'),
  'theming/appearance': () => import('../../content/theming/appearance.mdx'),
};
