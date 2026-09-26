export const PAGE_HEADING_CLASS = 'nx:typography-heading-large nx:mb-2';
export const SECTION_HEADING_CLASS =
  'nx:typography-heading-small nx:mt-8 nx:mb-3';
export const SUBSECTION_HEADING_CLASS =
  'nx:typography-label-default nx:font-semibold nx:mt-6 nx:mb-2';

type HeadingProps = {
  children: string;
  className?: string;
  /** Overrides the slugified text. Use when two headings share a slug. */
  id?: string;
};

export function SectionHeading({ children, className, id }: HeadingProps) {
  return (
    <h2 id={id ?? slugify(children)} className={className}>
      {children}
    </h2>
  );
}

export function SubsectionHeading({ children, className, id }: HeadingProps) {
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
