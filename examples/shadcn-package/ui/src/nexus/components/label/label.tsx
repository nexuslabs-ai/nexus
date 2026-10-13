import * as React from 'react';

import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '../../lib/utils';

/**
 * LabelProps
 *
 * Props for the Label component.
 */
interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {}

/**
 * Label
 *
 * An accessible caption for a form control. Associate it with a control via
 * `htmlFor` (matching the control's `id`) so clicking the label focuses (or
 * toggles, for a checkbox/radio) that control. Dims automatically when a
 * sibling `nx:peer` control is disabled.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">Email</Label>
 * <Input id="email" type="email" />
 * ```
 */
function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'nx:flex nx:items-center nx:gap-2 nx:select-none nx:typography-label-default nx:text-foreground',
        'nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
}

export { Label, type LabelProps };
