import * as React from 'react';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const avatarVariants = cva('nx:relative nx:flex nx:shrink-0', {
  variants: {
    size: {
      '2xs': 'nx:size-5 nx:text-[0.625rem]',
      xs: 'nx:size-6 nx:text-[0.6875rem]',
      sm: 'nx:size-8 nx:text-xs',
      md: 'nx:size-10 nx:text-base',
      lg: 'nx:size-12 nx:text-lg',
      xl: 'nx:size-14 nx:text-xl',
      '2xl': 'nx:size-16 nx:text-2xl',
      '3xl': 'nx:size-20 nx:text-3xl',
      '4xl': 'nx:size-24 nx:text-4xl',
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
});

/**
 * AvatarProps
 *
 * Props for the Avatar component.
 */
interface AvatarProps
  extends
    React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  /**
   * When true, renders a non-interactive emphasis ring around the avatar.
   * Use for selected/current visual emphasis; focus rings belong on the
   * interactive wrapper, not Avatar itself.
   * @default false
   * @example
   * ```tsx
   * <Avatar ring>
   *   <AvatarFallback>JD</AvatarFallback>
   * </Avatar>
   * ```
   */
  ring?: boolean;
}

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
function Avatar({
  className,
  size,
  shape,
  ring = false,
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      data-ring={ring || undefined}
      className={cn(
        avatarVariants({ size, shape }),
        ring &&
          'nx:ring-2 nx:ring-border-primary nx:ring-offset-2 nx:ring-offset-background',
        className
      )}
      {...props}
    />
  );
}

/**
 * AvatarImageProps
 *
 * Props for the AvatarImage component.
 */
interface AvatarImageProps extends React.ComponentProps<
  typeof AvatarPrimitive.Image
> {}

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
      className={cn(
        'nx:aspect-square nx:size-full nx:rounded-[inherit] nx:object-cover',
        'nx:animate-in nx:fade-in-0 nx:duration-150 nx:ease-out nx:motion-reduce:animate-none',
        className
      )}
      {...props}
    />
  );
}

/**
 * AvatarFallbackProps
 *
 * Props for the AvatarFallback component.
 */
interface AvatarFallbackProps extends React.ComponentProps<
  typeof AvatarPrimitive.Fallback
> {}

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
        'nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-[inherit] nx:bg-muted nx:text-foreground nx:font-medium nx:leading-none',
        'nx:animate-in nx:fade-in-0 nx:duration-150 nx:ease-out nx:motion-reduce:animate-none',
        className
      )}
      {...props}
    />
  );
}

const avatarStatusVariants = cva(
  'nx:absolute nx:right-[0.04em] nx:bottom-[0.04em] nx:size-[0.6em] nx:rounded-full nx:ring-2 nx:ring-background',
  {
    variants: {
      status: {
        online: 'nx:bg-success-background',
        away: 'nx:bg-warning-background',
        busy: 'nx:bg-error-background',
        offline: 'nx:bg-muted',
      },
    },
    defaultVariants: {
      status: 'online',
    },
  }
);

interface AvatarStatusProps
  extends
    React.ComponentProps<'span'>,
    VariantProps<typeof avatarStatusVariants> {}

function AvatarStatus({
  className,
  status = 'online',
  'aria-hidden': ariaHidden = true,
  ...props
}: AvatarStatusProps) {
  return (
    <span
      data-slot="avatar-status"
      data-status={status}
      aria-hidden={ariaHidden}
      className={cn(avatarStatusVariants({ status }), className)}
      {...props}
    />
  );
}

interface AvatarGroupProps extends React.ComponentProps<'div'> {
  /**
   * Maximum number of avatars to render before collapsing the remainder into a
   * +N tile.
   * @default undefined
   * @example
   * ```tsx
   * <AvatarGroup max={3}>{avatars}</AvatarGroup>
   * ```
   */
  max?: number;
}

function AvatarGroup({ className, children, max, ...props }: AvatarGroupProps) {
  const items = React.Children.toArray(children);
  const hasMax = typeof max === 'number' && max > 0;
  const visibleItems = hasMax ? items.slice(0, max) : items;
  const overflowCount = hasMax ? items.length - visibleItems.length : 0;

  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'nx:flex nx:items-center nx:[&>[data-slot=avatar]+[data-slot=avatar]]:-ms-2',
        'nx:[&>[data-slot=avatar]]:relative nx:[&>[data-slot=avatar]]:ring-2 nx:[&>[data-slot=avatar]]:ring-background',
        className
      )}
      {...props}
    >
      {visibleItems}
      {overflowCount > 0 && (
        <Avatar data-slot="avatar">
          <AvatarFallback>+{overflowCount}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export {
  Avatar,
  AvatarFallback,
  type AvatarFallbackProps,
  AvatarGroup,
  type AvatarGroupProps,
  AvatarImage,
  type AvatarImageProps,
  type AvatarProps,
  AvatarStatus,
  type AvatarStatusProps,
  avatarStatusVariants,
  avatarVariants,
};
