import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';

import { useNxdsAppearance } from '.';

const meta = {
  title: 'Appearance/Plugin',
  render: () => ({
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
  }),
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
