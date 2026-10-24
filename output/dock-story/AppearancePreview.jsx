import { useEffect, useRef, useState } from 'react';

import { PREVIEW_CHANNEL } from './appearance-model';

import './component-gallery.css';

export function AppearancePreview({ appearance, view }) {
  const frame = useRef(null);
  const revision = useRef(0);
  const [ready, setReady] = useState(0);
  const [applied, setApplied] = useState(0);
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    function receive(event) {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== PREVIEW_CHANNEL
      )
        return;
      if (event.data.type === 'ready') setReady((value) => value + 1);
      if (
        event.data.type === 'applied' &&
        event.data.revision === revision.current
      )
        setApplied(event.data.revision);
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);

  useEffect(() => {
    function measure() {
      const style = getComputedStyle(frame.current);
      const next = {
        columns: style.gridTemplateColumns,
        rows: style.gridTemplateRows,
        gap: style.gap,
      };
      setGeometry((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next
      );
    }
    const observer = new ResizeObserver(measure);
    observer.observe(frame.current);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!geometry) return;
    revision.current += 1;
    frame.current.contentWindow.postMessage(
      {
        channel: PREVIEW_CHANNEL,
        type: 'update',
        revision: revision.current,
        appearance,
        view,
        geometry,
      },
      window.location.origin
    );
  }, [appearance, view, geometry, ready]);

  return (
    <iframe
      ref={frame}
      className={`story-box-grid appearance-preview-frame${view === 'Gallery' ? ' component-gallery-frame' : ''}`}
      title={`${view} · Nexus appearance preview`}
      src="./appearance-preview.html"
      data-appearance-applied={applied}
      onLoad={() => setReady((value) => value + 1)}
    />
  );
}
