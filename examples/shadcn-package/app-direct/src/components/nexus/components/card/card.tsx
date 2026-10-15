import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';

/**
 * CardProps
 *
 * Props for the Card component.
 */
interface CardProps extends React.ComponentProps<'div'> {}

/**
 * Groups related content and actions in a bordered section.
 * Content is clipped to the rounded corners. Add `nx:overflow-visible` for content that overhangs the edge.
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
        'nx:overflow-hidden nx:rounded-xl nx:border-width-default nx:border-color-default nx:bg-container nx:text-container-foreground nx:shadow-sm',
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
 * Holds the title, description and `CardAction`.
 * `CardAction` sits in a right-hand column. Add `nx:col-start-1` to a custom child so it lines up with the title.
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
interface CardTitleProps extends React.ComponentProps<'h3'> {
  /**
   * Applies the title styles to the child element, such as a different heading level.
   *
   * @default false
   * @example
   * ```tsx
   * <CardTitle asChild>
   *   <h2>Section Title</h2>
   * </CardTitle>
   * ```
   */
  asChild?: boolean;
}

/**
 * Card heading. Renders an `h3`, or another heading level through `asChild`.
 *
 * @example
 * ```tsx
 * <CardTitle>Card Title</CardTitle>
 * ```
 */
function CardTitle({
  asChild = false,
  className,
  children,
  ...props
}: CardTitleProps) {
  const Comp = asChild ? Slot : 'h3';

  return (
    <Comp
      data-slot="card-title"
      className={cn(
        'nx:col-start-1 nx:m-0 nx:min-w-0 nx:typography-heading-xsmall',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

/**
 * CardDescriptionProps
 *
 * Props for the CardDescription component.
 */
interface CardDescriptionProps extends React.ComponentProps<'p'> {}

/**
 * Supporting text under the title.
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
        'nx:col-start-1 nx:m-0 nx:min-w-0 nx:typography-body-default nx:text-muted-foreground',
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
 * Holds header actions, such as buttons or badges, beside the title.
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
 * Main content area.
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
 * Holds actions and content at the bottom of the card.
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
