'use client';

import * as React from 'react';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const avatarVariants = cva(
  'nx:relative nx:flex nx:shrink-0 nx:after:pointer-events-none nx:after:absolute nx:after:inset-0 nx:after:rounded-[inherit] nx:after:outline nx:after:outline-1 nx:after:-outline-offset-1 nx:after:outline-border-hairline',
  {
    variants: {
      size: {
        '2xs':
          'nx:size-5 nx:text-[length:calc(var(--nx-typography-size-base)*0.625)]',
        xs: 'nx:size-6 nx:text-[length:calc(var(--nx-typography-size-base)*0.6875)]',
        sm: 'nx:size-8 nx:text-[length:calc(var(--nx-typography-size-base)*0.75)]',
        md: 'nx:size-10 nx:text-[length:calc(var(--nx-typography-size-base)*1)]',
        lg: 'nx:size-12 nx:text-[length:calc(var(--nx-typography-size-base)*1.125)]',
        xl: 'nx:size-14 nx:text-[length:calc(var(--nx-typography-size-base)*1.25)]',
        '2xl':
          'nx:size-16 nx:text-[length:calc(var(--nx-typography-size-base)*1.5)]',
        '3xl':
          'nx:size-20 nx:text-[length:calc(var(--nx-typography-size-base)*1.875)]',
        '4xl':
          'nx:size-24 nx:text-[length:calc(var(--nx-typography-size-base)*2.25)]',
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

type AvatarGroupContextValue = Pick<
  VariantProps<typeof avatarVariants>,
  'size' | 'shape'
>;

// Avatar falls back to this for `size`/`shape` when its own prop is unset.
const AvatarGroupContext = React.createContext<AvatarGroupContextValue | null>(
  null
);

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
   * Draws a non-interactive emphasis ring, such as for a selected person. Put focus rings on the interactive wrapper.
   */
  ring?: boolean;
}

/**
 * Shows a person's profile image, with initials or an icon as the fallback.
 *
 * @remarks
 * The `ring`, `AvatarStatus` and `AvatarGroup` rings use the `background` color.
 * On another surface, set `surface-*` on the wrapper so the rings match it:
 */
const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<AvatarProps>
>(function Avatar(propsWithoutRef, forwardedRef) {
  const {
    className,
    size,
    shape,
    ring = false,
    ...props
  }: React.PropsWithoutRef<AvatarProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const group = React.useContext(AvatarGroupContext);
  const resolvedSize = size ?? group?.size;
  const resolvedShape = shape ?? group?.shape;

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={resolvedSize ?? 'md'}
      data-shape={resolvedShape ?? 'circle'}
      data-ring={ring || undefined}
      className={cn(
        avatarVariants({ size: resolvedSize, shape: resolvedShape }),
        ring &&
          'nx:ring-2 nx:ring-primary-border nx:ring-offset-2 nx:ring-offset-surface',
        className
      )}
      {...props}
    />
  );
});

/**
 * AvatarImageProps
 *
 * Props for the AvatarImage component.
 */
type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image>;

/**
 * Profile image. AvatarFallback shows until it loads.
 *
 * @remarks
 * Defaults to `decoding="async"`. `loading="lazy"` has no effect, because the image is preloaded before it mounts.
 */
const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.PropsWithoutRef<AvatarImageProps>
>(function AvatarImage(propsWithoutRef, forwardedRef) {
  const {
    className,
    decoding = 'async',
    ...props
  }: React.PropsWithoutRef<AvatarImageProps> & {
    ref?: React.ForwardedRef<HTMLImageElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      decoding={decoding}
      className={cn(
        'nx:aspect-square nx:size-full nx:rounded-[inherit] nx:object-cover',
        'nx:animate-in nx:fade-in-0 nx:duration-fast nx:ease-enter',
        className
      )}
      {...props}
    />
  );
});

/**
 * AvatarFallbackProps
 *
 * Props for the AvatarFallback component.
 */
type AvatarFallbackProps = React.ComponentProps<
  typeof AvatarPrimitive.Fallback
>;

/**
 * Shows while the image loads or if it fails, usually initials or an icon.
 */
const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<AvatarFallbackProps>
>(function AvatarFallback(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AvatarFallbackProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-[inherit] nx:bg-muted nx:text-foreground nx:font-medium nx:leading-none',
        className
      )}
      {...props}
    />
  );
});

const avatarStatusVariants = cva(
  'nx:absolute nx:right-[0.04em] nx:bottom-[0.04em] nx:size-[0.6em] nx:rounded-full nx:ring-[0.1em] nx:ring-surface',
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

const STATUS_LABELS = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
} as const satisfies Record<
  NonNullable<VariantProps<typeof avatarStatusVariants>['status']>,
  string
>;

interface AvatarStatusProps
  extends
    Omit<React.ComponentProps<'span'>, 'children'>,
    VariantProps<typeof avatarStatusVariants> {
  /**
   * Screen reader text for the dot, the capitalized `status` by default. Pass `''` when visible text already shows presence.
   */
  label?: string;
}

/**
 * Presence dot in the avatar's corner, with a hidden label such as "Online" for screen readers.
 * Add visible status text too, because color alone doesn't reach every reader.
 *
 * @remarks
 * If the parent `Avatar` has `role="img"`, screen readers skip this label.
 * Put the status in the parent's name instead: `<Avatar role="img" aria-label="Ada Lovelace, online">`.
 */
const AvatarStatus = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<AvatarStatusProps>
>(function AvatarStatus(propsWithoutRef, forwardedRef) {
  const {
    className,
    status = 'online',
    label,
    ...props
  }: React.PropsWithoutRef<AvatarStatusProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  // cva types `status` as nullable; the destructure default only narrows
  // `undefined`, so coerce the residual `null` for the label lookup.
  const resolvedLabel = label ?? STATUS_LABELS[status ?? 'online'];

  return (
    <span
      data-slot="avatar-status"
      data-status={status}
      className={cn(avatarStatusVariants({ status }), className)}
      {...props}
    >
      <span className="nx:sr-only">{resolvedLabel}</span>
    </span>
  );
});

interface AvatarGroupProps
  extends
    React.ComponentProps<'div'>,
    Pick<VariantProps<typeof avatarVariants>, 'size' | 'shape'> {
  /**
   * Number of avatars shown before the rest collapse into a +N tile.
   */
  max?: number;
}

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AvatarGroupProps>
>(function AvatarGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    max,
    size,
    shape,
    ...props
  }: React.PropsWithoutRef<AvatarGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const items = React.Children.toArray(children);
  const hasMax = typeof max === 'number' && max > 0;
  const visibleItems = hasMax ? items.slice(0, max) : items;
  const overflowCount = hasMax ? items.length - visibleItems.length : 0;
  const groupContext = React.useMemo(() => ({ size, shape }), [size, shape]);

  return (
    <AvatarGroupContext.Provider value={groupContext}>
      <div
        data-slot="avatar-group"
        data-size={size}
        data-shape={shape}
        className={cn(
          'nx:flex nx:items-center',
          // Overlap scales with each avatar's font-size (set per size), so the
          // tuck stays ~proportional from 2xs to 4xl instead of a fixed px.
          'nx:[&>[data-slot=avatar]+[data-slot=avatar]]:ms-[-0.7em]',
          'nx:*:data-[slot=avatar]:relative',
          'nx:*:data-[slot=avatar]:ring-[0.1em] nx:*:data-[slot=avatar]:ring-surface',
          className
        )}
        {...props}
      >
        {visibleItems}
        {overflowCount > 0 && (
          <Avatar role="img" aria-label={`${overflowCount} more`}>
            <AvatarFallback aria-hidden="true">+{overflowCount}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </AvatarGroupContext.Provider>
  );
});

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
