import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const markerVariants = cva(
  "nx:group/marker nx:flex nx:min-h-4 nx:items-center nx:gap-2 nx:text-left nx:typography-body-small nx:text-muted-foreground nx:transition-colors nx:duration-faster nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&_svg:not([class*='size-'])]:size-4 nx:[&_svg]:shrink-0 nx:[&_a]:underline nx:[&_a]:underline-offset-4 nx:[&_a:hover]:text-primary-subtle-foreground nx:[a]:hover:text-foreground nx:[button]:hover:text-foreground",
  {
    variants: {
      variant: {
        default: '',
        separator:
          'nx:w-full nx:before:mr-1 nx:before:h-px nx:before:min-w-0 nx:before:flex-1 nx:before:bg-border-default nx:after:ml-1 nx:after:h-px nx:after:min-w-0 nx:after:flex-1 nx:after:bg-border-default',
        border: 'nx:border-b-default nx:border-border-default nx:pb-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * MarkerProps
 *
 * Props for the Marker component.
 */
interface MarkerProps
  extends React.ComponentProps<'div'>, VariantProps<typeof markerVariants> {
  /**
   * Render as the child element instead of a `div`, merging Marker's styles
   * onto it. Use when the annotation needs different semantics — a heading for
   * a labelled section, or a link / button for an actionable row.
   *
   * An `a` or `button` child is answered by the row itself — it picks up the
   * hover treatment and the design-system focus ring, so an interactive row
   * needs no extra classes at the call site.
   *
   * @default false
   * @example
   * ```tsx
   * <Marker asChild>
   *   <h3>Yesterday</h3>
   * </Marker>
   * ```
   */
  asChild?: boolean;
}

/**
 * Marker
 *
 * A low-emphasis annotation row for lists, feeds, and message streams — an
 * optional icon plus muted text. `variant="separator"` centres the label
 * between two rules; `variant="border"` rests the row above a bottom rule.
 *
 * The label stays real text in reading order, so it is announced where it
 * appears. For a purely decorative rule with no label, use `Separator`.
 *
 * @example
 * ```tsx
 * <Marker variant="separator">
 *   <MarkerContent>Today</MarkerContent>
 * </Marker>
 * ```
 *
 * @example
 * ```tsx
 * <Marker>
 *   <MarkerIcon>
 *     <PencilIcon />
 *   </MarkerIcon>
 *   <MarkerContent>Edited 2 minutes ago</MarkerContent>
 * </Marker>
 * ```
 */
function Marker({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: MarkerProps) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="marker"
      data-variant={variant}
      className={cn(markerVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * MarkerIconProps
 *
 * Props for the MarkerIcon component.
 */
interface MarkerIconProps extends React.ComponentProps<'span'> {}

/**
 * MarkerIcon
 *
 * Decorative leading icon for a Marker. Hidden from assistive tech — the
 * meaning belongs in `MarkerContent`.
 */
function MarkerIcon({ className, ...props }: MarkerIconProps) {
  return (
    <span
      data-slot="marker-icon"
      aria-hidden="true"
      className={cn(
        'nx:inline-flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center',
        className
      )}
      {...props}
    />
  );
}

/**
 * MarkerContentProps
 *
 * Props for the MarkerContent component.
 */
interface MarkerContentProps extends React.ComponentProps<'span'> {}

/**
 * MarkerContent
 *
 * The Marker's label. Under `variant="separator"` its text centres while the
 * two rules take the remaining space.
 */
function MarkerContent({ className, ...props }: MarkerContentProps) {
  return (
    <span
      data-slot="marker-content"
      className={cn(
        'nx:min-w-0 nx:wrap-break-word nx:group-data-[variant=separator]/marker:text-center',
        className
      )}
      {...props}
    />
  );
}

export {
  Marker,
  MarkerContent,
  type MarkerContentProps,
  MarkerIcon,
  type MarkerIconProps,
  type MarkerProps,
  markerVariants,
};
