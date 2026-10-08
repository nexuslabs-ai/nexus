// @ts-check

/**
 * `multi-brand` → `Multi brand`.
 * @param {string} slug
 */
export function humanize(slug) {
  const spaced = slug.replaceAll('-', ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * `input-otp` → `InputOtp`.
 * @param {string} slug
 */
export function pascal(slug) {
  return slug
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
}
