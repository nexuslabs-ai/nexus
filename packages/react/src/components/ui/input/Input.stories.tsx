import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  AllModesGrid,
  AllModesRow,
  SPACING_MODES,
} from '../../../stories/spacing-modes';
import { expectHeightPinned } from '../../../stories/test-utils';

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

const INPUT_SCALE_HEIGHTS = {
  sm: {
    vega: 32,
    lyra: 32,
    maia: 36,
    mira: 32,
    nova: 30,
    luma: 32,
    sera: 32,
  },
  default: {
    vega: 40,
    lyra: 42,
    maia: 44,
    mira: 40,
    nova: 38,
    luma: 40,
    sera: 40,
  },
  lg: {
    vega: 48,
    lyra: 48,
    maia: 52,
    mira: 48,
    nova: 46,
    luma: 48,
    sera: 48,
  },
} as const;

async function expectInputScaleHeights(
  canvasElement: HTMLElement,
  size: keyof typeof INPUT_SCALE_HEIGHTS,
  testIdPrefix: string
) {
  await document.fonts.ready;
  const canvas = within(canvasElement);

  for (const mode of SPACING_MODES) {
    const actual = Math.round(
      canvas.getByTestId(`${testIdPrefix}-${mode}`).getBoundingClientRect()
        .height
    );
    expect(actual, `[data-testid="${testIdPrefix}-${mode}"] height`).toBe(
      INPUT_SCALE_HEIGHTS[size][mode]
    );
  }
}

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

    await expect(hoverInput).toHaveClass(
      'nx:enabled:hover:bg-background-hover'
    );

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
          'Each row scopes `data-style` locally so the 7 spacing modes render side-by-side regardless of the Style toolbar. Input follows the approved fixed-height utility scale (`h-8` / `h-10` / `h-12`) without copying Button min-widths. Sm/default use body-small text; lg uses body-default text.',
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

export const InputScaleHeightsFollowModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Scale-utility sentinel for the Input sizing model. Text Input sizes use `h-8` / `h-10` / `h-12` and therefore follow the active Nexus spacing mode while keeping Input width layout-controlled.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background">
      {SPACING_MODES.map((mode) => (
        <div key={mode} data-style={mode} className="nx:flex nx:gap-4">
          <Input
            size="sm"
            aria-label={`${mode} small input`}
            data-testid={`input-sm-${mode}`}
          />
          <Input
            aria-label={`${mode} default input`}
            data-testid={`input-default-${mode}`}
          />
          <Input
            size="lg"
            aria-label={`${mode} large input`}
            data-testid={`input-lg-${mode}`}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultInput = canvas.getByLabelText('vega default input');
    const smallInput = canvas.getByLabelText('vega small input');
    const largeInput = canvas.getByLabelText('vega large input');

    await expect(defaultInput).toHaveAttribute('data-size', 'default');
    await expect(defaultInput).toHaveClass('nx:h-10');
    await expect(defaultInput).toHaveClass('nx:px-3');
    await expect(defaultInput).toHaveClass('nx:py-0');
    await expect(defaultInput).toHaveClass('nx:typography-body-small');
    await expect(smallInput).toHaveClass('nx:h-8');
    await expect(smallInput).toHaveClass('nx:px-2.5');
    await expect(smallInput).toHaveClass('nx:py-0');
    await expect(smallInput).toHaveClass('nx:typography-body-small');
    await expect(largeInput).toHaveClass('nx:h-12');
    await expect(largeInput).toHaveClass('nx:px-3.5');
    await expect(largeInput).toHaveClass('nx:py-0');
    await expect(largeInput).toHaveClass('nx:typography-body-default');

    await expectInputScaleHeights(canvasElement, 'default', 'input-default');
    await expectInputScaleHeights(canvasElement, 'sm', 'input-sm');
    await expectInputScaleHeights(canvasElement, 'lg', 'input-lg');
  },
};

export const VegaDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the fixed-height outcome: in vega mode, a default Input renders at exactly 40px via `h-10`.',
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
    await expectHeightPinned(within(canvasElement), 'input-vega-host', 40);
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
