'use client';

import * as React from 'react';

import { IconCheck, IconCopy, IconX } from '@tabler/icons-react';

import { join } from '../_lib/class-names';

import { Button } from './nexus';

const RESET_DELAY_MS = 2000;

const COPY_STATUS = {
  idle: { icon: <IconCopy />, message: '' },
  copied: { icon: <IconCheck />, message: 'Code copied to clipboard' },
  failed: { icon: <IconX />, message: 'Could not copy code' },
};

type CopyStatus = keyof typeof COPY_STATUS;

const PRE_CLASS =
  'nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:pe-14 nx:overflow-x-auto nx:typography-code-block nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:[&_code]:bg-transparent nx:[&_code]:p-0 nx:[&_code]:typography-code-block';

const BUTTON_CLASS =
  'nx:absolute nx:top-2 nx:end-2 nx:data-[copy-status=copied]:text-success-subtle-foreground nx:data-[copy-status=failed]:text-error-subtle-foreground';

/** The MDX `<pre>` override: the code block plus a control that copies it. */
export function CodeBlock({
  children,
  className,
  ...props
}: React.ComponentProps<'pre'>) {
  const preRef = React.useRef<HTMLPreElement>(null);
  const timerRef = React.useRef<number | undefined>(undefined);
  // `seq` advances on every settle so a repeat copy restarts the reset window
  // and remounts the live-region child — re-rendering the same text would not
  // announce a second time.
  const [{ status, seq }, setCopy] = React.useState({
    status: 'idle' as CopyStatus,
    seq: 0,
  });
  const { icon, message } = COPY_STATUS[status];

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const settle = (next: CopyStatus) => {
    setCopy((c) => ({ status: next, seq: c.seq + 1 }));
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => setCopy((c) => ({ status: 'idle', seq: c.seq + 1 })),
      RESET_DELAY_MS
    );
  };

  const handleCopy = async () => {
    const source = preRef.current?.textContent;
    if (!source) {
      settle('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(source);
      settle('copied');
    } catch {
      settle('failed');
    }
  };

  return (
    <div className="nx:relative nx:mb-4">
      <pre
        ref={preRef}
        // A scroll container with no focusable children needs its own tab stop.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className={join(PRE_CLASS, className)}
        {...props}
      >
        {children}
      </pre>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Copy code"
        data-copy-status={status}
        className={BUTTON_CLASS}
        onClick={handleCopy}
      >
        {icon}
      </Button>
      <span role="status" className="nx:sr-only">
        <span key={seq}>{message}</span>
      </span>
    </div>
  );
}
