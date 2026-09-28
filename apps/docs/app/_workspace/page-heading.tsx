import type { ReactNode } from 'react';

export function PageHeading({ children }: { children: ReactNode }) {
  return <h1 className="nx:typography-heading-large">{children}</h1>;
}
