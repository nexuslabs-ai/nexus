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
interface ChoiceCardProps
  extends
    Omit<React.ComponentProps<typeof Label>, 'asChild'>,
    VariantProps<typeof choiceCardVariants> {}

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
 *
 * @example
 * ```tsx
 * <ChoiceCard htmlFor="security">
 *   <Checkbox
 *     id="security"
 *     aria-labelledby="security-title"
 *     aria-describedby="security-description"
 *   />
 *   <ChoiceCardContent>
 *     <ChoiceCardTitle id="security-title">Security alerts</ChoiceCardTitle>
 *     <ChoiceCardDescription id="security-description">
 *       Important account notifications.
 *     </ChoiceCardDescription>
 *   </ChoiceCardContent>
 * </ChoiceCard>
 * ```
 */
function ChoiceCard({ className, variant, ...props }: ChoiceCardProps) {
  return (
    <Label
      data-slot="choice-card"
      data-variant={variant ?? 'bordered'}
      className={cn(choiceCardVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * Stacks the title and description.
 */
function ChoiceCardContent({ className, ...props }: ChoiceCardContentProps) {
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
}

/**
 * Choice label. With a description, point the control's `aria-labelledby` at its `id`.
 */
function ChoiceCardTitle({ className, ...props }: ChoiceCardTitleProps) {
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
}

/**
 * Optional helper text. Point the control's `aria-describedby` at its `id`.
 */
function ChoiceCardDescription({
  className,
  ...props
}: ChoiceCardDescriptionProps) {
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
}

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
