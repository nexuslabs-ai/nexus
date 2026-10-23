/** `multi-brand` → `Multi brand`. */
export function humanize(slug: string) {
  const spaced = slug.replaceAll('-', ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** `input-otp` → `InputOtp`. */
export function pascal(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
