'use client';

import React, {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@nexus_ds/react';

const COPY_STATUS_RESET_MS = 2000;

type CopyStatus = 'idle' | 'copied' | 'failed';

const COPY_LABELS: Record<CopyStatus, string> = {
  idle: 'Copy code',
  copied: 'Copied',
  failed: 'Try again',
};

const COPY_ANNOUNCEMENTS: Record<CopyStatus, string> = {
  idle: '',
  copied: 'Code copied to clipboard.',
  failed: 'Unable to copy code.',
};

export function CodeBlock({
  children,
  className,
  ...props
}: ComponentProps<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  const scheduleStatusReset = useCallback(() => {
    clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(
      () => setCopyStatus('idle'),
      COPY_STATUS_RESET_MS
    );
  }, []);

  useEffect(
    () => () => {
      clearTimeout(resetTimerRef.current);
    },
    []
  );

  const handleCopy = useCallback(async () => {
    const code = preRef.current?.querySelector('code');

    try {
      if (!code || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard writing is unavailable.');
      }

      await navigator.clipboard.writeText(code.textContent ?? '');
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }

    scheduleStatusReset();
  }, [scheduleStatusReset]);

  return (
    <div className="nx:relative nx:mb-4">
      <pre
        ref={preRef}
        className={`nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:pt-12 nx:overflow-x-auto nx:typography-code-block nx:[&_code]:bg-transparent nx:[&_code]:p-0 nx:[&_code]:typography-code-block ${className ?? ''}`}
        {...props}
      >
        {children}
      </pre>
      <Button
        className="nx:absolute nx:left-2 nx:top-2"
        onClick={handleCopy}
        size="sm"
        variant="outline"
      >
        {COPY_LABELS[copyStatus]}
      </Button>
      <span className="nx:sr-only" role="status">
        {COPY_ANNOUNCEMENTS[copyStatus]}
      </span>
    </div>
  );
}
