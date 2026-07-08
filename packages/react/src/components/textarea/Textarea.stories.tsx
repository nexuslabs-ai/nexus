import * as React from 'react';

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
    variant: {
      control: 'select',
      options: ['bordered', 'borderless'],
      description: 'The visual treatment of the textarea',
    },
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

function CharacterCounterTextarea() {
  const textareaId = React.useId();
  const descriptionId = React.useId();
  const counterId = React.useId();
  const maxLength = 160;
  const [value, setValue] = React.useState(
    'Shipped keyboard fixes and updated the empty state copy.'
  );

  return (
    <div className="nx:grid nx:gap-2">
      <Label htmlFor={textareaId}>Release note</Label>
      <Textarea
        id={textareaId}
        aria-describedby={`${descriptionId} ${counterId}`}
        value={value}
        maxLength={maxLength}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <div className="nx:flex nx:items-start nx:justify-between nx:gap-3">
        <p
          id={descriptionId}
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          Keep the note short enough for the activity feed.
        </p>
        <p
          id={counterId}
          className="nx:shrink-0 nx:typography-body-small nx:text-muted-foreground"
        >
          {value.length} / {maxLength} characters
        </p>
      </div>
    </div>
  );
}

function WordCounterTextarea() {
  const textareaId = React.useId();
  const descriptionId = React.useId();
  const counterId = React.useId();
  const [value, setValue] = React.useState(
    'Summarize the customer outcome and the next decision.'
  );
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="nx:grid nx:gap-2">
      <Label htmlFor={textareaId}>Executive summary</Label>
      <Textarea
        id={textareaId}
        aria-describedby={`${descriptionId} ${counterId}`}
        value={value}
        rows={5}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <div className="nx:flex nx:items-start nx:justify-between nx:gap-3">
        <p
          id={descriptionId}
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          Aim for one short paragraph.
        </p>
        <p
          id={counterId}
          className="nx:shrink-0 nx:typography-body-small nx:text-muted-foreground"
        >
          {wordCount} words
        </p>
      </div>
    </div>
  );
}

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
    await expect(textarea).toHaveClass('nx:disabled:border-border-disabled');
    await expect(textarea).toHaveClass('nx:disabled:bg-disabled');
    await expect(textarea).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(textarea).toHaveClass(
      'nx:disabled:placeholder:text-disabled-foreground'
    );
    await expect(window.getComputedStyle(textarea).opacity).toBe('1');
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

export const BorderlessStates: Story = {
  render: () => (
    <div className="nx:flex nx:w-[400px] nx:flex-col nx:gap-3">
      <Textarea
        data-testid="textarea-borderless-empty"
        variant="borderless"
        placeholder="Placeholder text"
      />
      <Textarea
        data-testid="textarea-borderless-filled"
        variant="borderless"
        defaultValue="Filled value spanning a couple of lines."
        aria-label="Filled borderless textarea"
      />
      <Textarea
        data-testid="textarea-borderless-readonly"
        variant="borderless"
        defaultValue="Read-only notes"
        aria-label="Read-only borderless textarea"
        readOnly
      />
      <Textarea
        data-testid="textarea-borderless-invalid"
        variant="borderless"
        defaultValue="Too short"
        aria-invalid
        aria-label="Invalid borderless textarea"
      />
      <Textarea
        data-testid="textarea-borderless-disabled"
        variant="borderless"
        placeholder="Disabled"
        disabled
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('textarea-borderless-empty');
    const readOnly = canvas.getByTestId('textarea-borderless-readonly');
    const invalid = canvas.getByTestId('textarea-borderless-invalid');
    const disabled = canvas.getByTestId('textarea-borderless-disabled');

    await expect(empty).toHaveAttribute('data-variant', 'borderless');
    await expect(empty).toHaveClass('nx:border-transparent');
    await expect(empty).toHaveClass('nx:bg-control-background');
    await expect(empty).toHaveClass(
      'nx:enabled:hover:bg-control-background-hover'
    );

    await expect(readOnly).toHaveAttribute('readonly');
    await expect(readOnly).not.toBeDisabled();

    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(invalid).toHaveClass('nx:aria-invalid:border-border-error');
    await expect(window.getComputedStyle(invalid).borderTopWidth).toBe('0px');
    await expect(window.getComputedStyle(invalid).boxShadow).not.toBe('none');

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabled).not.toHaveClass(
      'nx:disabled:border-border-disabled'
    );
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

export const CharacterCounter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Character counters are story-local composition: keep the count in local state and connect both helper text and counter with `aria-describedby`.',
      },
    },
  },
  render: () => <CharacterCounterTextarea />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText('Release note');
    const counter = canvas.getByText(/characters$/);

    await expect(textarea).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(counter.id)
    );
    await expect(counter).toHaveTextContent('characters');
  },
};

export const WordCounter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Word counters follow the same pattern as character counters: local story state, visible count, and `aria-describedby` on the textarea.',
      },
    },
  },
  render: () => <WordCounterTextarea />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText('Executive summary');
    const counter = canvas.getByText(/words$/);

    await expect(textarea).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(counter.id)
    );
    await expect(counter).toHaveTextContent('words');
  },
};

export const ResizeGuidance: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Textarea accepts native textarea attributes and className overrides. Use `rows` for the initial height and `nx:resize-y` when standalone vertical resizing is useful; InputGroupTextarea keeps `resize-none` so the grouped frame stays stable.',
      },
    },
  },
  render: () => (
    <div className="nx:grid nx:gap-2">
      <Label htmlFor="textarea-resize">Resizable notes</Label>
      <Textarea
        id="textarea-resize"
        rows={5}
        className="nx:resize-y"
        placeholder="Drag the bottom edge to resize vertically."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Resizable notes')).toHaveClass(
      'nx:resize-y'
    );
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
    await expect(textarea).toHaveAttribute('data-variant', 'bordered');
    await expect(textarea).toHaveClass('nx:enabled:hover:bg-background-hover');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:w-[400px]">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Variants
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-20 nx:pt-2">
              bordered
            </span>
            <Textarea placeholder="Bordered textarea" />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-20 nx:pt-2">
              borderless
            </span>
            <Textarea variant="borderless" placeholder="Borderless textarea" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          States
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
              empty
            </span>
            <Textarea placeholder="Placeholder text" />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
              filled
            </span>
            <Textarea
              defaultValue="Filled value spanning a couple of lines so the multi-line shape is visible."
              aria-label="Filled textarea"
            />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
              disabled
            </span>
            <Textarea placeholder="Disabled" disabled />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
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
