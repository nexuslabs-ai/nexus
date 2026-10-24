'use client';

import { ScrollHeadlineJourney } from './ScrollHeadlineJourney';
import { groups, StackedTileGroup } from './StackedHeadlineJourney';
import { TiltedCtaJourney } from './TiltedCtaJourney';

import './miniature-headline-journey.css';

function ButtonComposition(props) {
  return (
    <span {...props} className="component-composition composition-button">
      <span className="composition-pill">
        <span>Save</span>
      </span>
      <svg
        className="composition-cursor"
        viewBox="0 0 12 16"
        fill="currentColor"
      >
        <path d="M1 1v12l3-3 3 5 2-1-3-5h5Z" />
      </svg>
    </span>
  );
}

function DialogComposition(props) {
  return (
    <span {...props} className="component-composition composition-dialog">
      <span className="composition-panel">
        <span className="composition-title">Project</span>
        <span className="composition-close">×</span>
        <span className="composition-line" />
        <span className="composition-line composition-short" />
        <span className="composition-action" />
      </span>
    </span>
  );
}

function SelectComposition(props) {
  return (
    <span {...props} className="component-composition composition-select">
      <span className="composition-field">
        <span />⌄
      </span>
      <span className="composition-menu">
        <span className="composition-option">
          <span />✓
        </span>
        <span className="composition-option">
          <span />
        </span>
      </span>
    </span>
  );
}

const componentTiles = [
  ['Button', ButtonComposition],
  ['Dialog', DialogComposition],
  ['Select', SelectComposition],
];

function ComponentExamples() {
  return (
    <div className="source-composition-group">
      <StackedTileGroup
        title="Make each component yours."
        tiles={componentTiles}
        tuning={{ autoTour: false }}
      />
      <p className="source-ownership-line">
        Copy the source. Change it in your project.
      </p>
    </div>
  );
}

const miniatureGroups = [
  groups[0],
  { ...groups[1], title: 'Build on what you use.' },
  { title: 'Make each component yours.', content: <ComponentExamples /> },
];

export function MiniatureHeadlineJourney({ children, ...props }) {
  const staticContent = (
    <div
      className="rotating-headline-journey stacked-headline-journey"
      data-slide="0"
    >
      <TiltedCtaJourney
        {...props}
        details={[]}
        customizationHeading={
          <div className="stacked-headline-lines">
            {miniatureGroups.map((group) =>
              group.content ? (
                <ComponentExamples key={group.title} />
              ) : (
                <StackedTileGroup
                  key={group.title}
                  {...group}
                  tuning={{ ...props.tuning, autoTour: false }}
                />
              )
            )}
          </div>
        }
      />
    </div>
  );
  return (
    <ScrollHeadlineJourney
      {...props}
      contentGroups={miniatureGroups}
      staticContent={staticContent}
    >
      {children}
    </ScrollHeadlineJourney>
  );
}
