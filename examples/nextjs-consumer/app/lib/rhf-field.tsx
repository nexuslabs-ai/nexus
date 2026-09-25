import * as React from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { cn, Label } from '@acme/react';

type RhfFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const RhfFieldContext = React.createContext<RhfFieldContextValue | null>(null);

type RhfFieldItemContextValue = {
  id: string;
  hasDescription: boolean;
  hasMessage: boolean;
};

const RhfFieldItemContext =
  React.createContext<RhfFieldItemContextValue | null>(null);

function RhfField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <RhfFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </RhfFieldContext.Provider>
  );
}

function useRhfField() {
  const fieldContext = React.useContext(RhfFieldContext);
  const itemContext = React.useContext(RhfFieldItemContext);
  const formContext = useFormContext();
  const formState = useFormState({
    name: fieldContext?.name,
    exact: true,
  });

  if (!fieldContext) {
    throw new Error('useRhfField should be used within <RhfField>');
  }
  if (!itemContext) {
    throw new Error('useRhfField should be used within <RhfFieldItem>');
  }

  const { id } = itemContext;
  const { getFieldState } = formContext;
  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    ...itemContext,
    name: fieldContext.name,
    fieldId: `${id}-rhf-field`,
    descriptionId: `${id}-rhf-field-description`,
    messageId: `${id}-rhf-field-message`,
    ...fieldState,
  };
}

type RhfFieldItemProps = React.ComponentProps<'div'>;

function RhfFieldItem({ className, children, ...props }: RhfFieldItemProps) {
  const id = React.useId();
  const { hasDescription, hasMessage } = getRhfFieldItemParts(children);

  const value = React.useMemo<RhfFieldItemContextValue>(
    () => ({
      id,
      hasDescription,
      hasMessage,
    }),
    [id, hasDescription, hasMessage]
  );

  return (
    <RhfFieldItemContext.Provider value={value}>
      <div
        data-slot="rhf-field-item"
        className={cn('nx:grid nx:gap-2', className)}
        {...props}
      >
        {children}
      </div>
    </RhfFieldItemContext.Provider>
  );
}

type RhfFieldLabelProps = React.ComponentProps<typeof Label>;

function RhfFieldLabel({ className, ...props }: RhfFieldLabelProps) {
  const { error, fieldId } = useRhfField();

  return (
    <Label
      data-slot="rhf-field-label"
      data-error={!!error}
      className={cn(
        'nx:data-[error=true]:text-error-subtle-foreground',
        className
      )}
      htmlFor={fieldId}
      {...props}
    />
  );
}

interface RhfFieldControlProps {
  children: React.ReactElement<Record<string, unknown>>;
  'aria-describedby'?: string;
}

function RhfFieldControl({
  children,
  'aria-describedby': ariaDescribedBy,
}: RhfFieldControlProps) {
  const {
    error,
    fieldId,
    descriptionId,
    messageId,
    hasDescription,
    hasMessage,
  } = useRhfField();
  const hasErrorMessage = Boolean(error?.message);
  const describedBy =
    [hasDescription ? descriptionId : undefined, ariaDescribedBy]
      .filter(Boolean)
      .join(' ') || undefined;

  return React.cloneElement(children, {
    id: fieldId,
    'aria-describedby': describedBy,
    'aria-invalid': !!error,
    'aria-errormessage': hasErrorMessage && hasMessage ? messageId : undefined,
  });
}

type RhfFieldDescriptionProps = React.ComponentProps<'p'>;

function RhfFieldDescription({
  className,
  ...props
}: RhfFieldDescriptionProps) {
  const { descriptionId } = useRhfField();

  return (
    <p
      {...props}
      data-slot="rhf-field-description"
      id={descriptionId}
      className={cn(
        'nx:typography-body-small nx:text-muted-foreground',
        className
      )}
    />
  );
}

type RhfFieldMessageProps = React.ComponentProps<'p'>;

function RhfFieldMessage({
  className,
  children,
  role,
  ...props
}: RhfFieldMessageProps) {
  const { error, messageId } = useRhfField();
  const body = error ? String(error.message ?? '') : children;

  return (
    <p
      {...props}
      role={role ?? 'alert'}
      aria-atomic="true"
      data-slot="rhf-field-message"
      id={messageId}
      className={cn(
        'nx:typography-body-small nx:text-error-subtle-foreground',
        className
      )}
    >
      {body}
    </p>
  );
}

function getRhfFieldItemParts(children: React.ReactNode) {
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
      const parts = getRhfFieldItemParts(fragment.props.children);
      hasDescription ||= parts.hasDescription;
      hasMessage ||= parts.hasMessage;
      return;
    }

    if (child.type === RhfFieldDescription) {
      hasDescription = true;
    }
    if (child.type === RhfFieldMessage) {
      hasMessage = true;
    }
  });

  return { hasDescription, hasMessage };
}

export {
  RhfField,
  RhfFieldControl,
  RhfFieldDescription,
  RhfFieldItem,
  RhfFieldLabel,
  RhfFieldMessage,
};
