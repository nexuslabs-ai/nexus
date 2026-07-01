import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectHeightPinned } from '../../stories/story-height-test-utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../card';
import { Input } from '../input';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

function getTabsIndicator(canvasElement: HTMLElement) {
  const indicator = canvasElement.querySelector<HTMLElement>(
    '[data-slot="tabs-indicator"]'
  );

  if (!indicator) {
    throw new Error('Expected Tabs indicator to be rendered');
  }

  return indicator;
}

async function waitForIndicatorReady(indicator: HTMLElement) {
  await waitFor(() => expect(indicator.style.opacity).toBe('1'));
}

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Tabs defaultValue="account" className="nx:w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Make changes to your account here. Click save when you&apos;re done.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Change your password here. After saving, you&apos;ll be logged out.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

// ============================================
// VARIANT STORIES
// ============================================

export const UnderlineVariant: Story = {
  render: (_args) => (
    <Tabs defaultValue="account" className="nx:w-[400px]">
      <TabsList className="nx:bg-transparent nx:p-0">
        <TabsTrigger value="account" variant="underline">
          Account
        </TabsTrigger>
        <TabsTrigger value="password" variant="underline">
          Password
        </TabsTrigger>
        <TabsTrigger value="settings" variant="underline">
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Account settings with underline variant tabs.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Password settings with underline variant tabs.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          General settings with underline variant tabs.
        </p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const accountTab = canvas.getByRole('tab', { name: 'Account' });
    const passwordTab = canvas.getByRole('tab', { name: 'Password' });
    const indicator = getTabsIndicator(canvasElement);

    await expect(accountTab).toHaveAttribute('data-state', 'active');
    await waitForIndicatorReady(indicator);
    await expect(indicator).toHaveAttribute('data-variant', 'underline');

    const before = indicator.style.transform;

    await userEvent.click(passwordTab);
    await expect(passwordTab).toHaveAttribute('data-state', 'active');
    await waitFor(() => expect(indicator.style.transform).not.toBe(before));
    await expect(
      canvas.getByText('Password settings with underline variant tabs.')
    ).toBeVisible();
  },
};

// ============================================
// SIZE STORIES
// ============================================

export const SmallSize: Story = {
  render: (_args) => (
    <Tabs defaultValue="tab1" className="nx:w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1" size="sm">
          Small Tab
        </TabsTrigger>
        <TabsTrigger value="tab2" size="sm">
          Another
        </TabsTrigger>
        <TabsTrigger value="tab3" size="sm">
          Third
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Small size tabs content.
        </p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = canvas.getByRole('tab', { name: 'Small Tab' });

    await expect(tab).toHaveClass(
      'nx:typography-label-small',
      'nx:px-2',
      'nx:py-1'
    );
    await expect(getComputedStyle(tab).fontSize).toBe('12px');
  },
};

export const LargeSize: Story = {
  render: (_args) => (
    <Tabs defaultValue="tab1" className="nx:w-[500px]">
      <TabsList>
        <TabsTrigger value="tab1" size="lg">
          Large Tab
        </TabsTrigger>
        <TabsTrigger value="tab2" size="lg">
          Another
        </TabsTrigger>
        <TabsTrigger value="tab3" size="lg">
          Third
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Large size tabs content.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithCards: Story = {
  render: (_args) => (
    <Tabs defaultValue="account" className="nx:w-[400px]">
      <TabsList className="nx:grid nx:w-full nx:grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you&apos;re
              done.
            </CardDescription>
          </CardHeader>
          <CardContent className="nx:space-y-2">
            <div className="nx:space-y-1">
              <label
                htmlFor="name"
                className="nx:typography-label-default nx:leading-none"
              >
                Name
              </label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="nx:space-y-1">
              <label
                htmlFor="username"
                className="nx:typography-label-default nx:leading-none"
              >
                Username
              </label>
              <Input id="username" defaultValue="@peduarte" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you&apos;ll be logged
              out.
            </CardDescription>
          </CardHeader>
          <CardContent className="nx:space-y-2">
            <div className="nx:space-y-1">
              <label
                htmlFor="current"
                className="nx:typography-label-default nx:leading-none"
              >
                Current password
              </label>
              <Input id="current" type="password" />
            </div>
            <div className="nx:space-y-1">
              <label
                htmlFor="new"
                className="nx:typography-label-default nx:leading-none"
              >
                New password
              </label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const ThreeTabs: Story = {
  render: (_args) => (
    <Tabs defaultValue="overview" className="nx:w-[500px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Overview of your dashboard metrics and key performance indicators.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Detailed analytics showing user engagement and traffic patterns.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Generated reports for stakeholders and team reviews.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: (_args) => (
    <Tabs defaultValue="account" className="nx:w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings" disabled>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Account content
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Password content
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Settings content
        </p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledTab = canvas.getByRole('tab', { name: 'Settings' });

    await expect(disabledTab).toBeDisabled();

    // Disabled state uses a semantic text token at full opacity (not a fade).
    await expect(disabledTab).toHaveClass(
      'nx:disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(disabledTab).opacity).toBe('1');
  },
};

export const FullWidth: Story = {
  render: (_args) => (
    <Tabs defaultValue="tab1" className="nx:w-full">
      <TabsList className="nx:w-full nx:justify-start">
        <TabsTrigger value="tab1">First Tab</TabsTrigger>
        <TabsTrigger value="tab2">Second Tab</TabsTrigger>
        <TabsTrigger value="tab3">Third Tab</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Content for the first tab.
        </p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Content for the second tab.
        </p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Content for the third tab.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ClickInteraction: Story = {
  render: (_args) => (
    <Tabs defaultValue="tab1" className="nx:w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content 2</p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });
    const indicator = getTabsIndicator(canvasElement);

    await expect(tab1).toHaveAttribute('data-state', 'active');
    await expect(tab2).toHaveAttribute('data-state', 'inactive');
    await waitForIndicatorReady(indicator);
    await expect(indicator).toHaveAttribute('data-variant', 'default');
    await expect(canvas.getByText('Content 1')).toBeVisible();

    const before = indicator.style.transform;

    await userEvent.click(tab2);

    await expect(tab1).toHaveAttribute('data-state', 'inactive');
    await expect(tab2).toHaveAttribute('data-state', 'active');
    await waitFor(() => expect(indicator.style.transform).not.toBe(before));
    await expect(canvas.getByText('Content 2')).toBeVisible();
  },
};

export const ReducedMotion: Story = {
  render: Default.render,
  play: async ({ canvasElement }) => {
    const indicator = getTabsIndicator(canvasElement);

    await waitFor(() =>
      expect(indicator).toHaveClass('nx:motion-reduce:transition-none')
    );
  },
};

export const KeyboardInteraction: Story = {
  render: (_args) => (
    <Tabs defaultValue="tab1" className="nx:w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content 3</p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus the first tab
    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    await userEvent.click(tab1);
    await expect(tab1).toHaveFocus();

    // Navigate right with arrow key
    await userEvent.keyboard('{ArrowRight}');
    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });
    await expect(tab2).toHaveFocus();

    // Navigate right again
    await userEvent.keyboard('{ArrowRight}');
    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' });
    await expect(tab3).toHaveFocus();

    // Navigate left
    await userEvent.keyboard('{ArrowLeft}');
    await expect(tab2).toHaveFocus();
  },
};

export const DisabledTabInteraction: Story = {
  render: (_args) => (
    <Tabs defaultValue="tab1" className="nx:w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Tab 2 (Disabled)
        </TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content 3</p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const disabledTab = canvas.getByRole('tab', { name: 'Tab 2 (Disabled)' });
    await expect(disabledTab).toBeDisabled();

    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    const indicator = getTabsIndicator(canvasElement);

    await expect(tab1).toHaveAttribute('data-state', 'active');
    await waitForIndicatorReady(indicator);
    await expect(canvas.getByText('Content 1')).toBeVisible();

    const beforeDisabledSkip = indicator.style.transform;

    await userEvent.click(tab1);
    await userEvent.keyboard('{ArrowRight}');

    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' });
    await expect(tab3).toHaveFocus();
    await expect(tab1).toHaveAttribute('data-state', 'inactive');
    await expect(disabledTab).toHaveAttribute('data-state', 'inactive');
    await expect(tab3).toHaveAttribute('data-state', 'active');
    await waitFor(() =>
      expect(indicator.style.transform).not.toBe(beforeDisabledSkip)
    );
    await expect(canvas.getByText('Content 3')).toBeVisible();
  },
};

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Tabs defaultValue="tab1" className="nx:w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" variant="underline" size="lg">
          Tab 2
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content 2</p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check data-slot attributes
    const tabsList = canvas.getByRole('tablist');
    await expect(tabsList).toHaveAttribute('data-slot', 'tabs-list');

    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    await expect(tab1).toHaveAttribute('data-slot', 'tabs-trigger');
    await expect(tab1).toHaveAttribute('data-variant', 'default');
    await expect(tab1).toHaveAttribute('data-size', 'default');

    // Check data-variant and data-size on tab with explicit values
    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });
    await expect(tab2).toHaveAttribute('data-slot', 'tabs-trigger');
    await expect(tab2).toHaveAttribute('data-variant', 'underline');
    await expect(tab2).toHaveAttribute('data-size', 'lg');

    // Check tabpanel has data-slot
    const tabPanel = canvas.getByRole('tabpanel');
    await expect(tabPanel).toHaveAttribute('data-slot', 'tabs-content');

    await expect(tab1).toHaveClass(
      'nx:typography-label-default',
      'nx:px-3',
      'nx:py-1.5'
    );
    await expect(getComputedStyle(tab1).fontSize).toBe('14px');

    await expect(tab2).toHaveClass(
      'nx:typography-label-default',
      'nx:px-4',
      'nx:py-2'
    );
    await expect(getComputedStyle(tab2).fontSize).toBe('14px');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Default Variant
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">Account</TabsTrigger>
            <TabsTrigger value="tab2">Password</TabsTrigger>
            <TabsTrigger value="tab3">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Default variant (pill style)
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Underline Variant
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-[400px]">
          <TabsList className="nx:bg-transparent nx:p-0">
            <TabsTrigger value="tab1" variant="underline">
              Account
            </TabsTrigger>
            <TabsTrigger value="tab2" variant="underline">
              Password
            </TabsTrigger>
            <TabsTrigger value="tab3" variant="underline">
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Underline variant (border-bottom style)
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Sizes (Small, Default, Large)
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <Tabs defaultValue="tab1" className="nx:w-[400px]">
            <TabsList>
              <TabsTrigger value="tab1" size="sm">
                Small
              </TabsTrigger>
              <TabsTrigger value="tab2" size="sm">
                Tabs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" />
            <TabsContent value="tab2" />
          </Tabs>
          <Tabs defaultValue="tab1" className="nx:w-[400px]">
            <TabsList>
              <TabsTrigger value="tab1" size="default">
                Default
              </TabsTrigger>
              <TabsTrigger value="tab2" size="default">
                Tabs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" />
            <TabsContent value="tab2" />
          </Tabs>
          <Tabs defaultValue="tab1" className="nx:w-[400px]">
            <TabsList>
              <TabsTrigger value="tab1" size="lg">
                Large
              </TabsTrigger>
              <TabsTrigger value="tab2" size="lg">
                Tabs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" />
            <TabsContent value="tab2" />
          </Tabs>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Disabled Tab
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">Active</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Disabled
            </TabsTrigger>
            <TabsTrigger value="tab3">Another</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Active content
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Grid Layout
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-[400px]">
          <TabsList className="nx:grid nx:w-full nx:grid-cols-2">
            <TabsTrigger value="tab1">First</TabsTrigger>
            <TabsTrigger value="tab2">Second</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Grid layout content
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
};

export const TabsTriggerDefaultModeHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Regression sentinel: pins the `default` `TabsTrigger` height in default mode.',
      },
    },
  },
  render: () => (
    <div data-testid="tabs-default-host" className="nx:p-10 nx:bg-background">
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Default</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'tabs-default-host', 34);
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
