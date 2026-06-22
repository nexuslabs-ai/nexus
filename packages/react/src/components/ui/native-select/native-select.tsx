import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { IconChevronDown } from '@/lib/icons';
import { cn } from '@/lib/utils';

const nativeSelectVariants = cva(
  [
    'nx:w-full nx:min-w-0 nx:appearance-none nx:rounded-md nx:border nx:border-border-default',
    'nx:bg-background nx:text-foreground nx:shadow-xs nx:transition-colors nx:outline-none',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:disabled:cursor-not-allowed',
  ],
  {
    variants: {
      size: {
        default: 'nx:px-3 nx:py-2 nx:pr-9 nx:typography-body-default',
        sm: 'nx:px-2.5 nx:py-1.5 nx:pr-9 nx:typography-body-small',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

/**
 * NativeSelectProps
 *
 * Props for the NativeSelect component.
 */
interface NativeSelectProps
  extends
    Omit<React.ComponentProps<'select'>, 'size'>,
    VariantProps<typeof nativeSelectVariants> {}

/**
 * NativeSelect
 *
 * A styled wrapper over the native `<select>` — on mobile it opens the OS
 * picker (iOS wheel / Android sheet), the preferred dense-form UX there. The
 * closed trigger is styled to match `Input`; the open list is OS-rendered.
 * For rich options (icons, descriptions, grouping) on desktop, use `Select`.
 *
 * @example
 * ```tsx
 * <NativeSelect aria-label="Country" defaultValue="us">
 *   <NativeSelectOption value="us">United States</NativeSelectOption>
 *   <NativeSelectOption value="ca">Canada</NativeSelectOption>
 * </NativeSelect>
 * ```
 */
function NativeSelect({
  className,
  size = 'default',
  ...props
}: NativeSelectProps) {
  return (
    <div
      data-slot="native-select-wrapper"
      className="nx:group/native-select nx:relative nx:w-fit"
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          nativeSelectVariants({ size }),
          'nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground',
          className
        )}
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
 * NativeSelectOption
 *
 * An `<option>` for `NativeSelect`. Uses the `Canvas` / `CanvasText` system
 * colors so the OS-rendered list stays legible in both light and dark themes.
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
 * NativeSelectOptGroup
 *
 * An `<optgroup>` for grouping `NativeSelect` options.
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
