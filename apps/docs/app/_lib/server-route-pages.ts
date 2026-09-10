/**
 * App Router pages that are intentionally outside the `[section]/[sub]`
 * manifest because they need request-time server APIs.
 */
export const SERVER_ROUTE_PAGES = {
  '/appearance-ssr': {
    source: 'apps/docs/app/appearance-ssr/page.tsx',
  },
} as const;
