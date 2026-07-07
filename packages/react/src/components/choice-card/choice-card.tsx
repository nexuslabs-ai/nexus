import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Label } from '../label';

const choiceCardVariants = cva(
  [
    'nx:group/choice-card nx:box-border nx:flex nx:min-w-0 nx:w-full nx:cursor-pointer nx:items-start nx:gap-3 nx:rounded-md nx:bg-background nx:p-4 nx:transition-colors',
    'nx:[&>[data-slot=checkbox]]:mt-0.5 nx:[&>[data-slot=radio-group-item]]:mt-0.5',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:hover:bg-background-hover',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:active:bg-background-active',
    'nx:has-[>[data-slot=checkbox]:disabled]:cursor-not-allowed nx:has-[>[data-slot=checkbox]:disabled]:border-border-disabled nx:has-[>[data-slot=checkbox]:disabled]:bg-disabled',
    'nx:has-[>[data-slot=radio-group-item]:disabled]:cursor-not-allowed nx:has-[>[data-slot=radio-group-item]:disabled]:border-border-disabled nx:has-[>[data-slot=radio-group-item]:disabled]:bg-disabled',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=checkbox][aria-invalid=true]]:border-border-error',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=radio-group-item][aria-invalid=true]]:border-border-error',
    'nx:data-[variant=bordered]:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=checked]]:border-border-primary',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=checked]]:bg-primary-subtle',
    'nx:data-[variant=bordered]:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=indeterminate]]:border-border-primary',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=indeterminate]]:bg-primary-subtle',
    'nx:data-[variant=bordered]:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=radio-group-item][data-state=checked]]:border-border-primary',
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
 * Props for the ChoiceCard component. `asChild` is intentionally omitted
 * because ChoiceCard depends on native label semantics through `htmlFor`.
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
 * ChoiceCard
 *
 * A rich label-owned card for checkbox and radio choices. The card owns the
 * click/tap target through native `htmlFor`/`id` wiring, while the nested
 * Checkbox or RadioGroupItem remains the only interactive control and source of
 * selected/focus/disabled/invalid semantics.
 *
 * The default `variant="bordered"` gives the card a visible frame.
 * Use `variant="borderless"` for a quieter surface that keeps the same box
 * dimensions. Place `ChoiceCardContent` before the nested Checkbox or
 * RadioGroupItem when the control should appear at the trailing edge.
 *
 * When the card includes a description, wire the child control with
 * `aria-labelledby` pointing to `ChoiceCardTitle` and `aria-describedby`
 * pointing to `ChoiceCardDescription`. Without that explicit title wiring, the
 * native label would name the control with both title and description text.
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
 * ChoiceCardContent
 *
 * Vertical wrapper for rich choice title and description text.
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
 * ChoiceCardTitle
 *
 * Visible choice label text. Use its `id` as the child control's
 * `aria-labelledby` target when the card also includes a description.
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
 * ChoiceCardDescription
 *
 * Optional helper text for a choice. Pair its `id` with the child control's
 * `aria-describedby`.
 */
function ChoiceCardDescription({
  className,
  ...props
}: ChoiceCardDescriptionProps) {
  return (
    <p
      data-slot="choice-card-description"
      className={cn(
        'nx:min-w-0 nx:break-words nx:typography-body-default nx:text-muted-foreground',
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
