import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

const overlayContentVariants = cva(
  [
    'nx:fixed nx:left-1/2 nx:top-1/2 nx:z-modal nx:grid nx:w-full nx:max-w-lg',
    'nx:-translate-x-1/2 nx:-translate-y-1/2',
    'nx:gap-4 nx:border nx:border-border-default nx:bg-container nx:py-6 nx:shadow-lg',
    'nx:data-[state=open]:duration-slow nx:data-[state=open]:ease-enter',
    'nx:data-[state=closed]:duration-default nx:data-[state=closed]:ease-exit',
    'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
    'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
    'nx:data-[state=closed]:zoom-out-95 nx:data-[state=open]:zoom-in-95',
    'nx:motion-reduce:duration-0 nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
    'nx:sm:rounded-lg',
  ].join(' ')
);

const overlayHeaderVariants = cva('nx:flex nx:flex-col nx:gap-1 nx:px-6', {
  variants: {
    variant: {
      default: 'nx:text-center nx:sm:text-left',
      center: 'nx:items-center nx:text-center',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const overlayFooterVariants = cva('nx:flex nx:gap-2 nx:px-6', {
  variants: {
    orientation: {
      horizontal:
        'nx:flex-col nx:sm:flex-row nx:sm:items-center nx:sm:justify-end',
      vertical: 'nx:flex-col nx:items-stretch nx:*:w-full',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

type OverlayVariant = NonNullable<
  VariantProps<typeof overlayHeaderVariants>['variant']
>;

type OverlayButtonOrientation = NonNullable<
  VariantProps<typeof overlayFooterVariants>['orientation']
>;

type OverlayLayoutContextValue = {
  variant: OverlayVariant;
  buttonOrientation: OverlayButtonOrientation;
};

const defaultOverlayLayout: OverlayLayoutContextValue = {
  variant: 'default',
  buttonOrientation: 'horizontal',
};

function resolveOverlayButtonOrientation(
  variant: OverlayVariant
): OverlayButtonOrientation {
  return variant === 'center' ? 'vertical' : 'horizontal';
}

function containsComposedSlot(
  children: React.ReactNode,
  slot: React.ElementType
): boolean {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;
    if (child.type === slot) return true;
    if (child.type === React.Fragment) {
      const fragment = child as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      return containsComposedSlot(fragment.props.children, slot);
    }
    return false;
  });
}

export {
  containsComposedSlot,
  defaultOverlayLayout,
  type OverlayButtonOrientation,
  overlayContentVariants,
  overlayFooterVariants,
  overlayHeaderVariants,
  type OverlayLayoutContextValue,
  type OverlayVariant,
  resolveOverlayButtonOrientation,
};
