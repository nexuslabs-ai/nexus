import * as React from 'react';

import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '../../lib/utils';

/**
 * Props for the Label component.
 */
type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root>;

/**
 * Accessible name for a form control, linked by setting `htmlFor` to the
 * control's `id`. Dims when an earlier sibling with the `nx:peer` class is
 * disabled.
 */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.PropsWithoutRef<LabelProps>
>(function Label(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<LabelProps> & {
    ref?: React.ForwardedRef<HTMLLabelElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

export { Label, type LabelProps };
