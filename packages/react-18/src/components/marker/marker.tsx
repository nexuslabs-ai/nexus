import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const markerVariants = cva(
  "nx:group/marker nx:m-0 nx:flex nx:border-0 nx:bg-transparent nx:p-0 nx:no-underline nx:min-h-4 nx:items-center nx:gap-2 nx:text-left nx:typography-body-small nx:text-muted-foreground nx:transition-control nx:duration-faster nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:aria-disabled:pointer-events-none nx:aria-disabled:text-disabled-foreground nx:[&_svg:not([class*='size-'])]:size-4 nx:[&_svg]:shrink-0 nx:[a]:hover:text-foreground nx:[button]:cursor-pointer nx:[button]:hover:text-foreground",
  {
    variants: {
      variant: {
        default: '',
        separator:
          'nx:w-full nx:before:mr-1 nx:before:h-px nx:before:flex-1 nx:before:bg-border-default nx:after:ml-1 nx:after:h-px nx:after:flex-1 nx:after:bg-border-default',
        border: 'nx:border-b-default nx:border-border-default nx:pb-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Props for the Marker component.
 */
interface MarkerProps
  extends React.ComponentProps<'div'>, VariantProps<typeof markerVariants> {
  /**
   * Renders the child element, such as a heading, link or button, with Marker
   * styles. A link or button child gets hover styles with no extra classes. A
   * `disabled` or `aria-disabled` child ignores the pointer and dims.
   */
  asChild?: boolean;
}

/**
 * Quiet annotation row with an optional icon, for lists, feeds and message
 * streams. `separator` centers the label between two rules, and `border` adds
 * a rule underneath. For a decorative rule with no label, use `Separator`.
 */
const Marker = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MarkerProps>
>(function Marker(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'default',
    asChild = false,
    ...props
  }: React.PropsWithoutRef<MarkerProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="marker"
      data-variant={variant}
      className={cn(markerVariants({ variant }), className)}
      {...props}
    />
  );
});

/**
 * Props for the MarkerIcon component.
 */
type MarkerIconProps = React.ComponentProps<'span'>;

/**
 * Decorative leading icon. Screen readers skip it, so put the meaning in
 * `MarkerContent`.
 */
const MarkerIcon = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<MarkerIconProps>
>(function MarkerIcon(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<MarkerIconProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the MarkerContent component.
 */
type MarkerContentProps = React.ComponentProps<'span'>;

/**
 * Label text of the Marker. With `variant="separator"`, the text centers
 * between the two rules.
 */
const MarkerContent = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<MarkerContentProps>
>(function MarkerContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<MarkerContentProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <span
      data-slot="marker-content"
      className={cn(
        'nx:min-w-0 nx:wrap-break-word nx:[&>a]:text-inherit nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground nx:group-data-[variant=separator]/marker:text-center',
        className
      )}
      {...props}
    />
  );
});

export {
  Marker,
  MarkerContent,
  type MarkerContentProps,
  MarkerIcon,
  type MarkerIconProps,
  type MarkerProps,
  markerVariants,
};
