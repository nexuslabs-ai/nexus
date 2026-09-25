import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  /**
   * Optional actions shown opposite the title — a button, a toggle group, etc.
   * Wraps below the title on narrow widths.
   */
  children?: ReactNode;
}

/** Module-route header: a large title, a muted description, and optional actions. */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="nx:flex nx:flex-wrap nx:items-start nx:justify-between nx:gap-4">
      <div className="nx:space-y-1">
        <h1 className="nx:typography-heading-large nx:text-foreground">
          {title}
        </h1>
        <p className="nx:text-muted-foreground">{description}</p>
      </div>
      {children ? (
        <div className="nx:flex nx:items-center nx:gap-2">{children}</div>
      ) : null}
    </header>
  );
}
