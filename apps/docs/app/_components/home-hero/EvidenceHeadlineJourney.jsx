'use client';

import { useState } from 'react';

import { Button } from '@nxds/react';

import { ScrollHeadlineJourney } from './ScrollHeadlineJourney';
import { groups, StackedTileGroup } from './StackedHeadlineJourney';
import { TiltedCtaJourney } from './TiltedCtaJourney';

import './evidence-headline-journey.css';

const source = `export function StatusLabel({ children }) {
  return (
    <span className="nx:rounded-full nx:bg-success-subtle
      nx:px-3 nx:py-1 nx:text-success-subtle-foreground">
      {children}
    </span>
  );
}`;

function StatusLabel({ children }) {
  return (
    <span className="nx:rounded-full nx:bg-success-subtle nx:px-3 nx:py-1 nx:text-success-subtle-foreground">
      {children}
    </span>
  );
}

function CoexistenceExample() {
  const [saved, setSaved] = useState(false);
  const [invited, setInvited] = useState(false);
  return (
    <div className="stacked-headline-group evidence-group">
      <p className="journey-heading">Keep what you’ve built.</p>
      <div className="evidence-app">
        <div className="evidence-app-bar">
          <span className="evidence-avatar">a</span>
          <strong>Acme workspace</strong>
          <span className="evidence-origin">Your app</span>
        </div>
        <div className="evidence-app-body">
          <div className="evidence-existing">
            <span className="evidence-eyebrow">Workspace settings</span>
            <label>
              Workspace name
              <input
                defaultValue="Design team"
                onChange={() => setSaved(false)}
              />
            </label>
            <button
              type="button"
              className="evidence-save"
              onClick={() => setSaved(true)}
            >
              {saved ? 'Saved' : 'Save changes'}
            </button>
          </div>
          <div className="evidence-added">
            <span className="evidence-eyebrow">Added with Nexus</span>
            <strong>Make room for the team.</strong>
            <p>One new component. The same workspace.</p>
            <Button
              size="sm"
              onClick={() => setInvited(true)}
              disabled={invited}
            >
              {invited ? 'Invitation sent' : 'Invite teammate'}
            </Button>
            <span className="evidence-note" role="status">
              {invited
                ? 'Demo only — no invitation was sent.'
                : 'Try it in this preview.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceExample() {
  return (
    <div className="stacked-headline-group evidence-group">
      <p className="journey-heading">Start with source.</p>
      <div className="evidence-code">
        <div className="evidence-code-bar">
          <span>StatusLabel.jsx</span>
          <span>In your project</span>
        </div>
        <pre aria-label="StatusLabel component source">
          <code>{source}</code>
        </pre>
        <div className="evidence-result">
          <span>Result</span>
          <StatusLabel>Ready to ship</StatusLabel>
        </div>
      </div>
    </div>
  );
}

export function EvidenceHeadlineJourney({ children, ...props }) {
  const contentGroups = [
    groups[0],
    { title: 'Keep what you’ve built.', content: <CoexistenceExample /> },
    { title: 'Start with source.', content: <SourceExample /> },
  ];
  const staticContent = (
    <TiltedCtaJourney
      {...props}
      details={[]}
      customizationHeading={
        <div className="evidence-static">
          <StackedTileGroup
            {...groups[0]}
            tuning={{ ...props.tuning, autoTour: false }}
          />
          <CoexistenceExample />
          <SourceExample />
        </div>
      }
    />
  );
  return (
    <div className="evidence-headline-journey">
      <ScrollHeadlineJourney
        {...props}
        contentGroups={contentGroups}
        staticContent={staticContent}
      >
        {children}
      </ScrollHeadlineJourney>
    </div>
  );
}
