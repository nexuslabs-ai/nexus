import * as React from 'react';

import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from '../../lib/utils';

/**
 * Props for Separator.
 */
type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>;

/**
 * Thin rule that divides content. A vertical separator fills its parent's
 * height, so give that parent a set height. Set `decorative={false}` to expose
 * the `separator` role to assistive tech.
 */
const Separator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SeparatorProps>
>(function Separator(propsWithoutRef, forwardedRef) {
  const {
    className,
    orientation = 'horizontal',
    decorative = true,
    ...props
  }: React.PropsWithoutRef<SeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'nx:shrink-0 nx:bg-border-default',
        'nx:data-[orientation=horizontal]:h-px nx:data-[orientation=horizontal]:w-full',
        'nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:w-px',
        className
      )}
      {...props}
    />
  );
});

export { Separator, type SeparatorProps };
