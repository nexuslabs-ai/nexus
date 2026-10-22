import { DEFAULT_NXDS_APPEARANCE, type NxdsAppearanceState } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { createApp, ref } from 'vue';

import { Button } from '../button';

import {
  createNxdsAppearance,
  type NxdsAppearance,
  useNxdsAppearance,
} from '.';

const AppearanceControls = {
  components: { Button },
  setup() {
    const appearance = useNxdsAppearance();
    const update = (patch: Record<string, string>) =>
      appearance.setState((previous) => ({ ...previous, ...patch }));
    return { appearance, update };
  },
  template: `
    <div class="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <div class="nx:flex nx:gap-2">
        <Button variant="outline" @click="update({ mode: 'dark' })">Dark</Button>
        <Button variant="outline" @click="update({ brandColor: '#2563eb' })">Blue brand</Button>
        <Button variant="outline" @click="update({ corners: 'round' })">Round corners</Button>
        <Button variant="outline" @click="appearance.reset()">Reset</Button>
      </div>
      <p class="nx:m-0">Resolved mode: {{ appearance.resolvedMode.value }}</p>
    </div>
  `,
};

const meta = {
  title: 'Appearance/Plugin',
  render: () => AppearanceControls,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const themeCss = () =>
  document.querySelector('style[data-nxds-appearance-theme]')?.textContent;

export const AppliesThemeToPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement;

    await expect(root).not.toHaveClass('dark');
    await expect(themeCss()).toBeTruthy();

    await userEvent.click(canvas.getByRole('button', { name: 'Dark' }));
    await waitFor(() => expect(root).toHaveClass('dark'));
    await expect(canvas.getByText('Resolved mode: dark')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Round corners' })
    );
    await waitFor(() => expect(root).toHaveAttribute('data-radius', 'round'));

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(root).not.toHaveClass('dark'));
  },
};

export const BrandColorRederivesTheme: Story = {
  play: async ({ canvasElement }) => {
    const before = themeCss();

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Blue brand' })
    );
    await waitFor(() => expect(themeCss()).not.toBe(before));
    await expect(
      document.querySelectorAll('style[data-nxds-appearance-theme]')
    ).toHaveLength(1);
  },
};

const CONTROLLED_STORAGE_KEY = 'nxds-appearance-controlled-story';

// The story renders in the preview's app, so this is the preview's appearance.
// Unmounting the second app removes it from the document, so the play re-applies it.
let previewAppearance: NxdsAppearance | undefined;

export const ControlledState: Story = {
  render: () => ({
    setup() {
      previewAppearance = useNxdsAppearance();
    },
    template: '<div data-testid="controlled-app" />',
  }),
  play: async ({ canvasElement }) => {
    const preview = previewAppearance;
    if (!preview) {
      throw new Error(
        'ControlledState render did not capture the preview appearance.'
      );
    }
    const host = within(canvasElement).getByTestId('controlled-app');
    const state = ref<NxdsAppearanceState>(DEFAULT_NXDS_APPEARANCE);
    const onStateChange = fn();
    const app = createApp(AppearanceControls).use(
      createNxdsAppearance({
        storageKey: CONTROLLED_STORAGE_KEY,
        state,
        onStateChange,
      })
    );
    app.mount(host);
    const controls = within(host);

    try {
      await userEvent.click(controls.getByRole('button', { name: 'Dark' }));
      await expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'dark' })
      );
      await expect(controls.getByText('Resolved mode: light')).toBeVisible();
      await expect(localStorage.getItem(CONTROLLED_STORAGE_KEY)).toBeNull();

      state.value = { ...state.value, mode: 'dark' };
      await waitFor(() =>
        expect(controls.getByText('Resolved mode: dark')).toBeVisible()
      );
    } finally {
      app.unmount();
      preview.setState(preview.state.value);
    }
  },
};
