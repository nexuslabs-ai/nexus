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
