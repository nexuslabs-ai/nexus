import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useId } from 'vue';

import { Checkbox } from '../checkbox';
import { Input } from '../input';

import { Label } from '.';

const meta = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Label names a form control. Set `for` to the control's `id` so a click on the label focuses or toggles the control. Inside a Field, use FieldLabel.",
      },
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC STORIES
// ============================================

export const WithInput: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Input, Label },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <Label for="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Dim the label when the checkbox placed before it is disabled.',
      },
    },
  },
  // The label dims when its `nx:peer` sibling control is disabled.
  render: () => ({
    components: { Checkbox, Label },
    setup: () => ({ checkboxId: useId() }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Checkbox :id="checkboxId" disabled />
        <Label :for="checkboxId">Accept terms</Label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Accept terms');

    // Peer-disabled label uses a semantic text token at full opacity (not a fade).
    await expect(label).toHaveClass(
      'nx:peer-disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(label).opacity).toBe('1');
  },
};

export const LongContent: Story = {
  render: () => ({
    components: { Label },
    template: `
      <div class="nx:w-56">
        <Label>
          Notification preference for product updates and workspace activity
        </Label>
      </div>
    `,
  }),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ClickInteraction: Story = {
  render: () => ({
    components: { Input, Label },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <Label for="click-email">Email address</Label>
        <Input id="click-email" type="email" placeholder="you@example.com" />
      </div>
    `,
  }),
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
  render: () => ({
    components: { Label },
    template: '<Label>Field label</Label>',
  }),
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
  render: () => ({
    components: { Label },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <Label>Default label</Label>

        <div class="nx:w-56">
          <Label>
            Notification preference for product updates and workspace activity
          </Label>
        </div>

        <Label>
          <input type="checkbox" aria-label="Nested checkbox" />
          With nested control
        </Label>

        <span class="nx:flex nx:items-center nx:gap-2">
          <input
            type="checkbox"
            disabled
            class="nx:peer"
            aria-label="Unavailable option"
          />
          <Label>Peer-disabled</Label>
        </span>
      </div>
    `,
  }),
};
