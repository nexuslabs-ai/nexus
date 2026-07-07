import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Label } from '../label';

const choiceCardVariants = cva(
  [
    'nx:group/choice-card nx:box-border nx:flex nx:min-w-0 nx:w-full nx:cursor-pointer nx:gap-3 nx:bg-background nx:p-4 nx:transition-colors',
    'nx:focus-within:outline-2 nx:focus-within:outline-focus-default nx:focus-within:outline-offset-(--focus-offset)',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:hover:bg-background-hover',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:active:bg-background-active',
    'nx:has-[>[data-slot=checkbox]:disabled]:cursor-not-allowed nx:has-[>[data-slot=checkbox]:disabled]:border-border-disabled nx:has-[>[data-slot=checkbox]:disabled]:bg-disabled',
    'nx:has-[>[data-slot=radio-group-item]:disabled]:cursor-not-allowed nx:has-[>[data-slot=radio-group-item]:disabled]:border-border-disabled nx:has-[>[data-slot=radio-group-item]:disabled]:bg-disabled',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=checkbox][aria-invalid=true]]:border-border-error',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=checkbox][aria-invalid=true]]:focus-within:outline-focus-error',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=radio-group-item][aria-invalid=true]]:border-border-error',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=radio-group-item][aria-invalid=true]]:focus-within:outline-focus-error',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=checked]]:border-border-primary',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=checked]]:bg-primary-subtle',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=indeterminate]]:border-border-primary',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=indeterminate]]:bg-primary-subtle',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=radio-group-item][data-state=checked]]:border-border-primary',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=radio-group-item][data-state=checked]]:bg-primary-subtle',
  ],
  {
    variants: {
      variant: {
        default: 'nx:border-default nx:border-transparent',
        outline: 'nx:border-default nx:border-border-default',
      },
      controlPosition: {
        before:
          'nx:flex-row nx:items-start nx:[&>[data-slot=checkbox]]:mt-0.5 nx:[&>[data-slot=radio-group-item]]:mt-0.5',
        after:
          'nx:flex-row-reverse nx:items-center nx:[&>[data-slot=checkbox]]:mt-0 nx:[&>[data-slot=radio-group-item]]:mt-0',
      },
      floating: {
        true: 'nx:rounded-md',
        false: 'nx:rounded-none',
      },
    },
    compoundVariants: [
      {
        variant: 'outline',
        floating: false,
        className: 'nx:border-x-0 nx:border-t-0',
      },
      {
        variant: 'default',
        floating: false,
        className: 'nx:border-x-0 nx:border-t-0',
      },
    ],
    defaultVariants: {
      variant: 'default',
      controlPosition: 'before',
      floating: true,
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
 * Use `variant="default"` for a simpler borderless option surface and
 * `variant="outline"` for a bordered rich card. Use `controlPosition="after"`
 * to visually place the nested Checkbox or RadioGroupItem at the trailing edge.
 * Set `floating={false}` when the card is part of an attached list where
 * divider-style edges are preferred over rounded floating cards.
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
function ChoiceCard({
  className,
  controlPosition,
  floating,
  variant,
  ...props
}: ChoiceCardProps) {
  const resolvedControlPosition = controlPosition ?? 'before';
  const resolvedFloating = floating ?? true;
  const resolvedVariant = variant ?? 'default';

  return (
    <Label
      data-slot="choice-card"
      data-control-position={resolvedControlPosition}
      data-floating={resolvedFloating ? 'true' : 'false'}
      data-variant={resolvedVariant}
      className={cn(
        choiceCardVariants({
          controlPosition: resolvedControlPosition,
          floating: resolvedFloating,
          variant: resolvedVariant,
        }),
        className
      )}
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
};
