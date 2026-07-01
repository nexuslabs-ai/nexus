import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

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
      description: 'The size of the input',
    },
    variant: {
      control: 'select',
      options: ['default', 'borderless'],
      description: 'The visual treatment of the input',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'The type of the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Hello World',
    'aria-label': 'Text input with value',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Enter your email address',
    type: 'email',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const DisabledWithValue: Story = {
  args: {
    defaultValue: 'Cannot edit this',
    disabled: true,
    'aria-label': 'Disabled input with value',
  },
};

export const Invalid: Story = {
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
    await expect(empty).toHaveClass('nx:bg-background-hover-alpha');

    await expect(readOnly).toHaveAttribute('readonly');
    await expect(readOnly).not.toBeDisabled();

    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(invalid).toHaveClass('nx:aria-invalid:border-color-error');
    await expect(window.getComputedStyle(invalid).borderTopColor).not.toBe(
      'rgba(0, 0, 0, 0)'
    );

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabled).not.toHaveClass('nx:disabled:border-color-disabled');
  },
};

export const BorderlessSurfaceComparison: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Borderless inputs use the background-hover-alpha surface so the same semantic token adapts across light and dark page and container surfaces.',
      },
    },
  },
  render: () => (
    <div className="nx:grid nx:w-[400px] nx:gap-4">
      <div className="nx:grid nx:gap-2 nx:rounded-md nx:bg-background nx:p-4">
        <span className="nx:typography-label-default nx:text-foreground">
          Background
        </span>
        <Input
          variant="borderless"
          aria-label="Borderless input on background"
          defaultValue="alpha surface fill"
        />
      </div>
      <div className="nx:grid nx:gap-2 nx:rounded-md nx:bg-container nx:p-4">
        <span className="nx:typography-label-default nx:text-foreground">
          Container
        </span>
        <Input
          variant="borderless"
          aria-label="Borderless input on container"
          defaultValue="alpha surface fill"
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const background = canvas.getByRole('textbox', {
      name: 'Borderless input on background',
    });
    const container = canvas.getByRole('textbox', {
      name: 'Borderless input on container',
    });

    await expect(background).toHaveClass('nx:bg-background-hover-alpha');
    await expect(container).toHaveClass('nx:bg-background-hover-alpha');
  },
};

export const ReadOnlyVsDisabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Read-only keeps the control focusable and submittable while preventing edits. Disabled removes the control from editing and native form submission. Input has no special read-only visual treatment today, so pair read-only fields with helper copy when the distinction matters.',
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
          'Warning is advisory guidance and must not set `aria-invalid`. Error means the current value is invalid, so it uses `aria-invalid` and an error message relationship. First-class warning source semantics are intentionally left for a future iteration.',
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
          className="nx:border-border-warning"
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

// ============================================
// TYPE STORIES
// ============================================

export const TypeEmail: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const TypePassword: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const TypeNumber: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

export const TypeSearch: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
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

export const SizeDefault: Story = {
  args: {
    size: 'default',
    placeholder: 'Default input',
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

export const DisabledInteraction: Story = {
  args: {
    placeholder: 'Cannot type here',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // Input should be disabled
    await expect(input).toBeDisabled();
  },
};

export const VisualStateTokens: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Token sentinel for the corrected Figma node 843:71944 visual-state pass. The primitive remains a native input, while hover and disabled visuals map to Nexus semantic state tokens.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3 nx:w-[400px]">
      <Input
        data-testid="input-hover-token"
        placeholder="Hover surface"
        aria-label="Hover surface input"
      />
      <Input
        data-testid="input-disabled-empty"
        placeholder="Disabled placeholder"
        disabled
        aria-label="Disabled empty input"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hoverTokenInput = canvas.getByTestId('input-hover-token');
    const disabledEmpty = canvas.getByTestId('input-disabled-empty');

    await expect(hoverTokenInput).toHaveClass(
      'nx:enabled:hover:bg-background-hover'
    );

    await expect(disabledEmpty).toBeDisabled();
    await expect(disabledEmpty).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabledEmpty).toHaveClass(
      'nx:disabled:text-disabled-foreground'
    );
    await expect(disabledEmpty).toHaveClass(
      'nx:disabled:placeholder:text-disabled-foreground'
    );
    await expect(disabledEmpty).toHaveClass(
      'nx:disabled:border-color-disabled'
    );
    // Disabled uses a token color, not opacity-50 — opacity stays 1.
    await expect(window.getComputedStyle(disabledEmpty).opacity).toBe('1');
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
    await expect(input).toHaveAttribute('data-variant', 'default');
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
              default
            </span>
            <Input placeholder="Default input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-20">
              borderless
            </span>
            <Input variant="borderless" placeholder="Borderless input" />
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
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
