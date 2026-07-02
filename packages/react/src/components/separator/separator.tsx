import * as React from 'react';

import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from '../../lib/utils';

/**
 * SeparatorProps
 *
 * Props for the Separator component.
 */
interface SeparatorProps extends React.ComponentProps<
  typeof SeparatorPrimitive.Root
> {}

/**
 * Separator
 *
 * A visual divider between content — a thin rule along one axis. Horizontal by
 * default; pass `orientation="vertical"` inside a flex row (the parent needs a
 * defined cross-axis size, since a vertical rule stretches to `h-full`).
 * Decorative by default, so it's hidden from assistive tech; pass
 * `decorative={false}` when the rule marks a genuine semantic boundary between
 * groups (it then exposes a `separator` role).
 *
 * @example
 * ```tsx
 * <Separator />
 * ```
 *
 * @example
 * ```tsx
 * <div className="nx:flex nx:h-5 nx:items-center nx:gap-3">
 *   <span>Docs</span>
 *   <Separator orientation="vertical" />
 *   <span>Source</span>
 * </div>
 * ```
 */
function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
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
}

export { Separator, type SeparatorProps };
