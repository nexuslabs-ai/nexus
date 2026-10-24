import * as React from 'react';

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

/**
 * AspectRatioProps
 *
 * Props for the AspectRatio component.
 */
type AspectRatioProps = React.ComponentProps<typeof AspectRatioPrimitive.Root>;

/**
 * Keeps its child at a fixed width-to-height `ratio`, such as `16 / 9`. The child fills the box.
 */
const AspectRatio = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AspectRatioProps>
>(function AspectRatio(propsWithoutRef, forwardedRef) {
  const props: React.PropsWithoutRef<AspectRatioProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
});

export { AspectRatio, type AspectRatioProps };
