'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@nxds/react';
import { useNxdsAppearance } from '@nxds/react/appearance';
import { DialRoot, useDialKit } from 'dialkit';

import { initialPreviewAppearance } from './appearance-model';
import { CornerChoices, SurfaceToneChoices } from './AppearanceChoices';
import { AppearancePreview } from './AppearancePreview';
import { ComparisonChapter } from './ComparisonChapter';
import { ContextDock } from './ContextDock';
import { ContinuousDock } from './ContinuousDock';
import { CoreChipChapter } from './CoreChipChapter';
import { DialKitToolControls } from './DialKitToolControls';
import { tabIcons } from './dock-icons';
import { DockToolControls } from './DockToolControls';
import { FoundationChapter } from './FoundationChapter';
import { FrameworkChapter } from './FrameworkChapter';
import {
  ActiveLabelDock,
  MarkupPortraitDock,
  TactileDock,
} from './GrowingDock';
import { LiveComparisonChapter } from './LiveComparisonChapter';
import { MorphingDock } from './MorphingDock';
import { NexusAppearanceControls } from './NexusAppearanceControls';
import { NexusDock } from './NexusDock';
import { NexusPropertyControls } from './NexusPropertyControls';
import { OriginalShowcaseGrid } from './original/ShowcaseGrid';
import { PlaceholderGrid } from './PlaceholderGrid';
import { PreviousNexusDock } from './PreviousNexusDock';
import { ShowcaseGrid } from './ShowcaseGrid';
import { StoriesChapter } from './StoriesChapter';
import { StoryReplayChapter } from './StoryReplayChapter';
import { StoryTestIterations } from './StoryTestIterations';
import { StraightDock } from './StraightDock';

import 'dialkit/styles.css';
import './dock-chapter-journey.css';
import './story-chapters.css';

const chapters = [
  {
    id: 'explore',
    title: 'Your design system starts here.',
    cta: 'View components',
    href: 'https://nxds.dev/components/button',
    tabs: ['Components', 'Dashboard', 'Mail', 'Chat', 'Finances', 'CRM'],
  },
  {
    id: 'customize',
    controls: true,
    title: 'Customize every detail.',
    cta: 'Explore foundations',
    href: 'https://nxds.dev/foundations/tokens',
    tabs: ['Theme', 'Colors', 'Typography', 'Spacing', 'Radius', 'More'],
  },
  {
    id: 'coexist',
    title: 'Build on what you use.',
    cta: 'Explore integration',
    href: 'https://nxds.dev/getting-started/install',
    tabs: ['MUI', 'Ant Design', 'shadcn/ui'],
  },
  {
    id: 'frameworks',
    title: 'One foundation. Many frameworks.',
    cta: 'Explore the engine',
    href: 'https://nxds.dev/foundations/tokens',
    tabs: ['React', 'Vue', 'Svelte', 'Angular', 'React Native'],
  },
  {
    id: 'stories',
    title: 'Stories are the tests.',
    cta: 'Explore the stories',
    href: 'https://github.com/nexuslabs-ai/nxds/blob/main/packages/react/src/components/button/Button.stories.tsx',
    tabs: ['Click', 'Keyboard', 'Disabled'],
  },
];

function ChapterCanvas({
  chapter,
  tool,
  settings,
  split,
  onSplitChange,
  onFrameworkSelect,
  frameworkDiagram,
  showcaseView,
  showcaseVersion,
  appearance,
  customizeVersion,
  coexistenceVersion,
}) {
  if (chapter === 'customize' && customizeVersion !== 'previous')
    return <AppearancePreview appearance={appearance} view={showcaseView} />;
  if (
    (chapter === 'explore' || chapter === 'customize') &&
    showcaseVersion === 'original'
  )
    return (
      <OriginalShowcaseGrid
        view={chapter === 'explore' ? tool : showcaseView}
        settings={settings}
      />
    );
  if (chapter === 'explore' || chapter === 'customize')
    return (
      <ShowcaseGrid
        view={chapter === 'explore' ? tool : showcaseView}
        settings={settings}
      />
    );
  if (chapter === 'coexist' && coexistenceVersion === 'live')
    return (
      <LiveComparisonChapter
        stack={tool}
        appearance={appearance}
        split={split}
        onSplitChange={onSplitChange}
      />
    );
  if (chapter === 'coexist')
    return (
      <ComparisonChapter
        stack={tool}
        settings={settings}
        split={split}
        onSplitChange={onSplitChange}
      />
    );
  if (chapter === 'frameworks' && frameworkDiagram === 'chip')
    return <CoreChipChapter framework={tool} onSelect={onFrameworkSelect} />;
  if (chapter === 'frameworks' && frameworkDiagram === 'foundation')
    return <FoundationChapter framework={tool} onSelect={onFrameworkSelect} />;
  if (chapter === 'frameworks')
    return <FrameworkChapter framework={tool} onSelect={onFrameworkSelect} />;
  if (chapter === 'stories')
    return <StoriesChapter key={tool} scenario={tool} />;
  return (
    <PlaceholderGrid layout={settings.layout} treatment={settings.treatment} />
  );
}

export function DockChapterJourney({
  onThemeChange,
  previewAppearance,
  onPreviewAppearanceChange: updatePreviewAppearance,
  sharedAppearance,
}) {
  const track = useRef(null);
  const stage = useRef(null);
  const { state } = useNxdsAppearance();
  const dock = useDialKit(
    'Dock studio',
    {
      iteration: {
        type: 'select',
        options: [
          { value: 'nexus-owned', label: 'Nexus owned · new' },
          { value: 'nexus-dock', label: 'Nexus Dock · previous' },
          { value: 'straight-bare', label: 'Roomy · bare icons' },
          { value: 'straight-roomy', label: 'Straight expansion · roomy' },
          { value: 'straight', label: 'Straight expansion' },
          { value: 'continuous', label: 'Continuous surface' },
          { value: 'pill-morph', label: 'Pill morph · connected' },
          { value: 'markup-portrait', label: 'Markup · Portrait' },
          { value: 'tactile', label: 'Tactile tools' },
          { value: 'active-label', label: 'Active label · Examlly' },
          { value: 'contextual', label: 'Contextual dock' },
          { value: 'colored', label: 'Colored tiles · previous' },
        ],
        default: 'nexus-owned',
      },
      selectedWidth: {
        type: 'select',
        options: [
          { value: 'hug', label: 'Hug label · new' },
          { value: 'roomy', label: 'Roomy · previous' },
        ],
        default: 'hug',
      },
      showcase: {
        type: 'select',
        options: [
          { value: 'nexus', label: 'Nexus fields, rows & messages' },
          { value: 'original', label: 'Original · before migration' },
        ],
        default: 'nexus',
      },
      customize: {
        type: 'select',
        options: [
          { value: 'owned', label: 'Compact Nexus · reusable' },
          { value: 'compact', label: 'Compact Nexus · previous' },
          { value: 'visual', label: 'Visual choices · previous' },
          { value: 'nexus', label: 'Nexus appearance · previous' },
          { value: 'previous', label: 'Prototype controls · previous' },
        ],
        default: 'owned',
      },
      showCustomize: { type: 'action', label: 'Show Customize chapter' },
      frameworkDiagram: {
        type: 'select',
        options: [
          { value: 'tokens', label: 'Token flow · current' },
          { value: 'foundation', label: 'Shared foundation · new' },
          { value: 'chip', label: 'Core chip · new' },
        ],
        default: 'tokens',
      },
      motion: { duration: [0.25, 0.1, 0.6, 0.05] },
    },
    { id: 'nexus-story-dock-v1', persist: true, onAction: showCustomize }
  );
  const coexistence = useDialKit(
    'Coexistence studio',
    {
      iteration: {
        type: 'select',
        options: [
          { value: 'live', label: 'Real libraries + Nexus · new' },
          { value: 'placeholder', label: 'Placeholder comparison · previous' },
        ],
        default: 'live',
      },
      showCoexistence: { type: 'action', label: 'Show Build on what you use' },
    },
    {
      id: 'nexus-story-coexistence-v1',
      persist: true,
      onAction: showCoexistence,
    }
  );
  const stories = useDialKit(
    'Stories studio',
    {
      iteration: {
        type: 'select',
        options: [
          { value: 'current', label: 'Button story · current' },
          { value: 'bento', label: 'Connected bento' },
          { value: 'split', label: 'Code and preview' },
          { value: 'regression', label: 'Catch a regression' },
          { value: 'walkthrough', label: 'Follow the story · new' },
        ],
        default: 'current',
      },
      showStories: { type: 'action', label: 'Show stories chapter' },
    },
    { id: 'nexus-story-examples-v1', persist: true, onAction: showStories }
  );

  function showCoexistence(action) {
    if (action !== 'showCoexistence') return;
    const inset = parseFloat(getComputedStyle(stage.current).top) || 0;
    const distance = track.current.offsetHeight - stage.current.offsetHeight;
    const top =
      window.scrollY + track.current.getBoundingClientRect().top - inset;
    window.scrollTo({
      top:
        top +
        distance *
          ((chapters.findIndex((item) => item.id === 'coexist') + 0.1) /
            (chapters.length + 1)),
      behavior: state.prefs.reduceMotion ? 'instant' : 'smooth',
    });
  }
  function showCustomize(action) {
    if (action !== 'showCustomize') return;
    const inset = parseFloat(getComputedStyle(stage.current).top) || 0;
    const distance = track.current.offsetHeight - stage.current.offsetHeight;
    const top =
      window.scrollY + track.current.getBoundingClientRect().top - inset;
    window.scrollTo({
      top: top + distance * (1.1 / (chapters.length + 1)),
      behavior: state.prefs.reduceMotion ? 'instant' : 'smooth',
    });
  }
  function showStories(action) {
    if (action !== 'showStories') return;
    const inset = parseFloat(getComputedStyle(stage.current).top) || 0;
    const distance = track.current.offsetHeight - stage.current.offsetHeight;
    const top =
      window.scrollY + track.current.getBoundingClientRect().top - inset;
    window.scrollTo({
      top:
        top +
        distance *
          ((chapters.findIndex((item) => item.id === 'stories') + 0.1) /
            (chapters.length + 1)),
      behavior: state.prefs.reduceMotion ? 'instant' : 'smooth',
    });
  }

  const [settings, setSettings] = useState({
    accent: '#c4c9f8',
    tint: 0,
    gap: 16,
    radius: 14,
    border: 1,
    shadow: 0,
    titleSize: 56,
    weight: '600',
    layout: 'Sidebar',
    treatment: 'Outline',
  });
  function updateSetting(name, value) {
    setSettings((current) => ({ ...current, [name]: value }));
  }
  const [chapter, setChapter] = useState(0);
  const [selected, setSelected] = useState(() => chapters.map(() => 0));
  const [split, setSplit] = useState(50);

  useEffect(() => {
    let frame = 0;
    function measure() {
      frame = 0;
      const inset = parseFloat(getComputedStyle(stage.current).top) || 0;
      const distance = track.current.offsetHeight - stage.current.offsetHeight;
      const progress =
        (inset - track.current.getBoundingClientRect().top) /
        Math.max(1, distance);
      setChapter(
        Math.min(
          chapters.length,
          Math.max(0, Math.floor(progress * (chapters.length + 1)))
        )
      );
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(track.current);
    observer.observe(stage.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  function selectTab(index) {
    setSelected((current) =>
      current.map((value, i) => (i === chapter ? index : value))
    );
  }
  function navigateTabs(event) {
    const count = chapters[chapter].tabs.length;
    let next = selected[chapter];
    if (event.key === 'ArrowRight') next = (next + 1) % count;
    else if (event.key === 'ArrowLeft') next = (next + count - 1) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    selectTab(next);
    event.currentTarget.querySelectorAll('[role="tab"]')[next].focus();
  }

  const current = chapters[chapter];
  const showFooter = chapter === chapters.length;
  const AppearanceControls =
    dock.customize === 'owned'
      ? NexusPropertyControls
      : NexusAppearanceControls;
  const DockComponent =
    dock.iteration === 'nexus-owned' ? NexusDock : PreviousNexusDock;
  const chapterControls =
    current?.id === 'customize' && dock.customize !== 'previous' ? (
      <AppearanceControls
        compact={dock.customize === 'compact'}
        tool={current.tabs[selected[chapter]]}
        appearance={previewAppearance}
        onChange={updatePreviewAppearance}
        scopeDescription={
          sharedAppearance
            ? 'Updates the dock and showcase together.'
            : 'Applies to the component preview.'
        }
        onReset={() =>
          updatePreviewAppearance(initialPreviewAppearance(state.mode))
        }
        surfaceToneControl={
          ['visual', 'compact', 'owned'].includes(dock.customize) ? (
            <SurfaceToneChoices
              value={previewAppearance.surfaceTone}
              onChange={(surfaceTone) =>
                updatePreviewAppearance({ ...previewAppearance, surfaceTone })
              }
            />
          ) : undefined
        }
        cornersControl={
          ['visual', 'compact', 'owned'].includes(dock.customize) ? (
            <CornerChoices
              value={previewAppearance.corners}
              onChange={(corners) =>
                updatePreviewAppearance({ ...previewAppearance, corners })
              }
            />
          ) : undefined
        }
      />
    ) : null;
  return (
    <section
      className="dock-chapter-track"
      ref={track}
      data-reduce-motion={state.prefs.reduceMotion}
      aria-label="Design system walkthrough"
      data-dock-iteration={dock.iteration}
      style={{
        '--story-chapter-count': chapters.length + 1,
        '--canvas-accent': settings.accent,
        '--canvas-tint': settings.tint + '%',
        '--canvas-gap': settings.gap + 'px',
        '--canvas-radius': settings.radius + 'px',
        '--canvas-border': settings.border + 'px',
        '--canvas-shadow': settings.shadow + 'px',
        '--story-title-size': settings.titleSize + 'px',
        '--story-title-weight': settings.weight,
      }}
    >
      <div className="dock-chapter-stage" data-footer={showFooter} ref={stage}>
        {showFooter ? (
          <footer className="story-footer" key="footer">
            <a className="story-footer-brand" href="#top">
              Nexus Design System
            </a>
            <nav aria-label="Footer navigation">
              <a href="https://nxds.dev/getting-started/introduction">
                Documentation
              </a>
              <a
                href="https://github.com/nexuslabs-ai/nexus"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </nav>
          </footer>
        ) : current.id === 'stories' && stories.iteration === 'walkthrough' ? (
          <StoryReplayChapter
            dockIteration={dock.iteration}
            duration={dock.motion.duration}
            reduceMotion={state.prefs.reduceMotion}
            theme={state.mode}
          />
        ) : current.id === 'stories' && stories.iteration !== 'current' ? (
          <StoryTestIterations
            key={stories.iteration}
            iteration={stories.iteration}
            dockIteration={dock.iteration}
            duration={dock.motion.duration}
            reduceMotion={state.prefs.reduceMotion}
            theme={state.mode}
          />
        ) : (
          <>
            <div className="dock-chapter-heading" key={chapter}>
              <h1>{current.title}</h1>
              <div className="story-ctas">
                <Button asChild>
                  <a href="https://nxds.dev/docs">Get started</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={current.href}>{current.cta}</a>
                </Button>
              </div>
            </div>
            <div
              className="story-canvas"
              role={dock.iteration === 'colored' ? 'tabpanel' : 'region'}
              id="story-panel"
              aria-labelledby={`story-tab-${chapter}-${selected[chapter]}`}
            >
              <ChapterCanvas
                chapter={current.id}
                tool={current.tabs[selected[chapter]]}
                settings={settings}
                split={split}
                onSplitChange={setSplit}
                onFrameworkSelect={selectTab}
                frameworkDiagram={dock.frameworkDiagram}
                showcaseView={chapters[0].tabs[selected[0]]}
                showcaseVersion={dock.showcase}
                appearance={previewAppearance}
                customizeVersion={dock.customize}
                coexistenceVersion={coexistence.iteration}
              />
            </div>
            <div className="story-dock-position">
              {['nexus-owned', 'nexus-dock'].includes(dock.iteration) ? (
                <DockComponent
                  hugActive={dock.selectedWidth === 'hug'}
                  compactControls={['compact', 'owned'].includes(
                    dock.customize
                  )}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  hasControls={Boolean(current.controls)}
                >
                  {chapterControls ?? (
                    <DialKitToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </DockComponent>
              ) : dock.iteration === 'straight-bare' ? (
                <StraightDock
                  className="roomy-dock bare-dock"
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls ?? (
                    <DialKitToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </StraightDock>
              ) : dock.iteration === 'straight-roomy' ? (
                <StraightDock
                  className="roomy-dock"
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls ?? (
                    <DialKitToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </StraightDock>
              ) : dock.iteration === 'straight' ? (
                <StraightDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls ?? (
                    <DialKitToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </StraightDock>
              ) : dock.iteration === 'continuous' ? (
                <ContinuousDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls ?? (
                    <DialKitToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </ContinuousDock>
              ) : dock.iteration === 'pill-morph' ? (
                <MorphingDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls ?? (
                    <DialKitToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </MorphingDock>
              ) : dock.iteration === 'markup-portrait' ? (
                <MarkupPortraitDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls ?? (
                    <DialKitToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </MarkupPortraitDock>
              ) : dock.iteration === 'tactile' ? (
                <TactileDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                >
                  {chapterControls ?? (
                    <DockToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </TactileDock>
              ) : dock.iteration === 'active-label' ? (
                <ActiveLabelDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls ?? (
                    <DialKitToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </ActiveLabelDock>
              ) : dock.iteration === 'contextual' ? (
                <ContextDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={selected[chapter]}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                >
                  {chapterControls ?? (
                    <DockToolControls
                      tool={current.tabs[selected[chapter]]}
                      settings={settings}
                      onChange={updateSetting}
                      theme={state.mode}
                      onThemeChange={onThemeChange}
                    />
                  )}
                </ContextDock>
              ) : (
                <div
                  className="story-segmented"
                  role="tablist"
                  tabIndex={-1}
                  aria-label={current.title}
                  onKeyDown={navigateTabs}
                >
                  {current.tabs.map((tab, index) => {
                    const Icon = tabIcons[tab];
                    return (
                      <button
                        key={tab}
                        id={`story-tab-${chapter}-${index}`}
                        type="button"
                        role="tab"
                        aria-label={tab}
                        title={tab}
                        aria-selected={selected[chapter] === index}
                        aria-controls="story-panel"
                        tabIndex={selected[chapter] === index ? 0 : -1}
                        onClick={() => selectTab(index)}
                      >
                        <Icon size={21} stroke={1.7} aria-hidden="true" />
                        <span className="story-tab-label" aria-hidden="true">
                          {tab}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <DialRoot
        position="top-right"
        theme={state.mode}
        defaultOpen={false}
        productionEnabled
      />
    </section>
  );
}
