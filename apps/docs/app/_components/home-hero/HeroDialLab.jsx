'use client';

import { useEffect, useState } from 'react';

import { DialRoot, DialStore, useDialKitController } from 'dialkit';

import { CtaJourney } from './CtaJourney';
import { FeatureStripJourney } from './FeatureStripJourney';
import { FoilJourney } from './FoilJourney';
import { HeadlineJourney } from './HeadlineJourney';
import { InlineStacksJourney } from './InlineStacksJourney';
import { useJourneyColors } from './journey-colors';
import { RotatingHeadlineJourney } from './RotatingHeadlineJourney';
import { ScrollHeadlineJourney } from './ScrollHeadlineJourney';
import { StackedHeadlineJourney } from './StackedHeadlineJourney';
import { TileShuffleJourney } from './TileShuffleJourney';
import { TiltedCtaJourney } from './TiltedCtaJourney';
import { TiltedJourney } from './TiltedJourney';
import { VinylJourney } from './VinylJourney';
import { WorkbenchJourney } from './WorkbenchJourney';

import 'dialkit/styles.css';
import './hero-dial-lab.css';

const iterations = [
  {
    value: 'tile-shuffle',
    name: 'Tile shuffle',
    preset: null,
    description: 'Scroll-driven staggered tiles that lift, turn, and settle.',
  },
  {
    value: 'scroll-headlines',
    name: 'Scroll headlines',
    preset: null,
    description: 'Scroll through three benefits, then continue into the page.',
  },
  {
    value: 'stacked-headlines',
    name: 'Stacked headlines',
    preset: null,
    description:
      'All three benefits visible together, without headline rotation.',
  },
  {
    value: 'rotating',
    name: 'Rotating headline',
    preset: 'Rotating headline',
    description: 'Three rotating benefits, tilted tiles, and CTAs.',
  },
  {
    value: 'tilted-cta',
    name: 'Tilted tiles + CTAs',
    preset: 'Tilted tiles + CTAs',
    description:
      'Title and tilted tiles, followed by View components and Create.',
  },
  {
    value: 'foil',
    name: 'Foil material study',
    preset: 'Foil material study',
    description: 'Two sizes of one interactive foil sticker.',
  },
  {
    value: 'vinyl',
    name: 'Vinyl stickers',
    preset: 'Vinyl stickers',
    description:
      'Richer pastels, white cut borders, and fixed corner highlights.',
  },
  {
    value: 'tilted',
    name: 'Tilted tiles',
    preset: 'Tilted tiles',
    description: 'Headline with gently tilted, overlapping tiles and tools.',
  },
  {
    value: 'strip',
    name: 'Feature strip',
    preset: 'Feature strip',
    description: 'Title and CTAs above side-by-side customization and tools.',
  },
  {
    value: 'cta',
    name: 'Title + CTAs',
    preset: 'Title + CTAs',
    description:
      'Title and two actions, followed by a separate customization and tools section.',
  },
  {
    value: 'compact',
    name: 'Compact row',
    preset: null,
    description: 'Small headings with one row of tiles beneath them.',
  },
  {
    value: 'workbench',
    name: 'Workbench grid',
    preset: 'Workbench — original',
    description: 'Larger tiles arranged in two rows.',
  },
  {
    value: 'wheel',
    name: '3D wheel',
    preset: '3D wheel',
    description: 'A rotating wheel with the active tile at the front.',
  },
  {
    value: 'headline',
    name: 'Headline with tiles',
    preset: 'Headline with tiles',
    description: 'Three headline lines, with tiles and tools underneath.',
  },
  {
    value: 'stacks',
    name: 'Inline stacks',
    preset: 'Inline stacks',
    description: 'Cycling icon-and-label cards beside the headline.',
  },
];

const config = {
  iteration: {
    type: 'select',
    options: [
      { value: 'rotating', label: 'Rotating headline' },
      { value: 'stacked-headlines', label: 'Stacked headlines' },
      { value: 'scroll-headlines', label: 'Scroll headlines' },
      { value: 'tile-shuffle', label: 'Tile shuffle' },
      { value: 'compact', label: 'Compact row' },
      { value: 'workbench', label: 'Workbench grid' },
      { value: 'wheel', label: '3D wheel' },
      { value: 'headline', label: 'Headline with tiles' },
      { value: 'stacks', label: 'Inline stacks' },
      { value: 'cta', label: 'Title + CTAs' },
      { value: 'strip', label: 'Feature strip' },
      { value: 'tilted', label: 'Tilted tiles' },
      { value: 'tilted-cta', label: 'Tilted tiles + CTAs' },
      { value: 'vinyl', label: 'Vinyl stickers' },
      { value: 'foil', label: 'Foil material study' },
    ],
    default: 'tilted',
  },
  tilePalette: {
    type: 'select',
    options: [
      { value: 'balanced', label: 'Contrast balanced' },
      { value: 'pastel', label: 'Brighter palette' },
      { value: 'original-pastel', label: 'Original light pastels' },
    ],
    default: 'balanced',
  },
  typography: {
    titleSize: [48, 32, 64, 1],
    headingSize: [16, 14, 24, 1],
    labelSize: [16, 12, 16, 1],
  },
  spacing: {
    topPadding: [96, 32, 160, 4],
    sectionGap: [8, 4, 80, 4],
    headingGap: [8, 8, 40, 2],
  },
  tiles: {
    _collapsed: true,
    size: [72, 44, 120, 0.2],
    expandedWidth: [180, 140, 200, 4],
    gap: [8, 4, 24, 2],
    iconSize: [24, 18, 32, 2],
  },
  tools: {
    _collapsed: true,
    size: [72, 40, 120, 0.2],
    gap: [8, 4, 24, 2],
    headingGap: [8, 8, 40, 2],
  },
  animation: {
    _collapsed: true,
    autoTour: true,
    holdMs: [1300, 600, 3000, 100],
    expandMs: [320, 100, 700, 20],
  },
  wheel: { _collapsed: true, depth: [150, 80, 240, 10] },
  foil: {
    strength: [0.7, 0, 1, 0.01],
    sparkle: [0.35, 0, 1, 0.01],
    roughness: [0.4, 0, 1, 0.01],
    tilt: [12, 0, 24, 1],
    autoRotate: true,
  },
  replay: { type: 'action', label: 'Replay journey' },
  reset: { type: 'action', label: 'Reset to Compact row' },
};

export function HeroDialLab({ mode, children, ctaLinks, featureStripContent }) {
  const [replay, setReplay] = useState(0);
  const dial = useDialKitController('Hero studio', config, {
    id: 'nexus-hero-studio-v1',
    persist: true,
    onAction(path) {
      if (path === 'reset') dial.resetValues();
      if (path === 'reset' || path === 'replay')
        setReplay((value) => value + 1);
    },
  });
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    if (
      DialStore.getPresets(id).some(
        (preset) => preset.name === 'Workbench — original'
      )
    )
      return;
    const previous = DialStore.getActivePresetId(id);
    // Clone before editing so neither the base nor an existing saved version changes.
    DialStore.savePreset(id, 'Workbench — original');
    DialStore.updateValues(id, {
      iteration: 'workbench',
      'typography.titleSize': 48,
      'typography.headingSize': 22,
      'typography.labelSize': 13,
      'spacing.topPadding': 96,
      'spacing.sectionGap': 24,
      'spacing.headingGap': 20,
      'tiles.size': 94.4,
      'tiles.gap': 12,
      'tiles.radius': 12,
      'tiles.iconSize': 30,
      'tools.size': 95.333333,
      'tools.gap': 12,
      'tools.headingGap': 12,
      'animation.autoTour': true,
      'animation.holdMs': 1300,
      'animation.expandMs': 320,
    });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    if (DialStore.getPresets(id).some((p) => p.name === '3D wheel')) return;
    const previous = DialStore.getActivePresetId(id);
    DialStore.savePreset(id, '3D wheel');
    DialStore.updateValues(id, {
      iteration: 'wheel',
      'typography.titleSize': 48,
      'typography.headingSize': 16,
      'spacing.sectionGap': 32,
      'spacing.topPadding': 96,
      'tools.size': 48,
      'tools.headingGap': 16,
      'wheel.depth': 150,
    });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    const headline = DialStore.getPresets(id).find(
      (preset) => preset.name === 'Headline with tiles'
    );
    if (headline) {
      const migrationKey = 'nexus-headline-spacing-v2';
      if (localStorage.getItem(migrationKey)) return;
      const previous = DialStore.getActivePresetId(id);
      DialStore.loadPreset(id, headline.id);
      DialStore.updateValues(id, {
        'spacing.sectionGap': 8,
        'spacing.headingGap': 8,
        'tools.headingGap': 8,
      });
      if (previous) DialStore.loadPreset(id, previous);
      else DialStore.clearActivePreset(id);
      localStorage.setItem(migrationKey, '1');
      return;
    }
    const previous = DialStore.getActivePresetId(id);
    DialStore.savePreset(id, 'Headline with tiles');
    DialStore.updateValues(id, {
      iteration: 'headline',
      'typography.titleSize': 48,
      'typography.headingSize': 16,
      'typography.labelSize': 15,
      'spacing.topPadding': 96,
      'spacing.sectionGap': 8,
      'spacing.headingGap': 8,
      'tiles.size': 60,
      'tiles.expandedWidth': 152,
      'tiles.gap': 8,
      'tiles.radius': 12,
      'tiles.iconSize': 24,
      'tools.size': 60,
      'tools.gap': 8,
      'tools.headingGap': 8,
      'animation.autoTour': true,
      'animation.holdMs': 1300,
      'animation.expandMs': 320,
    });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    if (
      DialStore.getPresets(id).some(
        (item) => item.name === 'Tilted tiles + CTAs'
      )
    )
      return;
    const previous = DialStore.getActivePresetId(id);
    const tilted = DialStore.getPresets(id).find(
      (item) => item.name === 'Tilted tiles'
    );
    if (tilted) DialStore.loadPreset(id, tilted.id);
    DialStore.savePreset(id, 'Tilted tiles + CTAs');
    DialStore.updateValues(id, { iteration: 'tilted-cta' });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    const presets = DialStore.getPresets(id);
    const removed = presets.filter(
      (p) => p.name === 'Live workbench' || p.values.iteration === 'live'
    );
    if (
      removed.some((p) => p.id === DialStore.getActivePresetId(id)) ||
      dial.values.iteration === 'live'
    ) {
      const wheel = presets.find((p) => p.name === '3D wheel');
      if (wheel) DialStore.loadPreset(id, wheel.id);
      else DialStore.updateValues(id, { iteration: 'wheel' });
    }
    removed.forEach((p) => DialStore.deletePreset(id, p.id));
  }, [dial.values.iteration]);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    if (
      DialStore.getPresets(id).some((preset) => preset.name === 'Inline stacks')
    )
      return;
    const previous = DialStore.getActivePresetId(id);
    DialStore.savePreset(id, 'Inline stacks');
    DialStore.updateValues(id, {
      iteration: 'stacks',
      'typography.titleSize': 48,
      'spacing.topPadding': 96,
      'tiles.size': 60,
      'tiles.radius': 12,
      'tiles.iconSize': 24,
      'animation.autoTour': true,
      'animation.holdMs': 1300,
    });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    if (
      DialStore.getPresets(id).some((preset) => preset.name === 'Title + CTAs')
    )
      return;
    const previous = DialStore.getActivePresetId(id);
    DialStore.savePreset(id, 'Title + CTAs');
    DialStore.updateValues(id, {
      iteration: 'cta',
      'typography.titleSize': 48,
      'typography.headingSize': 18,
      'typography.labelSize': 15,
      'spacing.topPadding': 96,
      'spacing.sectionGap': 40,
      'spacing.headingGap': 16,
      'tiles.size': 60,
      'tiles.expandedWidth': 152,
      'tiles.gap': 8,
      'tiles.radius': 12,
      'tiles.iconSize': 24,
      'tools.size': 60,
      'tools.gap': 8,
      'tools.headingGap': 16,
      'animation.autoTour': true,
      'animation.holdMs': 1300,
      'animation.expandMs': 320,
    });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    if (
      DialStore.getPresets(id).some((preset) => preset.name === 'Feature strip')
    )
      return;
    const previous = DialStore.getActivePresetId(id);
    DialStore.savePreset(id, 'Feature strip');
    DialStore.updateValues(id, {
      iteration: 'strip',
      'typography.titleSize': 48,
      'typography.headingSize': 16,
      'typography.labelSize': 12,
      'spacing.topPadding': 96,
      'spacing.sectionGap': 40,
      'spacing.headingGap': 20,
      'tiles.size': 52,
      'tiles.gap': 8,
      'tiles.radius': 12,
      'tiles.iconSize': 24,
      'tools.size': 52,
      'tools.gap': 20,
      'tools.headingGap': 20,
      'animation.autoTour': true,
      'animation.holdMs': 1300,
      'animation.expandMs': 320,
    });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    const preset = DialStore.getPresets(id).find(
      (item) => item.name === 'Tilted tiles'
    );
    const migrationKey = 'nexus-tilted-defaults-180-v2';
    if (preset && localStorage.getItem(migrationKey)) return;
    const previous = DialStore.getActivePresetId(id);
    if (preset) DialStore.loadPreset(id, preset.id);
    else DialStore.savePreset(id, 'Tilted tiles');
    DialStore.updateValues(id, {
      iteration: 'tilted',
      'typography.titleSize': 48,
      'typography.headingSize': 16,
      'typography.labelSize': 16,
      'spacing.topPadding': 96,
      'spacing.sectionGap': 8,
      'spacing.headingGap': 8,
      'tiles.size': 72,
      'tiles.expandedWidth': 180,
      'tiles.gap': 8,
      'tiles.radius': 12,
      'tiles.iconSize': 24,
      'tools.size': 72,
      'tools.gap': 8,
      'tools.headingGap': 8,
      'animation.autoTour': true,
      'animation.holdMs': 1300,
      'animation.expandMs': 320,
      'wheel.depth': 150,
    });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
    localStorage.setItem(migrationKey, '1');
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    const preset = DialStore.getPresets(id).find(
      (item) => item.name === 'Vinyl stickers'
    );
    const migrationKey = 'nexus-vinyl-defaults-72-v1';
    if (preset && localStorage.getItem(migrationKey)) return;
    const previous = DialStore.getActivePresetId(id);
    if (preset) DialStore.loadPreset(id, preset.id);
    else DialStore.savePreset(id, 'Vinyl stickers');
    DialStore.updateValues(id, {
      iteration: 'vinyl',
      'typography.titleSize': 48,
      'typography.headingSize': 16,
      'typography.labelSize': 16,
      'spacing.topPadding': 96,
      'spacing.sectionGap': 8,
      'spacing.headingGap': 8,
      'tiles.size': 72,
      'tiles.expandedWidth': 148,
      'tiles.gap': 8,
      'tiles.radius': 12,
      'tiles.iconSize': 24,
      'tools.size': 72,
      'tools.gap': 8,
      'tools.headingGap': 8,
      'animation.autoTour': true,
      'animation.holdMs': 1300,
      'animation.expandMs': 320,
      'wheel.depth': 150,
    });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
    localStorage.setItem(migrationKey, '1');
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    const preset = DialStore.getPresets(id).find(
      (item) => item.name === 'Foil material study'
    );
    const migrationKey = 'nexus-foil-defaults-72-v1';
    if (preset && localStorage.getItem(migrationKey)) return;
    const previous = DialStore.getActivePresetId(id);
    if (preset) DialStore.loadPreset(id, preset.id);
    else DialStore.savePreset(id, 'Foil material study');
    DialStore.updateValues(id, {
      iteration: 'foil',
      'typography.titleSize': 48,
      'typography.headingSize': 16,
      'typography.labelSize': 16,
      'spacing.topPadding': 96,
      'spacing.sectionGap': 8,
      'spacing.headingGap': 8,
      'tiles.size': 72,
      'tiles.expandedWidth': 148,
      'tiles.gap': 8,
      'tiles.radius': 12,
      'tiles.iconSize': 24,
      'tools.size': 72,
      'tools.gap': 8,
      'tools.headingGap': 8,
      'animation.autoTour': true,
      'animation.holdMs': 1300,
      'animation.expandMs': 320,
      'wheel.depth': 150,
    });
    if (previous) DialStore.loadPreset(id, previous);
    else DialStore.clearActivePreset(id);
    localStorage.setItem(migrationKey, '1');
  }, []);
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    const active = DialStore.getPresets(id).find(
      (preset) => preset.id === DialStore.getActivePresetId(id)
    );
    const iteration = iterations.find(
      (item) => item.preset === (active?.name ?? null)
    );
    if (active && iteration)
      DialStore.updateValues(id, { iteration: iteration.value });
  }, []);
  const p = dial.values;
  useEffect(() => {
    const id = 'nexus-hero-studio-v1';
    let current;
    let switching = false;
    function select(value) {
      if (switching || current === value) return;
      const selected = iterations.find((item) => item.value === value);
      if (!selected) return;
      current = value;
      switching = true;
      const preset = DialStore.getPresets(id).find(
        (item) => item.name === selected.preset
      );
      if (preset) DialStore.loadPreset(id, preset.id);
      else DialStore.clearActivePreset(id);
      DialStore.updateValues(id, { iteration: value });
      const url = new URL(window.location.href);
      url.searchParams.set('iteration', value);
      window.history.replaceState(null, '', url);
      switching = false;
    }
    select(
      new URLSearchParams(window.location.search).get('iteration') ??
        DialStore.getPanel(id)?.values.iteration
    );
    return DialStore.subscribe(id, () =>
      select(DialStore.getPanel(id)?.values.iteration)
    );
  }, []);
  const Journey =
    {
      rotating: RotatingHeadlineJourney,
      'stacked-headlines': StackedHeadlineJourney,
      'scroll-headlines': ScrollHeadlineJourney,
      'tile-shuffle': TileShuffleJourney,
      'tilted-cta': TiltedCtaJourney,
      tilted: TiltedJourney,
      vinyl: VinylJourney,
      foil: FoilJourney,
      strip: FeatureStripJourney,
      cta: CtaJourney,
      headline: HeadlineJourney,
      stacks: InlineStacksJourney,
    }[p.iteration] ?? WorkbenchJourney;
  const originalPastels = useJourneyColors('light');
  const style = {
    ...Object.fromEntries(
      originalPastels.flatMap((colors, index) => [
        [`--original-paper-${index}`, colors['--paper']],
        [`--original-ink-${index}`, colors['--ink']],
      ])
    ),
    '--lab-title': `calc(var(--nx-typography-size-base) * ${p.typography.titleSize / 16})`,
    '--lab-heading': `calc(var(--nx-typography-size-base) * ${p.typography.headingSize / 16})`,
    '--lab-label': `calc(var(--nx-typography-size-base) * ${p.typography.labelSize / 16})`,
    '--lab-top': `calc(var(--nx-spacing-4) * ${p.spacing.topPadding / 16})`,
    '--lab-section': `calc(var(--nx-spacing-4) * ${p.spacing.sectionGap / 16})`,
    '--lab-heading-gap': `calc(var(--nx-spacing-4) * ${p.spacing.headingGap / 16})`,
    '--lab-tile': `calc(var(--nx-spacing-4) * ${p.tiles.size / 16})`,
    '--lab-expanded': `calc(var(--nx-spacing-4) * ${p.tiles.expandedWidth / 16})`,
    '--lab-gap': `calc(var(--nx-spacing-4) * ${p.tiles.gap / 16})`,
    '--lab-radius': 'var(--nx-radius-lg)',
    '--lab-icon': `calc(var(--nx-spacing-4) * ${p.tiles.iconSize / 16})`,
    '--lab-tool-heading-gap': `calc(var(--nx-spacing-4) * ${p.tools.headingGap / 16})`,
    '--lab-tool': `calc(var(--nx-spacing-4) * ${p.tools.size / 16})`,
    '--lab-tool-gap': `calc(var(--nx-spacing-4) * ${p.tools.gap / 16})`,
    '--lab-expand': `calc(var(--nx-motion-duration-default) * ${p.animation.expandMs / 200})`,
  };
  return (
    <>
      <div className="hero-lab" data-tile-palette={p.tilePalette} style={style}>
        <Journey
          {...ctaLinks}
          key={`${p.iteration}-${replay}`}
          mode={mode}
          compact={p.iteration === 'compact'}
          wheel={p.iteration === 'wheel'}
          tuning={{ ...p.animation, ...p.wheel, foil: p.foil }}
        >
          {p.iteration === 'strip'
            ? (featureStripContent ?? children)
            : children}
        </Journey>
      </div>
      <DialRoot position="top-right" theme={mode} productionEnabled />
    </>
  );
}
