import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { type ButtonProps, buttonVariants } from '@/components/ui/button';
import { IconChevronLeft, IconChevronRight, IconDots } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * PaginationProps
 *
 * Props for the Pagination component.
 */
interface PaginationProps extends React.ComponentProps<'nav'> {}

/**
 * Pagination
 *
 * Page navigation for list and table views, wrapped in the `navigation`
 * landmark. Compose with the sub-components: `PaginationContent` lays out a row
 * of `PaginationItem`s, each holding a `PaginationLink` (page number),
 * `PaginationPrevious` / `PaginationNext` (edge controls), or
 * `PaginationEllipsis` (overflow indicator).
 *
 * This is the structural primitive only — page-number generation and any
 * page-size control are the consumer's concern (compose them with `Select` and
 * your own paging state).
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
 * PaginationContentProps
 *
 * Props for the PaginationContent component.
 */
interface PaginationContentProps extends React.ComponentProps<'ul'> {}

/**
 * PaginationContent
 *
 * The `<ul>` that lays the pagination items out in a horizontal row.
 */
function PaginationContent({ className, ...props }: PaginationContentProps) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('nx:flex nx:flex-row nx:items-center nx:gap-1', className)}
      {...props}
    />
  );
}

/**
 * PaginationItemProps
 *
 * Props for the PaginationItem component.
 */
interface PaginationItemProps extends React.ComponentProps<'li'> {}

/**
 * PaginationItem
 *
 * A single `<li>` slot in the pagination row.
 */
function PaginationItem(props: PaginationItemProps) {
  return <li data-slot="pagination-item" {...props} />;
}

/**
 * PaginationLinkProps
 *
 * Props for the PaginationLink component.
 */
interface PaginationLinkProps
  extends React.ComponentProps<'a'>, Pick<ButtonProps, 'size'> {
  /**
   * Marks this link as the current page — applies the `outline` button
   * treatment and sets `aria-current="page"`.
   * @default false
   */
  isActive?: boolean;
  /**
   * Render as the child element via Radix Slot — e.g. a framework router link
   * (`next/link`, TanStack Router `Link`) — keeping the pagination-link
   * styling. The router link renders its own `<a>`, so this avoids the nested
   * `<a><a>` that wrapping would produce.
   * @default false
   */
  asChild?: boolean;
}

/**
 * PaginationLink
 *
 * A page link styled with the button system. The active page uses the
 * `outline` variant; the rest use `ghost`. Defaults to the square `icon` size,
 * suited to single page numbers. Pass `asChild` to route through a framework
 * link instead of the native `<a>`.
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
 * PaginationPreviousProps
 *
 * Props for the PaginationPrevious component.
 */
interface PaginationPreviousProps extends React.ComponentProps<
  typeof PaginationLink
> {}

/**
 * PaginationPrevious
 *
 * The "previous page" edge control — a left chevron and label. Defaults to that
 * content; pass `asChild` with a router link (carrying its own children) to
 * route through it.
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
 * PaginationNextProps
 *
 * Props for the PaginationNext component.
 */
interface PaginationNextProps extends React.ComponentProps<
  typeof PaginationLink
> {}

/**
 * PaginationNext
 *
 * The "next page" edge control — a label and right chevron. Defaults to that
 * content; pass `asChild` with a router link (carrying its own children) to
 * route through it.
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
 * PaginationEllipsisProps
 *
 * Props for the PaginationEllipsis component.
 */
interface PaginationEllipsisProps extends React.ComponentProps<'span'> {}

/**
 * PaginationEllipsis
 *
 * A non-interactive overflow indicator standing in for skipped page numbers.
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
