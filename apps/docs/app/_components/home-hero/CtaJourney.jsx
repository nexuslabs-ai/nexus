'use client';

import { Button } from '@nxds/react';

import { WorkbenchJourney } from './WorkbenchJourney';

import './cta-journey.css';

export function CtaJourney({
  mode,
  tuning,
  children,
  componentsHref = '/components',
  playgroundHref = '/create',
}) {
  return (
    <div className="cta-journey" data-mode={mode}>
      <header className="cta-journey-intro">
        <h1 className="journey-title journey-enter">
          An open-source design system.<span>Ready for your next idea.</span>
        </h1>
        <div
          className="cta-journey-actions journey-enter"
          style={{ '--arrival': '200ms' }}
        >
          <Button asChild>
            <a href={componentsHref}>Browse Components</a>
          </Button>
          <Button asChild variant="outline">
            <a href={playgroundHref}>Playground</a>
          </Button>
        </div>
      </header>
      <WorkbenchJourney
        mode={mode}
        compact
        tuning={tuning}
        intro={null}
        buildHeading={
          <h2
            className="journey-heading journey-enter"
            style={{ '--arrival': '2350ms' }}
          >
            Simply works with your favorite tools
          </h2>
        }
      >
        {children}
      </WorkbenchJourney>
    </div>
  );
}
