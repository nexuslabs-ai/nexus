import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NxdsAppearanceMode,
  type NxdsAppearanceState,
  sanitizeNxdsAppearance,
  STROKE_OPTIONS,
} from '@nxds/core';
import type { Decorator, Preview } from '@storybook/react-vite';
import { useGlobals } from 'storybook/preview-api';

import { NxdsAppearanceProvider } from '../src/components/appearance/provider';

// Storybook needs the full token set to render. The shipped component CSS
// (src/index.css) is utilities-only by design — tokens come from the consumer's
// @nxds/tailwind — so Storybook loads them via preview.css (a CSS @import, so
// the production build can resolve @nxds/tailwind's .css package entry).
import './preview.css';

type AppearanceGlobalKey =
  | 'mode'
  | 'brandColor'
  | 'surfaceTone'
  | 'lightContrast'
  | 'darkContrast'
  | 'density'
  | 'corners'
  | 'elevation'
  | 'stroke'
  | 'uiFont'
  | 'codeFont'
  | 'uiFontSize'
  | 'codeFontSize'
  | 'reduceMotion'
  | 'pointerCursors'
  | 'fontSmoothing';

const APPEARANCE_GLOBAL_KEYS: AppearanceGlobalKey[] = [
  'mode',
  'brandColor',
  'surfaceTone',
  'lightContrast',
  'darkContrast',
  'density',
  'corners',
  'elevation',
  'stroke',
  'uiFont',
  'codeFont',
  'uiFontSize',
  'codeFontSize',
  'reduceMotion',
  'pointerCursors',
  'fontSmoothing',
];

const MODE_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'circlehollow' },
] as const satisfies readonly {
  value: NxdsAppearanceMode;
  label: string;
  icon: string;
}[];

function pickOption<const T extends readonly { value: string }[]>(
  value: unknown,
  options: T,
  fallback: T[number]['value']
): T[number]['value'] {
  return typeof value === 'string' &&
    options.some((option) => option.value === value)
    ? value
    : fallback;
}

function appearanceStateFromGlobals(
  globals: Record<string, unknown>
): NxdsAppearanceState {
  const defaults = DEFAULT_NXDS_APPEARANCE;
  const prefs = defaults.prefs;

  return sanitizeNxdsAppearance({
    ...defaults,
    mode: pickOption(globals.mode, MODE_OPTIONS, defaults.mode),
    brandColor:
      typeof globals.brandColor === 'string'
        ? globals.brandColor
        : defaults.brandColor,
    surfaceTone: pickOption(
      globals.surfaceTone,
      BASE_TONE_OPTIONS,
      defaults.surfaceTone
    ),
    lightContrast:
      typeof globals.lightContrast === 'number'
        ? globals.lightContrast
        : defaults.lightContrast,
    darkContrast:
      typeof globals.darkContrast === 'number'
        ? globals.darkContrast
        : defaults.darkContrast,
    density: pickOption(globals.density, DENSITY_OPTIONS, defaults.density),
    corners: pickOption(globals.corners, CORNER_OPTIONS, defaults.corners),
    elevation: pickOption(
      globals.elevation,
      ELEVATION_OPTIONS,
      defaults.elevation
    ),
    stroke: pickOption(globals.stroke, STROKE_OPTIONS, defaults.stroke),
    prefs: {
      uiFont:
        typeof globals.uiFont === 'string' ? globals.uiFont : prefs.uiFont,
      codeFont:
        typeof globals.codeFont === 'string'
          ? globals.codeFont
          : prefs.codeFont,
      uiFontSize:
        typeof globals.uiFontSize === 'number'
          ? globals.uiFontSize
          : prefs.uiFontSize,
      codeFontSize:
        typeof globals.codeFontSize === 'number'
          ? globals.codeFontSize
          : prefs.codeFontSize,
      reduceMotion:
        typeof globals.reduceMotion === 'boolean'
          ? globals.reduceMotion
          : prefs.reduceMotion,
      pointerCursors:
        typeof globals.pointerCursors === 'boolean'
          ? globals.pointerCursors
          : prefs.pointerCursors,
      fontSmoothing:
        typeof globals.fontSmoothing === 'boolean'
          ? globals.fontSmoothing
          : prefs.fontSmoothing,
    },
  });
}

function globalsFromAppearanceState(
  state: NxdsAppearanceState
): Record<AppearanceGlobalKey, string | number | boolean> {
  return {
    mode: state.mode,
    brandColor: state.brandColor,
    surfaceTone: state.surfaceTone,
    lightContrast: state.lightContrast,
    darkContrast: state.darkContrast,
    density: state.density,
    corners: state.corners,
    elevation: state.elevation,
    stroke: state.stroke,
    uiFont: state.prefs.uiFont,
    codeFont: state.prefs.codeFont,
    uiFontSize: state.prefs.uiFontSize,
    codeFontSize: state.prefs.codeFontSize,
    reduceMotion: state.prefs.reduceMotion,
    pointerCursors: state.prefs.pointerCursors,
    fontSmoothing: state.prefs.fontSmoothing,
  };
}

function appearanceStatesEqual(
  a: NxdsAppearanceState,
  b: NxdsAppearanceState
): boolean {
  const aGlobals = globalsFromAppearanceState(a);
  const bGlobals = globalsFromAppearanceState(b);

  return APPEARANCE_GLOBAL_KEYS.every((key) => aGlobals[key] === bGlobals[key]);
}

function toolbarItems<
  const T extends readonly { value: string; label: string }[],
>(options: T) {
  return options.map((option) => ({
    value: option.value,
    title: option.label,
  }));
}

const AppearanceDecorator: Decorator = (Story, context) => {
  const [globals, updateGlobals] = useGlobals();
  const isDocs = context.viewMode === 'docs';
  const globalsState = useMemo(
    () => appearanceStateFromGlobals(globals as Record<string, unknown>),
    [globals]
  );
  const [appearanceState, setAppearanceState] = useState(globalsState);

  useEffect(() => {
    setAppearanceState((current) =>
      appearanceStatesEqual(current, globalsState) ? current : globalsState
    );
  }, [globalsState]);

  const handleStateChange = useCallback(
    (nextState: NxdsAppearanceState) => {
      setAppearanceState(nextState);

      const nextGlobals = globalsFromAppearanceState(nextState);
      const changedGlobals: Partial<
        Record<AppearanceGlobalKey, string | number | boolean>
      > = {};

      for (const key of APPEARANCE_GLOBAL_KEYS) {
        if (globals[key] !== nextGlobals[key]) {
          changedGlobals[key] = nextGlobals[key];
        }
      }

      if (Object.keys(changedGlobals).length > 0) {
        updateGlobals(changedGlobals);
      }
    },
    [globals, updateGlobals]
  );

  return (
    <NxdsAppearanceProvider
      state={appearanceState}
      storageKey={false}
      onStateChange={handleStateChange}
    >
      <div
        className={`nx:flex nx:items-center nx:justify-center nx:bg-background nx:text-foreground nx:typography-body-default ${isDocs ? 'nx:py-12' : 'nx:min-h-svh'}`}
      >
        <Story />
      </div>
    </NxdsAppearanceProvider>
  );
};

const preview: Preview = {
  // Enable autodocs for all stories globally
  tags: ['autodocs'],
  parameters: {
    options: {
      storySort: {
        order: [
          'Components',
          'Appearance',
          'Blocks',
          'Patterns',
          'Primitives',
          'Tokens',
        ],
      },
    },
    // Enable Table of Contents for docs pages
    docs: {
      toc: {
        headingSelector: 'h2, h3',
        title: 'On this page',
      },
    },
    // A11y violations will fail tests automatically.
    // Color-contrast is APCA-gated via `pnpm audit:contrast`
    // (see `packages/core/src/lib/apca-pairs.ts`), not WCAG 2 — disable
    // axe-core's WCAG-based contrast rules so the two gates don't conflict.
    // Rules live in `options` as an id-keyed object: Storybook deep-merges
    // parameter objects but replaces arrays, so a story's own rules would
    // otherwise drop these global disables.
    a11y: {
      test: 'error',
      options: {
        rules: {
          'color-contrast': { enabled: false },
          'color-contrast-enhanced': { enabled: false },
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Disable Storybook's built-in background selector
    // Theme switching is handled by the decorator which applies
    // nx:bg-background class that uses CSS variables
    backgrounds: { disable: true },
    // Use fullscreen layout so our theme wrapper fills the entire canvas
    layout: 'fullscreen',
    viewport: {
      options: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
      },
    },
  },
  initialGlobals: {
    mode: DEFAULT_NXDS_APPEARANCE.mode,
    brandColor: DEFAULT_NXDS_APPEARANCE.brandColor,
    surfaceTone: DEFAULT_NXDS_APPEARANCE.surfaceTone,
    lightContrast: DEFAULT_NXDS_APPEARANCE.lightContrast,
    darkContrast: DEFAULT_NXDS_APPEARANCE.darkContrast,
    density: DEFAULT_NXDS_APPEARANCE.density,
    corners: DEFAULT_NXDS_APPEARANCE.corners,
    elevation: DEFAULT_NXDS_APPEARANCE.elevation,
    stroke: DEFAULT_NXDS_APPEARANCE.stroke,
    uiFont: DEFAULT_NXDS_APPEARANCE.prefs.uiFont,
    codeFont: DEFAULT_NXDS_APPEARANCE.prefs.codeFont,
    uiFontSize: DEFAULT_NXDS_APPEARANCE.prefs.uiFontSize,
    codeFontSize: DEFAULT_NXDS_APPEARANCE.prefs.codeFontSize,
    reduceMotion: DEFAULT_NXDS_APPEARANCE.prefs.reduceMotion,
    pointerCursors: DEFAULT_NXDS_APPEARANCE.prefs.pointerCursors,
    fontSmoothing: DEFAULT_NXDS_APPEARANCE.prefs.fontSmoothing,
  },
  globalTypes: {
    mode: {
      name: 'Mode',
      description: 'Appearance mode',
      toolbar: {
        icon: 'circlehollow',
        items: MODE_OPTIONS.map((option) => ({
          value: option.value,
          icon: option.icon,
          title: option.label,
        })),
        dynamicTitle: true,
      },
    },
    surfaceTone: {
      name: 'Surface',
      description: 'Neutral surface tone',
      toolbar: {
        icon: 'paintbrush',
        items: toolbarItems(BASE_TONE_OPTIONS),
        dynamicTitle: true,
      },
    },
    density: {
      name: 'Density',
      description: 'Spacing density',
      toolbar: {
        icon: 'expand',
        items: toolbarItems(DENSITY_OPTIONS),
        dynamicTitle: true,
      },
    },
    corners: {
      name: 'Corners',
      description: 'Corner radius mode',
      toolbar: {
        icon: 'circlehollow',
        items: toolbarItems(CORNER_OPTIONS),
        dynamicTitle: true,
      },
    },
    elevation: {
      name: 'Elevation',
      description: 'Shadow elevation mode',
      toolbar: {
        icon: 'contrast',
        items: toolbarItems(ELEVATION_OPTIONS),
        dynamicTitle: true,
      },
    },
    stroke: {
      name: 'Stroke',
      description: 'Border width mode',
      toolbar: {
        icon: 'outline',
        items: toolbarItems(STROKE_OPTIONS),
        dynamicTitle: true,
      },
    },
  },
  decorators: [AppearanceDecorator],
};

export default preview;
