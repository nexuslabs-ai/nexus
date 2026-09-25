import * as React from 'react';

import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';

import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Input } from '../input';

interface InlineEditProps extends Omit<
  React.ComponentProps<'div'>,
  'onChange'
> {
  value: string;
  onValueChange?: (value: string) => void;
  label: string;
  variant?: 'click' | 'pencil';
  /** What happens when focus leaves the entire editor, including its actions. */
  blurBehavior?: 'keep-open' | 'save' | 'cancel';
  readOnly?: boolean;
  required?: boolean;
  emptyText?: string;
  placeholder?: string;
}

function focusInput(input: HTMLInputElement | null) {
  input?.focus();
}

/** A single-line editor. Consumers own the committed value and persistence. */
function InlineEdit({
  value,
  onValueChange,
  label,
  variant = 'pencil',
  blurBehavior = 'keep-open',
  readOnly = false,
  required = false,
  emptyText = 'Not provided',
  placeholder,
  className,
  ...props
}: InlineEditProps) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);
  const restoreFocus = React.useRef(false);
  const errorId = React.useId();
  const empty = value.trim().length === 0;
  const prompt = placeholder ?? `Add ${label.toLowerCase()}…`;

  function finishEditing(returnFocus = true) {
    restoreFocus.current = returnFocus;
    setDraft(null);
    setError(false);
  }

  function save(returnFocus = true) {
    if (draft === null) return;
    if (required && !draft.trim()) {
      setError(true);
      return;
    }
    onValueChange?.(draft.trim());
    finishEditing(returnFocus);
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    if (blurBehavior === 'save') save(false);
    if (blurBehavior === 'cancel') finishEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      finishEditing();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      save();
    }
  }

  function focusTrigger(button: HTMLButtonElement | null) {
    if (button && restoreFocus.current) {
      button.focus();
      restoreFocus.current = false;
    }
  }

  const display = (
    <span
      className={cn(
        'nx:min-w-0 nx:wrap-anywhere',
        empty && 'nx:text-muted-foreground'
      )}
    >
      {empty ? emptyText : value}
    </span>
  );

  return (
    <div
      data-slot="inline-edit"
      data-variant={variant}
      data-readonly={readOnly || undefined}
      className={cn('nx:min-w-0 nx:typography-body-default', className)}
      {...props}
    >
      {readOnly ? (
        display
      ) : draft !== null ? (
        <div
          role="group"
          aria-label={`Edit ${label}`}
          className="nx:relative nx:-start-[calc(var(--nx-spacing-2_5)+var(--nx-borderwidth-default))] nx:grid nx:gap-1"
          onBlur={handleBlur}
        >
          <div className="nx:flex nx:items-center nx:gap-1">
            <Input
              ref={focusInput}
              size="sm"
              className="nx:min-w-0 nx:typography-body-default"
              aria-label={label}
              aria-invalid={error || undefined}
              aria-describedby={error ? errorId : undefined}
              required={required}
              placeholder={prompt}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="nx:shrink-0 nx:bg-success-subtle nx:hover:bg-success-subtle-hover nx:active:bg-success-subtle-active"
              aria-label={`Save ${label}`}
              title={`Save ${label}`}
              onClick={() => save()}
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
              onClick={() => finishEditing()}
            >
              <IconX
                aria-hidden="true"
                className="nx:text-error-subtle-foreground"
              />
            </Button>
          </div>
          {error && (
            <span
              id={errorId}
              role="alert"
              className="nx:typography-body-small nx:text-error-subtle-foreground"
            >
              {label} is required.
            </span>
          )}
        </div>
      ) : variant === 'click' ? (
        <Button
          ref={focusTrigger}
          type="button"
          variant="ghost"
          size="sm"
          className="nx:h-auto nx:min-h-8 nx:w-full nx:justify-start nx:border-0 nx:px-0 nx:whitespace-normal nx:text-left nx:typography-body-default nx:hover:bg-transparent nx:active:scale-100 nx:active:bg-transparent"
          aria-label={`Edit ${label}`}
          onClick={() => setDraft(value)}
        >
          {empty ? (
            <span className="nx:text-muted-foreground">{prompt}</span>
          ) : (
            display
          )}
        </Button>
      ) : (
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
            onClick={() => setDraft(value)}
          >
            <IconPencil
              aria-hidden="true"
              className="nx:text-muted-foreground"
            />
          </Button>
        </div>
      )}
    </div>
  );
}

export { InlineEdit };
export type { InlineEditProps };
