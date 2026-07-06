import * as React from 'react';

import { OTPInput, OTPInputContext } from 'input-otp';

import { IconPointFilled } from '../../lib/icons';
import { cn } from '../../lib/utils';

/**
 * InputOTPProps
 *
 * Props for the InputOTP root — the underlying `input-otp` props (so
 * `maxLength`, `value`, `onChange`, `onComplete`, and `pattern` are all
 * available), composed with `children` instead of `input-otp`'s `render`
 * prop. `className` styles the (transparent) input element;
 * `containerClassName` styles the wrapper that lays out the slots.
 */
type InputOTPProps = Omit<
  React.ComponentProps<typeof OTPInput>,
  'render' | 'children'
> & {
  /** The OTP slots — `InputOTPGroup` / `InputOTPSlot` / `InputOTPSeparator`. */
  children?: React.ReactNode;
};

/**
 * InputOTP
 *
 * A one-time-code field that renders each character in its own slot, with
 * caret tracking and paste support. Compose it with `InputOTPGroup`,
 * `InputOTPSlot`, and `InputOTPSeparator`; each slot reads its character and
 * active state from context by `index`.
 *
 * @example
 * ```tsx
 * <InputOTP maxLength={6}>
 *   <InputOTPGroup>
 *     <InputOTPSlot index={0} />
 *     <InputOTPSlot index={1} />
 *     <InputOTPSlot index={2} />
 *     <InputOTPSlot index={3} />
 *     <InputOTPSlot index={4} />
 *     <InputOTPSlot index={5} />
 *   </InputOTPGroup>
 * </InputOTP>
 * ```
 */
function InputOTP({
  className,
  containerClassName,
  children,
  ...props
}: InputOTPProps) {
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
}

/**
 * InputOTPGroupProps
 *
 * Props for a group of OTP slots.
 */
interface InputOTPGroupProps extends React.ComponentProps<'div'> {}

/**
 * InputOTPGroup
 *
 * Groups a run of adjacent slots. Use multiple groups with an
 * `InputOTPSeparator` between them for split layouts (e.g. 3-3).
 */
function InputOTPGroup({ className, ...props }: InputOTPGroupProps) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('nx:flex nx:items-center', className)}
      {...props}
    />
  );
}

/**
 * InputOTPSlotProps
 *
 * Props for a single OTP slot.
 */
interface InputOTPSlotProps extends React.ComponentProps<'div'> {
  /**
   * The slot's position within the OTP input. Used to read this slot's
   * character, caret, and active state from context.
   */
  index: number;
}

/**
 * InputOTPSlot
 *
 * Renders one character cell — its character, a blinking fake caret when the
 * cursor sits in it, and a visual focus boundary while it is the active slot.
 */
function InputOTPSlot({ index, className, ...props }: InputOTPSlotProps) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'nx:relative nx:flex nx:box-border nx:size-10 nx:items-center nx:justify-center',
        'nx:border-0',
        'nx:group-has-[:disabled]/input-otp:bg-disabled nx:group-has-[:disabled]/input-otp:text-disabled-foreground',
        'nx:bg-background nx:text-foreground nx:typography-body-small nx:transition-[color,background-color,box-shadow] nx:duration-fast nx:motion-reduce:transition-none',
        'nx:first:rounded-l-md nx:last:rounded-r-md',
        'nx:data-[active=true]:z-10 nx:data-[active=true]:outline-2 nx:data-[active=true]:outline-focus-default nx:data-[active=true]:outline-offset-(--focus-offset)',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-center">
          <div className="nx:h-4 nx:w-px nx:animate-caret-blink nx:bg-foreground nx:motion-reduce:animate-none" />
        </div>
      )}
    </div>
  );
}

/**
 * InputOTPSeparatorProps
 *
 * Props for the separator between OTP groups.
 */
interface InputOTPSeparatorProps extends React.ComponentProps<'div'> {}

/**
 * InputOTPSeparator
 *
 * A decorative dot placed between OTP groups in split layouts.
 */
function InputOTPSeparator({ className, ...props }: InputOTPSeparatorProps) {
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
}

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
