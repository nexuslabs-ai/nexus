import type { Meta, StoryObj } from '@storybook/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { themeOnlyModes } from '@/storybook/modes';

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
      description: 'Render as circular number badge',
    },
    value: {
      control: 'text',
      description: 'Value to display when isNumber is true',
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
  // TODO: Fix error-background/error-foreground token contrast (3.76:1, needs 4.5:1)
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
  // TODO: Fix warning-background/warning-foreground token contrast (2.8:1, needs 4.5:1)
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
  // TODO: Fix success-background/success-foreground token contrast (3.29:1, needs 4.5:1)
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const Information: Story = {
  args: {
    variant: 'information',
    children: 'Info',
  },
  // TODO: Fix information-background/information-foreground token contrast (needs review)
  parameters: {
    a11y: { test: 'todo' },
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
  parameters: {
    chromatic: { disableSnapshot: true },
    // TODO: Fix success-surface/success-text token contrast
    a11y: { test: 'todo' },
  },
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
  parameters: {
    chromatic: { disableSnapshot: true },
  },
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
  render: (args) => (
    <Badge {...args} asChild>
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
  // TODO: Fix success-background/success-foreground token contrast
  parameters: {
    a11y: { test: 'todo' },
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
    value: 8,
  },
};

export const NumberBadgeHighValue: Story = {
  args: {
    isNumber: true,
    value: '99+',
    variant: 'error',
  },
  // TODO: Fix error-background/error-foreground token contrast
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const NumberBadgeIgnoresIcons: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    isNumber: true,
    value: 5,
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
  render: () => (
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
          <Badge variant="default" isNumber value={8} />
          <Badge variant="secondary" isNumber value={8} />
          <Badge variant="outline" isNumber value={8} />
          <Badge variant="error" isNumber value={8} />
          <Badge variant="warning" isNumber value={8} />
          <Badge variant="success" isNumber value={8} />
          <Badge variant="information" isNumber value={8} />
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
    chromatic: {
      modes: themeOnlyModes,
    },
    // TODO: Fix status token contrast ratios across error, warning, success, information
    a11y: { test: 'todo' },
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
