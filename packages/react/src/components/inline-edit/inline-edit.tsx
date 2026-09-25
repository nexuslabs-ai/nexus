import * as React from 'react';

import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';

import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Input } from '../input';

type InlineEditBlurBehavior = 'keep-open' | 'save' | 'cancel';

type InlineEditCommit = (value: string) => void | Promise<void>;

interface InlineEditBaseProps extends Omit<
  React.ComponentProps<'div'>,
  'onChange'
> {
  value: string;
  label: string;
  /** Whether the editor is open. Omit to let InlineEdit manage it. */
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  /** Consumer-owned validation or save error, shown while the editor is open. */
  error?: React.ReactNode;
  /** `pencil` shows an edit button beside the value; `click` makes the value itself the edit button. */
  activation?: 'pencil' | 'click';
  /** What happens when focus leaves the entire editor, including its actions. */
  blurBehavior?: InlineEditBlurBehavior;
  required?: boolean;
  /** Shown when a required value is saved empty. Defaults to `{label} is required.` */
  requiredMessage?: string;
  emptyText?: string;
  placeholder?: string;
}

interface InlineEditReadOnlyProps {
  readOnly: true;
  onCommit?: undefined;
}

interface InlineEditEditableProps {
  readOnly?: false;
  /**
   * Receives the trimmed draft. Return a promise to keep the editor open
   * until it settles: resolving closes the editor, rejecting keeps the draft
   * open so the consumer can show `error` and the user can retry.
   */
  onCommit: InlineEditCommit;
}

type InlineEditProps = InlineEditBaseProps &
  (InlineEditReadOnlyProps | InlineEditEditableProps);

const inlineEditInset =
  'nx:-ms-[calc(var(--nx-spacing-2_5)+var(--nx-borderwidth-default))] nx:border-default nx:px-2.5';

function focusInput(input: HTMLInputElement | null) {
  input?.focus();
}

function keepInputFocus(event: React.MouseEvent) {
  event.preventDefault();
}

function InlineEditValue({
  value,
  emptyText,
}: {
  value: string;
  emptyText: string;
}) {
  const empty = value.trim().length === 0;
  return (
    <span
      data-slot="inline-edit-value"
      className={cn(
        'nx:min-w-0 nx:wrap-anywhere',
        empty && 'nx:text-muted-foreground'
      )}
    >
      {empty ? emptyText : value}
    </span>
  );
}

interface InlineEditEditorProps {
  value: string;
  label: string;
  error: React.ReactNode;
  blurBehavior: InlineEditBlurBehavior;
  required: boolean;
  requiredMessage: string;
  placeholder?: string;
  onCommit: InlineEditCommit;
  onClose: () => void;
  focusReturn: React.RefObject<boolean>;
}

function InlineEditEditor({
  value,
  label,
  error,
  blurBehavior,
  required,
  requiredMessage,
  placeholder,
  onCommit,
  onClose,
  focusReturn,
}: InlineEditEditorProps) {
  const [draft, setDraft] = React.useState(value);
  const [missing, setMissing] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const group = React.useRef<HTMLDivElement>(null);
  const errorId = React.useId();
  const message = missing ? requiredMessage : error;
  const invalid = Boolean(message);

  React.useLayoutEffect(() => {
    const node = group.current;
    return () => {
      focusReturn.current = Boolean(node?.contains(document.activeElement));
    };
  }, [focusReturn]);

  function commit() {
    if (pending) return;
    const next = draft.trim();
    if (required && !next) {
      setMissing(true);
      return;
    }
    const result = onCommit(next);
    setPending(true);
    Promise.resolve(result).then(
      () => {
        setPending(false);
        onClose();
      },
      () => setPending(false)
    );
  }

  function cancel() {
    if (pending) return;
    onClose();
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    if (blurBehavior === 'save') commit();
    if (blurBehavior === 'cancel') cancel();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDraft(event.target.value);
    setMissing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      cancel();
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    commit();
  }

  return (
    <div
      ref={group}
      role="group"
      aria-label={`Edit ${label}`}
      aria-busy={pending || undefined}
      className="nx:grid nx:gap-1"
      onBlur={handleBlur}
    >
      <div className="nx:flex nx:items-center nx:gap-1">
        <Input
          ref={focusInput}
          size="sm"
          className={cn(
            inlineEditInset,
            'nx:min-w-0 nx:typography-body-default'
          )}
          aria-label={label}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          required={required}
          readOnly={pending}
          placeholder={placeholder}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="nx:shrink-0 nx:bg-success-subtle nx:hover:bg-success-subtle-hover nx:active:bg-success-subtle-active"
          aria-label={`Save ${label}`}
          title={`Save ${label}`}
          onMouseDown={keepInputFocus}
          onClick={commit}
        >
          <IconCheck
            aria-hidden="true"
            className="nx:text-success-subtle-foreground"
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="nx:shrink-0 nx:bg-error-subtle nx:hover:bg-error-subtle-hover nx:active:bg-error-subtle-active"
          aria-label={`Cancel editing ${label}`}
          title="Cancel editing"
          onMouseDown={keepInputFocus}
          onClick={cancel}
        >
          <IconX
            aria-hidden="true"
            className="nx:text-error-subtle-foreground"
          />
        </Button>
      </div>
      {invalid && (
        <span
          id={errorId}
          role="alert"
          className="nx:typography-body-small nx:text-error-subtle-foreground"
        >
          {message}
        </span>
      )}
    </div>
  );
}

/**
 * A single-line editor. Consumers own the committed value, persistence, and
 * any save error; `editing` / `onEditingChange` control when the editor is open.
 */
function InlineEdit({
  value,
  label,
  onCommit,
  editing: editingProp,
  onEditingChange,
  error,
  activation = 'pencil',
  blurBehavior = 'keep-open',
  readOnly,
  required = false,
  requiredMessage,
  emptyText = 'Not provided',
  placeholder,
  className,
  ...props
}: InlineEditProps) {
  const [uncontrolledEditing, setUncontrolledEditing] = React.useState(false);
  const editing = editingProp ?? uncontrolledEditing;
  const restoreFocus = React.useRef(false);

  function setEditing(next: boolean) {
    if (editingProp === undefined) setUncontrolledEditing(next);
    onEditingChange?.(next);
  }

  function close() {
    setEditing(false);
  }

  function focusTrigger(button: HTMLButtonElement | null) {
    if (!button || !restoreFocus.current) return;
    restoreFocus.current = false;
    button.focus();
  }

  function content() {
    const display = <InlineEditValue value={value} emptyText={emptyText} />;
    if (readOnly) return display;

    if (editing) {
      return (
        <InlineEditEditor
          value={value}
          label={label}
          error={error}
          blurBehavior={blurBehavior}
          required={required}
          requiredMessage={requiredMessage ?? `${label} is required.`}
          placeholder={placeholder}
          onCommit={onCommit}
          onClose={close}
          focusReturn={restoreFocus}
        />
      );
    }

    if (activation === 'click') {
      return (
        <button
          ref={focusTrigger}
          type="button"
          className={cn(
            inlineEditInset,
            'nx:flex nx:min-h-8 nx:w-full nx:cursor-pointer nx:items-center nx:rounded-md nx:border-transparent nx:text-start nx:typography-body-default nx:text-foreground nx:transition-control nx:duration-fast nx:hover:bg-container-hover nx:active:bg-container-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2'
          )}
          onClick={() => setEditing(true)}
        >
          <span className="nx:sr-only">{`Edit ${label} `}</span>
          {display}
        </button>
      );
    }

    return (
      <div className="nx:flex nx:items-center nx:gap-2">
        {display}
        <Button
          ref={focusTrigger}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="nx:shrink-0"
          aria-label={`Edit ${label}`}
          title={`Edit ${label}`}
          onClick={() => setEditing(true)}
        >
          <IconPencil aria-hidden="true" className="nx:text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <div
      data-slot="inline-edit"
      data-activation={activation}
      data-readonly={readOnly || undefined}
      className={cn('nx:min-w-0 nx:typography-body-default', className)}
      {...props}
    >
      {content()}
    </div>
  );
}

export { InlineEdit };
export type { InlineEditProps };
