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
 * AspectRatio
 *
 * Constrains its content to a fixed width:height ratio — media, embeds,
 * thumbnails, map tiles. Pass `ratio` (e.g. `16 / 9`); the single child fills
 * the resulting box.
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
