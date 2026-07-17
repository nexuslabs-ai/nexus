import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { ButtonGroupSizeContext } from '../button-group/button-group-context';
import { Spinner } from '../spinner';

const buttonVariants = cva(
  'nx:inline-flex nx:box-border nx:cursor-pointer nx:items-center nx:justify-center nx:rounded-base nx:border-default nx:border-transparent nx:whitespace-nowrap nx:transition-[color,background-color,border-color,scale] nx:active:scale-[0.96] nx:motion-reduce:active:scale-100 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:cursor-default nx:disabled:opacity-100 nx:aria-disabled:pointer-events-none nx:aria-disabled:cursor-default nx:aria-disabled:opacity-100 nx:[&_svg]:pointer-events-none nx:[&_svg]:size-3.5 nx:[&_svg]:shrink-0',
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
          'nx:border-default nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-secondary-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-secondary-disabled nx:aria-disabled:text-disabled-foreground',
        dashed:
          'nx:border-default nx:border-dashed nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-disabled nx:aria-disabled:text-disabled-foreground',
        secondary:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-background-hover nx:active:bg-secondary-background-active nx:disabled:bg-secondary-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:bg-secondary-disabled nx:aria-disabled:text-disabled-foreground',
        ghost:
          'nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        link: 'nx:border-0 nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline nx:active:scale-100 nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
      },
      size: {
        sm: 'nx:h-8 nx:px-2.5 nx:gap-2 nx:typography-label-default',
        default: 'nx:h-10 nx:px-3 nx:gap-2 nx:typography-label-default',
        lg: 'nx:h-12 nx:px-3.5 nx:gap-2 nx:typography-label-default',
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

interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /**
   * When true, the button renders as its child element (via Radix Slot),
   * applying button styling to e.g. an `<a>` while leaving the child's own
   * content untouched — compose icons inside the child. `loading` and the
   * `startIcon` / `endIcon` slots apply to the native `<button>` only.
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
   * Shows a loading indicator and disables the button. While loading, the
   * spinner replaces all visible content and any icon slots are hidden.
   * @default false
   * @example
   * ```tsx
   * <Button loading>Submitting...</Button>
   * ```
   */
  loading?: boolean;

  /**
   * Decorative icon rendered before the button label. Use either `startIcon`
   * or `endIcon`, not both. Hidden while `loading` (the spinner replaces all
   * content).
   */
  startIcon?: React.ReactNode;

  /**
   * Decorative icon rendered after the button label. Use either `endIcon`
   * or `startIcon`, not both. Hidden while `loading` (the spinner replaces all
   * content).
   */
  endIcon?: React.ReactNode;
}

function hasIconSlot(icon: React.ReactNode) {
  return icon !== undefined && icon !== null && icon !== false;
}

function ButtonIcon({
  position,
  children,
}: {
  position: 'start' | 'end';
  children: React.ReactNode;
}) {
  if (!hasIconSlot(children)) return null;
  return (
    <span
      aria-hidden="true"
      data-slot={`button-${position}-icon`}
      className="nx:inline-flex nx:shrink-0"
    >
      {children}
    </span>
  );
}

/** Icon slots and label content; loading renders spinner-only visually. */
function ButtonContent({
  loading,
  startIcon,
  endIcon,
  children,
}: {
  loading: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (loading)
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

  return (
    <>
      <ButtonIcon position="start">{startIcon}</ButtonIcon>
      {children}
      <ButtonIcon position="end">{endIcon}</ButtonIcon>
    </>
  );
}

/**
 * Native `<button>` by default. With `asChild`, the consumer's element renders
 * through Radix `Slot` with button styling and its own content untouched. A
 * non-button element ignores native `disabled`, so the disabled state there is
 * best-effort: `aria-disabled`, `tabIndex={-1}`, and the
 * `aria-disabled:pointer-events-none` class block real interaction.
 */
function Button({
  asChild = false,
  className,
  variant = 'default',
  size,
  loading = false,
  disabled,
  children,
  startIcon,
  endIcon,
  type = 'button',
  tabIndex,
  'aria-busy': ariaBusy,
  'aria-disabled': ariaDisabled,
  ...props
}: ButtonProps) {
  // Inherit the enclosing ButtonGroup's size when no explicit size is set, so a
  // Button nested inside a trigger wrapper (a split button) still picks it up.
  const groupSize = React.useContext(ButtonGroupSizeContext);
  const semanticSize = size ?? groupSize ?? 'default';
  const isDisabled = disabled || loading;
  const iconOnly = isIconButtonSize(semanticSize);

  const sharedProps = {
    'data-slot': 'button',
    'data-variant': variant,
    'data-size': semanticSize,
    'data-icon-only': iconOnly || undefined,
    'data-loading': loading || undefined,
    className: cn(buttonVariants({ variant, size: semanticSize, className })),
    'aria-busy': loading || ariaBusy || undefined,
    'aria-disabled': isDisabled || ariaDisabled || undefined,
  };

  if (asChild && React.isValidElement(children))
    return (
      <Slot {...sharedProps} {...props} tabIndex={isDisabled ? -1 : tabIndex}>
        {children}
      </Slot>
    );

  return (
    <button
      {...sharedProps}
      {...props}
      type={type}
      disabled={isDisabled}
      tabIndex={tabIndex}
    >
      <ButtonContent loading={loading} startIcon={startIcon} endIcon={endIcon}>
        {children}
      </ButtonContent>
    </button>
  );
}

export { Button, type ButtonProps, buttonVariants };
