import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import {
  AllModesGrid,
  AllModesRow,
  SPACING_MODES,
} from '../../../stories/spacing-modes';
import {
  expectHeightFixedAcrossModes,
  expectHeightPinned,
  expectModeCascadeWorks,
} from '../../../stories/test-utils';
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
        <p className="nx:text-sm nx:text-muted-foreground">
          Make changes to your account here. Click save when you&apos;re done.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="nx:text-sm nx:text-muted-foreground">
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
        <p className="nx:text-sm nx:text-muted-foreground">
          Account settings with underline variant tabs.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="nx:text-sm nx:text-muted-foreground">
          Password settings with underline variant tabs.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="nx:text-sm nx:text-muted-foreground">
          General settings with underline variant tabs.
        </p>
      </TabsContent>
    </Tabs>
  ),
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
        <p className="nx:text-sm nx:text-muted-foreground">
          Small size tabs content.
        </p>
      </TabsContent>
    </Tabs>
  ),
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
        <p className="nx:text-sm nx:text-muted-foreground">
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
                className="nx:text-sm nx:font-medium nx:leading-none"
              >
                Name
              </label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="nx:space-y-1">
              <label
                htmlFor="username"
                className="nx:text-sm nx:font-medium nx:leading-none"
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
                className="nx:text-sm nx:font-medium nx:leading-none"
              >
                Current password
              </label>
              <Input id="current" type="password" />
            </div>
            <div className="nx:space-y-1">
              <label
                htmlFor="new"
                className="nx:text-sm nx:font-medium nx:leading-none"
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
        <p className="nx:text-sm nx:text-muted-foreground">
          Overview of your dashboard metrics and key performance indicators.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="nx:text-sm nx:text-muted-foreground">
          Detailed analytics showing user engagement and traffic patterns.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="nx:text-sm nx:text-muted-foreground">
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
        <p className="nx:text-sm nx:text-muted-foreground">Account content</p>
      </TabsContent>
      <TabsContent value="password">
        <p className="nx:text-sm nx:text-muted-foreground">Password content</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="nx:text-sm nx:text-muted-foreground">Settings content</p>
      </TabsContent>
    </Tabs>
  ),
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
        <p className="nx:text-sm nx:text-muted-foreground">
          Content for the first tab.
        </p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="nx:text-sm nx:text-muted-foreground">
          Content for the second tab.
        </p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="nx:text-sm nx:text-muted-foreground">
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

    // Tab 1 should be active by default
    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });

    await expect(tab1).toHaveAttribute('data-state', 'active');
    await expect(tab2).toHaveAttribute('data-state', 'inactive');

    // Active state is cued by the segmented-control border (not a shadow)
    await expect(tab1).toHaveClass(
      'nx:data-[state=active]:border-border-default'
    );

    // Content 1 should be visible
    await expect(canvas.getByText('Content 1')).toBeVisible();

    // Click Tab 2
    await userEvent.click(tab2);

    // Tab 2 should now be active
    await expect(tab1).toHaveAttribute('data-state', 'inactive');
    await expect(tab2).toHaveAttribute('data-state', 'active');

    // Content 2 should be visible
    await expect(canvas.getByText('Content 2')).toBeVisible();
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

    // Disabled tab should have disabled attribute
    const disabledTab = canvas.getByRole('tab', { name: 'Tab 2 (Disabled)' });
    await expect(disabledTab).toBeDisabled();

    // Tab 1 should be active by default
    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    await expect(tab1).toHaveAttribute('data-state', 'active');

    // Content should be Content 1
    await expect(canvas.getByText('Content 1')).toBeVisible();

    // Click Tab 3 (enabled) to verify navigation still works
    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' });
    await userEvent.click(tab3);
    await expect(tab3).toHaveAttribute('data-state', 'active');
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

    // Check data-variant and data-size on tab with explicit values
    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });
    await expect(tab2).toHaveAttribute('data-slot', 'tabs-trigger');
    await expect(tab2).toHaveAttribute('data-variant', 'underline');
    await expect(tab2).toHaveAttribute('data-size', 'lg');

    // Check tabpanel has data-slot
    const tabPanel = canvas.getByRole('tabpanel');
    await expect(tabPanel).toHaveAttribute('data-slot', 'tabs-content');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Default Variant
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">Account</TabsTrigger>
            <TabsTrigger value="tab2">Password</TabsTrigger>
            <TabsTrigger value="tab3">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:text-sm nx:text-muted-foreground">
              Default variant (pill style)
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
            <p className="nx:text-sm nx:text-muted-foreground">
              Underline variant (border-bottom style)
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
            <p className="nx:text-sm nx:text-muted-foreground">
              Active content
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Grid Layout
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-[400px]">
          <TabsList className="nx:grid nx:w-full nx:grid-cols-2">
            <TabsTrigger value="tab1">First</TabsTrigger>
            <TabsTrigger value="tab2">Second</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:text-sm nx:text-muted-foreground">
              Grid layout content
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
};

// ============================================
// MODE BEHAVIOUR (per-mode spacing variance)
// ============================================

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Each row scopes `data-style` locally so the 7 spacing modes render side-by-side. `TabsTrigger` `default` migrates to `control-sm` and `lg` to `control-md` (both byte-identical to vega pre-refactor). The `sm` size stays on its own sub-control rhythm (`px-2 py-1`) and is intentionally density-stable across modes. Vega / Lyra / Luma / Mira share identical `control-{sm,md}` tokens (top 4 rows look the same); Nova compresses, Maia / Sera breathe.',
      },
    },
  },
  render: () => (
    <AllModesGrid>
      {SPACING_MODES.map((mode) => (
        <AllModesRow key={mode} mode={mode}>
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">Default</TabsTrigger>
              <TabsTrigger value="b">Other</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger size="lg" value="a">
                Lg
              </TabsTrigger>
              <TabsTrigger size="lg" value="b">
                Other
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </AllModesRow>
      ))}
    </AllModesGrid>
  ),
};

export const TabsTriggerModesProduceDifferentHeights: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Cascade sentinel for `TabsTrigger` `default` size. Uses the `nova` + `maia` pair to spread coverage away from the Button/Input nova+sera pair already in use — between them the suite covers `control-sm-y` at 4 / 8 / 12 px (nova / maia / sera).',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="nova" data-testid="tabs-mode-host-nova">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div data-style="maia" data-testid="tabs-mode-host-maia">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectModeCascadeWorks(
      within(canvasElement),
      'tabs-mode-host-nova',
      'tabs-mode-host-maia'
    );
  },
};

export const TabsTriggerVegaDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the migration outcome: in vega mode, a `TabsTrigger` at `default` size renders at exactly 34px (= `text-sm` 20px line-height + `py-control-sm` 6px × 2 + transparent border 1px × 2). If a designer retunes `--control-padding-y-sm`, the body type ramp, or the trigger border, this test fails.',
      },
    },
  },
  render: () => (
    <div
      data-style="vega"
      data-testid="tabs-vega-host"
      className="nx:p-10 nx:bg-background"
    >
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Default</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'tabs-vega-host', 34);
  },
};

export const TabsSmIsDensityStable: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Density-stability sentinel for the `sm` size. `TabsTrigger` `sm` stays on the sub-control numeric rhythm (`px-2 py-1 text-xs`). Every spacing mode therefore renders it at the same canonical 26px height (= `text-xs` line-height 16px + `py-1` 4px × 2 + transparent border 1px × 2). If a future PR migrates `py-1` → `py-control-sm` (or any other role utility), this test fails for nova/sera — the regression signal is that intent (sub-control, mode-stable) has been broken.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="nova" data-testid="tabs-sm-host-nova">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger size="sm" value="a">
              Tab
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div data-style="vega" data-testid="tabs-sm-host-vega">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger size="sm" value="a">
              Tab
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div data-style="sera" data-testid="tabs-sm-host-sera">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger size="sm" value="a">
              Tab
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightFixedAcrossModes(
      within(canvasElement),
      ['tabs-sm-host-nova', 'tabs-sm-host-vega', 'tabs-sm-host-sera'],
      26,
      { selector: '[data-slot="tabs-trigger"]' }
    );
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
