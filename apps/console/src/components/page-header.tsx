import type { ReactNode } from 'react';

import {
  PageHeader as Header,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@nexus_ds/react';

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
    <Header>
      <PageHeaderContent>
        <PageHeaderTitle>{title}</PageHeaderTitle>
        <PageHeaderDescription>{description}</PageHeaderDescription>
      </PageHeaderContent>
      {children ? <PageHeaderActions>{children}</PageHeaderActions> : null}
    </Header>
  );
}
