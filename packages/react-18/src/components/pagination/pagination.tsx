import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { IconChevronLeft, IconChevronRight, IconDots } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { type ButtonProps, buttonVariants } from '../button/button';

/**
 * Props for the Pagination component.
 */
type PaginationProps = React.ComponentProps<'nav'>;

/**
 * Page navigation for lists and tables, in a `navigation` landmark. Your app
 * works out which page numbers to show and owns any page-size control.
 */
const Pagination = React.forwardRef<
  HTMLElement,
  React.PropsWithoutRef<PaginationProps>
>(function Pagination(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<PaginationProps> & {
    ref?: React.ForwardedRef<HTMLElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the PaginationContent component.
 */
type PaginationContentProps = React.ComponentProps<'ul'>;

/**
 * `<ul>` that lays out the pagination items in a row.
 */
const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.PropsWithoutRef<PaginationContentProps>
>(function PaginationContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<PaginationContentProps> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the PaginationItem component.
 */
type PaginationItemProps = React.ComponentProps<'li'>;

/**
 * One `<li>` in the pagination row.
 */
const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.PropsWithoutRef<PaginationItemProps>
>(function PaginationItem(propsWithoutRef, forwardedRef) {
  const props: React.PropsWithoutRef<PaginationItemProps> & {
    ref?: React.ForwardedRef<HTMLLIElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return <li data-slot="pagination-item" {...props} />;
});

/**
 * Props for the PaginationLink component.
 */
interface PaginationLinkProps
  extends React.ComponentProps<'a'>, Pick<ButtonProps, 'size'> {
  /**
   * Marks the link as the current page and sets `aria-current="page"`.
   */
  isActive?: boolean;
  /**
   * Renders the child element, such as a router `Link`, with the link styles.
   * Use it instead of wrapping, which would nest one `<a>` in another.
   */
  asChild?: boolean;
}

/**
 * Page number link styled as a `ghost` button, or `outline` for the current
 * page. Uses the square `icon` size unless you set `size`.
 */
const PaginationLink = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithoutRef<PaginationLinkProps>
>(function PaginationLink(propsWithoutRef, forwardedRef) {
  const {
    className,
    isActive,
    size = 'icon',
    asChild = false,
    ...props
  }: React.PropsWithoutRef<PaginationLinkProps> & {
    ref?: React.ForwardedRef<HTMLAnchorElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the PaginationPrevious component.
 */
type PaginationPreviousProps = React.ComponentProps<typeof PaginationLink>;

/**
 * Link to the previous page, with a left chevron and the label "Previous".
 * With `asChild`, pass a router link that has its own children.
 */
const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithoutRef<PaginationPreviousProps>
>(function PaginationPrevious(propsWithoutRef, forwardedRef) {
  const {
    children,
    ...props
  }: React.PropsWithoutRef<PaginationPreviousProps> & {
    ref?: React.ForwardedRef<HTMLAnchorElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the PaginationNext component.
 */
type PaginationNextProps = React.ComponentProps<typeof PaginationLink>;

/**
 * Link to the next page, with the label "Next" and a right chevron.
 * With `asChild`, pass a router link that has its own children.
 */
const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithoutRef<PaginationNextProps>
>(function PaginationNext(propsWithoutRef, forwardedRef) {
  const {
    children,
    ...props
  }: React.PropsWithoutRef<PaginationNextProps> & {
    ref?: React.ForwardedRef<HTMLAnchorElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the PaginationEllipsis component.
 */
type PaginationEllipsisProps = React.ComponentProps<'span'>;

/**
 * Marker for skipped page numbers. Screen readers skip it.
 */
const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<PaginationEllipsisProps>
>(function PaginationEllipsis(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<PaginationEllipsisProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
