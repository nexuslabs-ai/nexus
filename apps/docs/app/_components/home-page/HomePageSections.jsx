'use client';

import { useId } from 'react';

import { Button } from '@nxds/react';

import { CoexistenceSection } from './CoexistenceSection';
import { FrameworkSection } from './FrameworkSection';

import './home-page.css';

export function ComponentGallery() {
  return (
    <div
      className="home-showcase nx:grid nx:grid-cols-1 nx:sm:grid-cols-2 nx:lg:grid-cols-3 nx:gap-4"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="nx:h-64 nx:rounded-xl nx:border nx:border-border-default"
        />
      ))}
    </div>
  );
}

export function HomePageSections({ docsBase = '' }) {
  const id = useId();
  return (
    <div className="home-page-content">
      <FrameworkSection docsBase={docsBase} />
      <CoexistenceSection docsBase={docsBase} />
      <section
        className="home-page-section home-reason"
        aria-labelledby={`${id}-testing`}
      >
        <div className="home-reason-copy">
          <h2 id={`${id}-testing`}>The stories are the tests.</h2>
          <p>
            Component examples, interaction tests, callback assertions, and
            automated accessibility checks live together in Storybook. See how a
            component looks, exercise its behavior, and inspect its states in
            the same place.
          </p>
          <p className="home-small-copy">
            Browser-based play functions and accessibility checks support the
            components. Automated checks are one part of accessibility testing.
          </p>
        </div>
        <div className="home-theme-visual">
          <span className="home-visual-label">COMPONENT.STORIES.TSX</span>
          <div className="home-token-row">
            <span>States & variants</span>
            <span>Interactions</span>
            <span>Actions & callbacks</span>
            <span>Accessibility</span>
          </div>
          <span className="home-visual-arrow" aria-hidden="true">
            ↓
          </span>
          <div className="home-engine">Living examples. Browser tests.</div>
          <p>Documented and exercised alongside the component.</p>
        </div>
      </section>
      <section
        className="home-page-section home-reason"
        aria-labelledby={`${id}-ownership`}
      >
        <div className="home-reason-copy">
          <h2 id={`${id}-ownership`}>The code is yours.</h2>
          <p>
            Like shadcn/ui, Nexus puts the component source in your project.
            Read it, change it, and make it fit your product. Keep the shared
            theme engine as a versioned dependency.
          </p>
        </div>
        <div className="home-ownership-visual">
          <div className="home-source-row">
            <code>button.tsx</code>
            <code>input.tsx</code>
            <code>your-app.tsx</code>
          </div>
          <span className="home-visual-arrow" aria-hidden="true">
            ↕
          </span>
          <div className="home-engine">
            <span className="home-visual-label">SHARED THEME ENGINE</span>
            <code>@nxds/core</code>
          </div>
          <p>Your source. Your changes. One foundation.</p>
        </div>
      </section>
      <section
        className="home-page-section home-reason"
        aria-labelledby={`${id}-axes`}
      >
        <div className="home-reason-copy">
          <h2 id={`${id}-axes`}>Every axis is a setting.</h2>
          <p>
            Color is just the start. Set density, corners, shadows, border
            width, typography, and motion through one appearance configuration.
            Components read the same tokens, so the details stay coordinated.
          </p>
          <a
            className="home-text-link home-why-link"
            href={`${docsBase}/create`}
          >
            Explore appearance settings <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="home-theme-visual">
          <span className="home-visual-label">
            ONE APPEARANCE CONFIGURATION
          </span>
          <div className="home-token-row">
            {[
              'Color',
              'Density',
              'Corners',
              'Shadows',
              'Borders',
              'Typography',
              'Motion',
            ].map((axis) => (
              <span key={axis}>{axis}</span>
            ))}
          </div>
          <span className="home-visual-arrow" aria-hidden="true">
            ↓
          </span>
          <div className="home-engine">
            <code>NxdsAppearanceProvider</code>
          </div>
          <p>Set it once. Carry it through the interface.</p>
        </div>
      </section>
      <section className="home-start" aria-labelledby={`${id}-start`}>
        <h2 id={`${id}-start`}>Make something yours.</h2>
        <p>Start with a theme. Or bring Nexus into the app you’re building.</p>
        <div className="home-start-actions">
          <Button asChild>
            <a href={`${docsBase}/create`}>Create your theme</a>
          </Button>
          <Button asChild variant="outline">
            <a href={`${docsBase}/getting-started/install`}>Add to your app</a>
          </Button>
        </div>
      </section>
      <footer className="home-footer">
        <div>
          <a className="home-footer-brand" href="/">
            Nexus Design System
          </a>
          <p>An open-source design system by Nexus Labs.</p>
        </div>
        <nav aria-label="Footer">
          <a href={`${docsBase}/getting-started/introduction`}>Docs</a>
          <a href="https://github.com/nexuslabs-ai/nexus">GitHub</a>
          <a href="https://github.com/nexuslabs-ai/nexus/releases">Releases</a>
          <a href="https://github.com/nexuslabs-ai/nexus/blob/main/LICENSE">
            License
          </a>
          <a href={`${docsBase}/getting-started/why-nexus#acknowledgements`}>
            Acknowledgements
          </a>
        </nav>
      </footer>
    </div>
  );
}
