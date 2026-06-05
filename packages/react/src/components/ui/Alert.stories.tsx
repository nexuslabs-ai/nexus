import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import {
  AllModesGrid,
  AllModesRow,
  SPACING_MODES,
} from '../../stories/spacing-modes';
import {
  expectHeightPinned,
  expectModeCascadeWorks,
} from '../../stories/test-utils';

import { Alert, AlertDescription, AlertTitle } from './alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success', 'warning'],
      description: 'The visual style variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Alert className="nx:max-w-md">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: (_args) => (
    <Alert variant="destructive" className="nx:max-w-md">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: (_args) => (
    <Alert variant="success" className="nx:max-w-md">
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: (_args) => (
    <Alert variant="warning" className="nx:max-w-md">
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your account is about to expire. Please renew your subscription.
      </AlertDescription>
    </Alert>
  ),
};

// ============================================
// WITH ICON STORIES
// ============================================

export const WithIcon: Story = {
  render: (_args) => (
    <Alert className="nx:max-w-md">
      <IconInfoCircle className="nx:size-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is an informational alert with an icon.
      </AlertDescription>
    </Alert>
  ),
};

export const DestructiveWithIcon: Story = {
  render: (_args) => (
    <Alert variant="destructive" className="nx:max-w-md">
      <IconAlertCircle className="nx:size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again later.
      </AlertDescription>
    </Alert>
  ),
};

export const SuccessWithIcon: Story = {
  render: (_args) => (
    <Alert variant="success" className="nx:max-w-md">
      <IconCircleCheck className="nx:size-4" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your payment was processed successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const WarningWithIcon: Story = {
  render: (_args) => (
    <Alert variant="warning" className="nx:max-w-md">
      <IconAlertTriangle className="nx:size-4" />
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
  render: (_args) => (
    <Alert className="nx:max-w-md">
      <AlertTitle>This is just a title</AlertTitle>
    </Alert>
  ),
};

export const WithDescription: Story = {
  render: (_args) => (
    <Alert className="nx:max-w-md">
      <AlertDescription>
        This alert has only a description without a title.
      </AlertDescription>
    </Alert>
  ),
};

export const LongContent: Story = {
  render: (_args) => (
    <Alert className="nx:max-w-md">
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
    await expect(alert).toHaveAttribute('role', 'alert');
    await expect(title).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
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
    // Default variant should have data-variant undefined or 'default'
    // CVA doesn't pass undefined variant to data-variant, so it will be 'default'
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <div className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Default
        </div>
        <Alert className="nx:max-w-md">
          <IconInfoCircle className="nx:size-4" />
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>
            This is a default informational alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Destructive
        </div>
        <Alert variant="destructive" className="nx:max-w-md">
          <IconAlertCircle className="nx:size-4" />
          <AlertTitle>Destructive Alert</AlertTitle>
          <AlertDescription>
            This is a destructive/error alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Success
        </div>
        <Alert variant="success" className="nx:max-w-md">
          <IconCircleCheck className="nx:size-4" />
          <AlertTitle>Success Alert</AlertTitle>
          <AlertDescription>This is a success alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Warning
        </div>
        <Alert variant="warning" className="nx:max-w-md">
          <IconAlertTriangle className="nx:size-4" />
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
// MODE BEHAVIOUR (density stability)
// ============================================

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Alert stays on the document spacing scale (`nx:p-4`) rather than migrating to `p-container`. Alert still mode-couples through `--nx-spacing-4` (nova 14 / vega-cluster 16 / maia 18), so the visual height shifts between nova / vega-cluster / maia rows. The point is that Alert uses the document scale (callout rhythm) instead of the container scale (raised-surface rhythm) — not that it is density-stable.',
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
              Padding does not move with mode.
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
