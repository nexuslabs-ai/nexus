import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';
import { Label } from '../label/label';

import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
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
          'Input collects one line of text. Give every input a visible label or an `aria-label`. For several lines of text, use Textarea.',
      },
    },
  },
  args: {
    onChange: fn(),
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'Native input type.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction.',
    },
    placeholder: {
      control: 'text',
      description: 'Hint text shown while the field is empty.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

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
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const WithLabel: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Link a Label to the input with `htmlFor` and a matching `id`.',
      },
    },
  },
  render: function WithLabelStory() {
    const inputId = React.useId();

    return (
      <div className="nx:grid nx:gap-1.5">
        <Label htmlFor={inputId}>Full name</Label>
        <Input id={inputId} placeholder="Ada Lovelace" />
      </div>
    );
  },
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
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
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
  args: {
    defaultValue: 'invalid@',
    'aria-invalid': true,
    'aria-label': 'Invalid email',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

export const BorderlessStates: Story = {
  render: () => (
    <div className="nx:flex nx:w-[400px] nx:flex-col nx:gap-3">
      <Input
        data-testid="input-borderless-empty"
        variant="borderless"
        placeholder="Placeholder text"
      />
      <Input
        data-testid="input-borderless-filled"
        variant="borderless"
        defaultValue="Filled value"
        aria-label="Filled borderless input"
      />
      <Input
        data-testid="input-borderless-readonly"
        variant="borderless"
        defaultValue="acct_1024"
        aria-label="Read-only borderless input"
        readOnly
      />
      <Input
        data-testid="input-borderless-invalid"
        variant="borderless"
        defaultValue="invalid@"
        aria-invalid
        aria-label="Invalid borderless input"
      />
      <Input
        data-testid="input-borderless-disabled"
        variant="borderless"
        placeholder="Disabled"
        disabled
      />
    </div>
  ),
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

export const GhostStates: Story = {
  render: () => (
    <div className="nx:flex nx:w-[400px] nx:flex-col nx:gap-3">
      <Input
        data-testid="input-ghost-filled"
        variant="ghost"
        defaultValue="Quarterly planning"
        aria-label="Filled ghost input"
      />
      <Input
        data-testid="input-ghost-invalid"
        variant="ghost"
        defaultValue="invalid@"
        aria-invalid
        aria-label="Invalid ghost input"
      />
      <Input
        data-testid="input-ghost-disabled"
        variant="ghost"
        placeholder="Disabled"
        disabled
      />
    </div>
  ),
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
  render: () => (
    <div className="nx:flex nx:w-[400px] nx:flex-col nx:gap-4">
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Read-only
        </span>
        <Input
          aria-label="Read-only account id"
          aria-describedby="input-readonly-note"
          defaultValue="acct_1024"
          readOnly
        />
        <p
          id="input-readonly-note"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          Value can be selected and submitted, but not edited here.
        </p>
      </div>
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Disabled
        </span>
        <Input
          aria-label="Disabled account id"
          aria-describedby="input-disabled-note"
          defaultValue="acct_1024"
          disabled
        />
        <p
          id="input-disabled-note"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          Value is unavailable and should not be submitted from this control.
        </p>
      </div>
    </div>
  ),
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
  render: () => (
    <div className="nx:flex nx:w-[400px] nx:flex-col nx:gap-4">
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Warning
        </span>
        <Input
          aria-label="Warning budget"
          aria-describedby="input-warning-message"
          defaultValue="95"
          className="nx:border-warning-border"
        />
        <p
          id="input-warning-message"
          className="nx:typography-body-small nx:text-warning-subtle-foreground"
        >
          Near the monthly limit. You can continue.
        </p>
      </div>
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Error
        </span>
        <Input
          aria-label="Invalid budget"
          aria-describedby="input-error-help"
          aria-errormessage="input-error-message"
          aria-invalid
          defaultValue="125"
        />
        <p
          id="input-error-help"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          Enter a value from 0 to 100.
        </p>
        <p
          id="input-error-message"
          role="alert"
          className="nx:typography-body-small nx:text-error-subtle-foreground"
        >
          Budget cannot exceed 100.
        </p>
      </div>
    </div>
  ),
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

    // onChange should have been called for each character
    await expect(args.onChange).toHaveBeenCalled();
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

// A plain `value` attribute renders as the field's value.
export const StaticValue: Story = {
  render: () => <Input aria-label="Account id" value="acct_1024" readOnly />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Account id' });
    await expect(input).toHaveValue('acct_1024');
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

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  tags: ['docs'],
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:w-[400px]">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Sizes
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              sm
            </span>
            <Input size="sm" placeholder="Small input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              default
            </span>
            <Input size="default" placeholder="Default input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              lg
            </span>
            <Input size="lg" placeholder="Large input" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Variants
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-20">
              bordered
            </span>
            <Input placeholder="Bordered input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-20">
              borderless
            </span>
            <Input variant="borderless" placeholder="Borderless input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-20">
              ghost
            </span>
            <Input variant="ghost" placeholder="Ghost input" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          States
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              empty
            </span>
            <Input placeholder="Placeholder text" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              filled
            </span>
            <Input defaultValue="Filled value" aria-label="Filled input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              disabled
            </span>
            <Input placeholder="Disabled" disabled />
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Types
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              text
            </span>
            <Input type="text" placeholder="Text input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              email
            </span>
            <Input type="email" placeholder="email@example.com" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              password
            </span>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              number
            </span>
            <Input type="number" placeholder="0" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16">
              file
            </span>
            <Input type="file" aria-label="File upload" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Compare every size, variant, state and type side by side.',
      },
    },
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
