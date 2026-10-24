'use client';

import { useEffect, useState } from 'react';

import { useNxdsAppearance } from '@nxds/react/appearance';
import {
  IconAsterisk,
  IconBorderAll,
  IconBorderRadius,
  IconBrandOpenai,
  IconColorSwatch,
  IconComponents,
  IconPaint,
  IconShadow,
  IconSpacingHorizontal,
  IconTypography,
} from '@tabler/icons-react';

import { ClaudeLogo, CursorLogo } from './BrandLogos';
import { toolColors, useJourneyColors } from './journey-colors';

import './inline-stacks-journey.css';

const categories = [
  ['Theme', IconPaint],
  ['Colors', IconColorSwatch],
  ['Typography', IconTypography],
  ['Spacing', IconSpacingHorizontal],
  ['Radius', IconBorderRadius],
  ['Borders', IconBorderAll],
  ['Shadows', IconShadow],
  ['Components', IconComponents],
  ['Icons', IconAsterisk],
];
function GrokMark() {
  return <span className="inline-stack-monogram">G</span>;
}

const tools = [
  ['Claude', ClaudeLogo],
  ['Grok', GrokMark],
  ['Cursor', CursorLogo],
  ['Codex', IconBrandOpenai],
];

function TileStack({
  items,
  colors,
  index,
  onAdvance,
  onPause,
  onResume,
  label,
}) {
  const current = index % items.length;
  const previous = (current + items.length - 1) % items.length;
  function card(itemIndex, className) {
    const [name, Icon] = items[itemIndex];
    return (
      <span
        className={`inline-stack-card ${className}`}
        style={colors[itemIndex]}
      >
        <Icon />
        <span className="inline-stack-label">{name}</span>
      </span>
    );
  }
  return (
    <button
      type="button"
      className="inline-stack"
      aria-label={`${label}: ${items[current][0]}. Show next`}
      onClick={onAdvance}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocus={onPause}
      onBlur={onResume}
    >
      <span key={index} className="inline-stack-deck" aria-hidden="true">
        {card((current + 1) % items.length, 'stack-middle')}
        {card(
          current,
          index > 0 ? 'stack-front stack-arriving' : 'stack-front'
        )}
        {index > 0 && card(previous, 'stack-departing')}
      </span>
    </button>
  );
}

export function InlineStacksJourney({ mode, tuning, children }) {
  const { state } = useNxdsAppearance();
  const reduceMotion = state.prefs.reduceMotion;
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [categoryOffset, setCategoryOffset] = useState(0);
  const [toolOffset, setToolOffset] = useState(0);
  const cycleLength = categories.length + tools.length;
  const cycle = Math.floor(step / cycleLength);
  const phase = step % cycleLength;
  const categoryIndex =
    cycle * categories.length +
    Math.min(phase, categories.length - 1) +
    categoryOffset;
  const toolIndex =
    cycle * tools.length + Math.max(0, phase - categories.length) + toolOffset;
  useEffect(() => {
    if (reduceMotion || paused || tuning?.autoTour === false) return;
    const timer = setTimeout(
      () => setStep((value) => value + 1),
      tuning?.holdMs ?? 1300
    );
    return () => clearTimeout(timer);
  }, [reduceMotion, step, paused, tuning?.autoTour, tuning?.holdMs]);
  function advanceCategory() {
    setCategoryOffset((value) => value + 1);
  }
  function advanceTool() {
    setToolOffset((value) => value + 1);
  }
  const palette = useJourneyColors();
  const toolPalette = tools.map(() => toolColors(mode));
  return (
    <>
      <section
        className="inline-stacks-journey"
        data-mode={mode}
        aria-label="Nexus Design System"
      >
        <h1 className="nx:sr-only">
          An open-source design system. Customizable in every detail. Built for
          your favorite tools.
        </h1>
        <div className="inline-headline">
          <p className="inline-headline-line" aria-hidden="true">
            An open-source design system.
          </p>
          <div className="inline-headline-line">
            <span aria-hidden="true">Customizable in every detail</span>
            <TileStack
              items={categories}
              colors={palette}
              index={categoryIndex}
              label="Customize"
              onAdvance={advanceCategory}
              onPause={() => setPaused(true)}
              onResume={() => setPaused(false)}
            />
          </div>
          <div className="inline-headline-line">
            <span aria-hidden="true">Built for your favorite tools</span>
            <TileStack
              items={tools}
              colors={toolPalette}
              index={toolIndex}
              label="Tools"
              onAdvance={advanceTool}
              onPause={() => setPaused(true)}
              onResume={() => setPaused(false)}
            />
          </div>
        </div>
      </section>
      <div className="inline-stacks-following">{children}</div>
    </>
  );
}
