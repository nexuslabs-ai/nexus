'use client';

import { ScrollHeadlineJourney, smoothStep } from './ScrollHeadlineJourney';
import { StackedTileGroup } from './StackedHeadlineJourney';

import './tile-shuffle-journey.css';

export function TileShuffleJourney(props) {
  return <ScrollHeadlineJourney {...props} Panel={TileShufflePanel} />;
}

function TileShufflePanel({ group, index, progress, slide, tuning }) {
  const enter = index === 0 ? 1 : smoothStep((progress - index / 3) / 0.07);
  const leave =
    index === 2 ? 0 : smoothStep((progress - (index + 1) / 3 + 0.09) / 0.09);
  const tileStyles = group.tiles.map((_, tileIndex) => {
    // Keep the whole stagger short regardless of the number of tiles.
    const stagger = (tileIndex / Math.max(1, group.tiles.length - 1)) * 0.025;
    const arrive =
      index === 0
        ? 1
        : smoothStep((progress - index / 3 - 0.015 - stagger) / 0.065);
    const depart =
      index === 2
        ? 0
        : smoothStep((progress - (index + 1) / 3 + 0.09 - stagger) / 0.065);
    const restingAngle = [-6, 5, -3][tileIndex % 3];
    return {
      opacity: arrive * (1 - depart),
      translate: `0 ${(1 - arrive) * 12 - depart * 10}px`,
      rotate: `${restingAngle * arrive * (1 - depart)}deg`,
      scale: 0.96 + 0.04 * arrive * (1 - depart),
    };
  });
  return (
    <div
      className="scroll-headline-panel tile-shuffle-panel"
      inert={index !== slide}
      aria-hidden={index !== slide}
    >
      <StackedTileGroup
        {...group}
        tuning={tuning}
        tileStyles={tileStyles}
        headingStyle={{
          opacity: enter * (1 - leave),
          transform: `translateY(${(1 - enter - leave) * 10}px)`,
        }}
      />
    </div>
  );
}
