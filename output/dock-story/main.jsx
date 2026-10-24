import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { DEFAULT_NXDS_APPEARANCE, sanitizeNxdsAppearance } from '@nxds/core';
import { Button } from '@nxds/react';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';
import { IconBrandGithub, IconMoon, IconSun } from '@tabler/icons-react';
import { useDialKit } from 'dialkit';

import { initialPreviewAppearance } from './appearance-model';
import { DockChapterJourney } from './DockChapterJourney';
import { SourceAudit } from './SourceAudit';

import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import './page.css';

function Page() {
  const page = useRef(null);
  const header = useRef(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.target.getBoundingClientRect().height + 'px';
      page.current.style.setProperty('--story-header-height', height);
      document.documentElement.style.setProperty(
        '--story-header-height',
        height
      );
    });
    observer.observe(header.current);
    return () => observer.disconnect();
  }, []);

  const [pageAppearance, setPageAppearance] = useState(() =>
    sanitizeNxdsAppearance({
      ...DEFAULT_NXDS_APPEARANCE,
      mode: 'dark',
      surfaceTone: 'neutral',
      corners: 'smooth',
      prefs: {
        ...DEFAULT_NXDS_APPEARANCE.prefs,
        uiFont: 'DM Sans, Arial, sans-serif',
        uiFontSize: 16,
      },
    })
  );
  const [previewAppearance, setPreviewAppearance] = useState(() =>
    initialPreviewAppearance()
  );
  const comparison = useDialKit(
    'Appearance studio',
    {
      iteration: {
        type: 'select',
        options: [
          { value: 'shared', label: 'Dock + showcase · new' },
          { value: 'isolated', label: 'Showcase only · previous' },
        ],
        default: 'shared',
      },
    },
    { id: 'nexus-story-shared-appearance-v1', persist: true }
  );
  const sharedAppearance = comparison.iteration === 'shared';
  const appearance = sharedAppearance ? previewAppearance : pageAppearance;

  function updatePreviewAppearance(next) {
    setPreviewAppearance((current) =>
      sanitizeNxdsAppearance(typeof next === 'function' ? next(current) : next)
    );
  }
  const setAppearance = sharedAppearance
    ? updatePreviewAppearance
    : setPageAppearance;

  return (
    <NxdsAppearanceProvider
      state={appearance}
      onStateChange={setAppearance}
      storageKey={false}
      cookieWriteKey={false}
    >
      <div
        ref={page}
        className="story-page nx:bg-background nx:text-foreground nx:typography-body-default"
      >
        <header
          ref={header}
          className="story-header nx:mx-auto nx:max-w-7xl nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-4 nx:px-4 nx:py-4 nx:lg:px-8"
        >
          <a
            href="#top"
            aria-label="Nexus Design System home"
            className="nx:flex nx:items-center nx:text-inherit nx:no-underline"
          >
            <span className="nx:font-semibold nx:typography-label-default">
              Nexus Design System
            </span>
          </a>
          <nav
            aria-label="Main navigation"
            className="nx:order-3 nx:flex nx:w-full nx:justify-between nx:gap-3 nx:lg:order-none nx:lg:w-auto nx:lg:gap-6 nx:typography-label-default nx:text-muted-foreground"
          >
            <a href="https://nxds.dev/components">Components</a>
            <a href="https://nxds.dev/foundations">Foundations</a>
            <a href="https://nxds.dev/theming/appearance">Themes</a>
            <a href="https://nxds.dev/getting-started/introduction">Docs</a>
          </nav>
          <div className="nx:flex nx:items-center nx:gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={
                appearance.mode === 'light'
                  ? 'Switch to dark theme'
                  : 'Switch to light theme'
              }
              onClick={() =>
                setAppearance((a) => ({
                  ...a,
                  mode: a.mode === 'light' ? 'dark' : 'light',
                }))
              }
            >
              {appearance.mode === 'light' ? (
                <IconMoon data-prototype-icon="true" />
              ) : (
                <IconSun data-prototype-icon="true" />
              )}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/nexuslabs-ai/nexus"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nexus repository on GitHub (opens in a new tab)"
              >
                <IconBrandGithub
                  data-prototype-icon="true"
                  aria-hidden="true"
                />
                GitHub
              </a>
            </Button>
          </div>
        </header>
        <main id="top">
          <DockChapterJourney
            previewAppearance={previewAppearance}
            onPreviewAppearanceChange={updatePreviewAppearance}
            sharedAppearance={sharedAppearance}
            onThemeChange={(mode) =>
              setAppearance((current) => ({ ...current, mode }))
            }
          />
        </main>
        <SourceAudit />
      </div>
    </NxdsAppearanceProvider>
  );
}
createRoot(document.getElementById('root')).render(<Page />);
