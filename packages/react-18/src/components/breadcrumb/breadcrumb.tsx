import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { IconChevronDown } from '../../lib/icons';
import { cn } from '../../lib/utils';

/**
 * BreadcrumbProps
 *
 * Props for the Breadcrumb component.
 */
type BreadcrumbProps = React.ComponentProps<'nav'>;

/**
 * Navigation trail in a `nav` landmark, showing where the current page sits.
 * Put `BreadcrumbLink` or `BreadcrumbPage` items in a `BreadcrumbList`, divided by `BreadcrumbSeparator`.
 */
const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.PropsWithoutRef<BreadcrumbProps>
>(function Breadcrumb(propsWithoutRef, forwardedRef) {
  const props: React.PropsWithoutRef<BreadcrumbProps> & {
    ref?: React.ForwardedRef<HTMLElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
});

/**
 * BreadcrumbListProps
 *
 * Props for the BreadcrumbList component.
 */
type BreadcrumbListProps = React.ComponentProps<'ol'>;

/**
 * Ordered list that lays out the trail in one row. A trail wider than its container scrolls sideways.
 * The list is focusable, so keyboard users can scroll it.
 */
const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.PropsWithoutRef<BreadcrumbListProps>
>(function BreadcrumbList(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<BreadcrumbListProps> & {
    ref?: React.ForwardedRef<HTMLOListElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ol
      data-slot="breadcrumb-list"
      // The current page is a non-focusable <span>, so the list itself must be
      // keyboard-focusable to scroll an overflowing trail into view (WCAG 2.1.1).
      tabIndex={0}
      className={cn(
        'nx:m-0 nx:flex nx:min-w-0 nx:max-w-full nx:list-none nx:flex-nowrap nx:items-center nx:gap-0.5 nx:overflow-x-auto nx:py-1.5 nx:pr-1.5 nx:pl-0 nx:typography-body-default nx:text-muted-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        className
      )}
      {...props}
    />
  );
});

/**
 * BreadcrumbItemProps
 *
 * Props for the BreadcrumbItem component.
 */
type BreadcrumbItemProps = React.ComponentProps<'li'>;

/**
 * One `<li>` in the trail.
 */
const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.PropsWithoutRef<BreadcrumbItemProps>
>(function BreadcrumbItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<BreadcrumbItemProps> & {
    ref?: React.ForwardedRef<HTMLLIElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn(
        'nx:inline-flex nx:min-w-0 nx:items-center nx:gap-0',
        className
      )}
      {...props}
    />
  );
});

/**
 * BreadcrumbLinkProps
 *
 * Props for the BreadcrumbLink component.
 */
interface BreadcrumbLinkProps extends React.ComponentProps<'a'> {
  /**
   * Renders the child element instead, such as a router `<Link>`.
   */
  asChild?: boolean;
}

/**
 * Link to an ancestor page. Wrap the label in a `<span>` so it truncates at 150px.
 */
const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithoutRef<BreadcrumbLinkProps>
>(function BreadcrumbLink(propsWithoutRef, forwardedRef) {
  const {
    asChild,
    className,
    ...props
  }: React.PropsWithoutRef<BreadcrumbLinkProps> & {
    ref?: React.ForwardedRef<HTMLAnchorElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        'nx:inline-flex nx:min-w-0 nx:max-w-[150px] nx:items-center nx:gap-1 nx:rounded-md nx:px-1.5 nx:text-inherit nx:no-underline nx:typography-label-default nx:transition-control nx:hover:bg-background-hover nx:active:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&>span]:min-w-0 nx:[&>span]:truncate nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      {...props}
    />
  );
});

/**
 * BreadcrumbPageProps
 *
 * Props for the BreadcrumbPage component.
 */
type BreadcrumbPageProps = React.ComponentProps<'span'>;

/**
 * Current page, marked with `aria-current="page"`. Wrap the label in a `<span>` so it truncates at 150px.
 */
const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<BreadcrumbPageProps>
>(function BreadcrumbPage(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<BreadcrumbPageProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(
        'nx:inline-flex nx:min-w-0 nx:max-w-[150px] nx:items-center nx:gap-1 nx:rounded-md nx:px-1.5 nx:typography-label-default nx:text-foreground nx:[&>span]:min-w-0 nx:[&>span]:truncate nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      {...props}
    />
  );
});

/**
 * BreadcrumbMenuTriggerProps
 *
 * Props for the BreadcrumbMenuTrigger component.
 */
type BreadcrumbMenuTriggerProps = React.ComponentProps<'button'>;

/**
 * Icon button that shows alternate paths for the segment beside it.
 * Wrap it in `DropdownMenuTrigger asChild`. Don't nest it inside a `BreadcrumbLink`.
 */
const BreadcrumbMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<BreadcrumbMenuTriggerProps>
>(function BreadcrumbMenuTrigger(propsWithoutRef, forwardedRef) {
  const {
    children,
    className,
    ref,
    type = 'button',
    'aria-label': ariaLabel = 'Show alternate paths',
    ...props
  }: React.PropsWithoutRef<BreadcrumbMenuTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <button
      ref={ref}
      data-slot="breadcrumb-menu-trigger"
      type={type}
      aria-label={ariaLabel}
      className={cn(
        'nx:inline-flex nx:size-5 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-transparent nx:p-0 nx:text-inherit nx:transition-control nx:hover:bg-background-hover nx:active:bg-background-active nx:data-[state=open]:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      {...props}
    >
      {children ?? <IconChevronDown aria-hidden="true" />}
    </button>
  );
});

/**
 * BreadcrumbSeparatorProps
 *
 * Props for the BreadcrumbSeparator component.
 */
type BreadcrumbSeparatorProps = React.ComponentProps<'li'>;

/**
 * Divider between items, a slash by default. Pass `children` for a different glyph.
 */
const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  React.PropsWithoutRef<BreadcrumbSeparatorProps>
>(function BreadcrumbSeparator(propsWithoutRef, forwardedRef) {
  const {
    children,
    className,
    ...props
  }: React.PropsWithoutRef<BreadcrumbSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLLIElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        'nx:inline-flex nx:shrink-0 nx:items-center nx:typography-body-default nx:text-muted-foreground nx:[&>svg]:size-3.5',
        className
      )}
      {...props}
    >
      {children ?? '/'}
    </li>
  );
});

/**
 * BreadcrumbEllipsisProps
 *
 * Props for the BreadcrumbEllipsis component.
 */
type BreadcrumbEllipsisProps = React.ComponentProps<'button'>;

/**
 * Button that stands in for collapsed middle items.
 * Wrap it in `DropdownMenuTrigger asChild` and list the hidden pages in the menu.
 */
const BreadcrumbEllipsis = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<BreadcrumbEllipsisProps>
>(function BreadcrumbEllipsis(propsWithoutRef, forwardedRef) {
  const {
    className,
    ref,
    type = 'button',
    'aria-label': ariaLabel = 'Show hidden breadcrumbs',
    ...props
  }: React.PropsWithoutRef<BreadcrumbEllipsisProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <button
      ref={ref}
      data-slot="breadcrumb-ellipsis"
      type={type}
      aria-label={ariaLabel}
      className={cn(
        'nx:inline-flex nx:shrink-0 nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-transparent nx:px-1.5 nx:py-0 nx:text-inherit nx:typography-body-default nx:transition-control nx:hover:bg-background-hover nx:active:bg-background-active nx:data-[state=open]:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        className
      )}
      {...props}
    >
      ...
    </button>
  );
});

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  type BreadcrumbEllipsisProps,
  BreadcrumbItem,
  type BreadcrumbItemProps,
  BreadcrumbLink,
  type BreadcrumbLinkProps,
  BreadcrumbList,
  type BreadcrumbListProps,
  BreadcrumbMenuTrigger,
  type BreadcrumbMenuTriggerProps,
  BreadcrumbPage,
  type BreadcrumbPageProps,
  type BreadcrumbProps,
  BreadcrumbSeparator,
  type BreadcrumbSeparatorProps,
};
