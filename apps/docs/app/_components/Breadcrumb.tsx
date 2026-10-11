import Link from 'next/link';

export function Breadcrumb({
  items,
  markdownHref,
}: {
  items: { label: string; href?: string }[];
  /** The page's Markdown twin, written by `scripts/write-markdown.mjs` at build time. */
  markdownHref?: string;
}) {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-baseline nx:gap-x-4 nx:typography-label-small nx:text-muted-foreground-subtle nx:mb-3">
      <nav aria-label="Breadcrumb" className="nx:me-auto">
        {items.map((item, i) => (
          <Crumb key={i} item={item} last={i === items.length - 1} />
        ))}
      </nav>
      {markdownHref && (
        <a
          href={markdownHref}
          data-md-skip
          className="nx:text-muted-foreground-subtle nx:no-underline nx:hover:text-muted-foreground"
        >
          View as Markdown
        </a>
      )}
    </div>
  );
}

function Crumb({
  item,
  last,
}: {
  item: { label: string; href?: string };
  last: boolean;
}) {
  return (
    <span>
      {item.href ? (
        <Link
          href={item.href}
          className="nx:text-muted-foreground-subtle nx:no-underline nx:hover:text-muted-foreground"
        >
          {item.label}
        </Link>
      ) : (
        <span>{item.label}</span>
      )}
      {!last && <span className="nx:mx-2">›</span>}
    </span>
  );
}
