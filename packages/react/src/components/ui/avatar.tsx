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
        rounded: '', // Applied conditionally based on size
      },
    },
    compoundVariants: [
      // Rounded rectangle radius varies by size
      { size: '2xs', shape: 'rounded', className: 'nx:rounded-md' },
      { size: 'xs', shape: 'rounded', className: 'nx:rounded-lg' },
      { size: 'sm', shape: 'rounded', className: 'nx:rounded-lg' },
      { size: 'md', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: 'lg', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: 'xl', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: '2xl', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: '3xl', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: '4xl', shape: 'rounded', className: 'nx:rounded-2xl' },
    ],
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

const avatarFallbackVariants = cva(
  'nx:flex nx:size-full nx:items-center nx:justify-center nx:bg-muted nx:text-foreground nx:font-normal',
  {
    variants: {
      size: {
        '2xs': 'nx:text-xs',
        xs: 'nx:text-sm',
        sm: 'nx:text-sm',
        md: 'nx:text-sm',
        lg: 'nx:text-sm',
        xl: 'nx:text-sm',
        '2xl': 'nx:text-sm',
        '3xl': 'nx:text-base',
        '4xl': 'nx:text-lg',
      },
      shape: {
        circle: 'nx:rounded-full',
        rounded: '', // Applied conditionally based on size
      },
    },
    compoundVariants: [
      // Rounded rectangle radius varies by size
      { size: '2xs', shape: 'rounded', className: 'nx:rounded-md' },
      { size: 'xs', shape: 'rounded', className: 'nx:rounded-lg' },
      { size: 'sm', shape: 'rounded', className: 'nx:rounded-lg' },
      { size: 'md', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: 'lg', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: 'xl', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: '2xl', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: '3xl', shape: 'rounded', className: 'nx:rounded-2xl' },
      { size: '4xl', shape: 'rounded', className: 'nx:rounded-2xl' },
    ],
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

type AvatarContextValue = {
  size: NonNullable<VariantProps<typeof avatarVariants>['size']>;
  shape: NonNullable<VariantProps<typeof avatarVariants>['shape']>;
};

const AvatarContext = React.createContext<AvatarContextValue>({
  size: 'md',
  shape: 'circle',
});

function useAvatarContext() {
  return React.useContext(AvatarContext);
}

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

/**
 * Avatar root component that provides context for size and shape to children.
 * Wraps Radix UI Avatar primitive.
 *
 * @example
 * ```tsx
 * <Avatar size="lg" shape="circle">
 *   <AvatarImage src="/avatar.jpg" alt="User" />
 *   <AvatarFallback>CN</AvatarFallback>
 * </Avatar>
 * ```
 */
function Avatar({
  className,
  size = 'md',
  shape = 'circle',
  ...props
}: AvatarProps) {
  return (
    <AvatarContext.Provider value={{ size: size ?? 'md', shape: shape ?? 'circle' }}>
      <AvatarPrimitive.Root
        data-slot="avatar"
        data-size={size}
        data-shape={shape}
        className={cn(avatarVariants({ size, shape, className }))}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image>;

/**
 * Image element for the avatar. Falls back to AvatarFallback if image fails to load.
 * Must be used within an Avatar component.
 *
 * @example
 * ```tsx
 * <AvatarImage src="/avatar.jpg" alt="User profile" />
 * ```
 */
function AvatarImage({ className, ...props }: AvatarImageProps) {
  const { shape, size } = useAvatarContext();

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        'nx:aspect-square nx:size-full nx:object-cover',
        shape === 'circle' && 'nx:rounded-full',
        shape === 'rounded' && size === '2xs' && 'nx:rounded-md',
        shape === 'rounded' && (size === 'xs' || size === 'sm') && 'nx:rounded-lg',
        shape === 'rounded' &&
          size !== '2xs' &&
          size !== 'xs' &&
          size !== 'sm' &&
          'nx:rounded-2xl',
        className
      )}
      {...props}
    />
  );
}

type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback>;

/**
 * Fallback content displayed when avatar image fails to load or while loading.
 * Typically contains user initials.
 * Must be used within an Avatar component.
 *
 * @example
 * ```tsx
 * <AvatarFallback>CN</AvatarFallback>
 * ```
 */
function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  const { size, shape } = useAvatarContext();

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(avatarFallbackVariants({ size, shape, className }))}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarFallback,
  type AvatarFallbackProps,
  avatarFallbackVariants,
  AvatarImage,
  type AvatarImageProps,
  type AvatarProps,
  avatarVariants,
};
