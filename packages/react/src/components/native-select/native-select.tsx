import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { IconChevronDown } from '../../lib/icons';
import { cn } from '../../lib/utils';

const nativeSelectVariants = cva(
  [
    'nx:box-border nx:w-full nx:min-w-0 nx:appearance-none nx:rounded-md nx:border-default',
    'nx:text-foreground nx:autofill-text-foreground nx:transition-field',
    'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default nx:focus-visible:border-focus-default',
    'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error nx:aria-invalid:focus-visible:border-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:autofill-bg-disabled nx:disabled:text-disabled-foreground nx:disabled:autofill-text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        default: 'nx:px-3 nx:py-2 nx:pr-9 nx:typography-body-default',
        sm: 'nx:px-2.5 nx:py-1.5 nx:pr-9 nx:typography-body-small',
      },
      variant: {
        bordered:
          'nx:border-border-default nx:bg-container nx:autofill-bg-container nx:enabled:hover:bg-container-hover nx:enabled:hover:autofill-bg-container-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:autofill-bg-control-background nx:enabled:hover:bg-control-background-hover nx:enabled:hover:autofill-bg-control-background-hover',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'bordered',
    },
  }
);

/**
 * Props for the NativeSelect component.
 */
interface NativeSelectProps
  extends
    Omit<React.ComponentProps<'select'>, 'size'>,
    VariantProps<typeof nativeSelectVariants> {}

/**
 * Styled native `<select>` that opens the system picker on mobile. Set
 * `variant="borderless"` to drop the border and keep a tinted fill. For a
 * styled dropdown, use `Select`. For search, use `Combobox`.
 */
function NativeSelect({
  className,
  size = 'default',
  variant,
  ...props
}: NativeSelectProps) {
  return (
    <div
      data-slot="native-select-wrapper"
      className="nx:group/native-select nx:relative nx:w-full"
    >
      <select
        data-slot="native-select"
        data-size={size}
        data-variant={variant ?? 'bordered'}
        className={cn(nativeSelectVariants({ size, variant, className }))}
        {...props}
      />
      <IconChevronDown
        aria-hidden="true"
        data-slot="native-select-icon"
        className="nx:pointer-events-none nx:absolute nx:top-1/2 nx:right-3.5 nx:size-4 nx:-translate-y-1/2 nx:text-muted-foreground nx:select-none nx:group-has-[select:disabled]/native-select:text-disabled-foreground"
      />
    </div>
  );
}

/**
 * `<option>` for `NativeSelect`. Stays readable in light and dark themes.
 */
function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<'option'>) {
  return (
    <option
      data-slot="native-select-option"
      className={cn('nx:bg-[Canvas] nx:text-[CanvasText]', className)}
      {...props}
    />
  );
}

/**
 * `<optgroup>` for grouping `NativeSelect` options.
 */
function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn('nx:bg-[Canvas] nx:text-[CanvasText]', className)}
      {...props}
    />
  );
}

export {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  type NativeSelectProps,
  nativeSelectVariants,
};
