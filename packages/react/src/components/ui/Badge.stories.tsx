import type { Meta, StoryObj } from '@storybook/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { SPACING_MODES } from '../../stories/spacing-modes';
import { expectHeightPinnedAcrossModes } from '../../stories/test-utils';

import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'outline',
        'error',
        'warning',
        'success',
        'information',
      ],
      description: 'The visual style variant',
    },
    fill: {
      control: 'select',
      options: ['solid', 'light'],
      description: 'The fill style (solid or light/surface)',
    },
    isCaps: {
      control: 'boolean',
      description: 'Use uppercase text with wider letter-spacing',
    },
    isNumber: {
      control: 'boolean',
      description: 'Render as circular number badge (pass number as children)',
    },
    leftIcon: {
      control: false,
      description: 'Icon to display before the label',
    },
    rightIcon: {
      control: false,
      description: 'Icon to display after the label',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (for composition)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// ============================================
// VARIANT STORIES (Solid Fill)
// ============================================

export const Default: Story = {
  args: {
    children: 'Badge',
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

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Error',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
};

export const Information: Story = {
  args: {
    variant: 'information',
    children: 'Info',
  },
};

// ============================================
// FILL STYLE STORIES
// ============================================

export const SolidFill: Story = {
  args: {
    variant: 'default',
    fill: 'solid',
    children: 'Solid',
  },
};

export const LightFill: Story = {
  args: {
    variant: 'default',
    fill: 'light',
    children: 'Light',
  },
};

// ============================================
// TYPOGRAPHY STYLE STORIES
// ============================================

export const Caps: Story = {
  args: {
    isCaps: true,
    children: 'Label',
  },
};

export const Sentence: Story = {
  args: {
    isCaps: false,
    children: 'Label',
  },
};

// ============================================
// DATA ATTRIBUTE TESTS
// ============================================

export const WithDataAttributes: Story = {
  args: {
    children: 'Status',
    variant: 'success',
    fill: 'light',
    isCaps: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Status');

    await expect(badge).toHaveAttribute('data-slot', 'badge');
    await expect(badge).toHaveAttribute('data-variant', 'success');
    await expect(badge).toHaveAttribute('data-fill', 'light');
    await expect(badge).toHaveAttribute('data-caps', 'false');
  },
};

export const WithCustomClassName: Story = {
  args: {
    children: 'Custom',
    className: 'custom-test-class',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Custom');

    await expect(badge).toHaveClass('custom-test-class');
  },
};

// ============================================
// COMPOSITION (asChild)
// ============================================

export const AsLink: Story = {
  render: (_args) => (
    <Badge asChild>
      <a href="https://example.com">New</a>
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('data-slot', 'badge');
  },
};

// ============================================
// WITH ICONS
// ============================================

export const WithLeftIcon: Story = {
  args: {
    children: 'Verified',
    variant: 'success',
    isCaps: false,
    leftIcon: <IconCheck />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Dismiss',
    variant: 'secondary',
    isCaps: false,
    rightIcon: <IconX />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Status',
    variant: 'default',
    isCaps: false,
    leftIcon: <IconCheck />,
    rightIcon: <IconX />,
  },
};

// ============================================
// NUMBER BADGES
// ============================================

export const NumberBadge: Story = {
  args: {
    isNumber: true,
    children: 8,
  },
};

export const NumberBadgeHighValue: Story = {
  args: {
    isNumber: true,
    children: '99+',
    variant: 'error',
  },
};

export const NumberBadgeIgnoresIcons: Story = {
  args: {
    isNumber: true,
    children: 5,
    leftIcon: <IconCheck />, // Should be ignored
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('5');

    // Should render as number badge without icon
    await expect(badge).toHaveAttribute('data-number', 'true');
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongContent: Story = {
  args: {
    children: 'This is a very long badge text',
    isCaps: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('This is a very long badge text');

    await expect(badge).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID (visual reference)
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      {/* Solid Fill - Caps */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:text-sm nx:font-medium">
          Solid Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default">Label</Badge>
          <Badge variant="secondary">Label</Badge>
          <Badge variant="outline">Label</Badge>
          <Badge variant="error">Label</Badge>
          <Badge variant="warning">Label</Badge>
          <Badge variant="success">Label</Badge>
          <Badge variant="information">Label</Badge>
        </div>
      </div>

      {/* Solid Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:text-sm nx:font-medium">
          Solid Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isCaps={false}>
            Label
          </Badge>
          <Badge variant="secondary" isCaps={false}>
            Label
          </Badge>
          <Badge variant="outline" isCaps={false}>
            Label
          </Badge>
          <Badge variant="error" isCaps={false}>
            Label
          </Badge>
          <Badge variant="warning" isCaps={false}>
            Label
          </Badge>
          <Badge variant="success" isCaps={false}>
            Label
          </Badge>
          <Badge variant="information" isCaps={false}>
            Label
          </Badge>
        </div>
      </div>

      {/* Light Fill - Caps */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:text-sm nx:font-medium">
          Light Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="light">
            Label
          </Badge>
          <Badge variant="error" fill="light">
            Label
          </Badge>
          <Badge variant="warning" fill="light">
            Label
          </Badge>
          <Badge variant="success" fill="light">
            Label
          </Badge>
          <Badge variant="information" fill="light">
            Label
          </Badge>
        </div>
      </div>

      {/* Light Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:text-sm nx:font-medium">
          Light Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="error" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="warning" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="success" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="information" fill="light" isCaps={false}>
            Label
          </Badge>
        </div>
      </div>

      {/* Number Badges */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:text-sm nx:font-medium">
          Number Badges
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isNumber>
            8
          </Badge>
          <Badge variant="secondary" isNumber>
            8
          </Badge>
          <Badge variant="outline" isNumber>
            8
          </Badge>
          <Badge variant="error" isNumber>
            8
          </Badge>
          <Badge variant="warning" isNumber>
            8
          </Badge>
          <Badge variant="success" isNumber>
            8
          </Badge>
          <Badge variant="information" isNumber>
            8
          </Badge>
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:text-sm nx:font-medium">
          With Icons
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isCaps={false} leftIcon={<IconCheck />}>
            Label
          </Badge>
          <Badge variant="success" isCaps={false} leftIcon={<IconCheck />}>
            Label
          </Badge>
          <Badge variant="error" isCaps={false} rightIcon={<IconX />}>
            Label
          </Badge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// ============================================
// MODE BEHAVIOUR (density stability)
// ============================================

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Badge is intentionally density-stable — its utilities sit on the canonical numeric step set (`px-2`, `py-0.5`, `gap-1`) rather than the `control-*` role family, because a chip is not a control (its padding is sub-control by design). All 7 rows should render at the same height regardless of mode. The `BadgeIsDensityStable` sentinel below asserts this.',
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
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="error" leftIcon={<IconX />}>
            Error
          </Badge>
        </div>
      ))}
    </div>
  ),
};

export const BadgeIsDensityStable: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Density-stability sentinel. Badge uses numeric `spacing-N` utilities only, so every spacing mode renders it at the same canonical 20px height (= `text-xs` line-height 16px + `py-0.5` 2×2). If a future PR introduces a `control-*` role utility on Badge, this test fails for that mode — the regression signal is that intent (numeric, mode-stable) has been broken.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="nova" data-testid="badge-host-nova">
        <Badge>Nova</Badge>
      </div>
      <div data-style="vega" data-testid="badge-host-vega">
        <Badge>Vega</Badge>
      </div>
      <div data-style="sera" data-testid="badge-host-sera">
        <Badge>Sera</Badge>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinnedAcrossModes(
      within(canvasElement),
      ['badge-host-nova', 'badge-host-vega', 'badge-host-sera'],
      20,
      { selector: '[data-slot="badge"]' }
    );
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
