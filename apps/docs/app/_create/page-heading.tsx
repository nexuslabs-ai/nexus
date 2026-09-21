import type { ReactNode } from 'react';
export function PageHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return <h1 className="nx:typography-heading-large">{children ?? title}</h1>;
}
