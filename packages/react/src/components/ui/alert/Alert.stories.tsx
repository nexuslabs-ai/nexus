import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  AllModesGrid,
  AllModesRow,
  SPACING_MODES,
} from '../../../stories/spacing-modes';
import {
  expectHeightPinned,
  expectModeCascadeWorks,
} from '../../../stories/test-utils';
import { Button } from '../button';

import {
  Alert,
  AlertActions,
  AlertClose,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from './alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  args: {
    layout: 'stack',
    density: 'comfortable',
    presentation: 'card',
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'information', 'destructive', 'success', 'warning'],
      description: 'The visual style variant',
    },
    presentation: {
      control: 'select',
      options: ['card', 'banner'],
      description: 'The alert presentation style',
    },
    layout: {
      control: 'select',
      options: ['stack', 'inline'],
      description: 'The alert content/action arrangement',
    },
    density: {
      control: 'select',
      options: ['comfortable', 'compact'],
      description: 'The alert spacing density',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

function DismissibleCloseButtonExample(
  props: React.ComponentProps<typeof Alert>
) {
  const [visible, setVisible] = React.useState(true);

  if (!visible) return <div data-testid="dismissed-alert" />;

  return (
    <Alert {...props} className="nx:max-w-xl">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertTitle>Invite ready</AlertTitle>
        <AlertDescription>
          The workspace invitation can now be sent.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <AlertClose onClick={() => setVisible(false)} />
      </AlertActions>
    </Alert>
  );
}

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};

export const Information: Story = {
  args: {
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        New workspace invitations are available for review.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  args: {
    variant: 'success',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  args: {
    variant: 'warning',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your account is about to expire. Please renew your subscription.
      </AlertDescription>
    </Alert>
  ),
};

export const BannerPresentation: Story = {
  args: {
    presentation: 'banner',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        New workspace invitations are available for review.
      </AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-variant', 'information');
    await expect(alert).toHaveAttribute('data-presentation', 'banner');
  },
};

// ============================================
// WITH ICON STORIES
// ============================================

export const WithIcon: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is an informational alert with an icon.
      </AlertDescription>
    </Alert>
  ),
};

export const DestructiveWithIcon: Story = {
  args: {
    variant: 'destructive',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <IconAlertCircle aria-hidden="true" className="nx:size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again later.
      </AlertDescription>
    </Alert>
  ),
};

export const InformationWithIcon: Story = {
  args: {
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        New workspace invitations are available for review.
      </AlertDescription>
    </Alert>
  ),
};

export const SuccessWithIcon: Story = {
  args: {
    variant: 'success',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <IconCircleCheck aria-hidden="true" className="nx:size-4" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your payment was processed successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const WarningWithIcon: Story = {
  args: {
    variant: 'warning',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <IconAlertTriangle aria-hidden="true" className="nx:size-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your storage is almost full. Consider upgrading your plan.
      </AlertDescription>
    </Alert>
  ),
};

// ============================================
// CONTENT VARIATIONS
// ============================================

export const WithTitle: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>This is just a title</AlertTitle>
    </Alert>
  ),
};

export const TitleAsHeading: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle asChild>
        <h2>Semantic heading</h2>
      </AlertTitle>
      <AlertDescription>
        Use this pattern when the alert title belongs in the page outline.
      </AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {
      name: 'Semantic heading',
    });

    await expect(heading).toBeInTheDocument();
    await expect(heading).toHaveAttribute('data-slot', 'alert-title');
  },
};

export const WithDescription: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertDescription>
        This alert has only a description without a title.
      </AlertDescription>
    </Alert>
  ),
};

export const LongContent: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>Important Information</AlertTitle>
      <AlertDescription>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p className="nx:mt-2">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
        </p>
      </AlertDescription>
    </Alert>
  ),
};

// ============================================
// ACTION PATTERNS
// ============================================

export const DismissibleCloseButton: Story = {
  args: {
    layout: 'inline',
    variant: 'information',
  },
  render: (args) => <DismissibleCloseButtonExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvasElement.querySelector('[data-slot="alert"]');
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-layout', 'inline');
    await userEvent.click(close);
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-slot="alert"]')
      ).not.toBeInTheDocument();
    });
  },
};

export const TextDismissAction: Story = {
  args: {
    layout: 'inline',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-xl">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertTitle>Import completed</AlertTitle>
        <AlertDescription>
          Review the imported contacts before publishing them.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="ghost">Dismiss</Button>
      </AlertActions>
    </Alert>
  ),
};

export const CriticalNoClose: Story = {
  args: {
    variant: 'destructive',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <IconAlertCircle aria-hidden="true" className="nx:size-4" />
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>
        Update the billing method before the workspace is paused.
      </AlertDescription>
    </Alert>
  ),
};

export const InlineAction: Story = {
  args: {
    layout: 'inline',
    variant: 'warning',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-xl">
      <IconAlertTriangle aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>Uploads may fail soon.</AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">Manage</Button>
      </AlertActions>
    </Alert>
  ),
};

export const DescriptionLinkAction: Story = {
  args: {
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertTitle>Sync is paused</AlertTitle>
      <AlertDescription>
        Reconnect the integration from{' '}
        <a
          className="nx:font-medium nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline"
          href="/settings"
        >
          workspace settings
        </a>
        .
      </AlertDescription>
    </Alert>
  ),
};

export const ActionsBelowDescription: Story = {
  args: {
    variant: 'warning',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <IconAlertTriangle aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertTitle>Plan limit reached</AlertTitle>
        <AlertDescription>
          Upgrade the workspace or remove unused seats before inviting more
          members.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button>Upgrade</Button>
        <Button variant="outline">View usage</Button>
      </AlertActions>
    </Alert>
  ),
};

export const InlineActionsWithClose: Story = {
  args: {
    layout: 'inline',
    variant: 'success',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-2xl">
      <IconCircleCheck aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertTitle>Deployment complete</AlertTitle>
        <AlertDescription>
          Version 2.4.0 is live in the production environment.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">View release</Button>
        <AlertClose />
      </AlertActions>
    </Alert>
  ),
};

export const BannerInlineActions: Story = {
  args: {
    layout: 'inline',
    presentation: 'banner',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-3xl">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertTitle>New policy available</AlertTitle>
        <AlertDescription>
          Review the updated workspace retention policy.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">Review</Button>
        <AlertClose />
      </AlertActions>
    </Alert>
  ),
};

export const CompactHelperBanner: Story = {
  args: {
    layout: 'inline',
    density: 'compact',
    presentation: 'banner',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-3xl">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertDescription>
          Scheduled maintenance begins at 9 PM.{' '}
          <a
            className="nx:font-medium nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline"
            href="/status"
          >
            View status
          </a>
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <AlertClose />
      </AlertActions>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-layout', 'inline');
    await expect(alert).toHaveAttribute('data-density', 'compact');
  },
};

export const CustomCloseIconLabel: Story = {
  args: {
    layout: 'inline',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-xl">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertTitle>Custom close icon</AlertTitle>
        <AlertDescription>
          Icon-only custom children need an explicit accessible name.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <AlertClose aria-label="Dismiss alert">
          <IconX aria-hidden="true" />
        </AlertClose>
      </AlertActions>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await expect(close).toBeInTheDocument();
    await expect(close).toHaveAttribute('aria-label', 'Dismiss alert');
  },
};

export const TextCloseLabel: Story = {
  args: {
    layout: 'inline',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-xl">
      <IconInfoCircle aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertTitle>Text close control</AlertTitle>
        <AlertDescription>
          Text children self-label, so the button keeps its visible name.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <AlertClose className="nx:size-auto nx:px-2 nx:typography-label-small">
          Close
        </AlertClose>
      </AlertActions>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Close' });

    await expect(close).toBeInTheDocument();
    await expect(close).not.toHaveAttribute('aria-label');
  },
};

// ============================================
// DATA ATTRIBUTES TESTS
// ============================================

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Alert variant="destructive" className="nx:max-w-md">
      <AlertTitle>Test Alert</AlertTitle>
      <AlertDescription>Testing data attributes.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    // Check data-slot attributes
    const alert = canvasElement.querySelector('[data-slot="alert"]');
    const title = canvasElement.querySelector('[data-slot="alert-title"]');
    const description = canvasElement.querySelector(
      '[data-slot="alert-description"]'
    );

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-variant', 'destructive');
    await expect(alert).toHaveAttribute('data-presentation', 'card');
    await expect(alert).toHaveAttribute('data-layout', 'stack');
    await expect(alert).toHaveAttribute('data-density', 'comfortable');
    await expect(alert).not.toHaveAttribute('role');
    await expect(title).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
  },
};

export const ActionSlotDataAttributes: Story = {
  render: (_args) => (
    <Alert variant="warning" layout="inline" className="nx:max-w-xl">
      <IconAlertTriangle aria-hidden="true" className="nx:size-4" />
      <AlertContent>
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>Uploads may fail soon.</AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">Manage</Button>
        <AlertClose />
      </AlertActions>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');
    const content = canvasElement.querySelector('[data-slot="alert-content"]');
    const actions = canvasElement.querySelector('[data-slot="alert-actions"]');
    const close = canvasElement.querySelector('[data-slot="alert-close"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-layout', 'inline');
    await expect(content).toBeInTheDocument();
    await expect(actions).toBeInTheDocument();
    await expect(close).toBeInTheDocument();
    await expect(close).toHaveAttribute('type', 'button');
  },
};

export const DefaultDataAttributes: Story = {
  render: (_args) => (
    <Alert className="nx:max-w-md">
      <AlertTitle>Default Alert</AlertTitle>
      <AlertDescription>Testing default variant.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-variant', 'default');
    await expect(alert).toHaveAttribute('data-presentation', 'card');
    await expect(alert).toHaveAttribute('data-density', 'comfortable');
    await expect(alert).not.toHaveAttribute('role');
  },
};

export const RolePassThrough: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <Alert role="alert" variant="destructive" className="nx:max-w-md">
        <AlertTitle>Session expired</AlertTitle>
        <AlertDescription>
          Sign in again before continuing this task.
        </AlertDescription>
      </Alert>
      <Alert role="status" variant="information" className="nx:max-w-md">
        <AlertTitle>Changes saved</AlertTitle>
        <AlertDescription>
          Your workspace settings were updated.
        </AlertDescription>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[role="alert"]');
    const status = canvasElement.querySelector('[role="status"]');

    await expect(alert).toBeInTheDocument();
    await expect(status).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Default
        </div>
        <Alert className="nx:max-w-md">
          <IconInfoCircle aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>
            This is a default informational alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Information
        </div>
        <Alert variant="information" className="nx:max-w-md">
          <IconInfoCircle aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Information Alert</AlertTitle>
          <AlertDescription>This is an informational alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Destructive
        </div>
        <Alert variant="destructive" className="nx:max-w-md">
          <IconAlertCircle aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Destructive Alert</AlertTitle>
          <AlertDescription>
            This is a destructive/error alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Success
        </div>
        <Alert variant="success" className="nx:max-w-md">
          <IconCircleCheck aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Success Alert</AlertTitle>
          <AlertDescription>This is a success alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Warning
        </div>
        <Alert variant="warning" className="nx:max-w-md">
          <IconAlertTriangle aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Warning Alert</AlertTitle>
          <AlertDescription>This is a warning alert.</AlertDescription>
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const AllBannerVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Default Banner
        </div>
        <Alert presentation="banner" className="nx:max-w-md">
          <IconInfoCircle aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>
            This is a default informational alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Information Banner
        </div>
        <Alert
          presentation="banner"
          variant="information"
          className="nx:max-w-md"
        >
          <IconInfoCircle aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Information Alert</AlertTitle>
          <AlertDescription>This is an informational alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Destructive Banner
        </div>
        <Alert
          presentation="banner"
          variant="destructive"
          className="nx:max-w-md"
        >
          <IconAlertCircle aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Destructive Alert</AlertTitle>
          <AlertDescription>
            This is a destructive/error alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Success Banner
        </div>
        <Alert presentation="banner" variant="success" className="nx:max-w-md">
          <IconCircleCheck aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Success Alert</AlertTitle>
          <AlertDescription>This is a success alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Warning Banner
        </div>
        <Alert presentation="banner" variant="warning" className="nx:max-w-md">
          <IconAlertTriangle aria-hidden="true" className="nx:size-4" />
          <AlertTitle>Warning Alert</AlertTitle>
          <AlertDescription>This is a warning alert.</AlertDescription>
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// ============================================
// MODE BEHAVIOUR (callout rhythm)
// ============================================

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Alert stays on the document spacing scale (`nx:p-4`) rather than migrating to `p-container`. Alert still mode-couples through `--nx-spacing-4` (nova 14 / vega-cluster 16 / maia 18), so the visual height shifts between nova / vega-cluster / maia rows. The point is that Alert uses numeric document padding even though its default visual surface uses `nx:bg-container`.',
      },
    },
  },
  render: () => (
    <AllModesGrid className="nx:gap-3">
      {SPACING_MODES.map((mode) => (
        <AllModesRow key={mode} mode={mode}>
          <Alert className="nx:w-[360px]">
            <AlertTitle>Heads up · {mode}</AlertTitle>
            <AlertDescription>
              Padding follows the spacing-4 mode value.
            </AlertDescription>
          </Alert>
        </AllModesRow>
      ))}
    </AllModesGrid>
  ),
};

export const ModesProduceDifferentHeights: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Cascade sentinel for Alert. Uses the `nova` + `maia` pair — the two modes where `--nx-spacing-4` diverges from the vega cluster (nova 14, maia 18). An Alert scoped to `nova` must render shorter than the same Alert scoped to `maia`. If a future PR accidentally swaps `p-4` for `p-container` the heights would still differ (and the pinned sentinel would catch the change in vega).',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-start nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="nova" data-testid="alert-mode-host-nova">
        <Alert className="nx:w-[200px]">
          <div className="nx:h-10" aria-hidden="true" />
        </Alert>
      </div>
      <div data-style="maia" data-testid="alert-mode-host-maia">
        <Alert className="nx:w-[200px]">
          <div className="nx:h-10" aria-hidden="true" />
        </Alert>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectModeCascadeWorks(
      within(canvasElement),
      'alert-mode-host-nova',
      'alert-mode-host-maia',
      { selector: '[data-slot="alert"]' }
    );
  },
};

export const VegaHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the stays-numeric outcome: in vega mode, an Alert with a single 40px fixed-height child renders at exactly 74px (= border 1 × 2 + `p-4` 16 × 2 + child 40). If a future PR migrates `p-4` to `p-container`, vega rendering shifts to 90px (= 2 + 24 × 2 + 40) and this test fails — the regression signal is that Alert was promoted out of the document scale into the container scale.',
      },
    },
  },
  render: () => (
    <div
      data-style="vega"
      data-testid="alert-vega-host"
      className="nx:p-10 nx:bg-background"
    >
      <Alert className="nx:w-[200px]">
        <div className="nx:h-10" aria-hidden="true" />
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'alert-vega-host', 74, {
      selector: '[data-slot="alert"]',
    });
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
