import { useState } from 'react';

import { Button } from '@nxds/react';

import { CodeBlock } from '../CodeBlock';
import { CopyAnnouncerProvider } from '../CopyAnnouncer';

import highlighted from './coexistence-highlighted.json';
import { integrationSamples } from './coexistence-samples.mjs';

import './coexistence-code.css';

export function HighlightedLines({ sample, additions = [] }) {
  return (
    <code>
      {highlighted[sample].map((tokens, index) => (
        <span
          className="coexist-docs-line"
          data-added={additions.includes(index) || undefined}
          data-line={index + 1}
          key={index}
        >
          {tokens.map(({ content, color }, tokenIndex) => (
            <span style={{ color }} key={tokenIndex}>
              {content}
            </span>
          ))}
          {index < highlighted[sample].length - 1 ? '\n' : ''}
        </span>
      ))}
    </code>
  );
}

export function CoexistenceVisualCode({ library, mode, example = 'invite' }) {
  const [view, setView] = useState('component');
  const sample = `${library}:${view === 'component' ? (example === 'command' ? 'command' : view) : example === 'command' ? `command-appearance:${mode}` : `appearance:${mode}`}`;
  const additions =
    view === 'component'
      ? integrationSamples[sample]
          .split('\n')
          .flatMap((line, index) =>
            line.includes("from '@/components/nexus-kit'") ||
            line.includes('<Command') ||
            line.includes('</Command') ||
            line.includes('setOpen') ||
            line.includes('<Button') ||
            line.includes('Send invitation') ||
            line.includes('</Button>')
              ? [index]
              : []
          )
      : [];
  return (
    <CopyAnnouncerProvider>
      <div className="coexist-integration">
        <div
          className="coexist-demo-controls coexist-code-tabs"
          role="group"
          aria-label="Code example"
        >
          {['component', 'appearance'].map((value) => (
            <Button
              key={value}
              size="sm"
              variant={view === value ? 'secondary' : 'ghost'}
              aria-pressed={view === value}
              onClick={() => setView(value)}
            >
              {value === 'component' ? 'Component' : 'Appearance'}
            </Button>
          ))}
        </div>
        <div className="coexist-docs-frame">
          <CodeBlock
            className="coexist-github-code"
            framed
            aria-label={`${library} visual integration code`}
          >
            <HighlightedLines sample={sample} additions={additions} />
          </CodeBlock>
        </div>
      </div>
    </CopyAnnouncerProvider>
  );
}
