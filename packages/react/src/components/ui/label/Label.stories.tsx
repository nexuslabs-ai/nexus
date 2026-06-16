import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Input } from '../input';

import { Label } from './label';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  args: {
    children: 'Email',
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {};

export const WithInput: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    // The label dims when its `nx:peer` sibling control is disabled.
    <div className="nx:flex nx:items-center nx:gap-2">
      <input type="checkbox" id="terms" disabled className="nx:peer" />
      <Label htmlFor="terms">Accept terms</Label>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div className="nx:w-56">
      <Label>
        Notification preference for product updates and workspace activity
      </Label>
    </div>
  ),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ClickInteraction: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <Label htmlFor="click-email">Email address</Label>
      <Input id="click-email" type="email" placeholder="you@example.com" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email address');
    const input = canvas.getByRole('textbox');

    // Clicking the label moves focus to its associated control
    await expect(input).not.toHaveFocus();
    await userEvent.click(label);
    await expect(input).toHaveFocus();
  },
};

export const WithDataAttributes: Story = {
  args: {
    children: 'Field label',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Field label');

    await expect(label).toHaveAttribute('data-slot', 'label');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <Label>Default label</Label>

      <div className="nx:w-56">
        <Label>
          Notification preference for product updates and workspace activity
        </Label>
      </div>

      <Label>
        <input type="checkbox" aria-label="Nested checkbox" />
        With nested control
      </Label>

      <span className="nx:flex nx:items-center nx:gap-2">
        <input
          type="checkbox"
          disabled
          className="nx:peer"
          aria-label="Unavailable option"
        />
        <Label>Peer-disabled</Label>
      </span>
    </div>
  ),
};
