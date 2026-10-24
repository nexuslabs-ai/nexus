import * as React from 'react';

import { cn } from '../../lib/utils';
import { Label } from '../label/label';

/**
 * ChoiceRowProps
 *
 * Props for the ChoiceRow component.
 */
type ChoiceRowProps = React.ComponentProps<typeof Label>;

/**
 * Compact label row for a checkbox or radio choice.
 * Set `htmlFor` to the nested control's `id`, so a click anywhere on the row toggles it.
 */
const ChoiceRow = React.forwardRef<
  HTMLLabelElement,
  React.PropsWithoutRef<ChoiceRowProps>
>(function ChoiceRow(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ChoiceRowProps> & {
    ref?: React.ForwardedRef<HTMLLabelElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <Label
      data-slot="choice-row"
      className={cn(
        'nx:group/choice-row nx:box-border nx:flex nx:min-h-8 nx:min-w-0 nx:w-full nx:cursor-pointer nx:items-center nx:justify-start nx:gap-2 nx:rounded-sm nx:px-2 nx:py-1.5 nx:transition-colors',
        'nx:not-has-[:disabled]:hover:bg-background-hover nx:not-has-[:disabled]:active:bg-background-active',
        'nx:has-[:disabled]:cursor-not-allowed nx:has-[:disabled]:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
});

/**
 * Optional wrapper that stacks the title and description.
 */
const ChoiceRowContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function ChoiceRowContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="choice-row-content"
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
const ChoiceRowTitle = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function ChoiceRowTitle(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="choice-row-title"
      className={cn(
        'nx:min-w-0 nx:flex-1 nx:typography-label-default nx:text-foreground nx:group-has-[:disabled]/choice-row:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
});

/**
 * Optional helper text. Point the control's `aria-describedby` at its `id`.
 */
const ChoiceRowDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<React.ComponentProps<'p'>>
>(function ChoiceRowDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'p'>> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <p
      data-slot="choice-row-description"
      className={cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground nx:group-has-[:disabled]/choice-row:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
});

export {
  ChoiceRow,
  ChoiceRowContent,
  ChoiceRowDescription,
  type ChoiceRowProps,
  ChoiceRowTitle,
};
