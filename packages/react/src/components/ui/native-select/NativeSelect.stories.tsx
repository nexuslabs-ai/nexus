import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from './native-select';

const meta: Meta<typeof NativeSelect> = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

// A basic select with a styled closed trigger; the open list is OS-rendered.
export const Default: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" defaultValue="pro">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
      <NativeSelectOption value="team">Team</NativeSelectOption>
    </NativeSelect>
  ),
};

// Both sizes: the default control height and the dense `sm`.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <NativeSelect size="default" aria-label="Default size" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect size="sm" aria-label="Small size" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

// Grouped options via optgroup.
export const WithOptGroups: Story = {
  render: () => (
    <NativeSelect aria-label="Timezone" defaultValue="pst">
      <NativeSelectOptGroup label="Americas">
        <NativeSelectOption value="pst">Pacific</NativeSelectOption>
        <NativeSelectOption value="est">Eastern</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Europe">
        <NativeSelectOption value="gmt">London</NativeSelectOption>
        <NativeSelectOption value="cet">Berlin</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};

// Invalid state — error border + error focus ring.
export const Invalid: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" aria-invalid defaultValue="free">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
    </NativeSelect>
  ),
};

// Disabled — semantic disabled tokens on the select and chevron.
export const Disabled: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" defaultValue="free" disabled>
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
    </NativeSelect>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Plan' });
    await expect(select).toBeDisabled();
    await expect(select).toHaveClass('nx:disabled:border-border-disabled');
    await expect(select).toHaveClass('nx:disabled:bg-disabled');
    await expect(select).toHaveClass('nx:disabled:text-disabled-foreground');

    const icon = canvasElement.querySelector(
      '[data-slot="native-select-icon"]'
    );
    await expect(icon).toHaveClass(
      'nx:group-has-[select:disabled]/native-select:text-disabled-foreground'
    );
  },
};

// Selecting an option updates the value and fires onChange.
export const ClickInteraction: Story = {
  args: { onChange: fn() },
  render: (args) => (
    <NativeSelect
      aria-label="Plan"
      defaultValue="free"
      onChange={args.onChange}
    >
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
      <NativeSelectOption value="team">Team</NativeSelectOption>
    </NativeSelect>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Plan' });
    await userEvent.selectOptions(select, 'pro');
    await expect(select).toHaveValue('pro');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

// The select is keyboard-reachable via Tab.
export const KeyboardInteraction: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" defaultValue="free">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
    </NativeSelect>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Plan' });
    await userEvent.tab();
    await expect(select).toHaveFocus();
  },
};

// The wrapper, control, and icon carry data-slot hooks; the control carries data-size.
export const WithDataAttributes: Story = {
  render: () => (
    <NativeSelect aria-label="Plan" defaultValue="free">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
    </NativeSelect>
  ),
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('[data-slot="native-select"]');
    await expect(select).toBeInTheDocument();
    await expect(select).toHaveAttribute('data-size', 'default');
    await expect(
      canvasElement.querySelector('[data-slot="native-select-wrapper"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="native-select-icon"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Default, small, invalid, and disabled side by side. Reused by the per-base
// variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <NativeSelect size="default" aria-label="Default" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect size="sm" aria-label="Small" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Invalid" aria-invalid defaultValue="free">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Disabled" defaultValue="free" disabled>
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};
