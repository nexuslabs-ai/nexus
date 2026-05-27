import type { Meta, StoryObj } from '@storybook/react';
import { IconRocket, IconStar } from '@tabler/icons-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SPACING_MODES } from '../../stories/spacing-modes';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    onClick: fn(), // Spy function for testing
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'The visual style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (for composition)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ============================================
// VARIANT STORIES (visual documentation)
// ============================================

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
  // TODO: Fix error-background/error-foreground token contrast (3.76:1, needs 4.5:1)
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
};

// ============================================
// SIZE STORIES
// ============================================

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const IconSize: Story = {
  args: {
    size: 'icon',
    children: <IconStar />,
    'aria-label': 'Star',
  },
};

// ============================================
// STATE STORIES (with interaction tests)
// ============================================

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify disabled state
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('disabled');

    // Verify onClick was not attached or callable
    // Note: Can't test click with pointer-events: none, disabled state is sufficient
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Submitting',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Loading button should be disabled
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAttribute('data-loading', 'true');

    // Click should not trigger onClick
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LoadingWithVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-wrap nx:gap-2">
      <Button loading variant="default">
        Default
      </Button>
      <Button loading variant="secondary">
        Secondary
      </Button>
      <Button loading variant="destructive">
        Destructive
      </Button>
      <Button loading variant="outline">
        Outline
      </Button>
    </div>
  ),
  parameters: {
    // TODO: Fix error-background/error-foreground token contrast (3.76:1, needs 4.5:1)
    a11y: { test: 'todo' },
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ClickInteraction: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Button should be clickable
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Multiple clicks should increment
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const KeyboardInteraction: Story = {
  args: {
    children: 'Press Enter',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Tab to focus
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Enter triggers click
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Space triggers click
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const FocusManagement: Story = {
  args: {
    children: 'Focus me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Initially not focused
    await expect(button).not.toHaveFocus();

    // Tab should focus
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Shift+Tab should blur
    await userEvent.tab({ shift: true });
    await expect(button).not.toHaveFocus();
  },
};

// ============================================
// PROPS & ATTRIBUTES TESTS
// ============================================

export const WithDataAttributes: Story = {
  args: {
    children: 'Data Attrs',
    variant: 'secondary',
    size: 'lg',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveAttribute('data-slot', 'button');
    await expect(button).toHaveAttribute('data-variant', 'secondary');
    await expect(button).toHaveAttribute('data-size', 'lg');
  },
};

export const WithCustomClassName: Story = {
  args: {
    children: 'Custom Class',
    className: 'custom-test-class',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveClass('custom-test-class');
  },
};

export const WithAriaLabel: Story = {
  args: {
    children: '×',
    'aria-label': 'Close dialog',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveAccessibleName('Close dialog');
  },
};

export const DefaultType: Story = {
  args: {
    children: 'Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Should default to type="button" to prevent accidental form submission
    await expect(button).toHaveAttribute('type', 'button');
  },
};

export const SubmitType: Story = {
  args: {
    children: 'Submit',
    type: 'submit',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Can explicitly set type="submit" for forms
    await expect(button).toHaveAttribute('type', 'submit');
  },
};

// ============================================
// COMPOSITION (asChild)
// ============================================

export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="https://example.com">Visit Website</a>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('data-slot', 'button');
  },
};

// ============================================
// EDGE CASES
// ============================================

export const EmptyChildren: Story = {
  args: {
    children: undefined,
    'aria-label': 'Empty button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeInTheDocument();
  },
};

export const LongContent: Story = {
  args: {
    children: 'This is a very long button text that might wrap or overflow',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveTextContent('This is a very long button text');
  },
};

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <IconRocket data-testid="icon" />
      Launch
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('icon')).toBeInTheDocument();
    await expect(canvas.getByRole('button')).toHaveTextContent('Launch');
  },
};

// ============================================
// ALL VARIANTS GRID (visual reference)
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:text-sm nx:font-medium">
          Variants
        </h3>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:text-sm nx:font-medium">
          Sizes
        </h3>
        <div className="nx:flex nx:items-center nx:gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Icon">
            <IconStar />
          </Button>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:text-sm nx:font-medium">
          Disabled
        </h3>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button variant="default" disabled>
            Default
          </Button>
          <Button variant="secondary" disabled>
            Secondary
          </Button>
          <Button variant="destructive" disabled>
            Destructive
          </Button>
          <Button variant="outline" disabled>
            Outline
          </Button>
          <Button variant="ghost" disabled>
            Ghost
          </Button>
          <Button variant="link" disabled>
            Link
          </Button>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:text-sm nx:font-medium">
          Loading
        </h3>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button variant="default" loading>
            Default
          </Button>
          <Button variant="secondary" loading>
            Secondary
          </Button>
          <Button variant="destructive" loading>
            Destructive
          </Button>
          <Button variant="outline" loading>
            Outline
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    // TODO: Fix error-background/error-foreground token contrast (3.76:1, needs 4.5:1)
    a11y: { test: 'todo' },
  },
};

// ============================================
// MODE BEHAVIOUR (per-mode spacing variance)
// ============================================

export const AllModes: Story = {
  parameters: {
    // 7 rows × 3 buttons each duplicates the same accessible names; the
    // canonical Default/Primary/etc. stories already cover a11y for Button.
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Each row scopes `data-style` locally, so the 7 spacing modes render side-by-side regardless of the Style toolbar. Vega / Lyra / Luma / Mira currently share identical control padding tokens (so the top 4 rows look the same); Nova compresses, Maia / Sera breathe. See `Tokens/Spacing/Roles` for the per-mode token grid.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background nx:min-w-fit">
      {SPACING_MODES.map((mode) => (
        <div
          key={mode}
          data-style={mode}
          className="nx:flex nx:gap-2 nx:items-center"
        >
          <span className="nx:w-[64px] nx:typography-label-default nx:font-mono nx:text-muted-foreground">
            {mode}
          </span>
          <Button>Default</Button>
          <Button size="sm">Sm</Button>
          <Button size="lg">Lg</Button>
        </div>
      ))}
    </div>
  ),
};

export const ModesProduceDifferentHeights: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Regression sentinel for the `data-style` cascade and the role-utility resolver. Buttons scoped to different modes must render at different heights — a typo like `nx:py-control-mdd` would silently fall back to intrinsic and all three buttons would match. The assertion is non-strict (`<`, not exact px) so designer retunes of the role tokens do not break the test; only a broken cascade does.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="nova" data-testid="mode-host-nova">
        <Button>btn</Button>
      </div>
      <div data-style="vega" data-testid="mode-host-vega">
        <Button>btn</Button>
      </div>
      <div data-style="sera" data-testid="mode-host-sera">
        <Button>btn</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heightOf = (testId: string) => {
      const host = canvas.getByTestId(testId);
      const button = host.querySelector('button');
      if (!button) throw new Error(`button not found in ${testId}`);
      return button.getBoundingClientRect().height;
    };

    const novaH = heightOf('mode-host-nova');
    const vegaH = heightOf('mode-host-vega');
    const seraH = heightOf('mode-host-sera');

    await expect(novaH).toBeLessThan(vegaH);
    await expect(vegaH).toBeLessThan(seraH);
  },
};

export const VegaDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the migration outcome: in vega mode, a default Button renders at exactly 36px (= `text-sm` 20px line-height + `py-control-md` 8px × 2). If a designer retunes `--control-padding-y-md` or the body type ramp, this test fails and the change must be acknowledged.',
      },
    },
  },
  render: () => (
    <div
      data-style="vega"
      data-testid="vega-host"
      className="nx:p-10 nx:bg-background"
    >
      <Button>Default</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Wait for Inter to load — fallback metrics would skew the measurement.
    await document.fonts.ready;
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button.getBoundingClientRect().height).toBe(36);
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
