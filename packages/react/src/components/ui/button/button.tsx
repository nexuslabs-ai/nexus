import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'nx:inline-flex nx:box-border nx:cursor-pointer nx:items-center nx:justify-center nx:rounded-base nx:border nx:border-transparent nx:whitespace-nowrap nx:transition-colors nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:cursor-default nx:disabled:opacity-100 nx:aria-disabled:pointer-events-none nx:aria-disabled:cursor-default nx:aria-disabled:opacity-100 nx:[&_svg]:pointer-events-none nx:[&_svg]:size-3.5 nx:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-background-hover nx:active:bg-primary-background-active nx:disabled:bg-primary-disabled nx:aria-disabled:bg-primary-disabled',
        error:
          'nx:text-error-subtle-foreground nx:hover:bg-error-subtle-hover nx:active:bg-error-subtle-active nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        destructive:
          'nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-background-hover nx:active:bg-error-background-active nx:disabled:bg-error-disabled nx:aria-disabled:bg-error-disabled',
        outline:
          'nx:border nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-background-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-disabled nx:aria-disabled:text-disabled-foreground',
        dashed:
          'nx:border nx:border-dashed nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-background-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-disabled nx:aria-disabled:text-disabled-foreground',
        secondary:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-background-hover nx:active:bg-secondary-background-active nx:disabled:bg-secondary-disabled nx:aria-disabled:bg-secondary-disabled',
        ghost:
          'nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        link: 'nx:border-0 nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
      },
      size: {
        sm: 'nx:h-8 nx:px-2.5 nx:gap-1 nx:typography-label-default',
        default: 'nx:h-10 nx:px-3 nx:gap-1 nx:typography-label-default',
        lg: 'nx:h-12 nx:px-3.5 nx:gap-1 nx:typography-label-large',
        'icon-sm':
          'nx:relative nx:size-8 nx:gap-0 nx:p-0 nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-1.5',
        icon: 'nx:relative nx:size-10 nx:gap-0 nx:p-0 nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-0.5',
        'icon-lg': 'nx:relative nx:size-12 nx:gap-0 nx:p-0',
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        size: ['sm', 'default', 'lg'],
        className: 'nx:h-auto nx:p-0!',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

function isIconButtonSize(size: ButtonSize) {
  return size === 'icon-sm' || size === 'icon' || size === 'icon-lg';
}

function getVisualButtonSize(
  size: ButtonSize,
  isIconOnly: boolean
): ButtonSize {
  if (!isIconOnly) return size;
  if (isIconButtonSize(size)) return size;
  if (size === 'sm') return 'icon-sm';
  if (size === 'lg') return 'icon-lg';
  return 'icon';
}

interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /**
   * When true, the button will render as its child element (using Radix Slot).
   * Useful for rendering as a link or custom element while keeping button styles.
   * @default false
   * @example
   * ```tsx
   * <Button asChild>
   *   <a href="/page">Link styled as button</a>
   * </Button>
   * ```
   */
  asChild?: boolean;

  /**
   * Shows a loading indicator and disables the button.
   * While loading, the spinner replaces all visible content and any icon
   * slots are hidden.
   * @default false
   * @example
   * ```tsx
   * <Button loading>Submitting...</Button>
   * ```
   */
  loading?: boolean;

  /**
   * Decorative icon rendered before the button label. Use either `startIcon`
   * or `endIcon` — the Figma anatomy has a single icon slot. Hidden while
   * `loading` (the spinner replaces all content).
   */
  startIcon?: React.ReactNode;

  /**
   * Decorative icon rendered after the button label. Use either `endIcon`
   * or `startIcon` — the Figma anatomy has a single icon slot. Hidden while
   * `loading` (the spinner replaces all content).
   */
  endIcon?: React.ReactNode;

  /**
   * Uses the fixed icon-only sizing model while preserving the same Button
   * semantics. `sm`, `default`, and `lg` map to the 8/10/12 spacing scale.
   * Icon-only buttons require `aria-label` or `aria-labelledby`.
   * @default false
   */
  isIconOnly?: boolean;
}

type ButtonAsChildElementProps = {
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

function hasIconSlot(icon: React.ReactNode) {
  return icon !== undefined && icon !== null && icon !== false;
}

function buttonIconSlot(position: 'start' | 'end', icon: React.ReactNode) {
  if (!hasIconSlot(icon)) return null;
  return (
    <span
      aria-hidden="true"
      data-slot={`button-${position}-icon`}
      className="nx:inline-flex nx:shrink-0"
    >
      {icon}
    </span>
  );
}

function buttonLoadingContent(children: React.ReactNode) {
  return (
    <span
      data-slot="button-loading-content"
      className="nx:relative nx:inline-flex nx:items-center nx:justify-center"
    >
      <span data-slot="button-loading-label" className="nx:opacity-0">
        {children}
      </span>
      <Spinner
        aria-hidden="true"
        className="nx:absolute nx:left-1/2 nx:top-1/2 nx:-translate-x-1/2 nx:-translate-y-1/2"
      />
    </span>
  );
}

/** Icon slots and label content; loading renders spinner-only visually. */
function buttonContent({
  children,
  endIcon,
  loading,
  startIcon,
}: {
  children: React.ReactNode;
  endIcon?: React.ReactNode;
  loading: boolean;
  startIcon?: React.ReactNode;
}) {
  if (loading) return buttonLoadingContent(children);

  return (
    <>
      {buttonIconSlot('start', startIcon)}
      {children}
      {buttonIconSlot('end', endIcon)}
    </>
  );
}

/**
 * The default `<button>`. Native `disabled` gives non-interactivity for free —
 * it blocks the click, focus, and keyboard with no JS guard needed.
 */
function NativeButton({
  className,
  variant = 'default',
  size,
  isIconOnly = false,
  loading = false,
  disabled,
  children,
  endIcon,
  startIcon,
  type = 'button',
  'aria-busy': ariaBusy,
  'aria-disabled': ariaDisabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const semanticSize = size ?? 'default';
  const visualSize = getVisualButtonSize(semanticSize, isIconOnly);
  const iconOnly = isIconOnly || isIconButtonSize(semanticSize);

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={semanticSize}
      data-icon-only={iconOnly || undefined}
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, size: visualSize, className }))}
      {...props}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled || ariaDisabled || undefined}
      aria-busy={loading || ariaBusy || undefined}
    >
      {buttonContent({ children, endIcon, loading, startIcon })}
    </button>
  );
}

/**
 * The `asChild` path. The child (e.g. an `<a>`) ignores native `disabled`, so
 * non-interactivity is faked with `aria-disabled`, `tabIndex={-1}`, and a click
 * guard. The child's own `onClick` is pulled onto the guarded handler so it
 * can't fire while disabled.
 */
function SlotButton({
  className,
  variant = 'default',
  size,
  isIconOnly = false,
  loading = false,
  disabled,
  children,
  endIcon,
  onClick,
  startIcon,
  tabIndex,
  'aria-busy': ariaBusy,
  'aria-disabled': ariaDisabled,
  ...props
}: ButtonProps) {
  if (!React.isValidElement<ButtonAsChildElementProps>(children)) return null;

  const isDisabled = disabled || loading;
  const semanticSize = size ?? 'default';
  const visualSize = getVisualButtonSize(semanticSize, isIconOnly);
  const iconOnly = isIconOnly || isIconButtonSize(semanticSize);
  const childOnClick = children.props.onClick;

  const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    childOnClick?.(event);
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
  };

  return (
    <Slot
      data-slot="button"
      data-variant={variant}
      data-size={semanticSize}
      data-icon-only={iconOnly || undefined}
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, size: visualSize, className }))}
      {...props}
      aria-disabled={isDisabled || ariaDisabled || undefined}
      aria-busy={loading || ariaBusy || undefined}
      tabIndex={isDisabled ? -1 : tabIndex}
      onClick={handleClick}
    >
      {React.cloneElement(
        children,
        { onClick: undefined },
        buttonContent({
          children: children.props.children,
          endIcon,
          loading,
          startIcon,
        })
      )}
    </Slot>
  );
}

function Button({ asChild = false, type, ...props }: ButtonProps) {
  if (asChild && React.isValidElement(props.children))
    return <SlotButton {...props} />;
  return <NativeButton {...props} type={type} />;
}

export { Button, type ButtonProps, buttonVariants };
