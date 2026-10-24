import { useEffect, useRef, useState } from 'react';

import { Button } from '@nxds/react';

import './live-comparison.css';

function LibraryFrame({ stack, addition, appearance, interactive, example }) {
  const frame = useRef(null);
  const [initialMode] = useState(appearance.mode);
  useEffect(() => {
    function sendAppearance() {
      frame.current?.contentWindow?.postMessage(
        {
          channel: 'nexus-coexistence-v1',
          type: 'appearance',
          appearance,
          interactive,
        },
        window.location.origin
      );
    }
    function receive(event) {
      if (
        event.source === frame.current?.contentWindow &&
        event.origin === window.location.origin &&
        event.data?.channel === 'nexus-coexistence-v1' &&
        event.data.type === 'ready'
      )
        sendAppearance();
    }
    window.addEventListener('message', receive);
    sendAppearance();
    return () => window.removeEventListener('message', receive);
  }, [appearance, interactive]);
  return (
    <iframe
      ref={frame}
      className="library-comparison-frame"
      title={`${stack} ${addition ? 'with Nexus additions' : 'without Nexus'}`}
      src={`./comparison-preview.html?library=${encodeURIComponent(stack)}&addition=${addition}&mode=${initialMode}&example=${example}`}
      inert={!interactive}
    />
  );
}

export function LiveComparisonChapter({
  stack,
  appearance,
  nexusAppearance = appearance,
  split,
  onSplitChange,
  children,
  example = 'workspace',
}) {
  const comparing = split > 0 && split < 100;
  return (
    <div
      className="live-comparison"
      style={{ '--comparison-split': `${split}%` }}
    >
      <div className="live-comparison-tools">
        <Button
          size="sm"
          variant={split === 100 ? 'secondary' : 'ghost'}
          onClick={() => onSplitChange(100)}
          aria-pressed={split === 100}
        >
          {stack}
        </Button>
        <label className="live-comparison-slider">
          <span>Drag to compare</span>
          <input
            type="range"
            min="0"
            max="100"
            value={split}
            onChange={(event) => onSplitChange(Number(event.target.value))}
            aria-label={`Compare ${stack} with Nexus`}
            aria-valuetext={`${100 - split}% with Nexus revealed`}
          />
        </label>
        <Button
          size="sm"
          variant={split === 0 ? 'secondary' : 'ghost'}
          onClick={() => onSplitChange(0)}
          aria-pressed={split === 0}
        >
          {stack} + Nexus
        </Button>
      </div>
      {children}
      <div className="live-comparison-stage" data-comparing={comparing}>
        <div className="live-comparison-layer">
          <LibraryFrame
            key={`${stack}-${example}-before`}
            stack={stack}
            appearance={appearance}
            addition={false}
            interactive={split === 100}
            example={example}
          />
        </div>
        <div className="live-comparison-layer live-comparison-after">
          <LibraryFrame
            key={`${stack}-${example}-after`}
            stack={stack}
            appearance={nexusAppearance}
            addition
            interactive={split === 0}
            example={example}
          />
        </div>
        {comparing && (
          <div className="live-comparison-line" aria-hidden="true">
            <span>↔</span>
          </div>
        )}
      </div>
      <p className="live-comparison-note">
        {comparing
          ? example === 'reference'
            ? 'Same app. New Nexus capabilities. Reveal either side to try it.'
            : 'Same app. Nexus adds an invite flow. Select either side above to try it.'
          : split === 0
            ? example === 'reference'
              ? 'Change Nexus appearance. The existing library keeps its own styles. All actions stay in this preview.'
              : 'Try inviting a teammate. The new row appears in the existing library’s table.'
            : 'The original library’s components, styles, and interactions.'}
      </p>
    </div>
  );
}
