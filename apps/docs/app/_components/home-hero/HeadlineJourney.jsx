'use client';

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
              An open-source design system. Customizable in every detail.
              {showTools && ' Built to work with your favorite tools.'}
            </h1>
            <p className="journey-title journey-enter" aria-hidden="true">
              An open-source design system.
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
