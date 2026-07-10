import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Label } from '../label';
import { Separator } from '../separator';

/**
 * FieldSet
 *
 * A `<fieldset>` grouping related fields — pair with `FieldLegend` for the
 * group's caption.
 */
function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'nx:flex nx:flex-col nx:gap-6 nx:has-[>[data-slot=checkbox-group]]:gap-3 nx:has-[>[data-slot=radio-group]]:gap-3',
        className
      )}
      {...props}
    />
  );
}

/**
 * FieldLegendProps
 *
 * Props for the FieldLegend component.
 */
interface FieldLegendProps extends React.ComponentProps<'legend'> {
  /**
   * Caption emphasis. `legend` is the larger fieldset caption; `label` matches
   * a field label's size.
   *
   * @default 'legend'
   */
  variant?: 'legend' | 'label';
}

/**
 * FieldLegend
 *
 * The caption for a `FieldSet`.
 */
function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: FieldLegendProps) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'nx:mb-3 nx:data-[variant=legend]:typography-heading-xsmall nx:data-[variant=label]:typography-label-default',
        className
      )}
      {...props}
    />
  );
}

/**
 * FieldGroup
 *
 * A vertical stack of `Field`s. Declares the `field-group` container so a
 * `Field`'s `responsive` orientation can adapt to the group's width.
 */
function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'nx:group/field-group nx:@container/field-group nx:flex nx:w-full nx:flex-col nx:gap-7 nx:data-[slot=checkbox-group]:gap-3 nx:*:data-[slot=field-group]:gap-4',
        className
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  'nx:group/field nx:flex nx:w-full nx:gap-2 nx:data-[invalid=true]:text-error-subtle-foreground',
  {
    variants: {
      orientation: {
        vertical: 'nx:flex-col nx:*:w-full nx:[&>.sr-only]:w-auto',
        horizontal:
          'nx:flex-row nx:items-center nx:*:data-[slot=field-label]:flex-auto nx:has-[>[data-slot=field-content]]:items-start nx:has-[>[data-slot=field-content]]:[&>[role=checkbox]]:mt-px nx:has-[>[data-slot=field-content]]:[&>[role=radio]]:mt-px',
        responsive:
          'nx:flex-col nx:@md/field-group:flex-row nx:@md/field-group:items-center nx:*:w-full nx:@md/field-group:*:w-auto nx:[&>.sr-only]:w-auto nx:@md/field-group:*:data-[slot=field-label]:flex-auto nx:@md/field-group:has-[>[data-slot=field-content]]:items-start nx:@md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox]]:mt-px nx:@md/field-group:has-[>[data-slot=field-content]]:[&>[role=radio]]:mt-px',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  }
);

/**
 * FieldProps
 *
 * Props for the Field component.
 */
interface FieldProps
  extends React.ComponentProps<'div'>, VariantProps<typeof fieldVariants> {}

/**
 * Field
 *
 * The labeled-field layout primitive — composes a label, control, description,
 * and error with their a11y wiring, decoupled from any form library.
 *
 * @example
 * ```tsx
 * <Field>
 *   <FieldLabel htmlFor="email">Email</FieldLabel>
 *   <Input id="email" type="email" />
 *   <FieldDescription>We'll never share it.</FieldDescription>
 * </Field>
 * ```
 */
function Field({ className, orientation = 'vertical', ...props }: FieldProps) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

/**
 * FieldContent
 *
 * Wraps a control's label + description when they sit beside the control (the
 * horizontal / checkbox-card layouts).
 */
function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        'nx:group/field-content nx:flex nx:flex-1 nx:flex-col nx:gap-1.5',
        className
      )}
      {...props}
    />
  );
}

/**
 * FieldLabel
 *
 * A field's label (wraps `Label`). When it wraps a nested `Field` it becomes a
 * selectable card (checkbox / radio card) that highlights when its control is
 * checked.
 */
function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'nx:group/field-label nx:peer/field-label nx:flex nx:w-fit nx:gap-2 nx:group-data-[disabled=true]/field:text-disabled-foreground',
        'nx:has-[>[data-slot=field]]:w-full nx:has-[>[data-slot=field]]:flex-col nx:has-[>[data-slot=field]]:rounded-md nx:has-[>[data-slot=field]]:border-default nx:*:data-[slot=field]:p-4',
        'nx:has-data-[state=checked]:border-border-primary nx:has-data-[state=checked]:bg-primary-subtle',
        className
      )}
      {...props}
    />
  );
}

/**
 * FieldRequiredIndicatorProps
 *
 * Props for the FieldRequiredIndicator component.
 */
type FieldRequiredIndicatorProps = Omit<
  React.ComponentProps<'span'>,
  'aria-hidden'
> & {
  /**
   * Optional-field content to render instead of the required marker. This
   * remains readable by assistive tech and takes precedence over `children`.
   * Required semantics still belong on the control via `required` or
   * `aria-required`.
   *
   * @example
   * ```tsx
   * <FieldLabel htmlFor="email">
   *   Email <FieldRequiredIndicator />
   * </FieldLabel>
   * <Input id="email" required />
   * ```
   *
   * @example
   * ```tsx
   * <FieldRequiredIndicator fallback="Optional">Required</FieldRequiredIndicator>
   * ```
   */
  fallback?: React.ReactNode;
};

/**
 * FieldRequiredIndicator
 *
 * A label affordance for required or optional fields. Renders `*` by default
 * with `aria-hidden`, or renders `fallback` as readable optional text.
 */
function FieldRequiredIndicator({
  className,
  children,
  fallback,
  ...props
}: FieldRequiredIndicatorProps) {
  const isOptional = fallback !== undefined;

  return (
    <span
      {...props}
      aria-hidden={isOptional ? undefined : true}
      data-slot="field-required-indicator"
      data-optional={isOptional ? 'true' : undefined}
      className={cn(
        'nx:text-error-subtle-foreground nx:data-[optional=true]:typography-body-default nx:data-[optional=true]:text-muted-foreground',
        className
      )}
    >
      {isOptional ? fallback : (children ?? '*')}
    </span>
  );
}

/**
 * FieldTitle
 *
 * A non-`<label>` title for a field group or card (use when the title isn't
 * bound to a single control via `htmlFor`).
 */
function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        'nx:flex nx:w-fit nx:items-center nx:gap-2 nx:typography-label-default nx:group-data-[disabled=true]/field:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * FieldDescription
 *
 * Helper text below a field's control.
 */
function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'nx:typography-body-default nx:text-muted-foreground nx:group-has-data-[orientation=horizontal]/field:text-balance',
        'nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * FieldSeparator
 *
 * A divider between fields, optionally with centered content (e.g. "OR").
 */
function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        'nx:relative nx:-my-2 nx:h-5 nx:typography-body-default',
        className
      )}
      {...props}
    >
      <Separator className="nx:absolute nx:inset-0 nx:top-1/2" />
      {children && (
        <span
          data-slot="field-separator-content"
          className="nx:relative nx:mx-auto nx:block nx:w-fit nx:bg-container nx:px-2 nx:text-muted-foreground"
        >
          {children}
        </span>
      )}
    </div>
  );
}

/**
 * FieldErrorProps
 *
 * Props for the FieldError component.
 */
interface FieldErrorProps extends React.ComponentProps<'div'> {
  /**
   * Validation errors to render. Deduplicated by message; a single error shows
   * inline, multiple render as a list. Ignored when `children` is provided.
   */
  errors?: Array<{ message?: string } | undefined>;
}

/**
 * FieldError
 *
 * The error message(s) for a field. Renders nothing when there's no content.
 */
function FieldError({
  className,
  children,
  errors,
  ...props
}: FieldErrorProps) {
  const messages = children ? [] : dedupeErrorMessages(errors);

  if (!children && messages.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-atomic="true"
      data-slot="field-error"
      className={cn(
        'nx:typography-body-default nx:text-error-subtle-foreground',
        className
      )}
      {...props}
    >
      {children ||
        (messages.length === 1 ? (
          messages[0]
        ) : (
          <FieldErrorList messages={messages} />
        ))}
    </div>
  );
}

/** Unique, non-empty error messages in first-seen order. */
function dedupeErrorMessages(errors: FieldErrorProps['errors']): string[] {
  const seen = new Map<string, string>();
  for (const error of errors ?? []) {
    if (error?.message) seen.set(error.message, error.message);
  }
  return [...seen.values()];
}

/** Renders multiple validation messages as a bulleted list. */
function FieldErrorList({ messages }: { messages: string[] }) {
  return (
    <ul className="nx:ml-4 nx:flex nx:list-disc nx:flex-col nx:gap-1">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  type FieldErrorProps,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  type FieldLegendProps,
  type FieldProps,
  FieldRequiredIndicator,
  type FieldRequiredIndicatorProps,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  fieldVariants,
};
