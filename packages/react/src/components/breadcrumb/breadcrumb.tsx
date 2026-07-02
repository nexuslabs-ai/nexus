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
 * Breadcrumb
 *
 * A hierarchical navigation trail wrapped in the `navigation` landmark. Compose
 * with the sub-components: `BreadcrumbList` lays out a row of `BreadcrumbItem`s,
 * each holding a `BreadcrumbLink` (an ancestor) or `BreadcrumbPage` (the current
 * page); `BreadcrumbSeparator` divides them and `BreadcrumbEllipsis` reveals a
 * collapsed middle when composed with a menu.
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
 * BreadcrumbList
 *
 * The `<ol>` that lays the trail out in one horizontal row. When the trail is
 * wider than its container it becomes a keyboard-focusable horizontal scroll
 * region, so the current page can be scrolled into view instead of being clipped.
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
        'nx:flex nx:min-w-0 nx:max-w-full nx:flex-nowrap nx:items-center nx:gap-0.5 nx:overflow-x-auto nx:px-1.5 nx:py-1.5 nx:typography-body-default nx:text-muted-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
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
 * BreadcrumbItem
 *
 * A single `<li>` slot in the trail.
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
   * Render as the child element via Radix Slot — e.g. a router `<Link>` — while
   * keeping the breadcrumb link styling.
   * @default false
   */
  asChild?: boolean;
}

/**
 * BreadcrumbLink
 *
 * A link to an ancestor page. It keeps the canonical focus ring since it is
 * reachable by keyboard. Wrap the label in a `<span>` so it truncates at the
 * 150px cap — both for plain text and when composing an icon with text.
 */
function BreadcrumbLink({ asChild, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        'nx:inline-flex nx:min-w-0 nx:max-w-[150px] nx:items-center nx:gap-1 nx:rounded-md nx:px-1.5 nx:typography-label-default nx:transition-colors nx:hover:bg-background-hover nx:active:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&>span]:min-w-0 nx:[&>span]:truncate nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
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
 * BreadcrumbPage
 *
 * The current page — non-interactive, announced via `aria-current="page"`. Wrap
 * the label in a `<span>` so it truncates at the 150px cap.
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
 * BreadcrumbMenuTrigger
 *
 * An icon button for revealing alternate paths for the adjacent breadcrumb
 * segment. Compose it with `DropdownMenuTrigger asChild`; do not nest it inside
 * a `BreadcrumbLink`.
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
        'nx:inline-flex nx:size-5 nx:shrink-0 nx:relative nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-3 nx:items-center nx:justify-center nx:rounded-md nx:transition-colors nx:hover:bg-background-hover nx:active:bg-background-active nx:data-[state=open]:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
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
 * BreadcrumbSeparator
 *
 * The divider between items — a slash by default; pass `children` to use a
 * different glyph.
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
 * BreadcrumbEllipsis
 *
 * Overflow trigger for a collapsed run of middle items. Compose it with
 * `DropdownMenuTrigger asChild` and put the hidden paths in the menu content.
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
        'nx:inline-flex nx:shrink-0 nx:relative nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-3 nx:items-center nx:justify-center nx:rounded-md nx:px-1.5 nx:typography-body-default nx:transition-colors nx:hover:bg-background-hover nx:active:bg-background-active nx:data-[state=open]:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
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
