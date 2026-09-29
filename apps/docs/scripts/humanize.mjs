// @ts-check

/**
 * `multi-brand` → `Multi brand`.
 * @param {string} slug
 */
export function humanize(slug) {
  const spaced = slug.replaceAll('-', ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
