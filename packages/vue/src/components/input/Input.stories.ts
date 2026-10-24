import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ref, useId } from 'vue';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';
import { Label } from '../label';

import { Input } from '.';

// Native attributes fall through to the `<input>`, so they are not declared props.
type InputArgs = InstanceType<typeof Input>['$props'] & {
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

const meta = {
  title: 'Components/Input',
  component: Input,
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
          'Input collects one line of text. Give every input a visible label or an `aria-label`. For several lines of text, use Textarea.',
      },
    },
  },
  args: {
    'onUpdate:modelValue': fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'Field size.',
    },
    variant: {
      control: 'select',
      options: ['bordered', 'borderless', 'ghost'],
      description: 'Stroke and fill treatment.',
    },
  },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args }),
    template: '<Input v-bind="args" />',
  }),
} satisfies Meta<InputArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Play functions can't put an element in a real `:hover` state, so this reads
// the border colours that `:hover` rules would apply to the element if it were
// hovered. Nested rules resolve `&` against their parent selector.
function hoverBorderColors(element: Element) {
  const unescapedHover = /(?<!\\):hover/g;
  const colors: string[] = [];

  function visit(rules: CSSRuleList, parent: string) {
    for (const rule of rules) {
      const selector =
        rule instanceof CSSStyleRule
          ? rule.selectorText.replace(/(?<!\\)&/g, `:is(${parent})`)
          : parent;
      const color =
        (rule instanceof CSSStyleRule ||
          rule instanceof CSSNestedDeclarations) &&
        rule.style.getPropertyValue('border-color');
      const unhovered = selector.replace(unescapedHover, '');
      if (color && unhovered !== selector && element.matches(unhovered)) {
        colors.push(color);
      }
      if (rule instanceof CSSGroupingRule || rule instanceof CSSStyleRule) {
        visit(rule.cssRules, selector);
      }
    }
  }

  for (const sheet of document.styleSheets) visit(sheet.cssRules, '');
  return colors;
}

// ============================================
// TYPE STORIES
// ============================================

export const TypeEmail: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Input },
    template: `
      <Input type="email" placeholder="email@example.com" />
    `,
  }),
};

export const WithLabel: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Link a Label to the input with `for` and a matching `id`.',
      },
    },
  },
  render: () => ({
    components: { Input, Label },
    setup: () => ({ inputId: useId() }),
    template: `
      <div class="nx:grid nx:gap-1.5">
        <Label :for="inputId">Full name</Label>
        <Input :id="inputId" placeholder="Ada Lovelace" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `disabled` to block editing and dim the field.',
      },
    },
  },
  render: () => ({
    components: { Input },
    template: `
      <Input placeholder="Disabled input" disabled />
    `,
  }),
};

export const Invalid: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `aria-invalid` to show the error border.',
      },
    },
  },
  render: () => ({
    components: { Input },
    template: `
      <Input default-value="invalid@" aria-invalid="true" aria-label="Invalid email" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

export const BorderlessStates: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div class="nx:flex nx:w-[400px] nx:flex-col nx:gap-3">
        <Input
          data-testid="input-borderless-empty"
          variant="borderless"
          placeholder="Placeholder text"
        />
        <Input
          data-testid="input-borderless-filled"
          variant="borderless"
          default-value="Filled value"
          aria-label="Filled borderless input"
        />
        <Input
          data-testid="input-borderless-readonly"
          variant="borderless"
          default-value="acct_1024"
          aria-label="Read-only borderless input"
          readonly
        />
        <Input
          data-testid="input-borderless-invalid"
          variant="borderless"
          default-value="invalid@"
          aria-invalid="true"
          aria-label="Invalid borderless input"
        />
        <Input
          data-testid="input-borderless-disabled"
          variant="borderless"
          placeholder="Disabled"
          disabled
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('input-borderless-empty');
    const readOnly = canvas.getByTestId('input-borderless-readonly');
    const invalid = canvas.getByTestId('input-borderless-invalid');
    const disabled = canvas.getByTestId('input-borderless-disabled');

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

export const GhostStates: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div class="nx:flex nx:w-[400px] nx:flex-col nx:gap-3">
        <Input
          data-testid="input-ghost-filled"
          variant="ghost"
          default-value="Quarterly planning"
          aria-label="Filled ghost input"
        />
        <Input
          data-testid="input-ghost-invalid"
          variant="ghost"
          default-value="invalid@"
          aria-invalid="true"
          aria-label="Invalid ghost input"
        />
        <Input
          data-testid="input-ghost-disabled"
          variant="ghost"
          placeholder="Disabled"
          disabled
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const filled = canvas.getByTestId('input-ghost-filled');
    const invalid = canvas.getByTestId('input-ghost-invalid');

    await expect(filled).toHaveAttribute('data-variant', 'ghost');
    const rest = window.getComputedStyle(filled);
    await expect(rest.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    await expect(rest.backgroundColor).toBe('rgba(0, 0, 0, 0)');

    await expect(hoverBorderColors(filled)).toEqual([
      'var(--nx-color-border-default)',
    ]);

    await expect(window.getComputedStyle(invalid).borderTopColor).not.toBe(
      'rgba(0, 0, 0, 0)'
    );
    await expect(hoverBorderColors(invalid)).toHaveLength(0);

    filled.focus();
    await expect(filled).toHaveFocus();
    await expect(hoverBorderColors(filled)).toHaveLength(0);

    await expect(canvas.getByTestId('input-ghost-disabled')).toBeDisabled();
  },
};

export const ReadOnlyVsDisabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A read-only field stays focusable and submits with the form. A disabled field does neither. Read-only looks editable, so add helper text.',
      },
    },
  },
  render: () => ({
    components: { Input },
    template: `
      <div class="nx:flex nx:w-[400px] nx:flex-col nx:gap-4">
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">
            Read-only
          </span>
          <Input
            aria-label="Read-only account id"
            aria-describedby="input-readonly-note"
            default-value="acct_1024"
            readonly
          />
          <p
            id="input-readonly-note"
            class="nx:typography-body-small nx:text-muted-foreground"
          >
            Value can be selected and submitted, but not edited here.
          </p>
        </div>
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">
            Disabled
          </span>
          <Input
            aria-label="Disabled account id"
            aria-describedby="input-disabled-note"
            default-value="acct_1024"
            disabled
          />
          <p
            id="input-disabled-note"
            class="nx:typography-body-small nx:text-muted-foreground"
          >
            Value is unavailable and should not be submitted from this control.
          </p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const readOnly = canvas.getByRole('textbox', {
      name: 'Read-only account id',
    });
    const disabled = canvas.getByRole('textbox', {
      name: 'Disabled account id',
    });

    await expect(readOnly).toHaveAttribute('readonly');
    await expect(readOnly).not.toBeDisabled();
    await expect(disabled).toBeDisabled();
  },
};

export const WarningVsError: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Don't set `aria-invalid` for a warning. For an error, set it and link the error message.",
      },
    },
  },
  render: () => ({
    components: { Input },
    template: `
      <div class="nx:flex nx:w-[400px] nx:flex-col nx:gap-4">
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">
            Warning
          </span>
          <Input
            aria-label="Warning budget"
            aria-describedby="input-warning-message"
            default-value="95"
            class="nx:border-warning-border"
          />
          <p
            id="input-warning-message"
            class="nx:typography-body-small nx:text-warning-subtle-foreground"
          >
            Near the monthly limit. You can continue.
          </p>
        </div>
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">
            Error
          </span>
          <Input
            aria-label="Invalid budget"
            aria-describedby="input-error-help"
            aria-errormessage="input-error-message"
            aria-invalid="true"
            default-value="125"
          />
          <p
            id="input-error-help"
            class="nx:typography-body-small nx:text-muted-foreground"
          >
            Enter a value from 0 to 100.
          </p>
          <p
            id="input-error-message"
            role="alert"
            class="nx:typography-body-small nx:text-error-subtle-foreground"
          >
            Budget cannot exceed 100.
          </p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const warning = canvas.getByRole('textbox', { name: 'Warning budget' });
    const error = canvas.getByRole('textbox', { name: 'Invalid budget' });

    await expect(warning).not.toHaveAttribute('aria-invalid');
    await expect(warning).toHaveAttribute(
      'aria-describedby',
      'input-warning-message'
    );
    await expect(error).toHaveAttribute('aria-invalid', 'true');
    await expect(error).toHaveAttribute(
      'aria-errormessage',
      'input-error-message'
    );
  },
};

export const TypeFile: Story = {
  args: {
    type: 'file',
    'aria-label': 'File upload',
  },
};

// ============================================
// SIZE STORIES
// ============================================

export const SizeSmall: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const SizeLarge: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
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
    const input = canvas.getByRole('textbox');

    // Type in the input
    await userEvent.type(input, 'Hello World');

    // Check the value
    await expect(input).toHaveValue('Hello World');

    // The model updates for each character
    await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
  },
};

export const FocusBlurInteraction: Story = {
  args: {
    placeholder: 'Focus me...',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // Focus the input
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await expect(args.onFocus).toHaveBeenCalled();

    // Blur the input
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
    await expect(args.onBlur).toHaveBeenCalled();
  },
};

export const WithDataAttributes: Story = {
  args: {
    size: 'lg',
    placeholder: 'Test input',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toHaveAttribute('data-slot', 'input');
    await expect(input).toHaveAttribute('data-size', 'lg');
    await expect(input).toHaveAttribute('data-variant', 'bordered');
    await expect(input).toHaveClass('nx:bg-container');
    await expect(input).toHaveClass('nx:enabled:hover:bg-container-hover');
    await expectAutofillPaired(input);
  },
};

export const VModel: Story = {
  render: () => ({
    components: { Input, Label },
    setup: () => ({ name: ref('Ada') }),
    template: `
      <div class="nx:grid nx:gap-1.5">
        <Label for="vmodel-name">Hello, {{ name }}</Label>
        <Input id="vmodel-name" v-model="name" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toHaveValue('Ada');
    await userEvent.clear(input);
    await userEvent.type(input, 'Grace');
    await expect(canvas.getByText('Hello, Grace')).toBeVisible();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Input },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8 nx:w-[400px]">
        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Sizes
          </h3>
          <div class="nx:flex nx:flex-col nx:gap-3">
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                sm
              </span>
              <Input size="sm" placeholder="Small input" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                default
              </span>
              <Input size="default" placeholder="Default input" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                lg
              </span>
              <Input size="lg" placeholder="Large input" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Variants
          </h3>
          <div class="nx:flex nx:flex-col nx:gap-3">
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-20">
                bordered
              </span>
              <Input placeholder="Bordered input" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-20">
                borderless
              </span>
              <Input variant="borderless" placeholder="Borderless input" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-20">
                ghost
              </span>
              <Input variant="ghost" placeholder="Ghost input" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            States
          </h3>
          <div class="nx:flex nx:flex-col nx:gap-3">
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                empty
              </span>
              <Input placeholder="Placeholder text" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                filled
              </span>
              <Input default-value="Filled value" aria-label="Filled input" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                disabled
              </span>
              <Input placeholder="Disabled" disabled />
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Types
          </h3>
          <div class="nx:flex nx:flex-col nx:gap-3">
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                text
              </span>
              <Input type="text" placeholder="Text input" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                email
              </span>
              <Input type="email" placeholder="email@example.com" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                password
              </span>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                number
              </span>
              <Input type="number" placeholder="0" />
            </div>
            <div class="nx:flex nx:items-center nx:gap-4">
              <span class="nx:typography-label-small nx:text-muted-foreground nx:w-16">
                file
              </span>
              <Input type="file" aria-label="File upload" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Compare every size, variant, state and type side by side.',
      },
    },
  },
};
