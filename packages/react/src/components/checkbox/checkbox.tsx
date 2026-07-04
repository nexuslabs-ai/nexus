import * as React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { IconCheck, IconMinus } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

/**
 * CheckboxProps
 *
 * Props for the Checkbox component.
 */
interface CheckboxProps extends React.ComponentProps<
  typeof CheckboxPrimitive.Root
> {}

/**
 * Checkbox
 *
 * A tri-state checkbox (checked / unchecked / indeterminate) for selecting one
 * or more options, or toggling a single setting. Shows a check mark when checked
 * and a minus when indeterminate. Pair the 16px checkbox with a wired label row
 * so the label text carries the touch target; set `checked="indeterminate"` for
 * the mixed state — e.g. a "select all" control whose children are only
 * partially selected.
 *
 * For a selectable card / row, compose this atom inside `Field` — a `FieldLabel`
 * wrapping a `Field` becomes a card that highlights when the checkbox is checked
 * (see the Field "CheckboxCard" story). The card stays driven by this real
 * control, so clicking anywhere on the label toggles it via native `htmlFor`
 * association — no duplicated indicator.
 *
 * @example
 * ```tsx
 * <Checkbox checked={agreed} onCheckedChange={setAgreed} />
 * ```
 *
 * @example
 * ```tsx
 * // Indeterminate (mixed) state
 * <Checkbox checked="indeterminate" aria-label="Select all" />
 * ```
 *
 * @example
 * ```tsx
 * <div className="nx:flex nx:items-center nx:gap-2">
 *   <Checkbox id="terms" />
 *   <Label htmlFor="terms">Accept terms and conditions</Label>
 * </div>
 * ```
 */
function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'nx:group nx:peer nx:inline-flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center',
        'nx:rounded-sm nx:border-default nx:border-border-default nx:bg-background',
        'nx:transition-colors',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
        'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled nx:disabled:bg-disabled',
        'nx:enabled:data-[state=unchecked]:hover:bg-background-hover nx:enabled:data-[state=unchecked]:active:bg-background-active',
        'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:bg-primary-background nx:data-[state=checked]:text-primary-foreground',
        'nx:enabled:data-[state=checked]:hover:border-primary-background-hover nx:enabled:data-[state=checked]:hover:bg-primary-background-hover',
        'nx:enabled:data-[state=checked]:active:border-primary-background-hover nx:enabled:data-[state=checked]:active:bg-primary-background-active',
        'nx:data-[state=indeterminate]:border-primary-background nx:data-[state=indeterminate]:bg-primary-background nx:data-[state=indeterminate]:text-primary-foreground',
        'nx:enabled:data-[state=indeterminate]:hover:border-primary-background-hover nx:enabled:data-[state=indeterminate]:hover:bg-primary-background-hover',
        'nx:enabled:data-[state=indeterminate]:active:border-primary-background-hover nx:enabled:data-[state=indeterminate]:active:bg-primary-background-active',
        'nx:data-[state=checked]:disabled:border-primary-disabled nx:data-[state=checked]:disabled:bg-primary-disabled',
        'nx:data-[state=indeterminate]:disabled:border-primary-disabled nx:data-[state=indeterminate]:disabled:bg-primary-disabled',
        // Invalid + checked/indeterminate: aria-invalid is the single authoring hook.
        'nx:aria-invalid:data-[state=checked]:border-border-error nx:aria-invalid:data-[state=checked]:bg-error-background nx:aria-invalid:data-[state=checked]:text-error-foreground',
        'nx:aria-invalid:data-[state=indeterminate]:border-border-error nx:aria-invalid:data-[state=indeterminate]:bg-error-background nx:aria-invalid:data-[state=indeterminate]:text-error-foreground',
        'nx:enabled:aria-invalid:data-[state=checked]:hover:border-border-error nx:enabled:aria-invalid:data-[state=checked]:hover:bg-error-background-hover',
        'nx:enabled:aria-invalid:data-[state=checked]:active:border-border-error nx:enabled:aria-invalid:data-[state=checked]:active:bg-error-background-active',
        'nx:enabled:aria-invalid:data-[state=indeterminate]:hover:border-border-error nx:enabled:aria-invalid:data-[state=indeterminate]:hover:bg-error-background-hover',
        'nx:enabled:aria-invalid:data-[state=indeterminate]:active:border-border-error nx:enabled:aria-invalid:data-[state=indeterminate]:active:bg-error-background-active',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        forceMount
        data-slot="checkbox-indicator"
        className="nx:relative nx:flex nx:size-full nx:items-center nx:justify-center nx:text-current"
      >
        <IconCheck
          data-slot="checkbox-check"
          aria-hidden="true"
          className={cn(
            'nx:absolute nx:size-3.5',
            selectionIndicatorMotionClassName,
            'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
          )}
        />
        <IconMinus
          data-slot="checkbox-minus"
          aria-hidden="true"
          className={cn(
            'nx:absolute nx:size-3.5',
            selectionIndicatorMotionClassName,
            'nx:group-data-[state=indeterminate]:scale-100 nx:group-data-[state=indeterminate]:opacity-100'
          )}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, type CheckboxProps };
