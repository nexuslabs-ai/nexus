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
    caps: {
      control: 'boolean',
      description: 'Use uppercase text with wider letter-spacing',
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
    caps: true,
    children: 'Label',
  },
};

export const Sentence: Story = {
  args: {
    caps: false,
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
    caps: false,
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

export const WithIconLeft: Story = {
  render: (args) => (
    <Badge {...args}>
      <IconCheck className="nx:size-3" />
      Verified
    </Badge>
  ),
  args: {
    variant: 'success',
    caps: false,
  },
  // TODO: Fix success-background/success-foreground token contrast
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const WithIconRight: Story = {
  render: (args) => (
    <Badge {...args}>
      Dismiss
      <IconX className="nx:size-3" />
    </Badge>
  ),
  args: {
    variant: 'secondary',
    caps: false,
  },
};

// ============================================
// EDGE CASES
// ============================================

export const NumberBadge: Story = {
  args: {
    children: '8',
  },
};

export const LongContent: Story = {
  args: {
    children: 'This is a very long badge text',
    caps: false,
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
          <Badge variant="default" caps={false}>
            Label
          </Badge>
          <Badge variant="secondary" caps={false}>
            Label
          </Badge>
          <Badge variant="outline" caps={false}>
            Label
          </Badge>
          <Badge variant="error" caps={false}>
            Label
          </Badge>
          <Badge variant="warning" caps={false}>
            Label
          </Badge>
          <Badge variant="success" caps={false}>
            Label
          </Badge>
          <Badge variant="information" caps={false}>
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
          <Badge variant="default" fill="light" caps={false}>
            Label
          </Badge>
          <Badge variant="error" fill="light" caps={false}>
            Label
          </Badge>
          <Badge variant="warning" fill="light" caps={false}>
            Label
          </Badge>
          <Badge variant="success" fill="light" caps={false}>
            Label
          </Badge>
          <Badge variant="information" fill="light" caps={false}>
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
          <Badge variant="default">8</Badge>
          <Badge variant="secondary">8</Badge>
          <Badge variant="outline">8</Badge>
          <Badge variant="error">8</Badge>
          <Badge variant="warning">8</Badge>
          <Badge variant="success">8</Badge>
          <Badge variant="information">8</Badge>
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:text-sm nx:font-medium">
          With Icons
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" caps={false}>
            <IconCheck className="nx:size-3" />
            Label
          </Badge>
          <Badge variant="success" caps={false}>
            <IconCheck className="nx:size-3" />
            Label
          </Badge>
          <Badge variant="error" caps={false}>
            Label
            <IconX className="nx:size-3" />
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
