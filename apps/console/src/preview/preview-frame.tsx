import { useEffect, useRef, useState } from 'react';

import { Button } from '@nexus_ds/react';

import { connectPreview, type PreviewStatus } from './frame-channel';
import type { PreviewResult } from './protocol';

interface PreviewFrameProps {
  result: PreviewResult;
}

function ConnectedPreview({ result }: PreviewFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const channel = useRef<ReturnType<typeof connectPreview>>(null);
  const [status, setStatus] = useState<PreviewStatus>({ phase: 'loading' });

  useEffect(() => {
    if (!frame.current) return;
    const connection = connectPreview(frame.current, setStatus, () =>
      enterButton.current?.focus()
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

  const applied =
    status.phase === 'applied' && status.revision === result.revision;
  const failed = status.phase === 'error';
  function enterPreview() {
    frame.current?.contentDocument
      ?.querySelector<HTMLButtonElement>('button')
      ?.focus();
  }

  return (
    <div
      className="nx:space-y-3"
      data-slot="preview-connection"
      data-state={failed ? 'error' : applied ? 'applied' : 'pending'}
      data-revision={applied ? status.revision : undefined}
    >
      <div className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-3">
        <p
          role="status"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          {failed
            ? 'The preview is unavailable. Reload it to try again.'
            : applied
              ? 'Preview is up to date.'
              : 'Preparing your preview…'}
        </p>
        <Button
          ref={enterButton}
          variant="ghost"
          size="sm"
          disabled={!applied}
          onClick={enterPreview}
        >
          Enter preview
        </Button>
      </div>
      <iframe
        ref={frame}
        title="Nexus component preview"
        src={`${import.meta.env.BASE_URL}component-preview.html`}
        hidden={failed}
        className={
          failed
            ? 'nx:hidden'
            : 'nx:block nx:h-96 nx:w-full nx:rounded-lg nx:border-default nx:border-border-default'
        }
      />
    </div>
  );
}

export function PreviewFrame({ result }: PreviewFrameProps) {
  const [instance, setInstance] = useState(0);
  return (
    <section
      aria-label="Live component preview"
      className="nx:space-y-3"
      data-slot="preview-frame"
    >
      <ConnectedPreview key={instance} result={result} />
      <Button
        variant="link"
        size="sm"
        onClick={() => setInstance(instance + 1)}
      >
        Reload preview
      </Button>
    </section>
  );
}
