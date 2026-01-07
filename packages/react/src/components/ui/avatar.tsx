import * as React from 'react';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'nx:relative nx:flex nx:shrink-0 nx:overflow-hidden nx:bg-muted',
  {
    variants: {
      size: {
        '2xs': 'nx:size-5 nx:text-[8px]',
        xs: 'nx:size-6 nx:text-[10px]',
        sm: 'nx:size-8 nx:text-xs',
        md: 'nx:size-10 nx:text-sm',
        lg: 'nx:size-12 nx:text-base',
        xl: 'nx:size-14 nx:text-lg',
        '2xl': 'nx:size-16 nx:text-xl',
        '3xl': 'nx:size-20 nx:text-2xl',
        '4xl': 'nx:size-24 nx:text-3xl',
      },
      shape: {
        circle: 'nx:rounded-full',
        rounded: 'nx:rounded-md',
      },
    },
    compoundVariants: [
      // Larger sizes get larger border radius for rounded shape
      { size: 'lg', shape: 'rounded', className: 'nx:rounded-lg' },
      { size: 'xl', shape: 'rounded', className: 'nx:rounded-lg' },
      { size: '2xl', shape: 'rounded', className: 'nx:rounded-xl' },
      { size: '3xl', shape: 'rounded', className: 'nx:rounded-xl' },
      { size: '4xl', shape: 'rounded', className: 'nx:rounded-2xl' },
    ],
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

/**
 * Avatar component for displaying user profile images with fallback support.
 * Built on Radix UI Avatar primitive for proper image loading states.
 */
function Avatar({ className, size, shape, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      className={cn(avatarVariants({ size, shape, className }))}
      {...props}
    />
  );
}

type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image>;

/**
 * Image element for Avatar. Renders only when image loads successfully.
 */
function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('nx:aspect-square nx:size-full nx:object-cover', className)}
      {...props}
    />
  );
}

interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  /**
   * Delay in milliseconds before showing the fallback.
   * Useful to avoid fallback flash for cached images.
   * @default 0
   */
  delayMs?: number;
}

/**
 * Fallback content for Avatar when image fails to load or is not provided.
 * Typically displays user initials or a placeholder icon.
 */
function AvatarFallback({
  className,
  delayMs,
  ...props
}: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      delayMs={delayMs}
      className={cn(
        'nx:flex nx:size-full nx:items-center nx:justify-center nx:bg-muted nx:font-medium nx:text-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarFallback,
  type AvatarFallbackProps,
  AvatarImage,
  type AvatarImageProps,
  type AvatarProps,
  avatarVariants,
};
