import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';

/**
 * PageHeaderProps
 *
 * Props for the PageHeader component.
 */
interface PageHeaderProps extends React.ComponentProps<'header'> {}

/**
 * PageHeader
 *
 * The title block of a page or section: a title, an optional description and
 * metadata, and the page's primary actions. Actions sit beside the content
 * while there is room and wrap below it when there is not.
 *
 * @example
 * ```tsx
 * <PageHeader>
 *   <PageHeaderContent>
 *     <PageHeaderTitle>Activity report</PageHeaderTitle>
 *     <PageHeaderDescription>
 *       Review activity for the selected period.
 *     </PageHeaderDescription>
 *   </PageHeaderContent>
 *   <PageHeaderActions>
 *     <Button>Share</Button>
 *   </PageHeaderActions>
 * </PageHeader>
 * ```
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
 * PageHeaderContentProps
 *
 * Props for the PageHeaderContent component.
 */
interface PageHeaderContentProps extends React.ComponentProps<'div'> {}

/**
 * PageHeaderContent
 *
 * Stacks the metadata, title, and description. It grows to fill the row and
 * keeps a minimum width, so actions wrap below it before they squeeze it.
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
 * PageHeaderMetaProps
 *
 * Props for the PageHeaderMeta component.
 */
interface PageHeaderMetaProps extends React.ComponentProps<'p'> {}

/**
 * PageHeaderMeta
 *
 * A short eyebrow line above the title, such as a record ID or parent project.
 */
function PageHeaderMeta({ className, ...props }: PageHeaderMetaProps) {
  return (
    <p
      data-slot="page-header-meta"
      className={cn(
        'nx:wrap-anywhere nx:typography-label-small nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * PageHeaderTitleRowProps
 *
 * Props for the PageHeaderTitleRow component.
 */
interface PageHeaderTitleRowProps extends React.ComponentProps<'div'> {}

/**
 * PageHeaderTitleRow
 *
 * Places inline status, such as a Badge, beside the title and wraps it below
 * the title when the row runs out of space.
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
 * PageHeaderTitleProps
 *
 * Props for the PageHeaderTitle component.
 */
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

/**
 * PageHeaderTitle
 *
 * The page or section title. Renders an `h1` at `heading-medium`; use
 * `asChild` to change the heading level and `className` to change the size.
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
        'nx:wrap-anywhere nx:typography-heading-medium nx:text-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * PageHeaderDescriptionProps
 *
 * Props for the PageHeaderDescription component.
 */
interface PageHeaderDescriptionProps extends React.ComponentProps<'p'> {}

/**
 * PageHeaderDescription
 *
 * Supporting copy beneath the title.
 */
function PageHeaderDescription({
  className,
  ...props
}: PageHeaderDescriptionProps) {
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

/**
 * PageHeaderActionsProps
 *
 * Props for the PageHeaderActions component.
 */
interface PageHeaderActionsProps extends React.ComponentProps<'div'> {}

/**
 * PageHeaderActions
 *
 * The page's primary actions. Buttons wrap within the group when it is
 * narrower than their combined width.
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
