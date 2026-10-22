'use client';

import { useEffect, useState } from 'react';

import { useNxdsAppearance } from '@nxds/react/appearance';
import { IconBrandGit, IconCopy, IconPencilCode } from '@tabler/icons-react';

import {
  AntDesignLogo,
  BootstrapLogo,
  HeroUiLogo,
  MuiLogo,
  ShadcnLogo,
} from './EcosystemLogos';
import { TiltedCtaJourney } from './TiltedCtaJourney';

import './rotating-headline-journey.css';

export const lines = [
  'Customizable in every detail.',
  'Works with your existing app.',
  'Yours to copy. Yours to change.',
];

export const tileSets = [
  undefined,
  [
    ['MUI', MuiLogo],
    ['Ant Design', AntDesignLogo],
    ['shadcn/ui', ShadcnLogo],
    ['HeroUI', HeroUiLogo],
    ['Bootstrap', BootstrapLogo],
  ],
  [
    ['Copy source', IconCopy],
    ['Make it yours', IconPencilCode],
    ['Own the changes', IconBrandGit],
  ],
];

export function RotatingHeadlineJourney(props) {
  const { state } = useNxdsAppearance();
  const [paused, setPaused] = useState(false);
  const [slide, setSlide] = useState(0);
  const stopped =
    state.prefs.reduceMotion || paused || props.tuning?.autoTour === false;
  useEffect(() => {
    if (stopped) return;
    const timer = setInterval(
      () => setSlide((current) => (current + 1) % lines.length),
      3400
    );
    return () => clearInterval(timer);
  }, [stopped]);
  return (
    <div className="rotating-headline-journey" data-slide={slide}>
      <TiltedCtaJourney
        {...props}
        details={tileSets[slide]}
        detailsLabel={lines[slide]}
        customizationHeading={
          <div className="rotating-headline" data-paused={stopped}>
            <div className="rotating-headline-lines" aria-hidden="true">
              {lines.map((line) => (
                <p
                  key={line}
                  className="journey-heading rotating-headline-reserve"
                >
                  {line}
                </p>
              ))}
              <p key={slide} className="journey-heading rotating-headline-line">
                {lines[slide]}
              </p>
            </div>
            <button
              className="rotating-headline-toggle"
              type="button"
              aria-label={
                paused
                  ? 'Resume headline animation'
                  : 'Pause headline animation'
              }
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
            </button>
          </div>
        }
      />
    </div>
  );
}
