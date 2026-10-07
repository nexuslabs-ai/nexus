'use client';

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { ButtonGroupSizeContext } from '../button-group/button-group-context';
import { Spinner } from '../spinner';

const buttonVariants = cva(
  'nx:inline-flex nx:box-border nx:cursor-pointer nx:items-center nx:justify-center nx:rounded-base nx:border-default nx:border-transparent nx:whitespace-nowrap nx:transition-[color,background-color,border-color,scale] nx:duration-faster nx:ease-enter nx:scale-100 nx:active:scale-98 nx:disabled:active:scale-100 nx:aria-disabled:active:scale-100 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2 nx:disabled:pointer-events-none nx:disabled:cursor-default nx:disabled:opacity-100 nx:aria-disabled:pointer-events-none nx:aria-disabled:cursor-default nx:aria-disabled:opacity-100 nx:[&_svg]:pointer-events-none nx:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-background-hover nx:active:bg-primary-background-active nx:disabled:not-data-[loading=true]:bg-disabled nx:disabled:not-data-[loading=true]:text-disabled-foreground nx:aria-disabled:not-data-[loading=true]:bg-disabled nx:aria-disabled:not-data-[loading=true]:text-disabled-foreground',
        error:
          'nx:text-error-subtle-foreground nx:hover:bg-error-subtle-hover nx:active:bg-error-subtle-active nx:disabled:not-data-[loading=true]:text-disabled-foreground nx:aria-disabled:not-data-[loading=true]:text-disabled-foreground',
        'error-outline':
          'nx:border-error-border nx:bg-container nx:text-error-subtle-foreground nx:hover:bg-error-subtle-hover nx:active:bg-error-subtle-active nx:disabled:not-data-[loading=true]:border-border-disabled nx:disabled:not-data-[loading=true]:bg-disabled nx:disabled:not-data-[loading=true]:text-disabled-foreground nx:aria-disabled:not-data-[loading=true]:border-border-disabled nx:aria-disabled:not-data-[loading=true]:bg-disabled nx:aria-disabled:not-data-[loading=true]:text-disabled-foreground',
        destructive:
          'nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-background-hover nx:active:bg-error-background-active nx:disabled:not-data-[loading=true]:bg-disabled nx:disabled:not-data-[loading=true]:text-disabled-foreground nx:aria-disabled:not-data-[loading=true]:bg-disabled nx:aria-disabled:not-data-[loading=true]:text-disabled-foreground',
        outline:
          'nx:border-default nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:not-data-[loading=true]:border-border-disabled nx:disabled:not-data-[loading=true]:bg-disabled nx:disabled:not-data-[loading=true]:text-disabled-foreground nx:aria-disabled:not-data-[loading=true]:border-border-disabled nx:aria-disabled:not-data-[loading=true]:bg-disabled nx:aria-disabled:not-data-[loading=true]:text-disabled-foreground',
        dashed:
          'nx:border-default nx:border-dashed nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:not-data-[loading=true]:border-border-disabled nx:disabled:not-data-[loading=true]:bg-disabled nx:disabled:not-data-[loading=true]:text-disabled-foreground nx:aria-disabled:not-data-[loading=true]:border-border-disabled nx:aria-disabled:not-data-[loading=true]:bg-disabled nx:aria-disabled:not-data-[loading=true]:text-disabled-foreground',
        secondary:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-background-hover nx:active:bg-secondary-background-active nx:disabled:not-data-[loading=true]:bg-disabled nx:disabled:not-data-[loading=true]:text-disabled-foreground nx:aria-disabled:not-data-[loading=true]:bg-disabled nx:aria-disabled:not-data-[loading=true]:text-disabled-foreground',
        ghost:
          'nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:not-data-[loading=true]:text-disabled-foreground nx:aria-disabled:not-data-[loading=true]:text-disabled-foreground',
        link: 'nx:border-0 nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline nx:disabled:not-data-[loading=true]:text-disabled-foreground nx:aria-disabled:not-data-[loading=true]:text-disabled-foreground',
      },
      size: {
        xs: 'nx:h-7 nx:px-2 nx:gap-1 nx:typography-label-small nx:[&_svg]:size-icon-xs',
        sm: 'nx:h-8 nx:px-2.5 nx:gap-2 nx:typography-label-compact nx:[&_svg]:size-icon-sm',
        default:
          'nx:h-10 nx:px-3 nx:gap-2 nx:typography-label-default nx:[&_svg]:size-icon-default',
        lg: 'nx:h-12 nx:px-3.5 nx:gap-2 nx:typography-label-default nx:[&_svg]:size-icon-default',
        'icon-xs': 'nx:size-7 nx:gap-0 nx:p-0 nx:[&_svg]:size-icon-xs',
        'icon-sm': 'nx:size-8 nx:gap-0 nx:p-0 nx:[&_svg]:size-icon-sm',
        icon: 'nx:size-10 nx:gap-0 nx:p-0 nx:[&_svg]:size-icon-default',
        'icon-lg': 'nx:size-12 nx:gap-0 nx:p-0 nx:[&_svg]:size-icon-default',
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        size: ['xs', 'sm', 'default', 'lg'],
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
  return (
    size === 'icon-xs' ||
    size === 'icon-sm' ||
    size === 'icon' ||
    size === 'icon-lg'
  );
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
   * Shows a loading indicator and blocks interaction while retaining the variant colours.
   * While loading, the
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
        className="nx:relative nx:inline-flex nx:items-center nx:justify-center nx:gap-[inherit]"
      >
        <span
          data-slot="button-loading-label"
          className="nx:inline-flex nx:items-center nx:gap-[inherit] nx:opacity-0"
        >
          <ButtonIcon position="start">{startIcon}</ButtonIcon>
          {children}
          <ButtonIcon position="end">{endIcon}</ButtonIcon>
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

function preventActivation(event: React.SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function preventKeyboardActivation(event: React.KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') preventActivation(event);
}

/**
 * Native `<button>` by default. With `asChild`, the consumer's element renders
 * through Radix `Slot` with button styling and its own content untouched. A
 * non-button element ignores native `disabled`, so the disabled state there is
 * guarded during event capture, before child activation handlers can run.
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
  const blocked =
    isDisabled || ariaDisabled === true || ariaDisabled === 'true';
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

  if (
    asChild &&
    React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)
  ) {
    const child = blocked
      ? React.cloneElement(children, {
          'aria-disabled': true,
          tabIndex: -1,
          onClickCapture: undefined,
          onAuxClickCapture: undefined,
          onKeyDownCapture: undefined,
        })
      : children;
    return (
      <Slot
        {...sharedProps}
        {...props}
        tabIndex={blocked ? -1 : tabIndex}
        onClickCapture={blocked ? preventActivation : props.onClickCapture}
        onAuxClickCapture={
          blocked ? preventActivation : props.onAuxClickCapture
        }
        onKeyDownCapture={
          blocked ? preventKeyboardActivation : props.onKeyDownCapture
        }
      >
        {child}
      </Slot>
    );
  }

  return (
    <button
      {...sharedProps}
      {...props}
      type={type}
      disabled={isDisabled}
      tabIndex={tabIndex}
      onClickCapture={blocked ? preventActivation : props.onClickCapture}
      onAuxClickCapture={blocked ? preventActivation : props.onAuxClickCapture}
      onKeyDownCapture={
        blocked ? preventKeyboardActivation : props.onKeyDownCapture
      }
    >
      <ButtonContent loading={loading} startIcon={startIcon} endIcon={endIcon}>
        {children}
      </ButtonContent>
    </button>
  );
}

export { Button, type ButtonProps, buttonVariants };
