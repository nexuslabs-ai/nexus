import * as React from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { Slot } from '@radix-ui/react-slot';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Form
 *
 * Context provider for a react-hook-form instance — a re-export of
 * `FormProvider`. Spread a `useForm()` return value onto it, then render fields
 * with `FormField` so the field parts (`FormLabel`, `FormControl`,
 * `FormDescription`, `FormMessage`) can read the field's state and wire their
 * `id` / `aria-*` together.
 *
 * @example
 * ```tsx
 * const form = useForm<Values>({ resolver: zodResolver(schema) });
 *
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit((values) => save(values))}>
 *     <FormField
 *       control={form.control}
 *       name="username"
 *       render={({ field }) => (
 *         <FormItem>
 *           <FormLabel>Username</FormLabel>
 *           <FormControl>
 *             <Input {...field} />
 *           </FormControl>
 *           <FormDescription>Your public display name.</FormDescription>
 *           <FormMessage />
 *         </FormItem>
 *       )}
 *     />
 *   </form>
 * </Form>
 * ```
 */
const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null
);

type FormItemContextValue = {
  id: string;
  hasDescription: boolean;
  hasMessage: boolean;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

/**
 * FormField
 *
 * Connects a single field to react-hook-form via `Controller` and publishes the
 * field name so the field parts inside it resolve their state and ids.
 */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

/**
 * useFormField
 *
 * Reads the active field's validation state plus the `id`s that link its label,
 * control, description, and message. Must be called inside both a `FormField`
 * and a `FormItem`.
 */
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const formContext = useFormContext();
  const formState = useFormState({
    name: fieldContext?.name,
    exact: true,
  });

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }
  if (!itemContext) {
    throw new Error('useFormField should be used within <FormItem>');
  }

  const { id } = itemContext;
  const { getFieldState } = formContext;
  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    ...itemContext,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

/**
 * FormItemProps
 *
 * Props for the FormItem component.
 */
interface FormItemProps extends React.ComponentProps<'div'> {}

/**
 * FormItem
 *
 * Groups one field's label, control, description, and message, and generates
 * the shared `id` that wires them together.
 */
function FormItem({ className, children, ...props }: FormItemProps) {
  const id = React.useId();
  const { hasDescription, hasMessage } = getFormItemParts(children);

  const value = React.useMemo<FormItemContextValue>(
    () => ({
      id,
      hasDescription,
      hasMessage,
    }),
    [id, hasDescription, hasMessage]
  );

  return (
    <FormItemContext.Provider value={value}>
      <div
        data-slot="form-item"
        className={cn('nx:grid nx:gap-2', className)}
        {...props}
      >
        {children}
      </div>
    </FormItemContext.Provider>
  );
}

/**
 * FormLabelProps
 *
 * Props for the FormLabel component.
 */
interface FormLabelProps extends React.ComponentProps<typeof Label> {}

/**
 * FormLabel
 *
 * Label for the field's control. Wired to the control via `htmlFor` and turns
 * error-coloured when the field is invalid.
 */
function FormLabel({ className, ...props }: FormLabelProps) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn(
        'nx:data-[error=true]:text-error-subtle-foreground',
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/**
 * FormControlProps
 *
 * Props for the FormControl component.
 */
interface FormControlProps extends React.ComponentProps<typeof Slot> {}

/**
 * FormControl
 *
 * Slot that wires the field's control to the surrounding `FormItem` — setting
 * its `id`, `aria-invalid`, `aria-describedby` (helper text only), and
 * `aria-errormessage` when invalid.
 */
function FormControl({
  'aria-describedby': ariaDescribedBy,
  ...props
}: FormControlProps) {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId,
    hasDescription,
    hasMessage,
  } = useFormField();
  const hasErrorMessage = Boolean(error?.message);
  const describedBy =
    [hasDescription ? formDescriptionId : undefined, ariaDescribedBy]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <Slot
      {...props}
      data-slot="form-control"
      id={formItemId}
      aria-describedby={describedBy}
      aria-invalid={!!error}
      aria-errormessage={
        hasErrorMessage && hasMessage ? formMessageId : undefined
      }
    />
  );
}

/**
 * FormDescriptionProps
 *
 * Props for the FormDescription component.
 */
interface FormDescriptionProps extends React.ComponentProps<'p'> {}

/**
 * FormDescription
 *
 * Helper text for the field, linked to the control via `aria-describedby`.
 */
function FormDescription({ className, ...props }: FormDescriptionProps) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      {...props}
      data-slot="form-description"
      id={formDescriptionId}
      // Keep className last so consumer typography overrides win by source order.
      className={cn(
        'nx:typography-body-small nx:text-muted-foreground',
        className
      )}
    />
  );
}

/**
 * FormMessageProps
 *
 * Props for the FormMessage component.
 */
interface FormMessageProps extends React.ComponentProps<'p'> {}

/**
 * FormMessage
 *
 * Validation message for the field. Renders a stable alert region so new
 * validation text is announced when the field becomes invalid.
 */
function FormMessage({
  className,
  children,
  role,
  ...props
}: FormMessageProps) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : children;

  return (
    <p
      {...props}
      role={role ?? 'alert'}
      aria-atomic="true"
      data-slot="form-message"
      id={formMessageId}
      // Keep className last so consumer typography overrides win by source order.
      className={cn(
        'nx:typography-body-small nx:text-error-subtle-foreground',
        className
      )}
    >
      {body}
    </p>
  );
}

function getFormItemParts(children: React.ReactNode) {
  let hasDescription = false;
  let hasMessage = false;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === React.Fragment) {
      const fragment = child as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      const parts = getFormItemParts(fragment.props.children);
      hasDescription ||= parts.hasDescription;
      hasMessage ||= parts.hasMessage;
      return;
    }

    if (child.type === FormDescription) {
      hasDescription = true;
    }
    if (child.type === FormMessage) {
      hasMessage = true;
    }
  });

  return { hasDescription, hasMessage };
}

export {
  Form,
  FormControl,
  type FormControlProps,
  FormDescription,
  type FormDescriptionProps,
  FormField,
  FormItem,
  type FormItemProps,
  FormLabel,
  type FormLabelProps,
  FormMessage,
  type FormMessageProps,
  useFormField,
};
