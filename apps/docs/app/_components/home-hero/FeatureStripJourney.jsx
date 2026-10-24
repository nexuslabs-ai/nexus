'use client';

import { useEffect, useState } from 'react';

import { Button, Input, Switch } from '@nxds/react';
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
import { useJourneyColors } from './journey-colors';

import './workbench-journey.css';
import './feature-strip-journey.css';

const details = [
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

export function FeatureStripJourney({
  tuning,
  children,
  componentsHref = '/components',
  playgroundHref = '/create',
}) {
  const { state } = useNxdsAppearance();
  const reduceMotion = state.prefs.reduceMotion;
  const colors = useJourneyColors();
  const [active, setActive] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (reduceMotion || paused || tuning?.autoTour === false) return;
    const timer = setInterval(
      () => setActive((value) => (value + 1) % details.length),
      tuning?.holdMs ?? 1300
    );
    return () => clearInterval(timer);
  }, [reduceMotion, paused, tuning?.autoTour, tuning?.holdMs]);
  function saveExample(event) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <div className="feature-strip">
      <header className="feature-strip-intro">
        <h1 className="journey-title journey-enter">
          An open-source design system.<span>Ready for your next idea.</span>
        </h1>
        <div
          className="feature-strip-actions journey-enter"
          style={{ '--arrival': '120ms' }}
        >
          <Button asChild>
            <a href={componentsHref}>Browse Components</a>
          </Button>
          <Button asChild variant="outline">
            <a href={playgroundHref}>Playground</a>
          </Button>
        </div>
      </header>
      <section
        className="feature-strip-band"
        aria-label="Customization and compatible tools"
      >
        <div className="feature-strip-customization">
          <h2>Customizable in every detail</h2>
          <ul
            className="feature-strip-tiles"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {details.map(([label, Icon], index) => (
              <li
                key={label}
                className="journey-enter"
                style={{
                  ...colors[index],
                  '--arrival': `${240 + index * 45}ms`,
                }}
              >
                <span
                  className="feature-strip-tile"
                  data-active={active === index}
                >
                  <Icon aria-hidden="true" />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="feature-strip-compatibility">
          <h2>Works with your favorite tools</h2>
          <ul className="feature-strip-tools">
            {[
              ['Claude', ClaudeLogo],
              ['Codex', IconBrandOpenai],
              ['Cursor', CursorLogo],
            ].map(([name, Icon], index) => (
              <li
                key={name}
                className="journey-enter"
                style={{ '--arrival': `${650 + index * 70}ms` }}
              >
                <Icon aria-hidden="true" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section
        className="feature-strip-examples journey-enter"
        style={{ '--arrival': '950ms' }}
        aria-label="Try Nexus components"
      >
        <div>
          <h2>Forms</h2>
          <p>A few details. A fresh start.</p>
          <form onSubmit={saveExample} className="feature-strip-form">
            <Input
              aria-label="Project name"
              placeholder="Project name"
              required
              onChange={() => setSaved(false)}
            />
            <Input
              aria-label="Email address"
              type="email"
              placeholder="Email address"
              required
              onChange={() => setSaved(false)}
            />
            <Button type="submit">{saved ? 'Saved' : 'Create project'}</Button>
            <span role="status" className="feature-strip-status">
              {saved
                ? 'Example saved in this preview.'
                : 'Try the form — nothing is sent.'}
            </span>
          </form>
        </div>
        <div>
          <h2>Preferences</h2>
          <p>Small controls. Considered details.</p>
          <div className="feature-strip-preferences">
            {['Email notifications', 'Project updates', 'Weekly digest'].map(
              (name, index) => (
                <div key={name}>
                  <span>{name}</span>
                  <Switch aria-label={name} defaultChecked={index !== 2} />
                </div>
              )
            )}
          </div>
        </div>
        <div>
          <h2>Buttons</h2>
          <p>Every action, in its place.</p>
          <div className="feature-strip-buttons">
            <Button asChild>
              <a href={componentsHref}>Browse components</a>
            </Button>
            <Button variant="outline" asChild>
              <a href={playgroundHref}>Open playground</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href={componentsHref}>Explore the library →</a>
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </section>
      {children}
    </div>
  );
}
