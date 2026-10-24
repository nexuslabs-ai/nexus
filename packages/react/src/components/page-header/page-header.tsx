import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';

/**
 * Props for the PageHeader component.
 */
type PageHeaderProps = React.ComponentProps<'header'>;

/**
 * Title block of a page or section, with optional description, metadata and
 * primary actions. Actions sit beside the title and wrap below it when space
 * runs out.
 */
function PageHeader({ className, ...props }: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        'nx:flex nx:w-full nx:flex-wrap nx:items-start nx:gap-4',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the PageHeaderContent component.
 */
type PageHeaderContentProps = React.ComponentProps<'div'>;

/**
 * Stack of metadata, title and description. Fills the row and keeps a
 * minimum width, so actions wrap below it instead of squeezing it.
 */
function PageHeaderContent({ className, ...props }: PageHeaderContentProps) {
  return (
    <div
      data-slot="page-header-content"
      className={cn(
        'nx:flex nx:min-w-0 nx:grow nx:basis-xs nx:flex-col nx:gap-1',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the PageHeaderMeta component.
 */
type PageHeaderMetaProps = React.ComponentProps<'p'>;

/**
 * Short line above the title, such as a record ID or parent project.
 */
function PageHeaderMeta({ className, ...props }: PageHeaderMetaProps) {
  return (
    <p
      data-slot="page-header-meta"
      className={cn(
        'nx:m-0 nx:wrap-anywhere nx:typography-label-small nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the PageHeaderTitleRow component.
 */
type PageHeaderTitleRowProps = React.ComponentProps<'div'>;

/**
 * Row that puts a status, such as a Badge, beside the title. The status
 * wraps below the title when space runs out.
 */
function PageHeaderTitleRow({ className, ...props }: PageHeaderTitleRowProps) {
  return (
    <div
      data-slot="page-header-title-row"
      className={cn('nx:flex nx:flex-wrap nx:items-center nx:gap-2', className)}
      {...props}
    />
  );
}

/**
 * Props for the PageHeaderTitle component.
 */
interface PageHeaderTitleProps extends React.ComponentProps<'h1'> {
  /**
   * Renders the child element with the title styles. Use it to change the
   * heading level.
   */
  asChild?: boolean;
}

/**
 * Title of the page or section, rendered as an `h1`. Use `asChild` to change
 * the heading level and `className` to change the size.
 */
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
        'nx:m-0 nx:wrap-anywhere nx:typography-heading-medium nx:text-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the PageHeaderDescription component.
 */
type PageHeaderDescriptionProps = React.ComponentProps<'p'>;

/**
 * Supporting text under the title.
 */
function PageHeaderDescription({
  className,
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p
      data-slot="page-header-description"
      className={cn(
        'nx:m-0 nx:wrap-anywhere nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the PageHeaderActions component.
 */
type PageHeaderActionsProps = React.ComponentProps<'div'>;

/**
 * Primary actions of the page. Buttons wrap onto more lines when they don't
 * fit.
 */
function PageHeaderActions({ className, ...props }: PageHeaderActionsProps) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn(
        'nx:flex nx:min-w-0 nx:max-w-full nx:flex-wrap nx:items-center nx:gap-2',
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
  PageHeaderMeta,
  PageHeaderTitle,
  PageHeaderTitleRow,
};
export type {
  PageHeaderActionsProps,
  PageHeaderContentProps,
  PageHeaderDescriptionProps,
  PageHeaderMetaProps,
  PageHeaderProps,
  PageHeaderTitleProps,
  PageHeaderTitleRowProps,
};
