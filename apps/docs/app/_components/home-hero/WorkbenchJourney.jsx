'use client';

import { useEffect, useState } from 'react';

import { useNxdsAppearance } from '@nxds/react/appearance';
import {
  IconAsterisk,
  IconBorderAll,
  IconBorderRadius,
  IconBrandOpenai,
  IconClock,
  IconColorSwatch,
  IconComponents,
  IconLayersIntersect,
  IconPaint,
  IconShadow,
  IconSpacingHorizontal,
  IconTypography,
  IconWaveSine,
} from '@tabler/icons-react';

import { ClaudeLogo, CursorLogo } from './BrandLogos';
import { toolColors, useJourneyColors } from './journey-colors';
import { TileWheel } from './TileWheel';

import './workbench-journey.css';

const defaultDetails = [
  ['Theme', IconPaint],
  ['Colors', IconColorSwatch],
  ['Typography', IconTypography],
  ['Spacing', IconSpacingHorizontal],
  ['Radius', IconBorderRadius],
  ['Borders', IconBorderAll],
  ['Shadows', IconShadow],
  ['Components', IconComponents],
  ['Icons', IconAsterisk],
  ['Motion', IconWaveSine, 9],
  ['Duration', IconClock, 10],
  ['Z-index', IconLayersIntersect, 11],
];
export function WorkbenchJourney({
  mode,
  compact = false,
  wheel = false,
  tuning,
  details = defaultDetails,
  detailsLabel = 'Customizable down to every detail',
  children,
  afterTiles,
  showTools = true,
  intro = (
    <h1 className="journey-title journey-enter">
      An open-source design system.<span>Ready for your next idea.</span>
    </h1>
  ),
  customizationHeading = (
    <h2 className="journey-heading journey-enter">
      Customizable down to every detail
    </h2>
  ),
  buildHeading = (
    <h2
      className="journey-heading journey-enter"
      style={{ '--arrival': '2350ms' }}
    >
      Start building with your favorite tools
    </h2>
  ),
}) {
  const { state } = useNxdsAppearance();
  const reduceMotion = state.prefs.reduceMotion;
  const colors = useJourneyColors();
  const toolsStyle = toolColors(mode);
  const [toolsReady, setToolsReady] = useState(false);
  const [step, setStep] = useState(-1);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const active =
    hovered ??
    focused ??
    (tuning?.autoTour !== false && step >= 0 && step < details.length
      ? step
      : null);
  useEffect(() => {
    if (
      reduceMotion ||
      wheel ||
      tuning?.autoTour === false ||
      step >= details.length ||
      hovered !== null ||
      focused !== null
    )
      return;
    const timer = setTimeout(
      () => setStep((current) => current + 1),
      step === -1 ? 2900 : (tuning?.holdMs ?? 1300)
    );
    return () => clearTimeout(timer);
  }, [
    reduceMotion,
    step,
    hovered,
    focused,
    wheel,
    tuning?.autoTour,
    tuning?.holdMs,
    details.length,
  ]);
  function finishTools(event) {
    if (
      event.animationName === 'journey-arrive' &&
      event.target === event.currentTarget
    )
      setToolsReady(true);
  }
  return (
    <>
      <section
        className={`workbench-journey${compact ? ' journey-compact' : ''}${wheel ? ' journey-wheel' : ''}`}
        data-mode={mode}
        aria-label="Nexus Design System"
      >
        <div className="journey-sequence">
          {intro}
          <div className="journey-workbench">
            {customizationHeading}
            {wheel ? (
              <TileWheel details={details} colors={colors} tuning={tuning} />
            ) : (
              <div
                className="journey-grid"
                role="group"
                aria-label={detailsLabel}
                onMouseLeave={() => setHovered(null)}
              >
                {details.map(([label, Icon, colorIndex], index) => (
                  <button
                    key={label}
                    type="button"
                    className={`journey-color-${colorIndex ?? index} journey-tile journey-enter`}
                    style={{
                      ...colors[colorIndex ?? index],
                      '--arrival': `${900 + index * 110}ms`,
                    }}
                    aria-label={`Play with ${label}`}
                    data-active={active === index}
                    onMouseEnter={() => setHovered(index)}
                    onFocus={() => setFocused(index)}
                    onBlur={() => setFocused(null)}
                  >
                    <Icon
                      className="journey-icon journey-idle-icon"
                      aria-hidden="true"
                    />
                    <span className="journey-face" aria-hidden="true">
                      <Icon className="journey-face-icon" />
                      <span className="journey-label">{label}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {afterTiles}
          {showTools && (
            <div className="journey-build">
              {buildHeading}
              <div
                className="journey-tools"
                role="list"
                aria-label="Build tools"
              >
                {[
                  ['Claude', ClaudeLogo],
                  ['Codex', IconBrandOpenai],
                  ['Cursor', CursorLogo],
                ].map(([label, Icon], index) => (
                  <span
                    key={label}
                    role="listitem"
                    className="journey-tool journey-enter"
                    onAnimationEnd={index === 2 ? finishTools : undefined}
                    style={{
                      ...toolsStyle,
                      '--arrival': `${2700 + index * 110}ms`,
                    }}
                  >
                    <Icon aria-hidden="true" />
                    <span className="nx:sr-only">{label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      {children && (
        <div
          className="journey-following"
          data-ready={reduceMotion || !showTools || toolsReady}
        >
          {children}
        </div>
      )}
    </>
  );
}
