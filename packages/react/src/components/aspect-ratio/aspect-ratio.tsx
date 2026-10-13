import * as React from 'react';

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

/**
 * AspectRatioProps
 *
 * Props for the AspectRatio component.
 */
interface AspectRatioProps extends React.ComponentProps<
  typeof AspectRatioPrimitive.Root
> {}

/**
 * Keeps its child at a fixed width-to-height `ratio`, such as `16 / 9`. The child fills the box.
 *
 * @example
 * ```tsx
 * <AspectRatio ratio={16 / 9}>
 *   <img src="…" alt="…" className="nx:size-full nx:object-cover" />
 * </AspectRatio>
 * ```
 */
function AspectRatio(props: AspectRatioProps) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio, type AspectRatioProps };
