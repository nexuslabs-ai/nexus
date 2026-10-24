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

import { Spinner } from '../spinner/spinner';

import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          "Badge labels an item with a short status, category or count. It is not interactive. Pair a status color with text or an icon, because color alone doesn't carry meaning.",
      },
    },
  },
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
      description: 'Color role.',
    },
    fill: {
      control: 'select',
      options: ['solid', 'light', 'outline'],
      description: 'Solid, light tint or outline.',
    },
    isCaps: {
      control: 'boolean',
      description: 'Uppercase text with wider letter spacing.',
    },
    isNumber: {
      control: 'boolean',
      description: 'Round count badge. Pass the number as children.',
    },
    leftIcon: {
      control: false,
      description: 'Icon before the label.',
    },
    rightIcon: {
      control: false,
      description: 'Icon after the label.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// `nx:h-6` / `nx:w-6` at `density: default`.
const BADGE_SIZE_PX = 24;
// `nx:size-3.5` icon slot.
const BADGE_ICON_SIZE_PX = 14;

// ============================================
// VARIANT STORIES (Solid Fill)
// ============================================

export const Default: Story = {
  tags: ['docs'],
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add a trailing icon with `rightIcon`.',
      },
    },
  },
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

      expect(Math.round(rect.width)).toBe(BADGE_ICON_SIZE_PX);
      expect(Math.round(rect.height)).toBe(BADGE_ICON_SIZE_PX);
    }
  },
};

export const IconOnly: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show only an icon, named for screen readers with `aria-label`.',
      },
    },
  },
  globals: { density: 'default' },
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
    expect(Math.round(rect.height)).toBe(BADGE_SIZE_PX);
    expect(Math.round(rect.width)).toBeGreaterThanOrEqual(BADGE_SIZE_PX);
    expect(Math.round(svgRect.width)).toBe(BADGE_ICON_SIZE_PX);
    expect(Math.round(svgRect.height)).toBe(BADGE_ICON_SIZE_PX);
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
    expect(Math.round(rect.width)).toBe(BADGE_ICON_SIZE_PX);
    expect(Math.round(rect.height)).toBe(BADGE_ICON_SIZE_PX);
  },
};

export const StatusWithIcons: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Pair each status color with text and a suggested icon, so status never relies on color alone.',
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
  globals: { density: 'default' },
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
    expect(Math.round(rect.height)).toBe(BADGE_SIZE_PX);
    expect(Math.round(rect.width)).toBeGreaterThan(BADGE_SIZE_PX);
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
  tags: ['docs'],
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
    docs: {
      description: {
        story: 'Compare every `variant` and `fill` in caps and sentence case.',
      },
    },
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
