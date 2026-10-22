'use client';

import { Badge } from '@nxds/react';

import { WorkbenchJourney } from './WorkbenchJourney';

import './headline-journey.css';

export function HeadlineJourney({
  mode,
  tuning,
  details,
  detailsLabel,
  children,
  afterTiles,
  showTools = true,
  customizationHeading = (
    <p className="journey-heading journey-enter" aria-hidden="true">
      Customizable in every detail.
    </p>
  ),
}) {
  return (
    <div className="headline-journey">
      <WorkbenchJourney
        mode={mode}
        compact
        tuning={tuning}
        details={details}
        detailsLabel={detailsLabel}
        afterTiles={afterTiles}
        showTools={showTools}
        intro={
          <>
            <h1 className="nx:sr-only">
              Nexus design system. Open source. Customizable in every detail.
              {showTools && ' Built to work with your favorite tools.'}
            </h1>
            <Badge
              className="headline-open-source"
              variant="secondary"
              fill="outline"
              isCaps={false}
            >
              Open Source
            </Badge>
            <p className="journey-title journey-enter" aria-hidden="true">
              Nexus design system.
            </p>
          </>
        }
        customizationHeading={customizationHeading}
        buildHeading={
          <p
            className="journey-heading journey-enter"
            aria-hidden="true"
            style={{ '--arrival': '2350ms' }}
          >
            Built to work with your favorite tools.
          </p>
        }
      >
        {children}
      </WorkbenchJourney>
    </div>
  );
}
