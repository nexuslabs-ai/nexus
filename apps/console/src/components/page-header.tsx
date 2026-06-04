import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /**
   * Optional actions shown opposite the title — a button, a toggle group, etc.
   * Wraps below the title on narrow widths.
   */
  children?: ReactNode;
}

/**
 * The standard module-route header: a large title, an optional muted
 * description, and optional right-aligned actions. Every list route shares this
 * shape, so it lives here instead of being hand-rolled per route.
 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="nx:flex nx:flex-wrap nx:items-start nx:justify-between nx:gap-4">
      <div className="nx:space-y-1">
        <h1 className="nx:typography-heading-large nx:text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="nx:text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </header>
  );
}
