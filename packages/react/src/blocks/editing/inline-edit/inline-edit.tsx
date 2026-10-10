import * as React from 'react';

import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';

import { Button } from '../../../components/button';
import { FieldError } from '../../../components/field';
import { Input } from '../../../components/input';
import { cn } from '../../../lib/utils';

type InlineEditBlurBehavior = 'keep-open' | 'save' | 'cancel';

type InlineEditCommit = (value: string) => void | Promise<void>;

export interface InlineEditProps extends Omit<
  React.ComponentProps<'div'>,
  'onChange'
> {
  value: string;
  label: string;
  /**
   * Receives the trimmed draft. Return a promise to keep the editor open
   * until it settles: resolving closes the editor, rejecting keeps the draft
   * open so the consumer can show `error` and the user can retry.
   */
  onCommit: InlineEditCommit;
  /** Whether the editor is open. Omit to let InlineEdit manage it. */
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  /** Renders the value without an edit trigger. */
  readOnly?: boolean;
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

// Pulls the field's padding and border outside the text, so editing text sits
// where the display text did.
const alignWithText =
  'nx:-ms-[calc(var(--nx-spacing-2_5)+var(--nx-borderwidth-default))]';

function focusInput(input: HTMLInputElement | null) {
  input?.focus();
}

// The trigger mounts in the same commit that removes the editor, so it is
// only attached once that commit finishes.
function focusAfterCommit(target: React.RefObject<HTMLElement | null>) {
  queueMicrotask(() => target.current?.focus());
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
  trigger: React.RefObject<HTMLButtonElement | null>;
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
  trigger,
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
      if (node?.contains(document.activeElement)) focusAfterCommit(trigger);
    };
  }, [trigger]);

  function commit() {
    if (pending) return;
    const next = draft.trim();
    if (required && !next) {
      setMissing(true);
      return;
    }
    setPending(true);
    new Promise<void>((resolve) => resolve(onCommit(next))).then(
      () => {
        setPending(false);
        // A null ref means the editor closed while saving; don't close its successor.
        if (group.current) onClose();
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
      data-slot="inline-edit-editor"
      className="nx:grid nx:gap-1"
      onBlur={handleBlur}
    >
      <div className="nx:flex nx:items-center nx:gap-1">
        <Input
          ref={focusInput}
          size="sm"
          variant="ghost"
          className={cn(alignWithText, 'nx:typography-body-default')}
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
        <div data-slot="inline-edit-actions" className="nx:flex nx:gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Save ${label}`}
            title={`Save ${label}`}
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
            aria-label={`Cancel editing ${label}`}
            title="Cancel editing"
            onClick={cancel}
          >
            <IconX
              aria-hidden="true"
              className="nx:text-error-subtle-foreground"
            />
          </Button>
        </div>
      </div>
      {invalid && <FieldError id={errorId}>{message}</FieldError>}
    </div>
  );
}

interface InlineEditTriggerProps {
  label: string;
  ref: React.Ref<HTMLButtonElement>;
  onClick: () => void;
  children: React.ReactNode;
}

function InlineEditClickTrigger({
  label,
  children,
  ...props
}: InlineEditTriggerProps) {
  return (
    <button
      type="button"
      data-slot="inline-edit-trigger"
      className={cn(
        alignWithText,
        'nx:flex nx:min-h-8 nx:w-full nx:cursor-pointer nx:items-center nx:rounded-md nx:border-default nx:border-transparent nx:px-2.5 nx:text-start nx:hover:bg-container-hover nx:active:bg-container-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2'
      )}
      {...props}
    >
      <span className="nx:sr-only">{`Edit ${label} `}</span>
      {children}
    </button>
  );
}

function InlineEditPencilTrigger({
  label,
  children,
  ...props
}: InlineEditTriggerProps) {
  return (
    <div className="nx:flex nx:items-center nx:gap-2">
      {children}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        data-slot="inline-edit-trigger"
        aria-label={`Edit ${label}`}
        title={`Edit ${label}`}
        {...props}
      >
        <IconPencil aria-hidden="true" className="nx:text-muted-foreground" />
      </Button>
    </div>
  );
}

/**
 * A single-line editor. Consumers own the committed value, persistence, and
 * any save error; `editing` / `onEditingChange` control when the editor is open.
 */
export function InlineEdit({
  value,
  label,
  onCommit,
  editing: editingProp,
  onEditingChange,
  readOnly = false,
  error,
  activation = 'pencil',
  blurBehavior = 'keep-open',
  required = false,
  requiredMessage = `${label} is required.`,
  emptyText = 'Not provided',
  placeholder,
  className,
  ...props
}: InlineEditProps) {
  const [uncontrolledEditing, setUncontrolledEditing] = React.useState(false);
  const editing = !readOnly && (editingProp ?? uncontrolledEditing);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const Trigger =
    activation === 'click' ? InlineEditClickTrigger : InlineEditPencilTrigger;
  const display = <InlineEditValue value={value} emptyText={emptyText} />;

  function setEditing(next: boolean) {
    if (editingProp === undefined) setUncontrolledEditing(next);
    onEditingChange?.(next);
  }

  return (
    <div
      data-slot="inline-edit"
      data-activation={activation}
      data-editing={editing || undefined}
      data-readonly={readOnly || undefined}
      className={cn('nx:min-w-0 nx:typography-body-default', className)}
      {...props}
    >
      {readOnly && display}
      {editing && (
        <InlineEditEditor
          value={value}
          label={label}
          error={error}
          blurBehavior={blurBehavior}
          required={required}
          requiredMessage={requiredMessage}
          placeholder={placeholder}
          onCommit={onCommit}
          onClose={() => setEditing(false)}
          trigger={trigger}
        />
      )}
      {!readOnly && !editing && (
        <Trigger ref={trigger} label={label} onClick={() => setEditing(true)}>
          {display}
        </Trigger>
      )}
    </div>
  );
}
