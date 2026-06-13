import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  AllModesGrid,
  AllModesRow,
  SPACING_MODES,
} from '../../../stories/spacing-modes';
import {
  expectHeightPinned,
  expectHeightPinnedAcrossModes,
} from '../../../stories/test-utils';

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
      <Input
        data-testid="input-disabled-filled"
        defaultValue="Disabled value"
        disabled
        aria-label="Disabled filled input"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hoverInput = canvas.getByTestId('input-hover-token');
    const disabledEmpty = canvas.getByTestId('input-disabled-empty');
    const disabledFilled = canvas.getByTestId('input-disabled-filled');

    await expect(hoverInput).toHaveClass('nx:enabled:hover:bg-container-hover');
    await userEvent.hover(hoverInput);
    await expect(hoverInput).toHaveClass('nx:enabled:hover:bg-container-hover');

    await expect(disabledEmpty).toBeDisabled();
    await expect(disabledFilled).toBeDisabled();
    await expect(disabledEmpty).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabledEmpty).toHaveClass(
      'nx:disabled:text-disabled-foreground'
    );
    await expect(disabledEmpty).toHaveClass(
      'nx:disabled:placeholder:text-disabled-foreground'
    );
    await expect(disabledEmpty).toHaveClass(
      'nx:disabled:border-border-disabled'
    );
    await expect(disabledFilled).not.toHaveClass('nx:disabled:opacity-50');
    await expect(window.getComputedStyle(disabledFilled).opacity).toBe('1');
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
          Sizes
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              sm
            </span>
            <Input size="sm" placeholder="Small input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              default
            </span>
            <Input size="default" placeholder="Default input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              lg
            </span>
            <Input size="lg" placeholder="Large input" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          States
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              empty
            </span>
            <Input placeholder="Placeholder text" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              filled
            </span>
            <Input defaultValue="Filled value" aria-label="Filled input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              disabled
            </span>
            <Input placeholder="Disabled" disabled />
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Types
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              text
            </span>
            <Input type="text" placeholder="Text input" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              email
            </span>
            <Input type="email" placeholder="email@example.com" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              password
            </span>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
              number
            </span>
            <Input type="number" placeholder="0" />
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-16">
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
// MODE BEHAVIOUR (mode-stable numeric spacing)
// ============================================

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Each row scopes `data-style` locally so the 7 spacing modes render side-by-side regardless of the Style toolbar. The corrected Figma node 843:71944 shows Input frame sizes at 28/32/36px; Nexus uses body-small text for sm/default and body-default text for lg while pinning browser-rendered heights to match the Button text scale at 28/32/36px. Numeric vertical padding (`py-[3px]` / `py-[5px]`) keeps heights mode-invariant and stable across hover, focus, filled, and typing states.',
      },
    },
  },
  render: () => (
    <AllModesGrid>
      {SPACING_MODES.map((mode) => (
        <AllModesRow key={mode} mode={mode}>
          <Input
            size="sm"
            placeholder="Sm"
            aria-label={`${mode} small input`}
          />
          <Input
            size="default"
            placeholder="Default"
            aria-label={`${mode} default input`}
          />
          <Input
            size="lg"
            placeholder="Lg"
            aria-label={`${mode} large input`}
          />
        </AllModesRow>
      ))}
    </AllModesGrid>
  ),
};

export const InputIsDensityStable: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Density-stability sentinel for the approved text scale. Figma node 843:71944 frames idle Input at 28/32/36px, and Nexus pins sm/default/lg to browser-rendered 28/32/36px across representative spacing modes so Input matches the Button text height scale. Sm/default use 14px body-small text; lg uses 16px body-default text. Horizontal `px-3` may still vary cosmetically by mode, but it does not affect height.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background">
      {(['nova', 'vega', 'maia', 'sera'] as const).map((mode) => (
        <div key={mode} data-style={mode} className="nx:flex nx:gap-4">
          <div data-testid={`input-${mode}-sm`}>
            <Input size="sm" aria-label={`${mode} small input`} />
          </div>
          <div data-testid={`input-${mode}-default`}>
            <Input aria-label={`${mode} default input`} />
          </div>
          <div data-testid={`input-${mode}-lg`}>
            <Input size="lg" aria-label={`${mode} large input`} />
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectHeightPinnedAcrossModes(
      canvas,
      ['input-nova-sm', 'input-vega-sm', 'input-maia-sm', 'input-sera-sm'],
      28
    );
    await expectHeightPinnedAcrossModes(
      canvas,
      [
        'input-nova-default',
        'input-vega-default',
        'input-maia-default',
        'input-sera-default',
      ],
      32
    );
    await expectHeightPinnedAcrossModes(
      canvas,
      ['input-nova-lg', 'input-vega-lg', 'input-maia-lg', 'input-sera-lg'],
      36
    );

    await expect(canvas.getByLabelText('vega large input')).toHaveClass(
      'nx:typography-body-default'
    );
    await expect(canvas.getByLabelText('vega large input')).toHaveClass(
      'nx:py-[5px]'
    );
  },
};

export const VegaDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the approved default-size text outcome: in vega mode, a default Input renders at exactly 32px (= `typography-body-small` 20px line-height + `py-[5px]` 5px x 2 + border 1px x 2). This keeps the Input default height aligned with the Button text scale. If a designer retunes the body type ramp, numeric spacing scale, or border-width token, this test fails and the change must be acknowledged.',
      },
    },
  },
  render: () => (
    <div
      data-style="vega"
      data-testid="input-vega-host"
      className="nx:p-10 nx:bg-background"
    >
      <Input aria-label="vega default input" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'input-vega-host', 32);
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
