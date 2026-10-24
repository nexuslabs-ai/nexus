import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Label } from '../label/label';
import { Separator } from '../separator/separator';

/**
 * A `<fieldset>` that groups related fields. Add a `FieldLegend` as its caption.
 */
const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.PropsWithoutRef<React.ComponentProps<'fieldset'>>
>(function FieldSet(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'fieldset'>> & {
    ref?: React.ForwardedRef<HTMLFieldSetElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'nx:m-0 nx:flex nx:min-w-0 nx:flex-col nx:gap-6 nx:border-0 nx:p-0 nx:has-[>[data-slot=checkbox-group]]:gap-3 nx:has-[>[data-slot=radio-group]]:gap-3',
        className
      )}
      {...props}
    />
  );
});

/**
 * FieldLegendProps
 *
 * Props for the FieldLegend component.
 */
interface FieldLegendProps extends React.ComponentProps<'legend'> {
  /**
   * Caption size. `legend` is larger, and `label` matches a field label.
   */
  variant?: 'legend' | 'label';
}

/**
 * The caption for a `FieldSet`.
 */
const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.PropsWithoutRef<FieldLegendProps>
>(function FieldLegend(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'legend',
    ...props
  }: React.PropsWithoutRef<FieldLegendProps> & {
    ref?: React.ForwardedRef<HTMLLegendElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'nx:mb-3 nx:p-0 nx:data-[variant=legend]:typography-heading-xsmall nx:data-[variant=label]:typography-label-default',
        className
      )}
      {...props}
    />
  );
});

/**
 * A vertical stack of `Field`s. A `Field` with `responsive` orientation adapts
 * to this group's width.
 */
const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function FieldGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
type FieldProps = React.ComponentProps<'div'> &
  VariantProps<typeof fieldVariants>;

/**
 * Lays out a label, control, description and error as one field. Works with
 * any form library.
 */
const Field = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<FieldProps>
>(function Field(propsWithoutRef, forwardedRef) {
  const {
    className,
    orientation = 'vertical',
    ...props
  }: React.PropsWithoutRef<FieldProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
});

/**
 * Wraps a label and description that sit beside the control, as in horizontal
 * and checkbox-card layouts.
 */
const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function FieldContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * A field's label, built on `Label`.
 *
 * - For a simple inline label, use `Label`.
 * - For compact checkbox or radio options, use `ChoiceRow`.
 * - For rich checkbox or radio option cards, use `ChoiceCard`.
 */
const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.PropsWithoutRef<React.ComponentProps<typeof Label>>
>(function FieldLabel(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<typeof Label>> & {
    ref?: React.ForwardedRef<HTMLLabelElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'nx:group/field-label nx:peer/field-label nx:flex nx:w-fit nx:gap-2 nx:group-data-[disabled=true]/field:text-disabled-foreground',
        'nx:has-[>[data-slot=field]]:w-full nx:has-[>[data-slot=field]]:flex-col nx:has-[>[data-slot=field]]:rounded-md nx:has-[>[data-slot=field]]:border-default nx:*:data-[slot=field]:p-4',
        'nx:has-data-[state=checked]:border-primary-border nx:has-data-[state=checked]:bg-primary-subtle',
        className
      )}
      {...props}
    />
  );
});

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
   * Text for an optional field, shown instead of the `*`. Screen readers read
   * it, and it overrides `children`.
   */
  fallback?: React.ReactNode;
};

/**
 * Marks a field as required with `*`, or as optional with `fallback` text.
 * Screen readers skip the `*`, so set `required` or `aria-required` on the
 * control.
 */
const FieldRequiredIndicator = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<FieldRequiredIndicatorProps>
>(function FieldRequiredIndicator(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    fallback,
    ...props
  }: React.PropsWithoutRef<FieldRequiredIndicatorProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * A title for a field group or card that is not tied to one control. Renders a
 * `div`, not a `<label>`.
 */
const FieldTitle = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function FieldTitle(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Helper text under a field's control.
 */
const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<React.ComponentProps<'p'>>
>(function FieldDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'p'>> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <p
      data-slot="field-description"
      className={cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground nx:group-has-data-[orientation=horizontal]/field:text-balance',
        'nx:[&>a]:text-inherit nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground',
        className
      )}
      {...props}
    />
  );
});

/**
 * A divider between fields, with optional centered content such as "OR".
 */
const FieldSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function FieldSeparator(propsWithoutRef, forwardedRef) {
  const {
    children,
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * FieldErrorProps
 *
 * Props for the FieldError component.
 */
interface FieldErrorProps extends React.ComponentProps<'div'> {
  /**
   * Validation errors to show. Duplicate messages show once, and several render
   * as a list. Ignored when `children` is set.
   */
  errors?: Array<{ message?: string } | undefined>;
}

/**
 * The error message for a field. Renders nothing when there is no error.
 */
const FieldError = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<FieldErrorProps>
>(function FieldError(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    errors,
    ...props
  }: React.PropsWithoutRef<FieldErrorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
    <ul className="nx:my-0 nx:ml-4 nx:flex nx:list-disc nx:flex-col nx:gap-1 nx:pl-0">
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
