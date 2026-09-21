'use client';

import { useEffect, useRef, useState } from 'react';

import type { NexusAppearanceState } from '@nexus_ds/core';

import { connectPreview, type PreviewStatus } from './frame-channel';
import type { PreviewResult } from './protocol';

interface PreviewFrameProps {
  result: PreviewResult;
  onAppearanceChange?: (state: NexusAppearanceState) => void;
}

function ConnectedPreview({ result, onAppearanceChange }: PreviewFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const appearanceRef = useRef(onAppearanceChange);
  useEffect(() => {
    appearanceRef.current = onAppearanceChange;
  }, [onAppearanceChange]);
  const channel = useRef<ReturnType<typeof connectPreview>>(null);
  const [status, setStatus] = useState<PreviewStatus>({ phase: 'loading' });

  useEffect(() => {
    if (!frame.current) return;
    const connection = connectPreview(
      frame.current,
      setStatus,
      () => frame.current?.focus(),
      undefined,
      (state) => appearanceRef.current?.(state)
    );
    channel.current = connection;
    return () => {
      connection.dispose();
      channel.current = null;
    };
  }, []);

  useEffect(() => {
    channel.current?.update(result);
  }, [result]);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    let observer: ResizeObserver | undefined;
    function observeContent() {
      observer?.disconnect();
      const content = element?.contentDocument?.getElementById('preview-root');
      if (!content || !element) return;
      const resize = () => {
        element.style.height = `${Math.ceil(content.getBoundingClientRect().height)}px`;
      };
      observer = new ResizeObserver(resize);
      observer.observe(content);
      resize();
    }
    element.addEventListener('load', observeContent);
    observeContent();
    return () => {
      element.removeEventListener('load', observeContent);
      observer?.disconnect();
    };
  }, []);

  const applied =
    status.phase === 'applied' && status.revision === result.revision;
  const failed = status.phase === 'error';
  return (
    <div
      className="nx:flex nx:flex-col nx:gap-3 nx:min-h-0"
      data-slot="preview-connection"
      data-state={failed ? 'error' : applied ? 'applied' : 'pending'}
      data-revision={applied ? status.revision : undefined}
    >
      {!applied && (
        <p
          role="status"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          {failed
            ? 'The preview is unavailable. Refresh this page to try again.'
            : 'Preparing your preview…'}
        </p>
      )}
      <iframe
        ref={frame}
        title="Nexus component preview"
        src="/create/preview"
        hidden={failed}
        className={failed ? 'nx:hidden' : 'nx:block nx:w-full nx:border-0'}
      />
    </div>
  );
}

export function PreviewFrame({
  result,
  onAppearanceChange,
}: PreviewFrameProps) {
  return (
    <section
      aria-label="Live component preview"
      className="nx:flex nx:flex-col nx:gap-3 nx:min-h-0"
      data-slot="preview-frame"
    >
      <ConnectedPreview
        result={result}
        onAppearanceChange={onAppearanceChange}
      />
    </section>
  );
}
