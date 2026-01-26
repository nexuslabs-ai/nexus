import * as React from 'react';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'nx:relative nx:flex nx:shrink-0 nx:overflow-hidden',
  {
    variants: {
      size: {
        '2xs': 'nx:size-5',
        xs: 'nx:size-6',
        sm: 'nx:size-8',
        md: 'nx:size-10',
        lg: 'nx:size-12',
        xl: 'nx:size-14',
        '2xl': 'nx:size-16',
        '3xl': 'nx:size-20',
        '4xl': 'nx:size-24',
      },
      shape: {
        circle: 'nx:rounded-full',
        rounded: 'nx:rounded-lg',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

/**
 * AvatarProps
 *
 * Props for the Avatar component.
 */
interface AvatarProps
  extends
    React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

/**
 * Avatar
 *
 * Displays a user's profile image or initials as a visual identifier.
 * Falls back to initials or placeholder when no image is available.
 *
 * @example
 * ```tsx
 * <Avatar>
 *   <AvatarImage src="/avatar.png" alt="User" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 * ```
 *
 * @example
 * ```tsx
 * // With size and shape
 * <Avatar size="lg" shape="rounded">
 *   <AvatarImage src="/avatar.png" alt="User" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 * ```
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

/**
 * AvatarImageProps
 *
 * Props for the AvatarImage component.
 */
type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image>;

/**
 * AvatarImage
 *
 * Displays the avatar image. Automatically handles loading states.
 *
 * @example
 * ```tsx
 * <AvatarImage src="/avatar.png" alt="John Doe" />
 * ```
 */
function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('nx:aspect-square nx:size-full', className)}
      {...props}
    />
  );
}

/**
 * AvatarFallbackProps
 *
 * Props for the AvatarFallback component.
 */
type AvatarFallbackProps = React.ComponentProps<
  typeof AvatarPrimitive.Fallback
>;

/**
 * AvatarFallback
 *
 * Displays when the image fails to load or while loading.
 * Typically shows user initials or a placeholder icon.
 *
 * @example
 * ```tsx
 * <AvatarFallback>JD</AvatarFallback>
 * ```
 */
function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'nx:flex nx:size-full nx:items-center nx:justify-center nx:bg-muted nx:text-foreground nx:font-medium',
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
