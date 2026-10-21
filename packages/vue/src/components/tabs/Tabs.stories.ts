import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '.';

const meta = {
  title: 'Components/Tabs',
  parameters: {
    docs: {
      description: {
        component:
          'Tabs switch between panels of related content in one place. Use them to split a view into sections that users visit one at a time.',
      },
    },
  },
  component: TabsList,
  argTypes: {
    variant: { control: 'select', options: ['default', 'underline'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
  render: (args) => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    setup: () => ({ args }),
    template: `
      <Tabs default-value="account" class="nx:w-96">
        <TabsList v-bind="args" aria-label="Settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team" disabled>Team</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Change your name and email.</TabsContent>
        <TabsContent value="billing">Manage your plan and invoices.</TabsContent>
        <TabsContent value="team">Invite your team.</TabsContent>
      </Tabs>
    `,
  }),
} satisfies Meta<typeof TabsList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="account" class="nx:w-96">
        <TabsList aria-label="Settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Change your name and email.</TabsContent>
        <TabsContent value="password">Change your password.</TabsContent>
      </Tabs>
    `,
  }),
};

export const UnderlineVariant: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="overview" class="nx:w-96">
        <TabsList variant="underline" aria-label="Project">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Three open issues.</TabsContent>
        <TabsContent value="activity">Updated two hours ago.</TabsContent>
      </Tabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const activity = within(canvasElement).getByRole('tab', {
      name: 'Activity',
    });

    await userEvent.click(activity);
    await waitFor(() => {
      const indicator = canvasElement.querySelector(
        '[data-slot="tabs-indicator"]'
      );
      if (!indicator) throw new Error('Tabs indicator not rendered');
      const indicatorRect = indicator.getBoundingClientRect();
      const activityRect = activity.getBoundingClientRect();
      expect(Math.round(indicatorRect.bottom)).toBe(
        Math.round(activityRect.bottom)
      );
      expect(Math.round(indicatorRect.left)).toBe(
        Math.round(activityRect.left)
      );
      expect(indicatorRect.height).toBeGreaterThan(0);
      expect(Math.round(indicatorRect.height)).toBe(
        Math.round(parseFloat(getComputedStyle(activity).borderBottomWidth))
      );
    });
  },
};

export const SmallSize: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Tabs, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="day">
        <TabsList size="sm" aria-label="Range">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>
    `,
  }),
};

export const WithDisabledTab: Story = {
  tags: ['docs'],
  parameters: {
    docs: { description: { story: 'Arrow keys skip a disabled tab.' } },
  },
  render: () => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="general" class="nx:w-96">
        <TabsList aria-label="Workspace">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="general">Rename your workspace.</TabsContent>
      </Tabs>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { Tabs, TabsList, TabsTrigger },
    setup: () => ({ sizes: ['sm', 'default', 'lg'] }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <Tabs v-for="size in sizes" :key="size" default-value="a">
          <TabsList :size="size" :aria-label="size">
            <TabsTrigger value="a">Overview</TabsTrigger>
            <TabsTrigger value="b">Activity</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const small = within(canvasElement).getByRole('tablist', { name: 'sm' });

    for (const tab of within(small).getAllByRole('tab')) {
      await expect(tab).toHaveAttribute('data-size', 'sm');
    }
  },
};

export const ClickInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole('tab', { name: 'Billing' });

    await userEvent.click(billing);
    await expect(billing).toHaveAttribute('aria-selected', 'true');
    await expect(billing).toHaveAttribute('data-state', 'active');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Manage your plan and invoices.'
    );
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const account = canvas.getByRole('tab', { name: 'Account' });

    await userEvent.tab();
    await expect(account).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Manage your plan'
    );

    // Team is disabled, so focus loops back to the first tab.
    await userEvent.keyboard('{ArrowRight}');
    await expect(account).toHaveFocus();
  },
};

export const Disabled: Story = {
  play: async ({ canvasElement }) => {
    const team = within(canvasElement).getByRole('tab', { name: 'Team' });

    await expect(team).toBeDisabled();
    await expect(team).toHaveAttribute('data-disabled');
  },
};

export const IndicatorFollowsActiveTab: Story = {
  play: async ({ canvasElement }) => {
    const billing = within(canvasElement).getByRole('tab', { name: 'Billing' });

    await userEvent.click(billing);
    await waitFor(() => {
      const indicator = canvasElement.querySelector(
        '[data-slot="tabs-indicator"]'
      );
      if (!indicator) throw new Error('Tabs indicator not rendered');
      const indicatorRect = indicator.getBoundingClientRect();
      const billingRect = billing.getBoundingClientRect();
      expect(Math.round(indicatorRect.left)).toBe(Math.round(billingRect.left));
      expect(Math.round(indicatorRect.width)).toBe(
        Math.round(billingRect.width)
      );
    });
  },
};

export const VerticalIndicatorFollowsActiveTab: Story = {
  render: () => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="account" orientation="vertical" class="nx:flex nx:gap-4">
        <TabsList aria-label="Settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Change your name and email.</TabsContent>
        <TabsContent value="billing">Manage your plan and invoices.</TabsContent>
      </Tabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const billing = within(canvasElement).getByRole('tab', { name: 'Billing' });

    await userEvent.click(billing);
    await waitFor(() => {
      const indicator = canvasElement.querySelector(
        '[data-slot="tabs-indicator"]'
      );
      if (!indicator) throw new Error('Tabs indicator not rendered');
      const indicatorRect = indicator.getBoundingClientRect();
      const billingRect = billing.getBoundingClientRect();
      expect(Math.round(indicatorRect.top)).toBe(Math.round(billingRect.top));
      expect(Math.round(indicatorRect.height)).toBe(
        Math.round(billingRect.height)
      );
    });
  },
};

export const VerticalUnderlineIndicatorFollowsActiveTab: Story = {
  render: () => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="account" orientation="vertical" class="nx:flex nx:gap-4">
        <TabsList variant="underline" aria-label="Settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Change your name and email.</TabsContent>
        <TabsContent value="billing">Manage your plan and invoices.</TabsContent>
      </Tabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const billing = within(canvasElement).getByRole('tab', { name: 'Billing' });

    await userEvent.click(billing);
    await waitFor(() => {
      const indicator = canvasElement.querySelector(
        '[data-slot="tabs-indicator"]'
      );
      if (!indicator) throw new Error('Tabs indicator not rendered');
      const indicatorRect = indicator.getBoundingClientRect();
      const billingRect = billing.getBoundingClientRect();
      expect(Math.round(indicatorRect.top)).toBe(Math.round(billingRect.top));
      expect(Math.round(indicatorRect.right)).toBe(
        Math.round(billingRect.right)
      );
      expect(indicatorRect.width).toBeGreaterThan(0);
      expect(Math.round(indicatorRect.width)).toBe(
        Math.round(parseFloat(getComputedStyle(billing).borderRightWidth))
      );
    });
  },
};

export const WithDataAttributes: Story = {
  args: { variant: 'underline', size: 'lg' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('tablist');
    const account = canvas.getByRole('tab', { name: 'Account' });

    await expect(list).toHaveAttribute('data-slot', 'tabs-list');
    await expect(list).toHaveAttribute('data-variant', 'underline');
    await expect(account).toHaveAttribute('data-slot', 'tabs-trigger');
    await expect(account).toHaveAttribute('data-variant', 'underline');
    await expect(account).toHaveAttribute('data-size', 'lg');
    await expect(canvas.getByRole('tabpanel')).toHaveAttribute(
      'data-slot',
      'tabs-content'
    );
  },
};
