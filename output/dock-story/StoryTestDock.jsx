import { ContextDock } from './ContextDock';
import { ContinuousDock } from './ContinuousDock';
import { tabIcons } from './dock-icons';
import {
  ActiveLabelDock,
  MarkupPortraitDock,
  TactileDock,
} from './GrowingDock';
import { MorphingDock } from './MorphingDock';
import { StraightDock } from './StraightDock';

const docks = {
  'straight-bare': StraightDock,
  'straight-roomy': StraightDock,
  straight: StraightDock,
  continuous: ContinuousDock,
  'pill-morph': MorphingDock,
  'markup-portrait': MarkupPortraitDock,
  tactile: TactileDock,
  'active-label': ActiveLabelDock,
  contextual: ContextDock,
};

export function StoryTestDock({ iteration, children, ...props }) {
  if (iteration === 'colored')
    return <SegmentedStoryDock {...props}>{children}</SegmentedStoryDock>;
  const Dock = docks[iteration] || StraightDock;
  const className =
    iteration === 'straight-bare'
      ? 'roomy-dock bare-dock'
      : iteration === 'straight-roomy'
        ? 'roomy-dock'
        : '';
  return (
    <Dock {...props} className={className} hasControls>
      {children}
    </Dock>
  );
}

function SegmentedStoryDock({ tabs, selected, onSelect, children, theme }) {
  function navigate(event) {
    let next = selected;
    if (event.key === 'ArrowRight') next = (selected + 1) % tabs.length;
    else if (event.key === 'ArrowLeft')
      next = (selected + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    onSelect(next);
    event.currentTarget.querySelectorAll('[role="tab"]')[next].focus();
  }
  return (
    <div className="story-test-segmented-dock">
      <details className="story-test-options dialkit-root" data-theme={theme}>
        <summary>Example options</summary>
        <div className="story-test-option-fields">{children}</div>
      </details>
      <div
        className="story-segmented"
        role="tablist"
        tabIndex={-1}
        aria-label="Story examples"
        onKeyDown={navigate}
      >
        {tabs.map((tab, index) => {
          const Icon = tabIcons[tab];
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`story-tab-tests-${index}`}
              aria-selected={selected === index}
              aria-controls="story-panel"
              tabIndex={selected === index ? 0 : -1}
              onClick={() => onSelect(index)}
            >
              <Icon size={21} stroke={1.7} aria-hidden="true" />
              <span className="story-tab-label">{tab}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
