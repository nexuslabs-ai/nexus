import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';

function PageHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        'nx:@container/page-header nx:flex nx:w-full nx:flex-wrap nx:items-start nx:gap-4',
        className
      )}
      {...props}
    />
  );
}

function PageHeaderContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-content"
      className={cn(
        'nx:min-w-0 nx:basis-full nx:space-y-1 nx:@md/page-header:flex-1',
        className
      )}
      {...props}
    />
  );
}

interface PageHeaderTitleProps extends React.ComponentProps<'h1'> {
  /**
   * Render the title styles on a child element. Use this when the header
   * needs a different heading level in the page outline.
   *
   * @default false
   * @example
   * ```tsx
   * <PageHeaderTitle asChild>
   *   <h2>Notification settings</h2>
   * </PageHeaderTitle>
   * ```
   */
  asChild?: boolean;
}

function PageHeaderTitle({
  asChild = false,
  className,
  ...props
}: PageHeaderTitleProps) {
  const Comp = asChild ? Slot : 'h1';

  return (
    <Comp
      data-slot="page-header-title"
      className={cn(
        'nx:wrap-anywhere nx:typography-heading-medium nx:text-foreground',
        className
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="page-header-description"
      className={cn(
        'nx:wrap-anywhere nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function PageHeaderActions({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn(
        'nx:flex nx:min-w-0 nx:max-w-full nx:basis-full nx:flex-wrap nx:items-center nx:gap-2 nx:@md/page-header:basis-auto',
        className
      )}
      {...props}
    />
  );
}

export {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
};
export type { PageHeaderTitleProps };
