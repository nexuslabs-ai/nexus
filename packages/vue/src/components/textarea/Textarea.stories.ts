import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ref, useId } from 'vue';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';
import { Label } from '../label';

import { Textarea } from '.';

// Native attributes fall through to the `<textarea>`, so they are not declared props.
type TextareaArgs = InstanceType<typeof Textarea>['$props'] & {
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  onFocus?: () => void;
  onBlur?: () => void;
};

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="nx:w-[400px]"><story /></div>',
    }),
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
    'onUpdate:modelValue': fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['bordered', 'borderless'],
      description: 'Bordered, or borderless with a tinted fill.',
    },
  },
  render: (args) => ({
    components: { Textarea },
    setup: () => ({ args }),
    template: '<Textarea v-bind="args" />',
  }),
} satisfies Meta<TextareaArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Textarea },
    template: `
      <Textarea placeholder="Tell us about yourself..." />
    `,
  }),
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
  render: () => ({
    components: { Textarea },
    template: `
      <Textarea placeholder="Cannot edit this" disabled />
    `,
  }),
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
  render: () => ({
    components: { Textarea },
    template: `
      <Textarea default-value="Too short" aria-invalid="true" aria-label="Invalid bio" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');

    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
  },
};

export const BorderlessStates: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div class="nx:flex nx:w-[400px] nx:flex-col nx:gap-3">
        <Textarea
          data-testid="textarea-borderless-empty"
          variant="borderless"
          placeholder="Placeholder text"
        />
        <Textarea
          data-testid="textarea-borderless-filled"
          variant="borderless"
          default-value="Filled value spanning a couple of lines."
          aria-label="Filled borderless textarea"
        />
        <Textarea
          data-testid="textarea-borderless-readonly"
          variant="borderless"
          default-value="Read-only notes"
          aria-label="Read-only borderless textarea"
          readonly
        />
        <Textarea
          data-testid="textarea-borderless-invalid"
          variant="borderless"
          default-value="Too short"
          aria-invalid="true"
          aria-label="Invalid borderless textarea"
        />
        <Textarea
          data-testid="textarea-borderless-disabled"
          variant="borderless"
          placeholder="Disabled"
          disabled
        />
      </div>
    `,
  }),
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
    // A borderless field keeps a transparent border, and the invalid state
    // recolours it in place.
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
        story: 'Link a Label to the textarea with `for` and `id`.',
      },
    },
  },
  render: () => ({
    components: { Label, Textarea },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <Label for="textarea-bio">Bio</Label>
        <Textarea id="textarea-bio" placeholder="A few words about you" />
      </div>
    `,
  }),
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
          'Bind the value with `v-model` and link the helper text and count with `aria-describedby`.',
      },
    },
  },
  render: () => ({
    components: { Label, Textarea },
    setup: () => ({
      textareaId: useId(),
      descriptionId: useId(),
      counterId: useId(),
      note: ref('Shipped keyboard fixes and updated the empty state copy.'),
    }),
    template: `
      <div class="nx:grid nx:gap-2">
        <Label :for="textareaId">Release note</Label>
        <Textarea
          :id="textareaId"
          v-model="note"
          :aria-describedby="descriptionId + ' ' + counterId"
          :maxlength="160"
        />
        <div class="nx:flex nx:items-start nx:justify-between nx:gap-3">
          <p
            :id="descriptionId"
            class="nx:typography-body-small nx:text-muted-foreground"
          >
            Keep the note short enough for the activity feed.
          </p>
          <p
            :id="counterId"
            class="nx:shrink-0 nx:typography-body-small nx:text-muted-foreground"
          >
            {{ note.length }} / 160 characters
          </p>
        </div>
      </div>
    `,
  }),
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
    await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
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

export const VModel: Story = {
  render: () => ({
    components: { Label, Textarea },
    setup: () => ({ bio: ref('') }),
    template: `
      <div class="nx:grid nx:gap-1.5">
        <Label for="vmodel-bio">Bio</Label>
        <Textarea id="vmodel-bio" v-model="bio" />
        <p>{{ bio.length }} characters</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('textbox'), 'Hello');
    await expect(canvas.getByText('5 characters')).toBeVisible();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8 nx:w-[400px]">
        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Variants
          </h3>
          <div class="nx:flex nx:flex-col nx:gap-3">
            <div class="nx:flex nx:items-start nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-20 nx:pt-2">
                bordered
              </span>
              <Textarea placeholder="Bordered textarea" />
            </div>
            <div class="nx:flex nx:items-start nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-20 nx:pt-2">
                borderless
              </span>
              <Textarea variant="borderless" placeholder="Borderless textarea" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            States
          </h3>
          <div class="nx:flex nx:flex-col nx:gap-3">
            <div class="nx:flex nx:items-start nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
                empty
              </span>
              <Textarea placeholder="Placeholder text" />
            </div>
            <div class="nx:flex nx:items-start nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
                filled
              </span>
              <Textarea
                default-value="Filled value spanning a couple of lines so the multi-line shape is visible."
                aria-label="Filled textarea"
              />
            </div>
            <div class="nx:flex nx:items-start nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
                disabled
              </span>
              <Textarea placeholder="Disabled" disabled />
            </div>
            <div class="nx:flex nx:items-start nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
                invalid
              </span>
              <Textarea
                default-value="Invalid value"
                aria-invalid="true"
                aria-label="Invalid textarea"
              />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
  },
};
