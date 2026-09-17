/**
 * File extensions App Router treats as a page file. `.mdx` is in the list so a
 * route can be authored as `page.mdx`; it does not affect how the dynamic route
 * imports content, which resolves through the MDX loader.
 *
 * next.config sets it and the route-discovery test reads it, so route authority
 * lives in one place.
 */
export const PAGE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mdx'];
