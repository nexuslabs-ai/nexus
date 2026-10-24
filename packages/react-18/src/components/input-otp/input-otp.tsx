'use client';

import * as React from 'react';

import { OTPInput, OTPInputContext } from 'input-otp';

import { IconPointFilled } from '../../lib/icons';
import { cn } from '../../lib/utils';

/**
 * Every `input-otp` prop except `render`, with slots passed as `children`.
 * `className` styles the transparent input and `containerClassName` the slot
 * wrapper.
 */
type InputOTPProps = Omit<
  React.ComponentProps<typeof OTPInput>,
  'render' | 'children'
> & {
  /** `InputOTPGroup`, `InputOTPSlot` and `InputOTPSeparator` elements. */
  children?: React.ReactNode;
};

/**
 * One-time code field that shows each character in its own slot. Build it
 * from `InputOTPGroup`, `InputOTPSlot` and `InputOTPSeparator`.
 */
const InputOTP = React.forwardRef<
  HTMLInputElement,
  React.PropsWithoutRef<InputOTPProps>
>(function InputOTP(propsWithoutRef, forwardedRef) {
  const {
    className,
    containerClassName,
    children,
    ...props
  }: React.PropsWithoutRef<InputOTPProps> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <OTPInput
      data-slot="input-otp"
      autoComplete="one-time-code"
      containerClassName={cn(
        'nx:group/input-otp nx:flex nx:items-center nx:gap-2',
        containerClassName
      )}
      className={cn('nx:disabled:cursor-not-allowed', className)}
      {...props}
    >
      {children}
    </OTPInput>
  );
});

/**
 * Props for a group of OTP slots.
 */
type InputOTPGroupProps = React.ComponentProps<'div'>;

/**
 * Row of adjacent slots. For a split code such as 3-3, put an
 * `InputOTPSeparator` between two groups.
 */
const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<InputOTPGroupProps>
>(function InputOTPGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<InputOTPGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="input-otp-group"
      className={cn('nx:isolate nx:flex nx:items-center', className)}
      {...props}
    />
  );
});

/**
 * Props for a single OTP slot.
 */
interface InputOTPSlotProps extends React.ComponentProps<'div'> {
  /**
   * Position of the slot in the code, starting at 0.
   */
  index: number;
}

/**
 * One character cell. Shows a blinking caret and a focus ring while it is the
 * active slot.
 */
const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<InputOTPSlotProps>
>(function InputOTPSlot(propsWithoutRef, forwardedRef) {
  const {
    index,
    className,
    ...props
  }: React.PropsWithoutRef<InputOTPSlotProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'nx:relative nx:flex nx:box-border nx:size-10 nx:items-center nx:justify-center',
        'nx:border-default nx:border-border-default nx:not-first:-ml-(--nx-borderwidth-default)',
        'nx:group-has-[:disabled]/input-otp:border-border-disabled nx:group-has-[:disabled]/input-otp:bg-disabled nx:group-has-[:disabled]/input-otp:text-disabled-foreground',
        'nx:bg-container nx:text-foreground nx:typography-body-small nx:transition-field nx:duration-fast',
        'nx:first:rounded-l-md nx:last:rounded-r-md',
        'nx:data-[active=true]:z-1 nx:data-[active=true]:border-focus-default nx:data-[active=true]:outline-default nx:data-[active=true]:outline-focus-default',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-center">
          <div className="nx:h-4 nx:w-px nx:animate-caret-blink nx:bg-foreground" />
        </div>
      )}
    </div>
  );
});

/**
 * Props for the separator between OTP groups.
 */
type InputOTPSeparatorProps = React.ComponentProps<'div'>;

/**
 * Decorative dot between two `InputOTPGroup`s. Screen readers skip it.
 */
const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<InputOTPSeparatorProps>
>(function InputOTPSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<InputOTPSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="input-otp-separator"
      aria-hidden="true"
      className={cn('nx:flex nx:items-center', className)}
      {...props}
    >
      <IconPointFilled className="nx:size-2.5 nx:text-muted-foreground" />
    </div>
  );
});

export {
  InputOTP,
  InputOTPGroup,
  type InputOTPGroupProps,
  type InputOTPProps,
  InputOTPSeparator,
  type InputOTPSeparatorProps,
  InputOTPSlot,
  type InputOTPSlotProps,
};
