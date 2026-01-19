/**
 * Input Component Fixture
 *
 * Form control with forwardRef pattern.
 * Used for testing extraction of:
 * - forwardRef usage
 * - HTML input props extension
 * - Form control patterns
 * - Simple component without CVA
 */

import * as React from 'react';

interface InputProps extends React.ComponentProps<'input'> {
  /**
   * Visual variant of the input.
   * @default 'default'
   */
  variant?: 'default' | 'ghost' | 'filled';

  /**
   * Size of the input.
   * @default 'default'
   */
  inputSize?: 'sm' | 'default' | 'lg';

  /**
   * Whether the input is in an error state.
   * @default false
   */
  error?: boolean;

  /**
   * Icon to display at the start of the input.
   */
  startIcon?: React.ReactNode;

  /**
   * Icon to display at the end of the input.
   */
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant = 'default',
      inputSize = 'default',
      error = false,
      startIcon,
      endIcon,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'border border-input bg-background',
      ghost: 'border-transparent bg-transparent',
      filled: 'border-transparent bg-muted',
    };

    const sizeClasses = {
      sm: 'h-8 px-2 text-xs',
      default: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    };

    const baseClasses = `flex w-full rounded-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`;

    const errorClasses = error
      ? 'border-destructive focus-visible:ring-destructive'
      : '';

    return (
      <div className="relative flex items-center">
        {startIcon && (
          <span className="text-muted-foreground absolute left-3 flex items-center">
            {startIcon}
          </span>
        )}
        <input
          type={type}
          data-slot="input"
          data-variant={variant}
          data-size={inputSize}
          data-error={error || undefined}
          className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[inputSize]} ${errorClasses} ${startIcon ? 'pl-10' : ''} ${endIcon ? 'pr-10' : ''} ${className}`}
          ref={ref}
          {...props}
        />
        {endIcon && (
          <span className="text-muted-foreground absolute right-3 flex items-center">
            {endIcon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps };
