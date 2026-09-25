import {
  CORNER_OPTIONS,
  DEFAULT_NEXUS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
} from '@nexus_ds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { NexusAppearanceProvider } from '../provider';

import { NexusAppearanceSettings } from './appearance-settings';

const meta: Meta<typeof NexusAppearanceSettings> = {
  title: 'Appearance/AppearanceSettings',
  component: NexusAppearanceSettings,
  decorators: [
    (Story) => (
      <NexusAppearanceProvider
        storageKey={false}
        defaultState={{
          ...DEFAULT_NEXUS_APPEARANCE,
        }}
      >
        <Story />
      </NexusAppearanceProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NexusAppearanceSettings>;

export const Default: Story = {};

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
