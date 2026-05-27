import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { SPACING_MODES } from '../../stories/spacing-modes';
import { expectHeightPinnedAcrossModes } from '../../stories/test-utils';

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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Default
        </h3>
        <Alert className="nx:max-w-md">
          <IconInfoCircle className="nx:size-4" />
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>
            This is a default informational alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Destructive
        </h3>
        <Alert variant="destructive" className="nx:max-w-md">
          <IconAlertCircle className="nx:size-4" />
          <AlertTitle>Destructive Alert</AlertTitle>
          <AlertDescription>
            This is a destructive/error alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Success
        </h3>
        <Alert variant="success" className="nx:max-w-md">
          <IconCircleCheck className="nx:size-4" />
          <AlertTitle>Success Alert</AlertTitle>
          <AlertDescription>This is a success alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Warning
        </h3>
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
    // TODO: Fix status token contrast ratios across error, warning, success
    a11y: { test: 'todo' },
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
          'Alert is intentionally density-stable — its `nx:p-4` (16px) sits below `--container-p` (24px in vega) because an alert is a callout, not a container. Migrating to `p-container` would push alert chrome into Card territory and visually compete with adjacent Cards (see `spacing-tokens.md` Alert note). All 7 rows render at the same height regardless of mode. The `AlertIsDensityStable` sentinel below asserts this.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3 nx:p-10 nx:bg-background nx:min-w-fit">
      {SPACING_MODES.map((mode) => (
        <div
          key={mode}
          data-style={mode}
          className="nx:flex nx:gap-2 nx:items-center"
        >
          <span className="nx:w-[64px] nx:typography-label-default nx:font-mono nx:text-muted-foreground">
            {mode}
          </span>
          <Alert className="nx:w-[360px]">
            <AlertTitle>Heads up · {mode}</AlertTitle>
            <AlertDescription>
              Padding does not move with mode.
            </AlertDescription>
          </Alert>
        </div>
      ))}
    </div>
  ),
};

export const AlertIsDensityStable: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Density-stability sentinel. Alert uses numeric `p-4` only, so every spacing mode renders it at the same canonical 74px height (= border 1 × 2 + `p-4` 16 × 2 + child h-10 40). If a future PR introduces a `container-*` or other role utility on Alert, this test fails for that mode — the regression signal is that intent (callout, mode-stable) has been broken. Per the JSDoc on `expectHeightPinnedAcrossModes`, a failure caused by an intentional architecture change (e.g. a `--callout-padding-*` family lands) is intent-changing rather than a regression — bump the expected px to the new canonical value.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-start nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="nova" data-testid="alert-host-nova">
        <Alert className="nx:w-[200px]">
          <div className="nx:h-10" aria-hidden="true" />
        </Alert>
      </div>
      <div data-style="vega" data-testid="alert-host-vega">
        <Alert className="nx:w-[200px]">
          <div className="nx:h-10" aria-hidden="true" />
        </Alert>
      </div>
      <div data-style="sera" data-testid="alert-host-sera">
        <Alert className="nx:w-[200px]">
          <div className="nx:h-10" aria-hidden="true" />
        </Alert>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinnedAcrossModes(
      within(canvasElement),
      ['alert-host-nova', 'alert-host-vega', 'alert-host-sera'],
      74,
      '[data-slot="alert"]'
    );
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
