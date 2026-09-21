'use client';

import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import type { NexusAppearanceState } from '@nexus_ds/core';

import type { ComponentId } from '../gallery';

import { PREVIEW_DEFAULT_STATE } from './accepted-result';
import { PreviewAppearanceContext } from './appearance-context';
import { applyPreviewAppearance } from './apply-appearance';
import { PreviewScene } from './preview-scene';
import {
  isHostMessage,
  PREVIEW_CHANNEL,
  PREVIEW_VERSION,
  type PreviewMessage,
} from './protocol';

export function PreviewClient() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const documentId = `${Date.now()}-${Math.random()}`;
    let connection = '';
    let revision = 0;
    let failed = false;
    function send(
      message:
        | { type: 'ready' }
        | { type: 'inspect'; revision: number; component: ComponentId }
        | {
            type: 'appearance-change';
            revision: number;
            state: NexusAppearanceState;
          }
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
    const root = createRoot(element, { onUncaughtError: fail });
    function unload() {
      if (revision > 0) send({ type: 'unloading', revision });
    }
    function exit() {
      send({ type: 'exit', revision });
    }
    function receive(event: MessageEvent<unknown>) {
      if (
        window.parent === window ||
        event.source !== window.parent ||
        event.origin !== location.origin ||
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
            <PreviewAppearanceContext.Provider
              value={{
                state: message.state ?? PREVIEW_DEFAULT_STATE,
                onChange: (state) =>
                  send({ type: 'appearance-change', revision, state }),
              }}
            >
              <PreviewScene
                onApplied={() => {
                  if (!failed && revision === message.revision) {
                    if (element) element.dataset.revision = String(revision);
                    send({ type: 'applied', revision });
                  }
                }}
                scene={message.scene}
                onInspect={(component) =>
                  send({ type: 'inspect', revision, component })
                }
                onExit={exit}
              />
            </PreviewAppearanceContext.Provider>
          )
        );
        if (failed) return;
      } catch {
        fail();
      }
    }
    window.addEventListener('message', receive);
    window.addEventListener('pagehide', unload);
    return () => {
      window.removeEventListener('message', receive);
      window.removeEventListener('pagehide', unload);
      root.unmount();
    };
  }, []);
  return <div ref={container} id="preview-root" />;
}
