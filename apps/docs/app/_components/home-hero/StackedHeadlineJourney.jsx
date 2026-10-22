'use client';

import { useEffect, useState } from 'react';

import { useNxdsAppearance } from '@nxds/react/appearance';
import {
  IconAsterisk,
  IconBorderAll,
  IconBorderRadius,
  IconBrandGit,
  IconClock,
  IconColorSwatch,
  IconComponents,
  IconCopy,
  IconLayersIntersect,
  IconPaint,
  IconPencilCode,
  IconShadow,
  IconSpacingHorizontal,
  IconTypography,
  IconWaveSine,
} from '@tabler/icons-react';

import {
  AntDesignLogo,
  BootstrapLogo,
  HeroUiLogo,
  MuiLogo,
  ShadcnLogo,
} from './EcosystemLogos';
import { TiltedCtaJourney } from './TiltedCtaJourney';

import './rotating-headline-journey.css';
import './stacked-headline-journey.css';

export const groups = [
  {
    title: 'Customizable in every detail.',
    tiles: [
      ['Theme', IconPaint],
      ['Colors', IconColorSwatch],
      ['Typography', IconTypography],
      ['Spacing', IconSpacingHorizontal],
      ['Radius', IconBorderRadius],
      ['Borders', IconBorderAll],
      ['Shadows', IconShadow],
      ['Components', IconComponents],
      ['Icons', IconAsterisk],
      ['Motion', IconWaveSine],
      ['Duration', IconClock],
      ['Z-index', IconLayersIntersect],
    ],
  },
  {
    title: 'Works with your existing app.',
    tiles: [
      ['MUI', MuiLogo],
      ['Ant Design', AntDesignLogo],
      ['shadcn/ui', ShadcnLogo],
      ['HeroUI', HeroUiLogo],
      ['Bootstrap', BootstrapLogo],
    ],
  },
  {
    title: 'Yours to copy. Yours to change.',
    tiles: [
      ['Copy source', IconCopy],
      ['Make it yours', IconPencilCode],
      ['Own the changes', IconBrandGit],
    ],
  },
];

export function StackedTileGroup({
  title,
  tiles,
  tuning,
  headingStyle,
  tileStyles,
}) {
  const { state } = useNxdsAppearance();
  const [step, setStep] = useState(-1);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const active =
    focused ?? hovered ?? (tuning?.autoTour === false ? null : step);
  useEffect(() => {
    if (
      state.prefs.reduceMotion ||
      tuning?.autoTour === false ||
      hovered !== null ||
      focused !== null
    )
      return;
    const timer = setTimeout(
      () => setStep((value) => (value + 1) % tiles.length),
      tuning?.holdMs ?? 1300
    );
    return () => clearTimeout(timer);
  }, [
    step,
    hovered,
    focused,
    tuning?.autoTour,
    tuning?.holdMs,
    state.prefs.reduceMotion,
    tiles.length,
  ]);
  return (
    <div className="stacked-headline-group">
      <p className="journey-heading" style={headingStyle}>
        {title}
      </p>
      <div className="stacked-headline-tiles" role="group" aria-label={title}>
        {tiles.map(([label, Icon], index) => (
          <button
            key={label}
            type="button"
            className={`journey-tile journey-color-${index} stacked-headline-tile`}
            aria-label={label}
            data-active={active === index}
            style={tileStyles?.[index]}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
          >
            <Icon aria-hidden="true" />
            <span
              className="journey-label stacked-tile-label"
              aria-hidden="true"
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StackedHeadlineJourney(props) {
  return (
    <div
      className="rotating-headline-journey stacked-headline-journey"
      data-slide="0"
    >
      <TiltedCtaJourney
        {...props}
        details={[]}
        customizationHeading={
          <div className="stacked-headline-lines">
            {groups.map((group) => (
              <StackedTileGroup
                key={group.title}
                {...group}
                tuning={{ ...props.tuning, autoTour: false }}
              />
            ))}
          </div>
        }
      />
    </div>
  );
}
