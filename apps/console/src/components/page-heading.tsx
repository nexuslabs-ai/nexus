import type { ComponentProps } from 'react';

import { cn } from '@nexus_ds/react/utils';

interface PageHeadingProps extends ComponentProps<'h1'> {
  title: string;
}

function focusHeading(element: HTMLHeadingElement | null) {
  element?.focus({ preventScroll: true });
}

export function PageHeading({
  title,
  children,
  className,
  ...props
}: PageHeadingProps) {
  return (
    <>
      <title>{`${title} · Nexus Console`}</title>
      <h1
        ref={focusHeading}
        tabIndex={-1}
        className={cn('nx:typography-heading-large nx:outline-none', className)}
        {...props}
      >
        {children ?? title}
      </h1>
    </>
  );
}
