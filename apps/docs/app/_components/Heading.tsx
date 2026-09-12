import { slugify } from '../_lib/table-of-contents';

/**
 * Headings for the hand-built pages and the registry placeholder view.
 *
 * They carry their own slugified `id` so every anchor exists in the server
 * HTML — the same guarantee `rehype-slug` gives MDX pages. That is what lets
 * `#heading` deep links resolve on first paint, and lets the right rail read
 * ids rather than assign them.
 */

export function SectionHeading({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <h2 id={slugify(children)} className={className}>
      {children}
    </h2>
  );
}

export function SubsectionHeading({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <h3 id={slugify(children)} className={className}>
      {children}
    </h3>
  );
}
