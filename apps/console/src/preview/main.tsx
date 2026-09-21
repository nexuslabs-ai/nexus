import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { applyPreviewAppearance } from './apply-appearance';
import { PreviewScene } from './preview-scene';
import {
  isHostMessage,
  PREVIEW_CHANNEL,
  PREVIEW_VERSION,
  type PreviewMessage,
} from './protocol';

import '../App.css';

const container = document.getElementById('preview-root');
if (!container) throw new Error('Preview root not found');

const documentId = `${Date.now()}-${Math.random()}`;
let connection = '';
let revision = 0;
let failed = false;

function send(
  message:
    | { type: 'ready' }
    | { type: 'applied' | 'error' | 'exit' | 'unloading'; revision: number }
) {
  if (window.parent === window || !connection) return;
  const envelope: PreviewMessage = {
    channel: PREVIEW_CHANNEL,
    version: PREVIEW_VERSION,
    connection,
    documentId,
    ...message,
  };
  window.parent.postMessage(envelope, window.location.origin);
}

function fail() {
  failed = true;
  if (revision > 0) send({ type: 'error', revision });
}

const root = createRoot(container, { onUncaughtError: fail });
root.render(
  <p role="status" className="nx:p-6 nx:text-muted-foreground">
    Waiting for a theme from Nexus Console.
  </p>
);

window.addEventListener('pagehide', () => {
  if (revision > 0) send({ type: 'unloading', revision });
});

function exitPreview() {
  send({ type: 'exit', revision });
}

window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (
    window.parent === window ||
    event.source !== window.parent ||
    event.origin !== window.location.origin ||
    !isHostMessage(event.data)
  )
    return;
  const message = event.data;
  if (message.type === 'connect') {
    connection = message.connection;
    send({ type: 'ready' });
    return;
  }
  if (
    message.connection !== connection ||
    message.documentId !== documentId ||
    message.revision < revision
  )
    return;
  revision = message.revision;
  if (failed) {
    send({ type: 'error', revision });
    return;
  }
  try {
    applyPreviewAppearance(document, message.appearance);
    flushSync(() =>
      root.render(
        <PreviewScene
          mode={message.appearance.colorScheme}
          onExit={exitPreview}
        />
      )
    );
    if (failed) return;
    container.dataset.revision = String(revision);
    send({ type: 'applied', revision });
  } catch {
    fail();
  }
});
