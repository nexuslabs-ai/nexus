import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Switch } from '../../switch';

import { NexusAppearanceSettingRow } from './setting-row';

const meta: Meta<typeof NexusAppearanceSettingRow> = {
  title: 'Appearance/SettingRow',
  component: NexusAppearanceSettingRow,
  args: {
    label: 'Reduce motion',
    description: 'Shorten animations and transitions across the interface.',
    children: <Switch aria-label="Reduce motion" />,
  },
  decorators: [
    (Story) => (
      <div className="nx:w-[36rem] nx:max-w-full">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof NexusAppearanceSettingRow>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(args.label)).toBeInTheDocument();
    await expect(canvas.getByText(args.description!)).toBeInTheDocument();
    await expect(
      canvas.getByRole('switch', { name: 'Reduce motion' })
    ).toBeInTheDocument();
  },
};

export const WithoutDescription: Story = {
  args: { description: undefined },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector(
      '[data-slot="appearance-setting-row"]'
    );

    await expect(row).toBeInTheDocument();
    await expect(row?.querySelector('p')).toBeNull();
  },
};

export const LongContent: Story = {
  args: {
    label: 'Pointer cursors on every interactive control',
    description:
      'Show the pointer cursor on buttons, tabs, radios and links, so every control that responds to a click also looks clickable before you press it.',
  },
  decorators: [
    (Story) => (
      <div className="nx:w-52">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="appearance-setting-row"]'
    )!;

    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
  },
};

export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="appearance-setting-row"]')
    ).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:divide-y nx:divide-border-default">
      <NexusAppearanceSettingRow
        label="Reduce motion"
        description="Shorten animations and transitions."
      >
        <Switch aria-label="Reduce motion" />
      </NexusAppearanceSettingRow>
      <NexusAppearanceSettingRow label="Font smoothing">
        <Switch aria-label="Font smoothing" defaultChecked />
      </NexusAppearanceSettingRow>
    </div>
  ),
};
