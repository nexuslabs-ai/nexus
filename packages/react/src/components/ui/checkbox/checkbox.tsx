import * as React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';

import { IconCheck, IconMinus } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * CheckboxProps
 *
 * Props for the Checkbox component.
 */
interface CheckboxProps extends React.ComponentProps<
  typeof CheckboxPrimitive.Root
> {}

/**
 * CheckboxCardProps
 *
 * Props for the CheckboxCard component.
 */
interface CheckboxCardProps extends Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  'children'
> {
  /**
   * The visible label for the checkbox option. Non-interactive content only —
   * the whole row is a `<button>` (see the CheckboxCard description).
   */
  label: React.ReactNode;

  /**
   * Optional supporting text announced through `aria-describedby`.
   * Non-interactive content only — see the CheckboxCard description.
   */
  description?: React.ReactNode;

  /**
   * Optional decorative content before the label text, such as an icon.
   * Non-interactive content only (the row is a `<button>`).
   */
  labelLeading?: React.ReactNode;

  /**
   * Visual treatment for the option row.
   * @default 'default'
   */
  variant?: 'default' | 'outline';

  /**
   * Checkbox placement relative to the label and description.
   * @default 'before'
   */
  checkboxPosition?: 'before' | 'after';

  /**
   * Whether the outline variant renders as a floating card or row separator.
   * @default true
   */
  floating?: boolean;
}

function mergeIds(...ids: Array<string | undefined>) {
  const merged = ids.filter(Boolean).join(' ');
  return merged || undefined;
}

/**
 * Checkbox
 *
 * A tri-state checkbox (checked / unchecked / indeterminate) for selecting one
 * or more options, or toggling a single setting. Shows a check mark when checked
 * and a minus when indeterminate. Pair the 16px checkbox with a wired label row
 * so the label text carries the touch target; set `checked="indeterminate"` for
 * the mixed state — e.g. a "select all" control whose children are only
 * partially selected.
 *
 * @example
 * ```tsx
 * <Checkbox checked={agreed} onCheckedChange={setAgreed} />
 * ```
 *
 * @example
 * ```tsx
 * // Indeterminate (mixed) state
 * <Checkbox checked="indeterminate" aria-label="Select all" />
 * ```
 *
 * @example
 * ```tsx
 * <div className="nx:flex nx:items-center nx:gap-2">
 *   <Checkbox id="terms" />
 *   <Label htmlFor="terms">Accept terms and conditions</Label>
 * </div>
 * ```
 */
function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'nx:group nx:peer nx:inline-flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center',
        'nx:rounded-sm nx:border nx:border-border-default nx:bg-background',
        'nx:transition-colors',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
        'nx:disabled:cursor-not-allowed nx:disabled:opacity-50',
        'nx:enabled:data-[state=unchecked]:hover:bg-background-hover nx:enabled:data-[state=unchecked]:active:bg-background-active',
        'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:bg-primary-background nx:data-[state=checked]:text-primary-foreground',
        'nx:enabled:data-[state=checked]:hover:border-primary-background-hover nx:enabled:data-[state=checked]:hover:bg-primary-background-hover',
        'nx:enabled:data-[state=checked]:active:border-primary-background-hover nx:enabled:data-[state=checked]:active:bg-primary-background-active',
        'nx:data-[state=indeterminate]:border-primary-background nx:data-[state=indeterminate]:bg-primary-background nx:data-[state=indeterminate]:text-primary-foreground',
        'nx:enabled:data-[state=indeterminate]:hover:border-primary-background-hover nx:enabled:data-[state=indeterminate]:hover:bg-primary-background-hover',
        'nx:enabled:data-[state=indeterminate]:active:border-primary-background-hover nx:enabled:data-[state=indeterminate]:active:bg-primary-background-active',
        // Invalid + checked/indeterminate follows Figma's destructive checkbox
        // treatment while preserving aria-invalid as the single authoring hook.
        'nx:aria-invalid:data-[state=checked]:border-border-error nx:aria-invalid:data-[state=checked]:bg-error-background nx:aria-invalid:data-[state=checked]:text-error-foreground',
        'nx:aria-invalid:data-[state=indeterminate]:border-border-error nx:aria-invalid:data-[state=indeterminate]:bg-error-background nx:aria-invalid:data-[state=indeterminate]:text-error-foreground',
        'nx:enabled:aria-invalid:data-[state=checked]:hover:border-border-error nx:enabled:aria-invalid:data-[state=checked]:hover:bg-error-background-hover',
        'nx:enabled:aria-invalid:data-[state=checked]:active:border-border-error nx:enabled:aria-invalid:data-[state=checked]:active:bg-error-background',
        'nx:enabled:aria-invalid:data-[state=indeterminate]:hover:border-border-error nx:enabled:aria-invalid:data-[state=indeterminate]:hover:bg-error-background-hover',
        'nx:enabled:aria-invalid:data-[state=indeterminate]:active:border-border-error nx:enabled:aria-invalid:data-[state=indeterminate]:active:bg-error-background',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="nx:flex nx:items-center nx:justify-center nx:text-current"
      >
        <IconCheck
          data-slot="checkbox-check"
          aria-hidden="true"
          className="nx:hidden nx:size-3.5 nx:group-data-[state=checked]:block"
        />
        <IconMinus
          data-slot="checkbox-minus"
          aria-hidden="true"
          className="nx:hidden nx:size-3.5 nx:group-data-[state=indeterminate]:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

const checkboxCardVariants = cva(
  [
    'nx:group/checkbox-card nx:flex nx:w-full nx:min-w-0 nx:appearance-none nx:overflow-hidden nx:bg-container nx:text-left nx:select-none nx:transition-colors nx:[&_svg]:pointer-events-none',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-border-error nx:aria-invalid:outline-border-error nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:disabled:outline-border-disabled',
  ],
  {
    variants: {
      variant: {
        default: '',
        outline:
          'nx:enabled:hover:bg-container-hover nx:enabled:active:bg-container-active',
      },
      checkboxPosition: {
        before: 'nx:flex-col nx:items-start nx:justify-center nx:gap-0.5',
        after: 'nx:flex-row nx:items-center nx:gap-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      checkboxPosition: 'before',
    },
  }
);

/**
 * CheckboxCard
 *
 * A full-row checkbox option matching the Figma checkbox card / group variants.
 * The row/card itself is the checkbox control, so clicking anywhere in the
 * surface toggles it while preserving Radix checkbox semantics and form
 * behavior. Because the row is itself the control (a `<button>`), every slotted
 * value — `label`, `description`, and `labelLeading` — must be plain,
 * non-interactive content: nesting a link, button, or other interactive element
 * inside it is invalid HTML. Render interactive helper content outside the
 * CheckboxCard.
 *
 * @example
 * ```tsx
 * <CheckboxCard
 *   label="Enable notifications"
 *   description="Receive product updates and security alerts."
 * />
 * ```
 */
function CheckboxCard({
  className,
  label,
  description,
  labelLeading,
  variant = 'default',
  checkboxPosition = 'before',
  floating = true,
  required,
  disabled,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  ...props
}: CheckboxCardProps) {
  const generatedId = React.useId();
  const labelId = `${generatedId}-label`;
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const labelledBy =
    ariaLabelledBy ?? (ariaLabel === undefined ? labelId : undefined);
  const describedBy = mergeIds(ariaDescribedBy, descriptionId);
  const hasFramedPadding =
    variant === 'outline' || checkboxPosition === 'after' || !floating;
  const isBefore = checkboxPosition === 'before';
  const invalid = ariaInvalid === true || ariaInvalid === 'true';

  const labelLeadingContent = labelLeading ? (
    <span
      aria-hidden="true"
      data-slot="checkbox-card-label-leading"
      className={cn(
        'nx:flex nx:shrink-0 nx:items-center nx:justify-center nx:text-muted-foreground',
        isBefore
          ? 'nx:[&_svg]:size-3.5'
          : 'nx:size-8 nx:rounded-sm nx:border nx:border-border-default nx:bg-background nx:[&_svg]:size-3.5'
      )}
    >
      {labelLeading}
    </span>
  ) : null;

  const labelRow = (
    <span
      data-slot="checkbox-card-label-row"
      className="nx:flex nx:min-w-0 nx:items-center nx:gap-0.5"
    >
      {isBefore && labelLeadingContent}
      <span
        id={labelId}
        data-slot="checkbox-card-label"
        className={cn(
          'nx:min-w-0 nx:typography-label-default',
          disabled ? 'nx:text-disabled-foreground' : 'nx:text-foreground'
        )}
      >
        {label}
      </span>
      {required && (
        <span
          aria-hidden="true"
          data-slot="checkbox-card-required"
          className="nx:shrink-0 nx:text-xs nx:leading-4 nx:font-semibold nx:text-error-subtle-foreground"
        >
          *
        </span>
      )}
    </span>
  );

  const descriptionContent = description ? (
    <span
      id={descriptionId}
      data-slot="checkbox-card-description"
      className={cn(
        'nx:block nx:min-w-0 nx:typography-body-small',
        disabled ? 'nx:text-disabled-foreground' : 'nx:text-muted-foreground'
      )}
    >
      {description}
    </span>
  ) : null;

  const leadingContent = (
    <span
      data-slot="checkbox-card-control-row"
      className="nx:flex nx:w-full nx:min-w-0 nx:items-start nx:gap-2"
    >
      <CheckboxCardControl
        disabled={disabled}
        invalid={invalid}
        className="nx:mt-0.5"
      />
      <span
        data-slot="checkbox-card-content"
        className="nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:items-start nx:gap-0.5"
      >
        {labelRow}
        {descriptionContent}
      </span>
    </span>
  );

  const trailingContent = (
    <>
      {!isBefore && labelLeadingContent}
      <span
        data-slot="checkbox-card-content"
        className="nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:items-start"
      >
        {labelRow}
        {descriptionContent}
      </span>
      <CheckboxCardControl disabled={disabled} invalid={invalid} />
    </>
  );

  const controlClasses = cn(
    checkboxCardVariants({ variant, checkboxPosition }),
    hasFramedPadding ? 'nx:p-4' : 'nx:min-h-[44px]',
    floating && variant === 'default' && 'nx:border-0',
    floating &&
      variant === 'outline' &&
      'nx:rounded-md nx:outline-1 nx:outline-offset-[-1px] nx:outline-border-default',
    !floating &&
      'nx:rounded-none nx:border-x-0 nx:border-t-0 nx:border-b nx:border-border-default',
    className
  );

  return (
    <CheckboxPrimitive.Root
      {...props}
      data-slot="checkbox-card"
      data-variant={variant}
      data-checkbox-position={checkboxPosition}
      data-floating={floating}
      className={controlClasses}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={ariaInvalid}
    >
      {isBefore ? leadingContent : trailingContent}
    </CheckboxPrimitive.Root>
  );
}

function CheckboxCardControl({
  className,
  disabled,
  invalid,
}: {
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-slot="checkbox-card-control"
      className={cn(
        'nx:flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border nx:bg-background nx:text-primary-foreground nx:transition-colors',
        // Rest border — valid vs invalid are mutually exclusive (no same-property
        // conflict), so the error border always shows on an invalid card.
        !disabled && !invalid && 'nx:border-border-default',
        !disabled && invalid && 'nx:border-border-error',
        // Checked / indeterminate fill — primary when valid, destructive when
        // invalid, mirroring the Checkbox atom's error treatment.
        !disabled &&
          !invalid &&
          'nx:group-data-[state=checked]/checkbox-card:border-primary-background nx:group-data-[state=checked]/checkbox-card:bg-primary-background',
        !disabled &&
          !invalid &&
          'nx:group-data-[state=indeterminate]/checkbox-card:border-primary-background nx:group-data-[state=indeterminate]/checkbox-card:bg-primary-background',
        !disabled &&
          invalid &&
          'nx:group-data-[state=checked]/checkbox-card:border-border-error nx:group-data-[state=checked]/checkbox-card:bg-error-background nx:group-data-[state=checked]/checkbox-card:text-error-foreground',
        !disabled &&
          invalid &&
          'nx:group-data-[state=indeterminate]/checkbox-card:border-border-error nx:group-data-[state=indeterminate]/checkbox-card:bg-error-background nx:group-data-[state=indeterminate]/checkbox-card:text-error-foreground',
        disabled &&
          'nx:border-border-disabled nx:bg-disabled nx:text-disabled-foreground',
        className
      )}
    >
      <span
        data-slot="checkbox-card-indicator"
        className="nx:flex nx:items-center nx:justify-center nx:text-current"
      >
        <IconCheck
          data-slot="checkbox-card-check"
          aria-hidden="true"
          className="nx:hidden nx:size-3.5 nx:group-data-[state=checked]/checkbox-card:block"
        />
        <IconMinus
          data-slot="checkbox-card-minus"
          aria-hidden="true"
          className="nx:hidden nx:size-3.5 nx:group-data-[state=indeterminate]/checkbox-card:block"
        />
      </span>
    </span>
  );
}

export {
  Checkbox,
  CheckboxCard,
  type CheckboxCardProps,
  checkboxCardVariants,
  type CheckboxProps,
};
