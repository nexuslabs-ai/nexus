/**
 * File extensions App Router treats as a page. `.md`/`.mdx` are in the list so
 * content imported by the dynamic route resolves as a module.
 *
 * next.config sets it and the route-discovery test reads it, so route
 * authority lives in one place.
 */
export const PAGE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'];
