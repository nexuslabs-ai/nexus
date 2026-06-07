import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { IconChevronRight, IconDots } from '@/lib/icons';
import { cn } from '@/lib/utils';

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
 * page); `BreadcrumbSeparator` divides them and `BreadcrumbEllipsis` stands in
 * for a collapsed middle.
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
 * The `<ol>` that lays the trail out in a horizontal, wrapping row.
 */
function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'nx:flex nx:flex-wrap nx:items-center nx:gap-1.5 nx:wrap-break-word nx:typography-body-small nx:text-muted-foreground',
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
      className={cn('nx:inline-flex nx:items-center nx:gap-1.5', className)}
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
 * A link to an ancestor page. Muted by default, darkening on hover; carries the
 * canonical focus ring since it is reachable by keyboard. Its vertical hit
 * area is expanded for touch without overlapping neighboring breadcrumbs.
 */
function BreadcrumbLink({ asChild, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "nx:relative nx:rounded-sm nx:transition-colors nx:after:absolute nx:after:inset-x-0 nx:after:-inset-y-3 nx:after:content-[''] nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)",
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
 * The current page — non-interactive, announced via `aria-current="page"`.
 */
function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn('nx:text-foreground', className)}
      {...props}
    />
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
 * The divider between items — a right chevron by default; pass `children` to
 * use a different glyph.
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
      className={cn('nx:[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <IconChevronRight />}
    </li>
  );
}

/**
 * BreadcrumbEllipsisProps
 *
 * Props for the BreadcrumbEllipsis component.
 */
interface BreadcrumbEllipsisProps extends React.ComponentProps<'span'> {}

/**
 * BreadcrumbEllipsis
 *
 * Decorative overflow marker for a collapsed run of middle items. If it is
 * wrapped in a real trigger, that trigger must provide its own accessible label.
 */
function BreadcrumbEllipsis({ className, ...props }: BreadcrumbEllipsisProps) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        'nx:flex nx:size-9 nx:items-center nx:justify-center',
        className
      )}
      {...props}
    >
      <IconDots className="nx:size-4" />
    </span>
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
  BreadcrumbPage,
  type BreadcrumbPageProps,
  type BreadcrumbProps,
  BreadcrumbSeparator,
  type BreadcrumbSeparatorProps,
};
