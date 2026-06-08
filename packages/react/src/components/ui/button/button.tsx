import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'nx:inline-flex nx:cursor-pointer nx:items-center nx:justify-center nx:overflow-clip nx:rounded-base nx:whitespace-nowrap nx:shadow-xs nx:transition-colors nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:cursor-default nx:disabled:opacity-100 nx:disabled:shadow-none nx:aria-disabled:pointer-events-none nx:aria-disabled:cursor-default nx:aria-disabled:opacity-100 nx:aria-disabled:shadow-none nx:[&_svg]:pointer-events-none nx:[&_svg]:size-3.5 nx:[&_svg]:shrink-0',
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
        link: 'nx:text-primary-subtle-foreground nx:underline-offset-4 nx:shadow-none nx:hover:underline nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
      },
      size: {
        sm: 'nx:px-2.5 nx:py-1.5 nx:gap-1 nx:typography-label-small',
        default: 'nx:typography-label-default nx:px-3 nx:py-1.5 nx:gap-1',
        lg: 'nx:typography-label-default nx:px-3.5 nx:py-2 nx:gap-1',
        'icon-sm':
          'nx:relative nx:size-[24px] nx:gap-0 nx:p-0 nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-[10px]',
        icon: 'nx:relative nx:size-[28px] nx:gap-0 nx:p-0 nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-[8px]',
        'icon-lg':
          'nx:relative nx:size-[32px] nx:gap-0 nx:p-0 nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-[6px]',
      },
    },
    compoundVariants: [
      {
        variant: ['outline', 'dashed'],
        size: 'sm',
        className: 'nx:px-[9px] nx:py-[5px]',
      },
      {
        variant: ['outline', 'dashed'],
        size: 'default',
        className: 'nx:px-[11px] nx:py-[5px]',
      },
      {
        variant: ['outline', 'dashed'],
        size: 'lg',
        className: 'nx:px-[13px] nx:py-[7px]',
      },
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
   * Loading buttons cannot render startIcon or endIcon.
   * @default false
   * @example
   * ```tsx
   * <Button loading>Submitting...</Button>
   * ```
   */
  loading?: boolean;

  /**
   * Decorative icon rendered before the button label.
   * Mutually exclusive with endIcon and loading.
   */
  startIcon?: React.ReactNode;

  /**
   * Decorative icon rendered after the button label.
   * Mutually exclusive with startIcon and loading.
   */
  endIcon?: React.ReactNode;

  /**
   * Uses the Figma icon-only sizing model while preserving the same Button
   * semantics. `sm`, `default`, and `lg` map to 24px, 28px, and 32px visuals.
   * @default false
   */
  isIconOnly?: boolean;
}

type ButtonAsChildElementProps = {
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

const MAX_BUTTON_LABEL_WORDS = 2;

function hasIconSlot(icon: React.ReactNode) {
  return icon !== undefined && icon !== null && icon !== false;
}

function countLabelWords(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function countButtonLabelWords(content: React.ReactNode): number {
  if (content === undefined || content === null || content === false) {
    return 0;
  }

  if (typeof content === 'string' || typeof content === 'number') {
    return countLabelWords(String(content));
  }

  if (Array.isArray(content)) {
    return content.reduce(
      (wordCount, child) => wordCount + countButtonLabelWords(child),
      0
    );
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(content)) {
    return countButtonLabelWords(content.props.children);
  }

  return 0;
}

function hasButtonContent(content: React.ReactNode): boolean {
  if (
    content === undefined ||
    content === null ||
    typeof content === 'boolean'
  ) {
    return false;
  }

  if (typeof content === 'string') {
    return content.trim().length > 0;
  }

  if (Array.isArray(content)) {
    return content.some(hasButtonContent);
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(content)) {
    if (content.type === React.Fragment) {
      return hasButtonContent(content.props.children);
    }
    return true;
  }

  return true;
}

function validateButtonContent(children: React.ReactNode) {
  if (!hasButtonContent(children)) {
    throw new Error('Button requires non-empty children.');
  }

  if (countButtonLabelWords(children) > MAX_BUTTON_LABEL_WORDS) {
    throw new Error('Button label must be one or two words.');
  }
}

function validateButtonIconSlots({
  endIcon,
  loading,
  startIcon,
}: {
  endIcon?: React.ReactNode;
  loading: boolean;
  startIcon?: React.ReactNode;
}) {
  const hasStartIcon = hasIconSlot(startIcon);
  const hasEndIcon = hasIconSlot(endIcon);

  if (hasStartIcon && hasEndIcon) {
    throw new Error('Button supports either startIcon or endIcon, not both.');
  }

  if (loading && (hasStartIcon || hasEndIcon)) {
    throw new Error('Button icon slots are not supported while loading.');
  }
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

/** Icon slots, label content, plus a trailing spinner while loading. */
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
  return (
    <>
      {buttonIconSlot('start', startIcon)}
      {children}
      {buttonIconSlot('end', endIcon)}
      {loading && <Spinner aria-hidden="true" />}
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
  size = 'default',
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
  validateButtonContent(children);
  validateButtonIconSlots({ endIcon, loading, startIcon });

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
      aria-busy={loading || ariaBusy}
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
  size = 'default',
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
  const isDisabled = disabled || loading;
  const semanticSize = size ?? 'default';
  const visualSize = getVisualButtonSize(semanticSize, isIconOnly);
  const iconOnly = isIconOnly || isIconButtonSize(semanticSize);
  const child = React.isValidElement<ButtonAsChildElementProps>(children)
    ? children
    : null;
  validateButtonContent(child ? child.props.children : children);
  validateButtonIconSlots({ endIcon, loading, startIcon });
  const childOnClick = child?.props.onClick;

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
      aria-busy={loading || ariaBusy}
      tabIndex={isDisabled ? -1 : tabIndex}
      onClick={handleClick}
    >
      {child
        ? React.cloneElement(
            child,
            { onClick: undefined },
            buttonContent({
              children: child.props.children,
              endIcon,
              loading,
              startIcon,
            })
          )
        : buttonContent({ children, endIcon, loading, startIcon })}
    </Slot>
  );
}

function Button({ asChild = false, type, ...props }: ButtonProps) {
  if (asChild) return <SlotButton {...props} />;
  return <NativeButton {...props} type={type} />;
}

export { Button, type ButtonProps, buttonVariants };
