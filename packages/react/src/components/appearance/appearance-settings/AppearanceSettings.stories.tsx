import { useState } from 'react';

import {
  BRAND_COLOR_PRESETS,
  CORNER_OPTIONS,
  createNxdsAppearanceSnapshotFromState,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
} from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../../button/button';
import { NxdsAppearanceProvider } from '../provider';

import { NxdsAppearanceSettings } from './appearance-settings';

const meta: Meta<typeof NxdsAppearanceSettings> = {
  title: 'Appearance/AppearanceSettings',
  component: NxdsAppearanceSettings,
  parameters: {
    docs: {
      description: {
        component:
          'NxdsAppearanceSettings is a full settings panel for theme, typography, layout feel and interaction preferences. Render it inside NxdsAppearanceProvider. For a compact popover, use NxdsThemeQuickControl.',
      },
    },
  },
  render: () => (
    <NxdsAppearanceProvider
      storageKey={false}
      defaultState={{
        ...DEFAULT_NXDS_APPEARANCE,
      }}
    >
      <NxdsAppearanceSettings />
    </NxdsAppearanceProvider>
  ),
};

export default meta;
type Story = StoryObj<typeof NxdsAppearanceSettings>;

export const Default: Story = {};

export const BrandPresets: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const preset = BRAND_COLOR_PRESETS.find(
      (option) => option.value === 'indigo'
    )!;
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Brand color preset' })
    );
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: preset.label })
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Brand color hex value' })
    ).toHaveValue(preset.color);
    await expect(
      canvas.getByText(`brandColor: "${preset.color}",`)
    ).toBeInTheDocument();
    const expected = createNxdsAppearanceSnapshotFromState({
      ...DEFAULT_NXDS_APPEARANCE,
      brandColor: preset.color,
    });
    await waitFor(() => {
      expect(
        document.querySelector('style[data-nxds-appearance-theme]')?.textContent
      ).toBe(expected.themeCss);
    });
  },
};

function SavedAppearanceExample({ storageKey }: { storageKey: string }) {
  const [revision, setRevision] = useState(0);
  return (
    <div className="nx:space-y-3">
      <Button onClick={() => setRevision((current) => current + 1)}>
        Reload saved appearance
      </Button>
      <NxdsAppearanceProvider key={revision} storageKey={storageKey}>
        <NxdsAppearanceSettings />
      </NxdsAppearanceProvider>
    </div>
  );
}

const SAVED_APPEARANCE_KEY = 'storybook-saved-brand';
const BLUE_PRESET = BRAND_COLOR_PRESETS.find(
  (preset) => preset.value === 'blue'
)!;

function saveBrandColor(brandColor: string) {
  localStorage.setItem(
    SAVED_APPEARANCE_KEY,
    JSON.stringify(
      createNxdsAppearanceSnapshotFromState({
        ...DEFAULT_NXDS_APPEARANCE,
        brandColor,
      })
    )
  );
}

async function expectRestoredBrandColor(
  canvasElement: HTMLElement,
  brandColor: string,
  label: string
) {
  const canvas = within(canvasElement);
  await waitFor(() => {
    expect(
      canvas.getByRole('textbox', { name: 'Brand color hex value' })
    ).toHaveValue(brandColor);
    expect(
      canvas.getByRole('combobox', { name: 'Brand color preset' })
    ).toHaveTextContent(label);
  });
  const restored = JSON.parse(localStorage.getItem(SAVED_APPEARANCE_KEY)!);
  await expect(restored.state).toEqual({
    ...DEFAULT_NXDS_APPEARANCE,
    brandColor,
  });
}

export const SavedPresetRestoration: Story = {
  beforeEach: () => {
    const previous = localStorage.getItem(SAVED_APPEARANCE_KEY);
    saveBrandColor(BLUE_PRESET.color.toUpperCase());
    return () => {
      if (previous === null) localStorage.removeItem(SAVED_APPEARANCE_KEY);
      else localStorage.setItem(SAVED_APPEARANCE_KEY, previous);
    };
  },
  render: () => <SavedAppearanceExample storageKey={SAVED_APPEARANCE_KEY} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reload = canvas.getByRole('button', {
      name: 'Reload saved appearance',
    });
    await expectRestoredBrandColor(
      canvasElement,
      BLUE_PRESET.color.toUpperCase(),
      BLUE_PRESET.label
    );

    for (const customColor of ['#95bf47', 'rgb(12 34 56)']) {
      saveBrandColor(customColor);
      await userEvent.click(reload);
      await expectRestoredBrandColor(canvasElement, customColor, 'Custom');
    }

    const next = BRAND_COLOR_PRESETS.find((preset) => preset.value === 'teal')!;
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Brand color preset' })
    );
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: next.label })
    );
    await waitFor(() => {
      expect(
        JSON.parse(localStorage.getItem(SAVED_APPEARANCE_KEY)!).state
      ).toEqual({
        ...DEFAULT_NXDS_APPEARANCE,
        brandColor: next.color,
      });
    });
    await userEvent.click(reload);
    await expectRestoredBrandColor(canvasElement, next.color, next.label);
  },
};

async function expectSelectOptions(
  canvasElement: HTMLElement,
  name: string,
  labels: readonly string[]
) {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox', { name });

  try {
    await userEvent.click(trigger);

    const listbox = await within(document.body).findByRole('listbox');
    for (const label of labels) {
      await expect(
        within(listbox).getByRole('option', { name: label })
      ).toBeInTheDocument();
    }
  } finally {
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });
  }
}

export const LayoutModeOptions: Story = {
  play: async ({ canvasElement }) => {
    await expectSelectOptions(
      canvasElement,
      'Density',
      DENSITY_OPTIONS.map((option) => option.label)
    );
    await expectSelectOptions(
      canvasElement,
      'Corners',
      CORNER_OPTIONS.map((option) => option.label)
    );
    await expectSelectOptions(
      canvasElement,
      'Elevation',
      ELEVATION_OPTIONS.map((option) => option.label)
    );
  },
};

export const ContrastSlider: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: 'Contrast' });
    await expect(canvas.getAllByRole('slider')).toHaveLength(1);
    await expect(
      canvas.getByText('Editing light appearance')
    ).toBeInTheDocument();
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
    slider.focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(slider).toHaveAttribute('aria-valuenow', '48');
    await expect(canvas.getByText('lightContrast: 48,')).toBeInTheDocument();
    await userEvent.keyboard('{Home}');
    await expect(slider).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    await expect(slider).toHaveAttribute('aria-valuenow', '100');
    await userEvent.click(canvas.getByRole('radio', { name: 'Dark' }));
    await expect(
      canvas.getByText('Editing dark appearance')
    ).toBeInTheDocument();
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByText('darkContrast: 51,')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('radio', { name: 'Light' }));
    await expect(slider).toHaveAttribute('aria-valuenow', '100');
  },
};

const DARK_QUERY = '(prefers-color-scheme: dark)';
let systemDark = false;
let systemMedia: MediaQueryList;

export const SystemContrast: Story = {
  beforeEach: () => {
    const originalMatchMedia = window.matchMedia;
    const events = new EventTarget();
    systemDark = false;
    systemMedia = {
      media: DARK_QUERY,
      get matches() {
        return systemDark;
      },
      onchange: null,
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
      dispatchEvent: events.dispatchEvent.bind(events),
      addListener: () => {},
      removeListener: () => {},
    };
    window.matchMedia = (query) =>
      query === DARK_QUERY
        ? systemMedia
        : originalMatchMedia.call(window, query);
    return () => {
      window.matchMedia = originalMatchMedia;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mode = within(canvas.getByLabelText('Mode'));
    await userEvent.click(mode.getByRole('radio', { name: 'System' }));
    await expect(
      canvas.getByText('Editing light appearance')
    ).toBeInTheDocument();
    const slider = canvas.getByRole('slider', { name: 'Contrast' });
    slider.focus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByText('lightContrast: 100,')).toBeInTheDocument();
    await expect(canvas.getByText('darkContrast: 50,')).toBeInTheDocument();
    systemDark = true;
    systemMedia.dispatchEvent(
      new MediaQueryListEvent('change', { matches: true, media: DARK_QUERY })
    );
    await waitFor(() =>
      expect(canvas.getByText('Editing dark appearance')).toBeInTheDocument()
    );
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByText('darkContrast: 51,')).toBeInTheDocument();
    await expect(canvas.getByText('lightContrast: 100,')).toBeInTheDocument();
    systemDark = false;
    systemMedia.dispatchEvent(
      new MediaQueryListEvent('change', { matches: false, media: DARK_QUERY })
    );
    await waitFor(() =>
      expect(canvas.getByText('Editing light appearance')).toBeInTheDocument()
    );
    await expect(slider).toHaveAttribute('aria-valuenow', '100');
  },
};
