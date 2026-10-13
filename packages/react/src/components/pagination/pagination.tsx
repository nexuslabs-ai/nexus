import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { IconChevronLeft, IconChevronRight, IconDots } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { type ButtonProps, buttonVariants } from '../button';

/**
 * Props for the Pagination component.
 */
interface PaginationProps extends React.ComponentProps<'nav'> {}

/**
 * Page navigation for lists and tables, in a `navigation` landmark. Your app
 * works out which page numbers to show and owns any page-size control.
 *
 * @example
 * ```tsx
 * <Pagination>
 *   <PaginationContent>
 *     <PaginationItem>
 *       <PaginationPrevious href="#" />
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationLink href="#">1</PaginationLink>
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationLink href="#" isActive>
 *         2
 *       </PaginationLink>
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationEllipsis />
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationNext href="#" />
 *     </PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 * ```
 */
function Pagination({ className, ...props }: PaginationProps) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn(
        'nx:mx-auto nx:flex nx:w-full nx:justify-center',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the PaginationContent component.
 */
interface PaginationContentProps extends React.ComponentProps<'ul'> {}

/**
 * `<ul>` that lays out the pagination items in a row.
 */
function PaginationContent({ className, ...props }: PaginationContentProps) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn(
        'nx:m-0 nx:flex nx:list-none nx:flex-row nx:items-center nx:gap-1 nx:p-0',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the PaginationItem component.
 */
interface PaginationItemProps extends React.ComponentProps<'li'> {}

/**
 * One `<li>` in the pagination row.
 */
function PaginationItem(props: PaginationItemProps) {
  return <li data-slot="pagination-item" {...props} />;
}

/**
 * Props for the PaginationLink component.
 */
interface PaginationLinkProps
  extends React.ComponentProps<'a'>, Pick<ButtonProps, 'size'> {
  /**
   * Marks the link as the current page and sets `aria-current="page"`.
   * @default false
   */
  isActive?: boolean;
  /**
   * Renders the child element, such as a router `Link`, with the link styles.
   * Use it instead of wrapping, which would nest one `<a>` in another.
   * @default false
   */
  asChild?: boolean;
}

/**
 * Page number link styled as a `ghost` button, or `outline` for the current
 * page. Uses the square `icon` size unless you set `size`.
 *
 * @example
 * ```tsx
 * <PaginationLink asChild isActive>
 *   <Link href="/items?page=2">2</Link>
 * </PaginationLink>
 * ```
 */
function PaginationLink({
  className,
  isActive,
  size = 'icon',
  asChild = false,
  ...props
}: PaginationLinkProps) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }),
        'nx:typography-label-default',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the PaginationPrevious component.
 */
interface PaginationPreviousProps extends React.ComponentProps<
  typeof PaginationLink
> {}

/**
 * Link to the previous page, with a left chevron and the label "Previous".
 * With `asChild`, pass a router link that has its own children.
 */
function PaginationPrevious({ children, ...props }: PaginationPreviousProps) {
  return (
    <PaginationLink aria-label="Go to previous page" size="default" {...props}>
      {children ?? (
        <>
          <IconChevronLeft />
          <span>Previous</span>
        </>
      )}
    </PaginationLink>
  );
}

/**
 * Props for the PaginationNext component.
 */
interface PaginationNextProps extends React.ComponentProps<
  typeof PaginationLink
> {}

/**
 * Link to the next page, with the label "Next" and a right chevron.
 * With `asChild`, pass a router link that has its own children.
 */
function PaginationNext({ children, ...props }: PaginationNextProps) {
  return (
    <PaginationLink aria-label="Go to next page" size="default" {...props}>
      {children ?? (
        <>
          <span>Next</span>
          <IconChevronRight />
        </>
      )}
    </PaginationLink>
  );
}

/**
 * Props for the PaginationEllipsis component.
 */
interface PaginationEllipsisProps extends React.ComponentProps<'span'> {}

/**
 * Marker for skipped page numbers. Screen readers skip it.
 */
function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        'nx:flex nx:items-center nx:justify-center nx:size-10',
        className
      )}
      {...props}
    >
      <IconDots className="nx:size-4" />
      <span className="nx:sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  type PaginationContentProps,
  PaginationEllipsis,
  type PaginationEllipsisProps,
  PaginationItem,
  type PaginationItemProps,
  PaginationLink,
  type PaginationLinkProps,
  PaginationNext,
  type PaginationNextProps,
  PaginationPrevious,
  type PaginationPreviousProps,
  type PaginationProps,
};
