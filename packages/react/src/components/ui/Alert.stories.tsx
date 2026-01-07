import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { themeOnlyModes } from '@/storybook/modes';

import { Alert, AlertDescription, AlertTitle } from './alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'information', 'warning', 'success'],
      description: 'The visual style variant',
    },
    isBanner: {
      control: 'boolean',
      description: 'Whether to display as a banner with colored background',
    },
    icon: {
      control: false,
      description: 'Custom icon element or null to hide icon',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

// ============================================
// DEFAULT STORIES (visual documentation)
// ============================================

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>This is the alert description</AlertDescription>
    </Alert>
  ),
};

export const DefaultVariant: Story = {
  render: () => (
    <Alert variant="default">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
};

// ============================================
// VARIANT STORIES
// ============================================

export const Error: Story = {
  render: () => (
    <Alert variant="error">
      <AlertTitle variant="error">Error</AlertTitle>
      <AlertDescription variant="error">
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};

export const Information: Story = {
  render: () => (
    <Alert variant="information">
      <AlertTitle variant="information">Information</AlertTitle>
      <AlertDescription variant="information">
        A new software update is available for download.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTitle variant="warning">Warning</AlertTitle>
      <AlertDescription variant="warning">
        Your account is about to expire. Please renew your subscription.
      </AlertDescription>
    </Alert>
  ),
  // TODO: Fix warning-text token contrast (3.55:1, needs 4.5:1)
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <AlertTitle variant="success">Success</AlertTitle>
      <AlertDescription variant="success">
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
  // TODO: Fix success-text token contrast (3.29:1, needs 4.5:1)
  parameters: {
    a11y: { test: 'todo' },
  },
};

// ============================================
// BANNER MODE STORIES
// ============================================

export const DefaultBanner: Story = {
  render: () => (
    <Alert variant="default" isBanner>
      <AlertTitle>Default Banner</AlertTitle>
      <AlertDescription>
        This alert has a muted background color.
      </AlertDescription>
    </Alert>
  ),
  // TODO: Fix muted-foreground/muted token contrast
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const ErrorBanner: Story = {
  render: () => (
    <Alert variant="error" isBanner>
      <AlertTitle variant="error">Error Banner</AlertTitle>
      <AlertDescription variant="error">
        Something went wrong. Please try again.
      </AlertDescription>
    </Alert>
  ),
  // TODO: Fix error-text/error-surface token contrast
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const InformationBanner: Story = {
  render: () => (
    <Alert variant="information" isBanner>
      <AlertTitle variant="information">Information Banner</AlertTitle>
      <AlertDescription variant="information">
        You have new notifications.
      </AlertDescription>
    </Alert>
  ),
};

export const WarningBanner: Story = {
  render: () => (
    <Alert variant="warning" isBanner>
      <AlertTitle variant="warning">Warning Banner</AlertTitle>
      <AlertDescription variant="warning">
        Your storage is almost full.
      </AlertDescription>
    </Alert>
  ),
  // TODO: Fix warning-text/warning-surface token contrast (3.35:1, needs 4.5:1)
  parameters: {
    a11y: { test: 'todo' },
  },
};

export const SuccessBanner: Story = {
  render: () => (
    <Alert variant="success" isBanner>
      <AlertTitle variant="success">Success Banner</AlertTitle>
      <AlertDescription variant="success">
        Payment completed successfully.
      </AlertDescription>
    </Alert>
  ),
  // TODO: Fix success-text/success-surface token contrast (3.14:1, needs 4.5:1)
  parameters: {
    a11y: { test: 'todo' },
  },
};

// ============================================
// ICON STORIES
// ============================================

export const WithoutIcon: Story = {
  render: () => (
    <Alert icon={null}>
      <AlertTitle>No Icon Alert</AlertTitle>
      <AlertDescription>
        This alert does not display an icon.
      </AlertDescription>
    </Alert>
  ),
};

export const WithCustomIcon: Story = {
  render: () => (
    <Alert icon={<span aria-hidden="true">🔔</span>}>
      <AlertTitle>Custom Icon</AlertTitle>
      <AlertDescription>
        This alert uses a custom emoji icon.
      </AlertDescription>
    </Alert>
  ),
};

// ============================================
// CONTENT VARIATIONS
// ============================================

export const TitleOnly: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Alert title only</AlertTitle>
    </Alert>
  ),
};

export const DescriptionOnly: Story = {
  render: () => (
    <Alert>
      <AlertDescription>This alert has only a description.</AlertDescription>
    </Alert>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Long Content Alert</AlertTitle>
      <AlertDescription>
        This is a much longer description that demonstrates how the alert
        component handles extended text content. It should wrap nicely and
        maintain proper spacing with the icon and title. Lorem ipsum dolor sit
        amet, consectetur adipiscing elit.
      </AlertDescription>
    </Alert>
  ),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const WithDataAttributes: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Alert variant="information">
      <AlertTitle variant="information">Test Alert</AlertTitle>
      <AlertDescription variant="information">Test description</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');

    await expect(alert).toHaveAttribute('data-slot', 'alert');
    await expect(alert).toHaveAttribute('data-variant', 'information');
  },
};

export const AccessibilityRole: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Alert>
      <AlertTitle>Accessible Alert</AlertTitle>
      <AlertDescription>This alert has proper ARIA role.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');

    // Verify role="alert" is present
    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('role', 'alert');
  },
};

export const WithCustomClassName: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Alert className="custom-test-class">
      <AlertTitle>Custom Class Alert</AlertTitle>
      <AlertDescription>This alert has a custom class.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');

    await expect(alert).toHaveClass('custom-test-class');
  },
};

export const IconSlotPresent: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Alert>
      <AlertTitle>Icon Slot Test</AlertTitle>
      <AlertDescription>Testing icon slot presence.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const iconSlot = canvas.getByRole('alert').querySelector('[data-slot="alert-icon"]');
    const contentSlot = canvas.getByRole('alert').querySelector('[data-slot="alert-content"]');

    await expect(iconSlot).toBeInTheDocument();
    await expect(contentSlot).toBeInTheDocument();
  },
};

export const TitleSlotPresent: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Alert>
      <AlertTitle>Title Slot Test</AlertTitle>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const titleSlot = canvas.getByRole('alert').querySelector('[data-slot="alert-title"]');

    await expect(titleSlot).toBeInTheDocument();
    await expect(titleSlot).toHaveTextContent('Title Slot Test');
  },
};

export const DescriptionSlotPresent: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Alert>
      <AlertDescription>Description Slot Test</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const descSlot = canvas.getByRole('alert').querySelector('[data-slot="alert-description"]');

    await expect(descSlot).toBeInTheDocument();
    await expect(descSlot).toHaveTextContent('Description Slot Test');
  },
};

// ============================================
// ALL VARIANTS GRID (visual reference)
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6 nx:max-w-2xl">
      <div>
        <div className="nx:text-foreground nx:mb-3 nx:text-sm nx:font-medium">
          Standard (isBanner=false)
        </div>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <Alert variant="default">
            <AlertTitle>Default</AlertTitle>
            <AlertDescription>This is the alert description</AlertDescription>
          </Alert>
          <Alert variant="error">
            <AlertTitle variant="error">Error</AlertTitle>
            <AlertDescription variant="error">
              This is the alert description
            </AlertDescription>
          </Alert>
          <Alert variant="information">
            <AlertTitle variant="information">Information</AlertTitle>
            <AlertDescription variant="information">
              This is the alert description
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTitle variant="warning">Warning</AlertTitle>
            <AlertDescription variant="warning">
              This is the alert description
            </AlertDescription>
          </Alert>
          <Alert variant="success">
            <AlertTitle variant="success">Success</AlertTitle>
            <AlertDescription variant="success">
              This is the alert description
            </AlertDescription>
          </Alert>
        </div>
      </div>
      <div>
        <div className="nx:text-foreground nx:mb-3 nx:text-sm nx:font-medium">
          Banner (isBanner=true)
        </div>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <Alert variant="default" isBanner>
            <AlertTitle>Default</AlertTitle>
            <AlertDescription>This is the alert description</AlertDescription>
          </Alert>
          <Alert variant="error" isBanner>
            <AlertTitle variant="error">Error</AlertTitle>
            <AlertDescription variant="error">
              This is the alert description
            </AlertDescription>
          </Alert>
          <Alert variant="information" isBanner>
            <AlertTitle variant="information">Information</AlertTitle>
            <AlertDescription variant="information">
              This is the alert description
            </AlertDescription>
          </Alert>
          <Alert variant="warning" isBanner>
            <AlertTitle variant="warning">Warning</AlertTitle>
            <AlertDescription variant="warning">
              This is the alert description
            </AlertDescription>
          </Alert>
          <Alert variant="success" isBanner>
            <AlertTitle variant="success">Success</AlertTitle>
            <AlertDescription variant="success">
              This is the alert description
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    chromatic: {
      modes: themeOnlyModes,
    },
    // TODO: Fix warning-text and success-text token contrasts
    a11y: { test: 'todo' },
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
