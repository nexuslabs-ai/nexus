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
  const formState = useFormState({ name: fieldContext?.name });

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
    id,
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
function FormItem({ className, ...props }: FormItemProps) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn(
          // nexus-allow-numeric: vertical rhythm between label, control, description, message
          'nx:grid nx:gap-2',
          className
        )}
        {...props}
      />
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
 * its `id`, `aria-invalid`, and `aria-describedby` (pointing at the description
 * and, when invalid, the message).
 */
function FormControl(props: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
      }
      aria-invalid={!!error}
      {...props}
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
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('nx:text-sm nx:text-muted-foreground', className)}
      {...props}
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
 * Validation message for the field. Renders the field's error message, falling
 * back to its `children`, and renders nothing when there is neither.
 */
function FormMessage({ className, children, ...props }: FormMessageProps) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('nx:text-sm nx:text-error-subtle-foreground', className)}
      {...props}
    >
      {body}
    </p>
  );
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
