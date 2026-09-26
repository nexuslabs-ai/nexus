'use client';

import * as React from 'react';

import { cn } from '@nexus_ds/react/utils';
import { IconCheck, IconCopy, IconX } from '@tabler/icons-react';

import { useCopyAnnouncer } from './CopyAnnouncer';
import { Button } from './nexus';

const RESET_DELAY_MS = 2000;

const COPY_STATUS = {
  idle: { icon: <IconCopy /> },
  copied: { icon: <IconCheck />, message: 'Code copied to clipboard' },
  failed: { icon: <IconX />, message: 'Could not copy code' },
};

type CopyStatus = keyof typeof COPY_STATUS;

// Every docs code block — MDX fence and `CodeSample` alike —
// renders through here, so this is the one code-block surface. `bg-container`
// is the surface the syntax colours are APCA-gated against; `pe-14` keeps the
// copy control clear of the code; the `code` resets undo the inline-code
// styling the MDX `code` override applies inside a fence.
const PRE_CLASS =
  'nx:typography-code-block nx:bg-container nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:pe-14 nx:overflow-x-auto nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&_code]:bg-transparent nx:[&_code]:p-0 nx:[&_code]:typography-code-block';

const BUTTON_CLASS =
  'nx:absolute nx:top-2 nx:end-2 nx:data-[copy-status=copied]:text-success-subtle-foreground nx:data-[copy-status=failed]:text-error-subtle-foreground';

/** The MDX `<pre>` override: the code block plus a control that copies it. */
export function CodeBlock({
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'pre'>, 'tabIndex' | 'ref'>) {
  const preRef = React.useRef<HTMLPreElement>(null);
  const timerRef = React.useRef<number | undefined>(undefined);
  const [status, setStatus] = React.useState<CopyStatus>('idle');
  const announce = useCopyAnnouncer();

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const settle = (next: Exclude<CopyStatus, 'idle'>) => {
    setStatus(next);
    announce(COPY_STATUS[next].message);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => setStatus('idle'),
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
        className={cn(PRE_CLASS, className)}
        {...props}
        ref={preRef}
        // Below the spread so an injected `tabIndex` cannot replace this one.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
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
        {COPY_STATUS[status].icon}
      </Button>
    </div>
  );
}
