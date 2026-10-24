import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { sanitizeNxdsAppearance } from '@nxds/core';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';

import { initialPreviewAppearance, PREVIEW_CHANNEL } from './appearance-model';
import { ComponentBoard } from './ComponentBoard';
import { ComponentGallery } from './ComponentGallery';
import { LabeledComponentBoard } from './LabeledComponentBoard';
import { ShowcaseGrid } from './ShowcaseGrid';

import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import './page.css';
import './dock-chapter-journey.css';
import './source-audit.css';
import './appearance-preview.css';

function Preview() {
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    let lastRevision = 0;
    function receive(event) {
      const data = event.data;
      if (
        event.source !== window.parent ||
        event.origin !== window.location.origin ||
        data?.channel !== PREVIEW_CHANNEL ||
        data.type !== 'update' ||
        !Number.isInteger(data.revision) ||
        data.revision <= lastRevision
      )
        return;
      if (
        ![
          'Board',
          'LabeledBoard',
          'Gallery',
          'Components',
          'Dashboard',
          'Mail',
          'Chat',
          'Finances',
          'CRM',
        ].includes(data.view) ||
        !data.geometry
      )
        return;
      lastRevision = data.revision;
      setPreview({
        ...data,
        appearance: sanitizeNxdsAppearance(data.appearance),
      });
    }
    window.addEventListener('message', receive);
    window.parent.postMessage(
      { channel: PREVIEW_CHANNEL, type: 'ready' },
      window.location.origin
    );
    return () => window.removeEventListener('message', receive);
  }, []);

  useEffect(() => {
    if (!preview) return;
    // Acknowledge after the provider's document styles and attributes paint.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        window.parent.postMessage(
          {
            channel: PREVIEW_CHANNEL,
            type: 'applied',
            revision: preview.revision,
          },
          window.location.origin
        );
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [preview]);

  return (
    <NxdsAppearanceProvider
      state={preview?.appearance ?? initialPreviewAppearance()}
      storageKey={false}
      cookieWriteKey={false}
    >
      {preview && (
        <div
          className="appearance-preview story-page nx:typography-body-default"
          style={{
            '--preview-columns': preview.geometry.columns,
            '--preview-rows': preview.geometry.rows,
            '--preview-gap': preview.geometry.gap,
          }}
        >
          {preview.view === 'Board' ? (
            <ComponentBoard />
          ) : preview.view === 'LabeledBoard' ? (
            <LabeledComponentBoard />
          ) : preview.view === 'Gallery' ? (
            <ComponentGallery />
          ) : (
            <ShowcaseGrid
              view={preview.view}
              settings={{ layout: 'Sidebar', treatment: 'Outline' }}
            />
          )}
        </div>
      )}
    </NxdsAppearanceProvider>
  );
}

createRoot(document.getElementById('root')).render(<Preview />);
