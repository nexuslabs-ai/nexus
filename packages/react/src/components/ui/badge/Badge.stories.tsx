import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { SPACING_MODES } from '../../../stories/spacing-modes';
import { expectHeightFixedAcrossModes } from '../../../stories/test-utils';
import { Spinner } from '../spinner';

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
        'error',
        'warning',
        'success',
        'information',
      ],
      description: 'The visual style variant',
    },
    fill: {
      control: 'select',
      options: ['solid', 'light', 'outline'],
      description: 'The fill style (solid, light/surface, or outline)',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Badge');

    await expect(badge).toHaveAttribute('data-variant', 'default');
    await expect(badge).toHaveAttribute('data-fill', 'solid');
    await expect(badge).toHaveAttribute('data-caps', 'true');
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

export const ErrorVariant: Story = {
  name: 'Error',
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

export const OutlineFill: Story = {
  args: {
    variant: 'success',
    fill: 'outline',
    children: 'Outline',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Outline');
    const badgeStyles = getComputedStyle(badge);

    await expect(badge).toHaveAttribute('data-variant', 'success');
    await expect(badge).toHaveAttribute('data-fill', 'outline');
    // Assert the rendered result (opaque fill + visible border), not the
    // utility class names — class names are implementation detail and mergeable.
    expect(badgeStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(parseFloat(badgeStyles.borderTopWidth)).toBeGreaterThan(0);
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Status');
    const svgs = badge.querySelectorAll('svg');

    await expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      const rect = svg.getBoundingClientRect();

      expect(Math.round(rect.width)).toBe(14);
      expect(Math.round(rect.height)).toBe(14);
    }
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'success',
    fill: 'light',
    leftIcon: <IconCheck />,
    'aria-label': 'Approved',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('img', { name: 'Approved' });
    const svg = badge.querySelector('svg');
    const rect = badge.getBoundingClientRect();

    if (!(svg instanceof SVGElement)) {
      throw new Error('Expected icon-only badge to render an SVG icon.');
    }

    const svgRect = svg.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-icon-only', 'true');
    expect(badge.textContent).toBe('');
    expect(Math.round(rect.height)).toBe(24);
    expect(Math.round(rect.width)).toBeGreaterThanOrEqual(24);
    expect(Math.round(svgRect.width)).toBe(14);
    expect(Math.round(svgRect.height)).toBe(14);
  },
};

export const WithSvgLoader: Story = {
  args: {
    children: 'Loading',
    variant: 'information',
    fill: 'outline',
    isCaps: false,
    leftIcon: (
      <Spinner role="presentation" aria-hidden="true" aria-label={undefined} />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Loading');
    const spinner = badge.querySelector('[data-slot="spinner"]');

    if (!(spinner instanceof SVGElement)) {
      throw new Error('Expected loader badge to render a Spinner SVG.');
    }

    const rect = spinner.getBoundingClientRect();

    await expect(spinner).toHaveAttribute('role', 'presentation');
    await expect(spinner).toHaveAttribute('aria-hidden', 'true');
    await expect(spinner).not.toHaveAttribute('aria-label');
    expect(Math.round(rect.width)).toBe(14);
    expect(Math.round(rect.height)).toBe(14);
  },
};

export const StatusWithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Recommended (not enforced): don't rely on color alone for status — pair a status `variant` with clear text and/or a leading icon. The icons here are a suggested set.",
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Badge
        variant="success"
        fill="light"
        isCaps={false}
        leftIcon={<IconCircleCheck />}
      >
        Success
      </Badge>
      <Badge
        variant="warning"
        fill="light"
        isCaps={false}
        leftIcon={<IconAlertTriangle />}
      >
        Warning
      </Badge>
      <Badge
        variant="error"
        fill="light"
        isCaps={false}
        leftIcon={<IconAlertCircle />}
      >
        Error
      </Badge>
      <Badge
        variant="information"
        fill="light"
        isCaps={false}
        leftIcon={<IconInfoCircle />}
      >
        Info
      </Badge>
    </div>
  ),
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('99+');
    const rect = badge.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-number', 'true');
    expect(Math.round(rect.height)).toBe(24);
    expect(Math.round(rect.width)).toBeGreaterThan(24);
  },
};

export const NumberBadgeIgnoresIcons: Story = {
  args: {
    isNumber: true,
    children: 5,
    leftIcon: <IconCheck />, // Should be ignored
    rightIcon: <IconX />, // Should be ignored
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('5');

    // Number mode wins over icons.
    await expect(badge).toHaveAttribute('data-number', 'true');
    await expect(badge.querySelectorAll('svg')).toHaveLength(0);
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
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Solid Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default">Label</Badge>
          <Badge variant="secondary">Label</Badge>
          <Badge variant="error">Label</Badge>
          <Badge variant="warning">Label</Badge>
          <Badge variant="success">Label</Badge>
          <Badge variant="information">Label</Badge>
        </div>
      </div>

      {/* Solid Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Solid Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isCaps={false}>
            Label
          </Badge>
          <Badge variant="secondary" isCaps={false}>
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
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Light Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="light">
            Label
          </Badge>
          <Badge variant="secondary" fill="light">
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
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Light Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="secondary" fill="light" isCaps={false}>
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

      {/* Outline Fill - Caps */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Outline Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="outline">
            Default
          </Badge>
          <Badge variant="secondary" fill="outline">
            Secondary
          </Badge>
          <Badge variant="error" fill="outline">
            Error
          </Badge>
          <Badge variant="warning" fill="outline">
            Warning
          </Badge>
          <Badge variant="success" fill="outline">
            Success
          </Badge>
          <Badge variant="information" fill="outline">
            Info
          </Badge>
        </div>
      </div>

      {/* Outline Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Outline Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="outline" isCaps={false}>
            Default
          </Badge>
          <Badge variant="secondary" fill="outline" isCaps={false}>
            Secondary
          </Badge>
          <Badge variant="error" fill="outline" isCaps={false}>
            Error
          </Badge>
          <Badge variant="warning" fill="outline" isCaps={false}>
            Warning
          </Badge>
          <Badge variant="success" fill="outline" isCaps={false}>
            Success
          </Badge>
          <Badge variant="information" fill="outline" isCaps={false}>
            Info
          </Badge>
        </div>
      </div>

      {/* Number Badges */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Number Badges
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isNumber>
            8
          </Badge>
          <Badge variant="secondary" isNumber>
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

      {/* Icon Only */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Icon Only
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge
            variant="success"
            fill="light"
            leftIcon={<IconCheck />}
            aria-label="Approved"
          />
          <Badge
            variant="default"
            fill="solid"
            leftIcon={<IconCheck />}
            aria-label="Verified"
          />
          <Badge
            variant="error"
            fill="outline"
            rightIcon={<IconX />}
            aria-label="Error"
          />
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
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

      {/* With SVG Loader */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          With SVG Loader
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge
            variant="information"
            fill="outline"
            isCaps={false}
            leftIcon={
              <Spinner
                role="presentation"
                aria-hidden="true"
                aria-label={undefined}
              />
            }
          >
            Loading
          </Badge>
          <Badge
            variant="information"
            fill="light"
            isCaps={false}
            leftIcon={
              <Spinner
                role="presentation"
                aria-hidden="true"
                aria-label={undefined}
              />
            }
          >
            Syncing
          </Badge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'All spacing-mode rows render at the same Badge height; the `BadgeIsDensityStable` sentinel below asserts it.',
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
          'Mode-invariance sentinel: Badge renders at the same height in every spacing mode.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="compact" data-testid="badge-host-compact">
        <Badge>Nova</Badge>
      </div>
      <div data-style="regular" data-testid="badge-host-regular">
        <Badge>Vega</Badge>
      </div>
      <div data-style="spacious" data-testid="badge-host-spacious">
        <Badge>Sera</Badge>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightFixedAcrossModes(
      within(canvasElement),
      ['badge-host-compact', 'badge-host-regular', 'badge-host-spacious'],
      24,
      { selector: '[data-slot="badge"]' }
    );
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
