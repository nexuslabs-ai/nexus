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
        'nx:relative nx:rounded-xl nx:border nx:border-border-default nx:bg-container nx:text-container-foreground nx:shadow-sm',
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
        // nexus-allow-numeric: sub-element header rhythm — Card note in spacing-tokens.md
        'nx:flex nx:flex-col nx:gap-1.5 nx:p-container',
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
        'nx:text-lg nx:font-semibold nx:leading-none nx:tracking-tight',
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
      className={cn('nx:text-sm nx:text-muted-foreground', className)}
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
 * Positioned to the right of the title and description.
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
        // nexus-allow-numeric: CardAction icon/label rhythm — Card note in spacing-tokens.md
        'nx:absolute nx:right-(--nx-container-p) nx:top-(--nx-container-p) nx:flex nx:items-center nx:gap-2',
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
      className={cn('nx:p-container nx:pt-0', className)}
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
        // nexus-allow-numeric: CardFooter sub-element rhythm — Card note in spacing-tokens.md
        'nx:flex nx:items-center nx:gap-2 nx:p-container nx:pt-0',
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
