/**
 * ForwardRef Wrapped Component Fixture
 *
 * Component using forwardRef with displayName.
 * Used for testing extraction of:
 * - forwardRef pattern detection
 * - displayName handling
 * - Ref type inference
 */

import * as React from 'react';

interface TextAreaProps extends React.ComponentProps<'textarea'> {
  /**
   * Whether the textarea should auto-resize based on content.
   * @default false
   */
  autoResize?: boolean;

  /**
   * Minimum number of rows to display.
   * @default 3
   */
  minRows?: number;

  /**
   * Maximum number of rows before scrolling.
   */
  maxRows?: number;

  /**
   * Whether the textarea is in an error state.
   * @default false
   */
  error?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      autoResize = false,
      minRows = 3,
      maxRows,
      error = false,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Combine refs
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Auto-resize logic
    React.useEffect(() => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;

      if (maxRows) {
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const maxHeight = lineHeight * maxRows;
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      } else {
        textarea.style.height = `${scrollHeight}px`;
      }
    }, [autoResize, maxRows, props.value]);

    const errorClasses = error
      ? 'border-destructive focus-visible:ring-destructive'
      : '';

    return (
      <textarea
        data-slot="textarea"
        data-error={error || undefined}
        data-auto-resize={autoResize || undefined}
        className={`border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errorClasses} ${className}`}
        ref={setRefs}
        rows={minRows}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea, type TextAreaProps };
