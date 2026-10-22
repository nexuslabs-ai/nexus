'use client';
import { useState } from 'react';

import { Button } from '@nxds/react';
import { useNxdsAppearance } from '@nxds/react/appearance';

import { CoexistenceVisualCode } from './CoexistenceVisualCode';

import './coexistence-visuals.css';
export default function CoexistenceVisuals({ iteration = 'code' }) {
  const { resolvedMode } = useNxdsAppearance();
  const [library, setLibrary] = useState('MUI');
  const example = iteration === 'command' ? 'command' : 'invite';
  const source = `/coexistence-preview/index.html?library=${encodeURIComponent(library)}&mode=${resolvedMode}&example=${example}`;
  return (
    <div className="coexist-visual">
      <div
        className="coexist-demo-controls"
        role="group"
        aria-label="Existing UI library"
      >
        {['MUI', 'Ant Design', 'shadcn/ui'].map((name) => (
          <Button
            key={name}
            variant={library === name ? 'default' : 'outline'}
            aria-pressed={library === name}
            onClick={() => setLibrary(name)}
          >
            {name}
          </Button>
        ))}
      </div>
      <div className="coexist-connected-card">
        <div className="coexist-comparison">
          <CoexistenceVisualCode
            library={library}
            mode={resolvedMode}
            example={example}
          />
          <iframe
            loading="lazy"
            className="coexist-preview-frame"
            src={source}
            title={`${library} with Nexus ${example} preview`}
          />
        </div>
      </div>
    </div>
  );
}
