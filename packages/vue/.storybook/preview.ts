import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NxdsAppearanceState,
  sanitizeNxdsAppearance,
  STROKE_OPTIONS,
} from '@nxds/core';
import { type Decorator, type Preview, setup } from '@storybook/vue3-vite';

import {
  createNxdsAppearance,
  useNxdsAppearance,
} from '../src/components/appearance';

import './preview.css';

setup((app) => {
  app.use(createNxdsAppearance({ storageKey: false }));
});

const MODE_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'circlehollow' },
] as const;

function toolbarItems(options: readonly { value: string; label: string }[]) {
  return options.map(({ value, label }) => ({ value, title: label }));
}

// The toolbar globals are sanitized by core, so an unknown value falls back
// to the default.
function appearanceStateFromGlobals(
  globals: Record<string, unknown>
): NxdsAppearanceState {
  return sanitizeNxdsAppearance({ ...DEFAULT_NXDS_APPEARANCE, ...globals });
}

const AppearanceDecorator: Decorator = (story, context) => ({
  components: { story },
  setup() {
    useNxdsAppearance().setState(appearanceStateFromGlobals(context.globals));
  },
  template:
    '<div class="nx:flex nx:min-h-svh nx:items-center nx:justify-center nx:bg-background nx:text-foreground nx:typography-body-default"><story /></div>',
});

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    // A11y violations fail tests. Contrast is APCA-gated by
    // `pnpm audit:contrast`, so axe's WCAG 2 contrast rules are off.
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
    backgrounds: { disable: true },
    layout: 'fullscreen',
  },
  initialGlobals: {
    mode: DEFAULT_NXDS_APPEARANCE.mode,
    surfaceTone: DEFAULT_NXDS_APPEARANCE.surfaceTone,
    density: DEFAULT_NXDS_APPEARANCE.density,
    corners: DEFAULT_NXDS_APPEARANCE.corners,
    elevation: DEFAULT_NXDS_APPEARANCE.elevation,
    stroke: DEFAULT_NXDS_APPEARANCE.stroke,
  },
  globalTypes: {
    mode: {
      name: 'Mode',
      toolbar: {
        icon: 'circlehollow',
        items: toolbarItems(MODE_OPTIONS),
        dynamicTitle: true,
      },
    },
    surfaceTone: {
      name: 'Surface',
      toolbar: {
        icon: 'paintbrush',
        items: toolbarItems(BASE_TONE_OPTIONS),
        dynamicTitle: true,
      },
    },
    density: {
      name: 'Density',
      toolbar: {
        icon: 'expand',
        items: toolbarItems(DENSITY_OPTIONS),
        dynamicTitle: true,
      },
    },
    corners: {
      name: 'Corners',
      toolbar: {
        icon: 'circlehollow',
        items: toolbarItems(CORNER_OPTIONS),
        dynamicTitle: true,
      },
    },
    elevation: {
      name: 'Elevation',
      toolbar: {
        icon: 'contrast',
        items: toolbarItems(ELEVATION_OPTIONS),
        dynamicTitle: true,
      },
    },
    stroke: {
      name: 'Stroke',
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
