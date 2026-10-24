import * as React from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const switchVariants = cva(
  [
    'nx:peer nx:inline-flex nx:shrink-0 nx:cursor-pointer nx:items-center nx:p-0',
    'nx:rounded-full nx:border-thick nx:border-border-default',
    'nx:transition-control',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
    'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:aria-invalid:data-[state=checked]:border-primary-background',
    'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled',
    'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:bg-primary-background nx:enabled:data-[state=checked]:hover:bg-primary-background-hover nx:data-[state=checked]:disabled:border-primary-disabled nx:data-[state=checked]:disabled:bg-primary-disabled',
    'nx:data-[state=unchecked]:bg-control-background nx:enabled:data-[state=unchecked]:hover:bg-control-background-hover nx:data-[state=unchecked]:disabled:bg-disabled',
  ],
  {
    variants: {
      size: {
        default: 'nx:h-5 nx:w-9',
        sm: 'nx:h-[18px] nx:w-[32px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const switchThumbVariants = cva(
  [
    'nx:pointer-events-none nx:block nx:rounded-full',
    'nx:bg-control-thumb nx:transition-[background-color,transform]',
    'nx:data-[state=checked]:bg-primary-foreground',
    'nx:data-[state=unchecked]:translate-x-0',
  ],
  {
    variants: {
      size: {
        default: 'nx:size-4 nx:data-[state=checked]:translate-x-4',
        sm: 'nx:size-[14px] nx:data-[state=checked]:translate-x-[14px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

/**
 * Props for Switch.
 */
type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants>;

/**
 * On/off control for settings that apply at once, with no save step. Pair it
 * with a label so the label text is clickable too.
 */
const Switch = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<SwitchProps>
>(function Switch(propsWithoutRef, forwardedRef) {
  const {
    className,
    size,
    ...props
  }: React.PropsWithoutRef<SwitchProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size ?? 'default'}
      className={cn(switchVariants({ size, className }))}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={switchThumbVariants({ size })}
      />
    </SwitchPrimitive.Root>
  );
});

export { Switch, type SwitchProps, switchVariants };
