/**
 * Headings for the hand-built pages and the registry placeholder view.
 *
 * They carry their own slugified `id` so every anchor exists in the server
 * HTML — the same guarantee `rehype-slug` gives MDX pages. That is what lets
 * `#heading` deep links resolve on first paint, and lets the right rail read
 * ids rather than assign them.
 *
 * `slugify` has no collision suffix, so two headings with the same text on one
 * page need an explicit `id` on the second to stay individually linkable.
 */

export function SectionHeading({
  children,
  className,
  id,
}: {
  children: string;
  className?: string;
  /** Overrides the slugified text. Use when two headings share a slug. */
  id?: string;
}) {
  return (
    <h2 id={id ?? slugify(children)} className={className}>
      {children}
    </h2>
  );
}

export function SubsectionHeading({
  children,
  className,
  id,
}: {
  children: string;
  className?: string;
  /** Overrides the slugified text. Use when two headings share a slug. */
  id?: string;
}) {
  return (
    <h3 id={id ?? slugify(children)} className={className}>
      {children}
    </h3>
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}
