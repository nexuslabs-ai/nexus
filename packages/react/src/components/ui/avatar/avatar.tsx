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
 *
 * @remarks
 * The emphasis `ring`, `AvatarStatus`, and `AvatarGroup` separator rings read
 * the `--avatar-surface` CSS variable (default: `background`). When avatars sit
 * on a non-default surface, set it on a wrapper so the rings match it instead
 * of leaving a `background`-coloured halo:
 *
 * @example
 * ```tsx
 * // On a container surface — rings match the card, no halo
 * <div className="nx:bg-container nx:[--avatar-surface:var(--nx-color-container)]">
 *   <AvatarGroup>{avatars}</AvatarGroup>
 * </div>
 * ```
 */
function Avatar({
  className,
  size,
  shape,
  ring = false,
  ...props
}: AvatarProps) {
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
          'nx:ring-2 nx:ring-border-primary nx:ring-offset-2 nx:ring-offset-(--avatar-surface,var(--nx-color-background))',
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
 * @remarks
 * Defaults `decoding="async"` so the browser can decode off the main thread.
 * No `loading="lazy"` — Radix preloads the source with `new Image()` before
 * mounting the `<img>`, so the attribute on the rendered element is inert.
 *
 * @example
 * ```tsx
 * <AvatarImage src="/avatar.png" alt="John Doe" />
 * ```
 */
function AvatarImage({
  className,
  decoding = 'async',
  ...props
}: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      decoding={decoding}
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
  'nx:absolute nx:right-[0.04em] nx:bottom-[0.04em] nx:size-[0.6em] nx:rounded-full nx:ring-[0.1em] nx:ring-(--avatar-surface,var(--nx-color-background))',
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
   * Visually-hidden text announced by assistive tech in place of the
   * colour-only dot. Defaults to the capitalised `status`. Pass `''` to opt
   * out when an adjacent text label already conveys presence.
   * @default the capitalised `status` ('Online', 'Away', 'Busy', 'Offline')
   */
  label?: string;
}

/**
 * AvatarStatus
 *
 * A presence dot pinned to the avatar's corner. Conveys status with colour and
 * an attached visually-hidden label, so assistive tech announces it (e.g.
 * "Online"). Sighted users who cannot rely on colour should be given a
 * redundant text label by the consumer.
 *
 * @remarks
 * The label only reaches assistive tech when the parent `Avatar` is not atomic.
 * If the parent sets `role="img"` (the fallback-only pattern), it suppresses
 * every descendant — including this label — so fold the status into the
 * parent's name instead: `<Avatar role="img" aria-label="Ada Lovelace, online">`.
 *
 * @example
 * ```tsx
 * <Avatar>
 *   <AvatarImage src="/avatar.png" alt="Ada Lovelace" />
 *   <AvatarFallback>AL</AvatarFallback>
 *   <AvatarStatus status="online" />
 * </Avatar>
 * ```
 */
function AvatarStatus({
  className,
  status = 'online',
  label,
  ...props
}: AvatarStatusProps) {
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
}

interface AvatarGroupProps
  extends
    React.ComponentProps<'div'>,
    Pick<VariantProps<typeof avatarVariants>, 'size' | 'shape'> {
  /**
   * Maximum number of avatars to render before collapsing the remainder into a
   * +N tile.
   * @default undefined
   * @example
   * ```tsx
   * <AvatarGroup size="lg" max={3}>{avatars}</AvatarGroup>
   * ```
   */
  max?: number;
}

function AvatarGroup({
  className,
  children,
  max,
  size,
  shape,
  ...props
}: AvatarGroupProps) {
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
          'nx:*:data-[slot=avatar]:ring-[0.1em] nx:*:data-[slot=avatar]:ring-(--avatar-surface,var(--nx-color-background))',
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
