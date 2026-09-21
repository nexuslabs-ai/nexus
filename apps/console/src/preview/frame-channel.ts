import {
  type HostMessage,
  isPreviewMessage,
  PREVIEW_CHANNEL,
  PREVIEW_VERSION,
  type PreviewResult,
} from './protocol';

export type PreviewStatus =
  | { phase: 'loading' }
  | { phase: 'updating' | 'applied'; revision: number }
  | { phase: 'error'; revision?: number };

let connectionSequence = 0;
const RESPONSE_TIMEOUT_MS = 8000;

/** One frame connection; it owns no theme calculations or React state. */
export function connectPreview(
  frame: HTMLIFrameElement,
  onStatus: (status: PreviewStatus) => void,
  onExit: () => void
) {
  const host = frame.ownerDocument.defaultView;
  if (!host) throw new Error('Missing preview host window');
  const origin = host.location.origin;
  let connection = '';
  let documentId: string | undefined;
  let latest: PreviewResult | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let failed = false;

  function awaitResponse(revision?: number) {
    clearTimeout(timer);
    const expectedConnection = connection;
    const expectedDocument = documentId;
    timer = setTimeout(() => {
      if (
        disposed ||
        expectedConnection !== connection ||
        expectedDocument !== documentId ||
        (revision !== undefined && revision !== latest?.revision)
      )
        return;
      failed = true;
      onStatus({ phase: 'error', revision });
    }, RESPONSE_TIMEOUT_MS);
  }

  function send(message: HostMessage) {
    frame.contentWindow?.postMessage(message, origin);
  }

  function applyLatest() {
    if (!documentId || !latest || disposed || failed) return;
    onStatus({ phase: 'updating', revision: latest.revision });
    awaitResponse(latest.revision);
    send({
      channel: PREVIEW_CHANNEL,
      version: PREVIEW_VERSION,
      type: 'apply',
      connection,
      documentId,
      ...latest,
    });
  }

  function start() {
    if (disposed) return;
    connection = `frame-${++connectionSequence}`;
    documentId = undefined;
    failed = false;
    onStatus({ phase: 'loading' });
    awaitResponse();
    send({
      channel: PREVIEW_CHANNEL,
      version: PREVIEW_VERSION,
      type: 'connect',
      connection,
    });
  }

  function receive(event: MessageEvent<unknown>) {
    if (
      disposed ||
      failed ||
      event.source !== frame.contentWindow ||
      event.origin !== origin ||
      !isPreviewMessage(event.data)
    )
      return;
    const message = event.data;
    if (message.connection !== connection) return;
    if (message.type === 'ready') {
      if (documentId) return;
      documentId = message.documentId;
      clearTimeout(timer);
      applyLatest();
      return;
    }
    if (message.type === 'unloading' && message.documentId === documentId) {
      connection = `frame-${++connectionSequence}`;
      documentId = undefined;
      onStatus({ phase: 'loading' });
      awaitResponse();
      return;
    }
    if (
      message.documentId !== documentId ||
      message.revision !== latest?.revision
    )
      return;
    if (message.type === 'exit') {
      onExit();
      return;
    }
    clearTimeout(timer);
    failed = message.type === 'error';
    onStatus({
      phase: failed ? 'error' : 'applied',
      revision: message.revision,
    });
  }

  host.addEventListener('message', receive);
  frame.addEventListener('load', start);
  start();
  return {
    update(result: PreviewResult) {
      if (disposed || (latest && result.revision <= latest.revision)) return;
      latest = result;
      applyLatest();
    },
    dispose() {
      disposed = true;
      clearTimeout(timer);
      host.removeEventListener('message', receive);
      frame.removeEventListener('load', start);
    },
  };
}
