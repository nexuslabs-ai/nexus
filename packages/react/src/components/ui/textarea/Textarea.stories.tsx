import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Label } from '../label';

import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  decorators: [
    (Story) => (
      <div className="nx:w-[400px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    rows: {
      control: 'number',
      description: 'Visible number of text lines',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  args: {
    placeholder: 'Tell us about yourself...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'The quick brown fox jumps over the lazy dog.',
    'aria-label': 'Textarea with value',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Cannot edit this',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');

    await expect(textarea).toBeDisabled();
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: 'Too short',
    'aria-invalid': true,
    'aria-label': 'Invalid bio',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');

    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <Label htmlFor="textarea-bio">Bio</Label>
      <Textarea
        id="textarea-bio"
        placeholder="A few words about you"
        {...args}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText('Bio');

    await expect(textarea).toBeInTheDocument();
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const TypeInteraction: Story = {
  args: {
    placeholder: 'Type here...',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');

    await userEvent.type(textarea, 'Hello\nWorld');

    await expect(textarea).toHaveValue('Hello\nWorld');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const FocusBlurInteraction: Story = {
  args: {
    placeholder: 'Focus me...',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');

    await userEvent.click(textarea);
    await expect(textarea).toHaveFocus();
    await expect(args.onFocus).toHaveBeenCalled();

    await userEvent.tab();
    await expect(textarea).not.toHaveFocus();
    await expect(args.onBlur).toHaveBeenCalled();
  },
};

export const WithDataAttributes: Story = {
  args: {
    placeholder: 'Test textarea',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');

    await expect(textarea).toHaveAttribute('data-slot', 'textarea');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:w-[400px]">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          States
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16 nx:pt-2">
              empty
            </span>
            <Textarea placeholder="Placeholder text" />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16 nx:pt-2">
              filled
            </span>
            <Textarea
              defaultValue="Filled value spanning a couple of lines so the multi-line shape is visible."
              aria-label="Filled textarea"
            />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16 nx:pt-2">
              disabled
            </span>
            <Textarea placeholder="Disabled" disabled />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16 nx:pt-2">
              invalid
            </span>
            <Textarea
              defaultValue="Invalid value"
              aria-invalid
              aria-label="Invalid textarea"
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
