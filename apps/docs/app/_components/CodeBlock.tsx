'use client';

import * as React from 'react';

import { IconCheck, IconCopy, IconX } from '@tabler/icons-react';

import { join } from '../_lib/class-names';

import { Button } from './nexus';

const RESET_DELAY_MS = 2000;

type CopyStatus = 'idle' | 'copied' | 'failed';

const COPY_STATUS: Record<
  CopyStatus,
  { icon: React.ReactNode; message: string; textClass: string }
> = {
  idle: { icon: <IconCopy />, message: '', textClass: '' },
  copied: {
    icon: <IconCheck />,
    message: 'Code copied to clipboard',
    textClass: 'nx:text-success-subtle-foreground',
  },
  failed: {
    icon: <IconX />,
    message: 'Could not copy code',
    textClass: 'nx:text-error-subtle-foreground',
  },
};

const PRE_CLASS =
  'nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:pe-14 nx:overflow-x-auto nx:typography-code-block nx:[&_code]:bg-transparent nx:[&_code]:p-0 nx:[&_code]:typography-code-block';

/**
 * The MDX `<pre>` override. Copy-paste is how Nexus components are adopted, so
 * every fenced block carries a control that yields the whole snippet — imports
 * included — in one click.
 *
 * The control is a sibling of the `<pre>`, not a child: the copied string is
 * read straight off `<pre>.textContent`, so the button's own label can never
 * leak into it, and a hand-selection of the block does not pick it up either.
 * Reading the DOM rather than the React children also keeps the copy exact once
 * syntax highlighting wraps the source in nested spans.
 */
export function CodeBlock({
  children,
  className,
  ...props
}: React.ComponentProps<'pre'>) {
  const preRef = React.useRef<HTMLPreElement>(null);
  const [status, setStatus] = React.useState<CopyStatus>('idle');
  const { icon, message, textClass } = COPY_STATUS[status];

  React.useEffect(() => {
    if (status === 'idle') return;

    const timer = window.setTimeout(() => setStatus('idle'), RESET_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleCopy = async () => {
    // textContent, not innerText: it keeps the source verbatim, including the
    // fence's trailing newline, where innerText would collapse the whitespace.
    const source = preRef.current?.textContent;
    if (!source) return;

    try {
      await navigator.clipboard.writeText(source);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <div className="nx:relative nx:mb-4">
      <pre ref={preRef} className={join(PRE_CLASS, className)} {...props}>
        {children}
      </pre>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Copy code"
        data-copy-status={status}
        className={join('nx:absolute nx:top-2 nx:end-2', textClass)}
        onClick={handleCopy}
      >
        {icon}
      </Button>
      <span role="status" className="nx:sr-only">
        {message}
      </span>
    </div>
  );
}
