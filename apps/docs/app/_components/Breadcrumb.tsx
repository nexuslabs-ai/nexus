import Link from 'next/link';

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="nx:text-xs nx:text-muted-foreground-subtle nx:mb-3">
      {items.map((item, i) => (
        <span key={i}>
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
          {i < items.length - 1 && <span className="nx:mx-2">›</span>}
        </span>
      ))}
    </nav>
  );
}
