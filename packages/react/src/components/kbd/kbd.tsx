import * as React from 'react';

import { cn } from '../../lib/utils';

/**
 * KbdProps
 *
 * Props for the Kbd component.
 */
interface KbdProps extends React.ComponentProps<'kbd'> {}

/**
 * Kbd
 *
 * Key cap for one key of a shortcut, such as `⌘` or `Esc`. Put several
 * inside `KbdGroup` to show a combination.
 *
 * @example
 * ```tsx
 * <Kbd>⌘</Kbd>
 *
 * <KbdGroup>
 *   <Kbd>⌘</Kbd>
 *   <Kbd>K</Kbd>
 * </KbdGroup>
 * ```
 */
function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'nx:pointer-events-none nx:inline-flex nx:h-5 nx:w-fit nx:min-w-5 nx:items-center nx:justify-center nx:gap-1 nx:rounded-sm nx:bg-muted nx:px-1 nx:typography-label-small nx:text-muted-foreground nx:select-none nx:[&_svg]:size-3',
        className
      )}
      {...props}
    />
  );
}

/**
 * KbdGroupProps
 *
 * Props for the KbdGroup component.
 */
interface KbdGroupProps extends React.ComponentProps<'kbd'> {}

/**
 * KbdGroup
 *
 * Row of `Kbd` key caps shown as one combination, such as `⌘ K`.
 */
function KbdGroup({ className, ...props }: KbdGroupProps) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('nx:inline-flex nx:items-center nx:gap-1', className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup, type KbdGroupProps, type KbdProps };
