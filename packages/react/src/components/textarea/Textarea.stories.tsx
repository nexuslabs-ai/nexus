import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';
import { Label } from '../label/label';

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
    docs: {
      description: {
        component:
          'Textarea takes multi-line text, such as notes or a bio. It accepts every native textarea attribute. For a single line, use Input.',
      },
    },
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
      description: 'Bordered, or borderless with a tinted fill.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents editing.',
    },
    placeholder: {
      control: 'text',
      description: 'Hint shown while empty.',
    },
    rows: {
      control: 'number',
      description: 'Starting height, in lines of text.',
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

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
  args: {
    placeholder: 'Tell us about yourself...',
  },
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'A disabled textarea shows muted colors and blocks editing.',
      },
    },
  },
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `aria-invalid` to show an error border and error focus ring.',
      },
    },
  },
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
    await expect(invalid).toHaveClass('nx:aria-invalid:border-error-border');
    // The stroke is a real border now, so a borderless field keeps a
    // transparent one and the invalid state recolours it in place.
    const restStyles = window.getComputedStyle(empty);
    await expect(Number.parseFloat(restStyles.borderTopWidth)).toBeGreaterThan(
      0
    );
    await expect(restStyles.borderTopColor).toBe('rgba(0, 0, 0, 0)');

    const invalidStyles = window.getComputedStyle(invalid);
    await expect(
      Number.parseFloat(invalidStyles.borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(invalidStyles.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(invalidStyles.boxShadow).toBe('none');

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabled).not.toHaveClass(
      'nx:disabled:border-border-disabled'
    );
  },
};

export const WithLabel: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Link a Label to the textarea with `htmlFor` and `id`.',
      },
    },
  },
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Keep a character count in local state and link the helper text and count with `aria-describedby`.',
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
    await expect(textarea).toHaveClass('nx:bg-container');
    await expect(textarea).toHaveClass('nx:enabled:hover:bg-container-hover');
    await expectAutofillPaired(textarea);
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
