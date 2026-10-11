import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { IconChevronDown } from '../../lib/icons';
import { cn } from '../../lib/utils';

/**
 * BreadcrumbProps
 *
 * Props for the Breadcrumb component.
 */
interface BreadcrumbProps extends React.ComponentProps<'nav'> {}

/**
 * Navigation trail in a `nav` landmark, showing where the current page sits.
 * Put `BreadcrumbLink` or `BreadcrumbPage` items in a `BreadcrumbList`, divided by `BreadcrumbSeparator`.
 *
 * @example
 * ```tsx
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Contacts</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 * ```
 */
function Breadcrumb(props: BreadcrumbProps) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * BreadcrumbListProps
 *
 * Props for the BreadcrumbList component.
 */
interface BreadcrumbListProps extends React.ComponentProps<'ol'> {}

/**
 * Ordered list that lays out the trail in one row. A trail wider than its container scrolls sideways, with keyboard focus.
 */
function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      data-slot="breadcrumb-list"
      // The current page is a non-focusable <span>, so the list itself must be
      // keyboard-focusable to scroll an overflowing trail into view (WCAG 2.1.1).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={cn(
        'nx:flex nx:min-w-0 nx:max-w-full nx:flex-nowrap nx:items-center nx:gap-0.5 nx:overflow-x-auto nx:py-1.5 nx:pr-1.5 nx:typography-body-default nx:text-muted-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        className
      )}
      {...props}
    />
  );
}

/**
 * BreadcrumbItemProps
 *
 * Props for the BreadcrumbItem component.
 */
interface BreadcrumbItemProps extends React.ComponentProps<'li'> {}

/**
 * One `<li>` in the trail.
 */
function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
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
}

/**
 * BreadcrumbLinkProps
 *
 * Props for the BreadcrumbLink component.
 */
interface BreadcrumbLinkProps extends React.ComponentProps<'a'> {
  /**
   * Renders the child element instead, such as a router `<Link>`.
   * @default false
   */
  asChild?: boolean;
}

/**
 * Link to an ancestor page. Wrap the label in a `<span>` so it truncates at 150px.
 */
function BreadcrumbLink({ asChild, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        'nx:inline-flex nx:min-w-0 nx:max-w-[150px] nx:items-center nx:gap-1 nx:rounded-md nx:px-1.5 nx:typography-label-default nx:transition-control nx:hover:bg-background-hover nx:active:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&>span]:min-w-0 nx:[&>span]:truncate nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      {...props}
    />
  );
}

/**
 * BreadcrumbPageProps
 *
 * Props for the BreadcrumbPage component.
 */
interface BreadcrumbPageProps extends React.ComponentProps<'span'> {}

/**
 * Current page, marked with `aria-current="page"`. Wrap the label in a `<span>` so it truncates at 150px.
 */
function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
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
}

/**
 * BreadcrumbMenuTriggerProps
 *
 * Props for the BreadcrumbMenuTrigger component.
 */
interface BreadcrumbMenuTriggerProps extends React.ComponentProps<'button'> {}

/**
 * Icon button that shows alternate paths for the segment beside it.
 * Wrap it in `DropdownMenuTrigger asChild`. Don't nest it inside a `BreadcrumbLink`.
 */
function BreadcrumbMenuTrigger({
  children,
  className,
  ref,
  type = 'button',
  'aria-label': ariaLabel = 'Show alternate paths',
  ...props
}: BreadcrumbMenuTriggerProps) {
  return (
    <button
      ref={ref}
      data-slot="breadcrumb-menu-trigger"
      type={type}
      aria-label={ariaLabel}
      className={cn(
        'nx:inline-flex nx:size-5 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-md nx:transition-control nx:hover:bg-background-hover nx:active:bg-background-active nx:data-[state=open]:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      {...props}
    >
      {children ?? <IconChevronDown aria-hidden="true" />}
    </button>
  );
}

/**
 * BreadcrumbSeparatorProps
 *
 * Props for the BreadcrumbSeparator component.
 */
interface BreadcrumbSeparatorProps extends React.ComponentProps<'li'> {}

/**
 * Divider between items, a slash by default. Pass `children` for a different glyph.
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: BreadcrumbSeparatorProps) {
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
}

/**
 * BreadcrumbEllipsisProps
 *
 * Props for the BreadcrumbEllipsis component.
 */
interface BreadcrumbEllipsisProps extends React.ComponentProps<'button'> {}

/**
 * Button that stands in for collapsed middle items.
 * Wrap it in `DropdownMenuTrigger asChild` and list the hidden pages in the menu.
 */
function BreadcrumbEllipsis({
  className,
  ref,
  type = 'button',
  'aria-label': ariaLabel = 'Show hidden breadcrumbs',
  ...props
}: BreadcrumbEllipsisProps) {
  return (
    <button
      ref={ref}
      data-slot="breadcrumb-ellipsis"
      type={type}
      aria-label={ariaLabel}
      className={cn(
        'nx:inline-flex nx:shrink-0 nx:items-center nx:justify-center nx:rounded-md nx:px-1.5 nx:typography-body-default nx:transition-control nx:hover:bg-background-hover nx:active:bg-background-active nx:data-[state=open]:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        className
      )}
      {...props}
    >
      ...
    </button>
  );
}

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
