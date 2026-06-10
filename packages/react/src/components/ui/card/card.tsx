import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * CardProps
 *
 * Props for the Card component.
 */
interface CardProps extends React.ComponentProps<'div'> {}

/**
 * Card
 *
 * A container component for grouping related content and actions.
 * Use for displaying information in a visually distinct section.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description goes here.</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content goes here.</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'nx:overflow-hidden nx:rounded-xl nx:border nx:border-border-default nx:bg-container nx:text-container-foreground nx:shadow-sm',
        className
      )}
      {...props}
    />
  );
}

/**
 * CardHeaderProps
 *
 * Props for the CardHeader component.
 */
interface CardHeaderProps extends React.ComponentProps<'div'> {}

/**
 * CardHeader
 *
 * Container for the card's header content including title, description, and actions.
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <CardTitle>Title</CardTitle>
 *   <CardDescription>Description</CardDescription>
 * </CardHeader>
 * ```
 */
function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'nx:grid nx:grid-cols-[minmax(0,1fr)_auto] nx:items-start nx:gap-y-1.5 nx:p-6',
        className
      )}
      {...props}
    />
  );
}

/**
 * CardTitleProps
 *
 * Props for the CardTitle component.
 */
interface CardTitleProps extends React.ComponentProps<'h3'> {}

/**
 * CardTitle
 *
 * The primary heading of a card.
 *
 * @example
 * ```tsx
 * <CardTitle>Card Title</CardTitle>
 * ```
 */
function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        'nx:col-start-1 nx:min-w-0 nx:typography-heading-xsmall',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

/**
 * CardDescriptionProps
 *
 * Props for the CardDescription component.
 */
interface CardDescriptionProps extends React.ComponentProps<'p'> {}

/**
 * CardDescription
 *
 * Supporting text that provides additional context for the card.
 *
 * @example
 * ```tsx
 * <CardDescription>This is a description of the card content.</CardDescription>
 * ```
 */
function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        'nx:col-start-1 nx:min-w-0 nx:typography-body-small nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * CardActionProps
 *
 * Props for the CardAction component.
 */
interface CardActionProps extends React.ComponentProps<'div'> {}

/**
 * CardAction
 *
 * Container for action elements (buttons, badges) in the card header.
 * Placed in the header action column beside the title and description.
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <CardTitle>Title</CardTitle>
 *   <CardAction>
 *     <Button size="sm">Action</Button>
 *   </CardAction>
 * </CardHeader>
 * ```
 */
function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'nx:col-start-2 nx:row-start-1 nx:row-span-2 nx:flex nx:items-center nx:gap-2 nx:self-start nx:justify-self-end nx:pl-4',
        className
      )}
      {...props}
    />
  );
}

/**
 * CardContentProps
 *
 * Props for the CardContent component.
 */
interface CardContentProps extends React.ComponentProps<'div'> {}

/**
 * CardContent
 *
 * The main content area of a card.
 *
 * @example
 * ```tsx
 * <CardContent>
 *   <p>Main content goes here.</p>
 * </CardContent>
 * ```
 */
function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn('nx:p-6 nx:pt-0', className)}
      {...props}
    />
  );
}

/**
 * CardFooterProps
 *
 * Props for the CardFooter component.
 */
interface CardFooterProps extends React.ComponentProps<'div'> {}

/**
 * CardFooter
 *
 * Container for footer content and actions at the bottom of a card.
 *
 * @example
 * ```tsx
 * <CardFooter>
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Submit</Button>
 * </CardFooter>
 * ```
 */
function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'nx:flex nx:items-center nx:gap-2 nx:p-6 nx:pt-0',
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  type CardActionProps,
  CardContent,
  type CardContentProps,
  CardDescription,
  type CardDescriptionProps,
  CardFooter,
  type CardFooterProps,
  CardHeader,
  type CardHeaderProps,
  type CardProps,
  CardTitle,
  type CardTitleProps,
};
