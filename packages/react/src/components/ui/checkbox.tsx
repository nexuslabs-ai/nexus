import * as React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { IconCheck, IconMinus } from '@/lib/icons';
import { cn } from '@/lib/utils';

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
 * and a minus when indeterminate. Set `checked="indeterminate"` for the mixed
 * state — e.g. a "select all" control whose children are only partially selected.
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
 *   <label htmlFor="terms">Accept terms and conditions</label>
 * </div>
 * ```
 */
function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'nx:group nx:peer nx:inline-flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center',
        'nx:rounded-sm nx:border nx:border-border-default nx:bg-background',
        'nx:transition-colors',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
        'nx:disabled:cursor-not-allowed nx:disabled:opacity-50',
        'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:bg-primary-background nx:data-[state=checked]:text-primary-foreground',
        'nx:data-[state=indeterminate]:border-primary-background nx:data-[state=indeterminate]:bg-primary-background nx:data-[state=indeterminate]:text-primary-foreground',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="nx:flex nx:items-center nx:justify-center nx:text-current"
      >
        <IconCheck
          data-slot="checkbox-check"
          aria-hidden="true"
          className="nx:hidden nx:size-3.5 nx:group-data-[state=checked]:block"
        />
        <IconMinus
          data-slot="checkbox-minus"
          aria-hidden="true"
          className="nx:hidden nx:size-3.5 nx:group-data-[state=indeterminate]:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, type CheckboxProps };
