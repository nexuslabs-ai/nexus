import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';

/**
 * CardProps
 *
 * Props for the Card component.
 */
type CardProps = React.ComponentProps<'div'>;

/**
 * Groups related content and actions in a bordered section.
 * Content is clipped to the rounded corners. Add `nx:overflow-visible` for content that overhangs the edge.
 */
const Card = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<CardProps>>(
  function Card(propsWithoutRef, forwardedRef) {
    const {
      className,
      ...props
    }: React.PropsWithoutRef<CardProps> & {
      ref?: React.ForwardedRef<HTMLDivElement>;
    } =
      forwardedRef === null
        ? propsWithoutRef
        : { ...propsWithoutRef, ref: forwardedRef };
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
);

/**
 * CardHeaderProps
 *
 * Props for the CardHeader component.
 */
type CardHeaderProps = React.ComponentProps<'div'>;

/**
 * Holds the title, description and `CardAction`.
 * `CardAction` sits in a right-hand column. Add `nx:col-start-1` to a custom child so it lines up with the title.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CardHeaderProps>
>(function CardHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CardHeaderProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * CardTitleProps
 *
 * Props for the CardTitle component.
 */
interface CardTitleProps extends React.ComponentProps<'h3'> {
  /**
   * Applies the title styles to the child element, such as a different heading level.
   */
  asChild?: boolean;
}

/**
 * Card heading. Renders an `h3`, or another heading level through `asChild`.
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.PropsWithoutRef<CardTitleProps>
>(function CardTitle(propsWithoutRef, forwardedRef) {
  const {
    asChild = false,
    className,
    children,
    ...props
  }: React.PropsWithoutRef<CardTitleProps> & {
    ref?: React.ForwardedRef<HTMLHeadingElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * CardDescriptionProps
 *
 * Props for the CardDescription component.
 */
type CardDescriptionProps = React.ComponentProps<'p'>;

/**
 * Supporting text under the title.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<CardDescriptionProps>
>(function CardDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CardDescriptionProps> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * CardActionProps
 *
 * Props for the CardAction component.
 */
type CardActionProps = React.ComponentProps<'div'>;

/**
 * Holds header actions, such as buttons or badges, beside the title.
 */
const CardAction = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CardActionProps>
>(function CardAction(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CardActionProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * CardContentProps
 *
 * Props for the CardContent component.
 */
type CardContentProps = React.ComponentProps<'div'>;

/**
 * Main content area.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CardContentProps>
>(function CardContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CardContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="card-content"
      className={cn('nx:p-6 nx:pt-0', className)}
      {...props}
    />
  );
});

/**
 * CardFooterProps
 *
 * Props for the CardFooter component.
 */
type CardFooterProps = React.ComponentProps<'div'>;

/**
 * Holds actions and content at the bottom of the card.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CardFooterProps>
>(function CardFooter(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CardFooterProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
