import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Label } from '../label/label';

const choiceCardVariants = cva(
  [
    'nx:group/choice-card nx:box-border nx:flex nx:min-w-0 nx:w-full nx:cursor-pointer nx:items-start nx:gap-3 nx:rounded-md nx:bg-background nx:p-4 nx:transition-colors',
    'nx:[&>[data-slot=checkbox]]:mt-0.5 nx:[&>[data-slot=radio-group-item]]:mt-0.5',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:hover:bg-background-hover',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:active:bg-background-active',
    'nx:has-[>[data-slot=checkbox]:disabled]:cursor-not-allowed nx:has-[>[data-slot=checkbox]:disabled]:border-border-disabled nx:has-[>[data-slot=checkbox]:disabled]:bg-disabled',
    'nx:has-[>[data-slot=radio-group-item]:disabled]:cursor-not-allowed nx:has-[>[data-slot=radio-group-item]:disabled]:border-border-disabled nx:has-[>[data-slot=radio-group-item]:disabled]:bg-disabled',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=checkbox][aria-invalid=true]]:border-error-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=radio-group-item][aria-invalid=true]]:border-error-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=checked]]:border-primary-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=checked]]:bg-primary-subtle',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=indeterminate]]:border-primary-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=indeterminate]]:bg-primary-subtle',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=radio-group-item][data-state=checked]]:border-primary-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=radio-group-item][data-state=checked]]:bg-primary-subtle',
  ],
  {
    variants: {
      variant: {
        bordered: 'nx:border-default nx:border-border-default',
        borderless: 'nx:border-default nx:border-transparent',
      },
    },
    defaultVariants: {
      variant: 'bordered',
    },
  }
);

/**
 * ChoiceCardProps
 *
 * Props for ChoiceCard. It has no `asChild`, because it relies on a native label with `htmlFor`.
 */
type ChoiceCardProps = Omit<React.ComponentProps<typeof Label>, 'asChild'> &
  VariantProps<typeof choiceCardVariants>;

/**
 * ChoiceCardContentProps
 *
 * Props for the ChoiceCardContent component.
 */
type ChoiceCardContentProps = React.ComponentProps<'div'>;

/**
 * ChoiceCardTitleProps
 *
 * Props for the ChoiceCardTitle component.
 */
type ChoiceCardTitleProps = React.ComponentProps<'div'>;

/**
 * ChoiceCardDescriptionProps
 *
 * Props for the ChoiceCardDescription component.
 */
type ChoiceCardDescriptionProps = React.ComponentProps<'p'>;

/**
 * Label card for a checkbox or radio choice with a title and description.
 * Set `htmlFor` to the nested control's `id`, so a click anywhere on the card toggles it.
 *
 * `variant="borderless"` hides the frame and keeps the size. Put `ChoiceCardContent` first to move the control to the trailing edge.
 *
 * With a description, point the control's `aria-labelledby` at `ChoiceCardTitle` and `aria-describedby` at `ChoiceCardDescription`.
 * Otherwise the description becomes part of the control's name.
 */
const ChoiceCard = React.forwardRef<
  HTMLLabelElement,
  React.PropsWithoutRef<ChoiceCardProps>
>(function ChoiceCard(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant,
    ...props
  }: React.PropsWithoutRef<ChoiceCardProps> & {
    ref?: React.ForwardedRef<HTMLLabelElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <Label
      data-slot="choice-card"
      data-variant={variant ?? 'bordered'}
      className={cn(choiceCardVariants({ variant }), className)}
      {...props}
    />
  );
});

/**
 * Stacks the title and description.
 */
const ChoiceCardContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ChoiceCardContentProps>
>(function ChoiceCardContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ChoiceCardContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="choice-card-content"
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5',
        className
      )}
      {...props}
    />
  );
});

/**
 * Choice label. With a description, point the control's `aria-labelledby` at its `id`.
 */
const ChoiceCardTitle = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ChoiceCardTitleProps>
>(function ChoiceCardTitle(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ChoiceCardTitleProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="choice-card-title"
      className={cn(
        'nx:min-w-0 nx:break-words nx:typography-label-default nx:text-foreground',
        'nx:group-has-[>[data-slot=checkbox]:disabled]/choice-card:text-disabled-foreground',
        'nx:group-has-[>[data-slot=radio-group-item]:disabled]/choice-card:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
});

/**
 * Optional helper text. Point the control's `aria-describedby` at its `id`.
 */
const ChoiceCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<ChoiceCardDescriptionProps>
>(function ChoiceCardDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ChoiceCardDescriptionProps> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <p
      data-slot="choice-card-description"
      className={cn(
        'nx:m-0 nx:min-w-0 nx:break-words nx:typography-body-default nx:text-muted-foreground',
        'nx:group-has-[>[data-slot=checkbox]:disabled]/choice-card:text-disabled-foreground',
        'nx:group-has-[>[data-slot=radio-group-item]:disabled]/choice-card:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
});

export {
  ChoiceCard,
  ChoiceCardContent,
  type ChoiceCardContentProps,
  ChoiceCardDescription,
  type ChoiceCardDescriptionProps,
  type ChoiceCardProps,
  ChoiceCardTitle,
  type ChoiceCardTitleProps,
  choiceCardVariants,
};
