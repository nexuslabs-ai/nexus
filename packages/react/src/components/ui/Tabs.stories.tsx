import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { themeOnlyModes } from '@/storybook/modes';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';
import { Input } from './input';
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
  parameters: {
    chromatic: { disableSnapshot: true },
  },
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

export const KeyboardNavigation: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
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
  parameters: {
    chromatic: { disableSnapshot: true },
  },
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

export const DataAttributesTest: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
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

    // Check data-slot attributes
    const tabsList = canvas.getByRole('tablist');
    await expect(tabsList).toHaveAttribute('data-slot', 'tabs-list');

    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    await expect(tab1).toHaveAttribute('data-slot', 'tabs-trigger');

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
          Two Tabs
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">Account</TabsTrigger>
            <TabsTrigger value="tab2">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:text-sm nx:text-muted-foreground">
              Account settings content
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Three Tabs
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-[500px]">
          <TabsList>
            <TabsTrigger value="tab1">Overview</TabsTrigger>
            <TabsTrigger value="tab2">Analytics</TabsTrigger>
            <TabsTrigger value="tab3">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:text-sm nx:text-muted-foreground">
              Overview content
            </p>
          </TabsContent>
        </Tabs>
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
  parameters: {
    chromatic: {
      modes: themeOnlyModes,
    },
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
