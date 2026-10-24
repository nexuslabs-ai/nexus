import { IconArrowsHorizontal } from '@tabler/icons-react';

import { PlaceholderGrid } from './PlaceholderGrid';

export function ComparisonChapter({ stack, settings, split, onSplitChange }) {
  return (
    <div
      className="story-comparison"
      style={{ '--comparison-split': `${split}%` }}
    >
      <PlaceholderGrid
        layout={settings.layout}
        treatment="Outline"
        className="comparison-before"
      />
      <div className="comparison-after">
        <PlaceholderGrid
          layout={settings.layout}
          treatment={settings.treatment}
        />
      </div>
      <div className="comparison-labels" aria-hidden="true">
        <span>{stack}</span>
        <span>{stack} + Nexus</span>
      </div>
      <div className="comparison-divider" aria-hidden="true">
        <span>
          <IconArrowsHorizontal size={18} />
        </span>
      </div>
      <input
        className="comparison-range"
        type="range"
        min="0"
        max="100"
        step="1"
        value={split}
        onChange={(event) => onSplitChange(Number(event.target.value))}
        aria-label={`Compare ${stack} with Nexus`}
        aria-valuetext={`${100 - split}% Nexus revealed`}
      />
      <span className="comparison-caption">
        Layout preview · Drag to compare
      </span>
    </div>
  );
}
