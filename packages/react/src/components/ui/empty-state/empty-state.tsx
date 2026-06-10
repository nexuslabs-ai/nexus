import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * EmptyStateProps
 *
 * Props for the EmptyState component.
 */
interface EmptyStateProps extends React.ComponentProps<'div'> {}

/**
 * EmptyState
 *
 * A centered empty-state region for list, table, and record views with no
 * content yet — an icon, a title, a short description, and an optional action.
 * Compose with the sub-components: `EmptyStateHeader` groups the
 * `EmptyStateMedia` (icon), `EmptyStateTitle`, and `EmptyStateDescription`;
 * `EmptyStateContent` holds the call to action. Carries a dashed border style
 * that only shows when a consumer adds a border width.
 *
 * @example
 * ```tsx
 * <EmptyState>
 *   <EmptyStateHeader>
 *     <EmptyStateMedia variant="icon">
 *       <IconInbox />
 *     </EmptyStateMedia>
 *     <EmptyStateTitle>No contacts yet</EmptyStateTitle>
 *     <EmptyStateDescription>
 *       Add your first contact to get started.
 *     </EmptyStateDescription>
 *   </EmptyStateHeader>
 *   <EmptyStateContent>
 *     <Button>Add contact</Button>
 *   </EmptyStateContent>
 * </EmptyState>
 * ```
 */
function EmptyState({ className, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:items-center nx:justify-center nx:gap-6 nx:rounded-lg nx:border-dashed nx:p-6 nx:text-center nx:text-balance',
        className
      )}
      {...props}
    />
  );
}

/**
 * EmptyStateHeaderProps
 *
 * Props for the EmptyStateHeader component.
 */
interface EmptyStateHeaderProps extends React.ComponentProps<'div'> {}

/**
 * EmptyStateHeader
 *
 * Groups the media, title, and description in a narrow centered column.
 */
function EmptyStateHeader({ className, ...props }: EmptyStateHeaderProps) {
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
}

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
interface EmptyStateMediaProps
  extends
    React.ComponentProps<'div'>,
    VariantProps<typeof emptyStateMediaVariants> {}

/**
 * EmptyStateMedia
 *
 * Holds the empty-state's icon or illustration. The `icon` variant renders a
 * muted rounded medallion sized for a single glyph; `default` is an unstyled
 * wrapper for a larger illustration.
 */
function EmptyStateMedia({
  className,
  variant = 'default',
  ...props
}: EmptyStateMediaProps) {
  return (
    <div
      data-slot="empty-state-media"
      data-variant={variant}
      className={cn(emptyStateMediaVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * EmptyStateTitleProps
 *
 * Props for the EmptyStateTitle component.
 */
interface EmptyStateTitleProps extends React.ComponentProps<'div'> {}

/**
 * EmptyStateTitle
 *
 * The headline of the empty state — what is missing. Renders a `div`, not a
 * heading element — set the heading level in your app if the region needs one.
 */
function EmptyStateTitle({ className, ...props }: EmptyStateTitleProps) {
  return (
    <div
      data-slot="empty-state-title"
      className={cn('nx:typography-heading-xsmall', className)}
      {...props}
    />
  );
}

/**
 * EmptyStateDescriptionProps
 *
 * Props for the EmptyStateDescription component.
 */
interface EmptyStateDescriptionProps extends React.ComponentProps<'p'> {}

/**
 * EmptyStateDescription
 *
 * Supporting copy beneath the title; anchors inside are underlined.
 */
function EmptyStateDescription({
  className,
  ...props
}: EmptyStateDescriptionProps) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn(
        'nx:typography-body-small nx:text-muted-foreground nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * EmptyStateContentProps
 *
 * Props for the EmptyStateContent component.
 */
interface EmptyStateContentProps extends React.ComponentProps<'div'> {}

/**
 * EmptyStateContent
 *
 * The action area below the header — typically one or two buttons.
 */
function EmptyStateContent({ className, ...props }: EmptyStateContentProps) {
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
}

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
