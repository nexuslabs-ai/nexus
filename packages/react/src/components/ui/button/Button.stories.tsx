import type { Meta, StoryObj } from '@storybook/react';
import { IconArrowRight, IconRocket, IconStar } from '@tabler/icons-react';
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
        'error',
        'destructive',
        'outline',
        'dashed',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'The visual style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon-sm', 'icon', 'icon-lg'],
      description: 'The size of the button',
    },
    isIconOnly: {
      control: 'boolean',
      description: 'Use the Figma icon-only sizing model',
    },
    startIcon: {
      control: false,
      description: 'Decorative icon rendered before the button label',
    },
    endIcon: {
      control: false,
      description: 'Decorative icon rendered after the button label',
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
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Error',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Dashed: Story = {
  args: {
    variant: 'dashed',
    children: 'Dashed',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Star' });

    await expect(button).toHaveClass('nx:relative');
    await expect(button).toHaveClass('nx:size-[28px]');
    await expect(button).toHaveClass('nx:p-0');
    await expect(button).toHaveClass('nx:pointer-coarse:after:absolute');
    await expect(button).toHaveClass('nx:pointer-coarse:after:-inset-[8px]');
    await expect(button).toHaveAttribute('data-icon-only', 'true');
  },
};

export const IconSmallSize: Story = {
  args: {
    size: 'icon-sm',
    children: <IconStar />,
    'aria-label': 'Small star',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Small star' });

    await expect(button).toHaveClass('nx:size-[24px]');
    await expect(button).toHaveAttribute('data-icon-only', 'true');
  },
};

export const IconLargeSize: Story = {
  args: {
    size: 'icon-lg',
    children: <IconStar />,
    'aria-label': 'Large star',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Large star' });

    await expect(button).toHaveClass('nx:size-[32px]');
    await expect(button).toHaveAttribute('data-icon-only', 'true');
  },
};

export const IconOnlySizes: Story = {
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Button size="sm" isIconOnly aria-label="Small icon">
        <IconStar />
      </Button>
      <Button isIconOnly aria-label="Default icon">
        <IconStar />
      </Button>
      <Button size="lg" isIconOnly aria-label="Large icon">
        <IconStar />
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Small icon' })
    ).toHaveClass('nx:size-[24px]');
    await expect(
      canvas.getByRole('button', { name: 'Default icon' })
    ).toHaveClass('nx:size-[28px]');
    await expect(
      canvas.getByRole('button', { name: 'Large icon' })
    ).toHaveClass('nx:size-[32px]');
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

export const ManualBusyState: Story = {
  args: {
    'aria-busy': true,
    children: 'Processing',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).not.toHaveAttribute('data-loading');
    await expect(button).not.toBeDisabled();
  },
};

export const LoadingWithVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Button loading variant="default">
        Default
      </Button>
      <Button loading variant="secondary">
        Secondary
      </Button>
      <Button loading variant="error">
        Error
      </Button>
      <Button loading variant="destructive">
        Destructive
      </Button>
      <Button loading variant="outline">
        Outline
      </Button>
      <Button loading variant="dashed">
        Dashed
      </Button>
    </div>
  ),
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
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-2">
      <Button>Default attrs</Button>
      <Button variant="secondary" size="lg">
        Explicit attrs
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultButton = canvas.getByRole('button', {
      name: 'Default attrs',
    });
    const explicitButton = canvas.getByRole('button', {
      name: 'Explicit attrs',
    });

    await expect(defaultButton).toHaveAttribute('data-slot', 'button');
    await expect(defaultButton).toHaveAttribute('data-variant', 'default');
    await expect(defaultButton).toHaveAttribute('data-size', 'default');
    await expect(explicitButton).toHaveAttribute('data-slot', 'button');
    await expect(explicitButton).toHaveAttribute('data-variant', 'secondary');
    await expect(explicitButton).toHaveAttribute('data-size', 'lg');
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

export const DisabledAsLink: Story = {
  args: {
    disabled: true,
    children: 'Disabled link',
  },
  render: ({ children, ...args }) => (
    <Button {...args} asChild>
      <a
        href="#disabled-as-link"
        onClick={(event) => {
          event.currentTarget.dataset.childClicked = 'true';
        }}
      >
        {children}
      </a>
    </Button>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).not.toHaveAttribute('disabled');
    await expect(link).not.toHaveAttribute('type');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).toHaveAttribute('tabindex', '-1');
    await expect(link).toHaveClass('nx:aria-disabled:pointer-events-none');
    await expect(link).toHaveClass('nx:aria-disabled:opacity-100');
    await expect(link).toHaveClass('nx:aria-disabled:shadow-none');
    await expect(link).toHaveClass('nx:aria-disabled:bg-primary-disabled');

    const clickResult = link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    expect(clickResult).toBe(false);
    await expect(link).not.toHaveAttribute('data-child-clicked');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LoadingAsLink: Story = {
  args: {
    loading: true,
    children: 'Loading link',
  },
  render: ({ children, ...args }) => (
    <Button {...args} asChild>
      <a
        href="#loading-as-link"
        onClick={(event) => {
          event.currentTarget.dataset.childClicked = 'true';
        }}
      >
        {children}
      </a>
    </Button>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).not.toHaveAttribute('disabled');
    await expect(link).not.toHaveAttribute('type');
    await expect(link).toHaveAttribute('aria-busy', 'true');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).toHaveAttribute('data-loading', 'true');
    await expect(link).toHaveAttribute('tabindex', '-1');
    await expect(link.querySelector('svg')).toBeInTheDocument();

    const clickResult = link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    expect(clickResult).toBe(false);
    await expect(link).not.toHaveAttribute('data-child-clicked');
    await expect(args.onClick).not.toHaveBeenCalled();
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

export const StartIconSlot: Story = {
  args: {
    startIcon: <IconRocket data-testid="start-icon" />,
    children: 'Launch',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Launch' });
    const startIcon = button.querySelector('[data-slot="button-start-icon"]');

    await expect(startIcon).toBeInTheDocument();
    await expect(startIcon).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByTestId('start-icon')).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Launch');
  },
};

export const EndIconSlot: Story = {
  args: {
    endIcon: <IconArrowRight data-testid="end-icon" />,
    children: 'Continue',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continue' });
    const endIcon = button.querySelector('[data-slot="button-end-icon"]');

    await expect(endIcon).toBeInTheDocument();
    await expect(endIcon).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByTestId('end-icon')).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Continue');
  },
};

export const StartAndEndIconSlots: Story = {
  args: {
    startIcon: <IconRocket />,
    endIcon: <IconArrowRight />,
    children: 'Launch flow',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Launch flow' });

    await expect(
      button.querySelector('[data-slot="button-start-icon"]')
    ).toBeInTheDocument();
    await expect(
      button.querySelector('[data-slot="button-end-icon"]')
    ).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Launch flow');
  },
};

export const LoadingWithIconSlots: Story = {
  args: {
    loading: true,
    startIcon: <IconRocket />,
    endIcon: <IconArrowRight />,
    children: 'Launching',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Launching' });

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(
      button.querySelector('[data-slot="button-start-icon"]')
    ).toBeInTheDocument();
    await expect(
      button.querySelector('[data-slot="button-end-icon"]')
    ).toBeInTheDocument();
    await expect(
      button.querySelector('[data-slot="spinner"]')
    ).toBeInTheDocument();
  },
};

export const AsLinkWithIconSlots: Story = {
  render: (args) => (
    <Button
      {...args}
      asChild
      startIcon={<IconRocket />}
      endIcon={<IconArrowRight />}
    >
      <a href="https://example.com">Visit Website</a>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Visit Website' });

    await expect(link).toHaveAttribute('data-slot', 'button');
    await expect(
      link.querySelector('[data-slot="button-start-icon"]')
    ).toBeInTheDocument();
    await expect(
      link.querySelector('[data-slot="button-end-icon"]')
    ).toBeInTheDocument();
    await expect(link).toHaveAccessibleName('Visit Website');
  },
};

// ============================================
// ALL VARIANTS GRID (visual reference)
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Variants
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="error">Error</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="dashed">Dashed</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Sizes
        </h3>
        <div className="nx:flex nx:items-center nx:gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="sm" isIconOnly aria-label="Small icon">
            <IconStar />
          </Button>
          <Button size="icon" aria-label="Icon">
            <IconStar />
          </Button>
          <Button size="lg" isIconOnly aria-label="Large icon">
            <IconStar />
          </Button>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Icon slots
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button startIcon={<IconRocket />}>Start icon</Button>
          <Button endIcon={<IconArrowRight />}>End icon</Button>
          <Button startIcon={<IconRocket />} endIcon={<IconArrowRight />}>
            Both icons
          </Button>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Disabled
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button variant="default" disabled>
            Default
          </Button>
          <Button variant="secondary" disabled>
            Secondary
          </Button>
          <Button variant="error" disabled>
            Error
          </Button>
          <Button variant="destructive" disabled>
            Destructive
          </Button>
          <Button variant="outline" disabled>
            Outline
          </Button>
          <Button variant="dashed" disabled>
            Dashed
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
        <h3 className="nx:text-foreground nx:mb-2 nx:typography-label-default">
          Loading
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button variant="default" loading>
            Default
          </Button>
          <Button variant="secondary" loading>
            Secondary
          </Button>
          <Button variant="error" loading>
            Error
          </Button>
          <Button variant="destructive" loading>
            Destructive
          </Button>
          <Button variant="outline" loading>
            Outline
          </Button>
          <Button variant="dashed" loading>
            Dashed
          </Button>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// MODE BEHAVIOUR
// ============================================

export const AllModes: Story = {
  parameters: {
    // 7 rows × 3 buttons each duplicates the same accessible names; the
    // canonical Default/Primary/etc. stories already cover a11y for Button.
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Each row scopes `data-style` locally, so the 7 spacing modes render side-by-side regardless of the Style toolbar. Button uses the Figma numeric padding scale, so sm, default, and lg text-button heights stay pinned across density modes.',
      },
    },
  },
  render: () => (
    <AllModesGrid>
      {SPACING_MODES.map((mode) => (
        <AllModesRow key={mode} mode={mode}>
          <Button>Default</Button>
          <Button size="sm">Sm</Button>
          <Button size="lg">Lg</Button>
        </AllModesRow>
      ))}
    </AllModesGrid>
  ),
};

export const LargeHeightPinnedAcrossModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Density-stability sentinel for the large Button size after moving to the compact Figma scale.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background">
      {SPACING_MODES.map((mode) => (
        <div key={mode} data-style={mode}>
          <Button size="lg" data-testid={`button-lg-${mode}`}>
            Lg
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinnedAcrossModes(
      within(canvasElement),
      SPACING_MODES.map((mode) => `button-lg-${mode}`),
      36
    );
  },
};

export const IconHeightsArePinnedAcrossModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Icon-only Button visuals follow Figma at 24px, 28px, and 32px while coarse-pointer hit-area overlays preserve the Nexus touch floor.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background">
      {SPACING_MODES.map((mode) => (
        <div
          key={mode}
          data-style={mode}
          className="nx:flex nx:items-center nx:gap-2"
        >
          <Button
            size="sm"
            isIconOnly
            aria-label={`Small icon ${mode}`}
            data-testid={`button-icon-sm-${mode}`}
          >
            <IconStar />
          </Button>
          <Button
            isIconOnly
            aria-label={`Default icon ${mode}`}
            data-testid={`button-icon-default-${mode}`}
          >
            <IconStar />
          </Button>
          <Button
            size="lg"
            isIconOnly
            aria-label={`Large icon ${mode}`}
            data-testid={`button-icon-lg-${mode}`}
          >
            <IconStar />
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectHeightPinnedAcrossModes(
      canvas,
      SPACING_MODES.map((mode) => `button-icon-sm-${mode}`),
      24
    );
    await expectHeightPinnedAcrossModes(
      canvas,
      SPACING_MODES.map((mode) => `button-icon-default-${mode}`),
      28
    );
    await expectHeightPinnedAcrossModes(
      canvas,
      SPACING_MODES.map((mode) => `button-icon-lg-${mode}`),
      32
    );
  },
};

export const VariantClassesMatchFigmaTokens: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="error">Error</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="dashed">Dashed</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Default' })).toHaveClass(
      'nx:active:bg-primary-background-active'
    );
    await expect(canvas.getByRole('button', { name: 'Secondary' })).toHaveClass(
      'nx:active:bg-secondary-background-active'
    );
    await expect(canvas.getByRole('button', { name: 'Error' })).toHaveClass(
      'nx:text-error-subtle-foreground'
    );
    await expect(
      canvas.getByRole('button', { name: 'Destructive' })
    ).toHaveClass('nx:active:bg-error-background-active');
    await expect(canvas.getByRole('button', { name: 'Outline' })).toHaveClass(
      'nx:active:bg-container-active'
    );
    await expect(canvas.getByRole('button', { name: 'Dashed' })).toHaveClass(
      'nx:border-dashed'
    );
    await expect(canvas.getByRole('button', { name: 'Ghost' })).toHaveClass(
      'nx:hover:bg-container-hover'
    );
    await expect(canvas.getByRole('button', { name: 'Link' })).toHaveClass(
      'nx:hover:bg-primary-subtle-hover'
    );
  },
};

export const BorderedVariantsKeepFigmaHeight: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Button variant="outline" size="sm" data-testid="outline-sm">
          Sm
        </Button>
        <Button variant="outline" data-testid="outline-default">
          Default
        </Button>
        <Button variant="outline" size="lg" data-testid="outline-lg">
          Lg
        </Button>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Button variant="dashed" size="sm" data-testid="dashed-sm">
          Sm
        </Button>
        <Button variant="dashed" data-testid="dashed-default">
          Default
        </Button>
        <Button variant="dashed" size="lg" data-testid="dashed-lg">
          Lg
        </Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectHeightPinned(canvas, 'outline-sm', 28);
    await expectHeightPinned(canvas, 'outline-default', 32);
    await expectHeightPinned(canvas, 'outline-lg', 36);
    await expectHeightPinned(canvas, 'dashed-sm', 28);
    await expectHeightPinned(canvas, 'dashed-default', 32);
    await expectHeightPinned(canvas, 'dashed-lg', 36);
  },
};

export const TextHeightsArePinnedAcrossModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Density-stability sentinel for the Figma text-button scale. Sm, default, and lg should stay 28px, 32px, and 36px across spacing modes.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background">
      {SPACING_MODES.map((mode) => (
        <div
          key={mode}
          data-style={mode}
          className="nx:flex nx:items-center nx:gap-2"
        >
          <Button data-testid={`button-default-${mode}`}>Default</Button>
          <Button size="sm" data-testid={`button-sm-${mode}`}>
            Sm
          </Button>
          <Button size="lg" data-testid={`button-lg-${mode}`}>
            Lg
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultButton = canvas.getByTestId('button-default-vega');
    const smallButton = canvas.getByTestId('button-sm-vega');

    await expect(defaultButton).toHaveClass('nx:typography-label-default');
    await expect(defaultButton).toHaveClass('nx:px-3');
    await expect(defaultButton).toHaveClass('nx:py-1.5');
    await expect(defaultButton).toHaveClass('nx:gap-1');
    await expect(smallButton).toHaveClass('nx:typography-label-small');
    await expect(smallButton).toHaveClass('nx:px-2.5');
    await expect(smallButton).toHaveClass('nx:py-1.5');
    await expect(smallButton).toHaveClass('nx:gap-1');

    await expectHeightPinnedAcrossModes(
      canvas,
      SPACING_MODES.map((mode) => `button-default-${mode}`),
      32
    );
    await expectHeightPinnedAcrossModes(
      canvas,
      SPACING_MODES.map((mode) => `button-sm-${mode}`),
      28
    );
    await expectHeightPinnedAcrossModes(
      canvas,
      SPACING_MODES.map((mode) => `button-lg-${mode}`),
      36
    );
  },
};

export const VegaDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the Figma numeric-spacing outcome: in vega mode, a default Button renders at exactly 32px (= `typography-label-default` 20px line-height + `py-1.5` 6px x 2).',
      },
    },
  },
  render: () => (
    <div
      data-style="vega"
      data-testid="button-vega-host"
      className="nx:p-10 nx:bg-background"
    >
      <Button>Default</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'button-vega-host', 32);
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
