'use client';

import { Button } from '@nxds/react';

import { TiltedJourney } from './TiltedJourney';

import './tilted-cta-journey.css';

export function TiltedCtaJourney({
  componentsHref = '/components',
  createHref = '/create',
  ...props
}) {
  return (
    <div className="tilted-cta-journey">
      <TiltedJourney
        {...props}
        showTools={false}
        afterTiles={
          <div className="tilted-cta-actions">
            <Button asChild>
              <a href={createHref}>Get started</a>
            </Button>
            <Button asChild variant="outline">
              <a href={componentsHref}>View components</a>
            </Button>
          </div>
        }
      />
    </div>
  );
}
