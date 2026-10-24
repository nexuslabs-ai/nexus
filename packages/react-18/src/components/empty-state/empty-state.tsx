import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * EmptyStateProps
 *
 * Props for the EmptyState component.
 */
interface EmptyStateProps extends React.ComponentProps<'div'> {
  /**
   * Adds a dashed frame. Match a bordered skeleton so swapping from loading
   * doesn't shift the layout.
   */
  bordered?: boolean;
}

/**
 * A centered message for a list, table or record view with no content yet.
 * Shows an icon, a title, a short description and an optional action.
 */
const EmptyState = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<EmptyStateProps>
>(function EmptyState(propsWithoutRef, forwardedRef) {
  const {
    className,
    bordered = false,
    ...props
  }: React.PropsWithoutRef<EmptyStateProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="empty-state"
      data-bordered={bordered || undefined}
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:items-center nx:justify-center nx:gap-6 nx:rounded-lg nx:bg-muted-extralight nx:p-6 nx:text-center nx:text-balance',
        bordered &&
          'nx:border-default nx:border-dashed nx:border-border-default',
        className
      )}
      {...props}
    />
  );
});

/**
 * EmptyStateHeaderProps
 *
 * Props for the EmptyStateHeader component.
 */
type EmptyStateHeaderProps = React.ComponentProps<'div'>;

/**
 * Groups the media, title and description in a narrow centered column.
 */
const EmptyStateHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<EmptyStateHeaderProps>
>(function EmptyStateHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<EmptyStateHeaderProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="empty-state-header"
      className={cn(
        'nx:flex nx:max-w-sm nx:flex-col nx:items-center nx:gap-2',
        className
      )}
      {...props}
    />
  );
});

const emptyStateMediaVariants = cva(
  'nx:mb-2 nx:flex nx:shrink-0 nx:items-center nx:justify-center nx:[&_svg]:pointer-events-none nx:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: '',
        icon: 'nx:size-10 nx:rounded-lg nx:bg-muted nx:text-foreground nx:[&_svg]:size-6',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * EmptyStateMediaProps
 *
 * Props for the EmptyStateMedia component.
 */
type EmptyStateMediaProps = React.ComponentProps<'div'> &
  VariantProps<typeof emptyStateMediaVariants>;

/**
 * Holds the icon or illustration. The `icon` variant puts one icon on a muted
 * rounded tile. The `default` variant is an unstyled wrapper for a larger image.
 */
const EmptyStateMedia = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<EmptyStateMediaProps>
>(function EmptyStateMedia(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'default',
    ...props
  }: React.PropsWithoutRef<EmptyStateMediaProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="empty-state-media"
      data-variant={variant}
      className={cn(emptyStateMediaVariants({ variant }), className)}
      {...props}
    />
  );
});

/**
 * EmptyStateTitleProps
 *
 * Props for the EmptyStateTitle component.
 */
interface EmptyStateTitleProps extends React.ComponentProps<'div'> {
  /**
   * Applies the title styles to a child element, such as an `h2` heading.
   */
  asChild?: boolean;
}

/**
 * The headline that says what is missing. Renders a `div`, so use `asChild`
 * when the page outline needs a real heading.
 */
const EmptyStateTitle = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<EmptyStateTitleProps>
>(function EmptyStateTitle(propsWithoutRef, forwardedRef) {
  const {
    asChild = false,
    className,
    ...props
  }: React.PropsWithoutRef<EmptyStateTitleProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="empty-state-title"
      className={cn('nx:m-0 nx:typography-heading-xxsmall', className)}
      {...props}
    />
  );
});

/**
 * EmptyStateDescriptionProps
 *
 * Props for the EmptyStateDescription component.
 */
type EmptyStateDescriptionProps = React.ComponentProps<'p'>;

/**
 * Supporting text under the title. Links inside it are underlined.
 */
const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<EmptyStateDescriptionProps>
>(function EmptyStateDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<EmptyStateDescriptionProps> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <p
      data-slot="empty-state-description"
      className={cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground nx:[&>a]:text-inherit nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground',
        className
      )}
      {...props}
    />
  );
});

/**
 * EmptyStateContentProps
 *
 * Props for the EmptyStateContent component.
 */
type EmptyStateContentProps = React.ComponentProps<'div'>;

/**
 * The action area under the header, usually one or two buttons.
 */
const EmptyStateContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<EmptyStateContentProps>
>(function EmptyStateContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<EmptyStateContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="empty-state-content"
      className={cn(
        'nx:flex nx:w-full nx:max-w-sm nx:min-w-0 nx:flex-col nx:items-center nx:gap-4',
        className
      )}
      {...props}
    />
  );
});

export {
  EmptyState,
  EmptyStateContent,
  type EmptyStateContentProps,
  EmptyStateDescription,
  type EmptyStateDescriptionProps,
  EmptyStateHeader,
  type EmptyStateHeaderProps,
  EmptyStateMedia,
  type EmptyStateMediaProps,
  emptyStateMediaVariants,
  type EmptyStateProps,
  EmptyStateTitle,
  type EmptyStateTitleProps,
};
