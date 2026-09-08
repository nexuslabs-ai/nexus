'use client';

import * as React from 'react';

import { IconCheck, IconCopy, IconX } from '@tabler/icons-react';

import { join } from '../_lib/class-names';

import { Button } from './nexus';

const RESET_DELAY_MS = 2000;

const COPY_STATUS = {
  idle: { icon: <IconCopy />, message: '', className: '' },
  copied: {
    icon: <IconCheck />,
    message: 'Code copied to clipboard',
    className: 'nx:text-success-subtle-foreground',
  },
  failed: {
    icon: <IconX />,
    message: 'Could not copy code',
    className: 'nx:text-error-subtle-foreground',
  },
};

type CopyStatus = keyof typeof COPY_STATUS;

const PRE_CLASS =
  'nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:pe-14 nx:overflow-x-auto nx:typography-code-block nx:[&_code]:bg-transparent nx:[&_code]:p-0 nx:[&_code]:typography-code-block';

/** The MDX `<pre>` override: the code block plus a control that copies it. */
export function CodeBlock({
  children,
  className,
  ...props
}: React.ComponentProps<'pre'>) {
  const preRef = React.useRef<HTMLPreElement>(null);
  const [status, setStatus] = React.useState<CopyStatus>('idle');
  const { icon, message, className: statusClass } = COPY_STATUS[status];

  React.useEffect(() => {
    if (status === 'idle') return;

    const timer = window.setTimeout(() => setStatus('idle'), RESET_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleCopy = async () => {
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
        variant="outline"
        size="icon-sm"
        aria-label="Copy code"
        data-copy-status={status}
        className={join('nx:absolute nx:top-2 nx:end-2', statusClass)}
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
