import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { Button } from '../button';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '.';

const meta = {
  title: 'Components/Card',
  parameters: {
    docs: {
      description: {
        component:
          'Card groups related content and actions in a bordered section. Use it for dashboards, settings sections and forms.',
      },
    },
  },
  component: Card,
  render: () => ({
    components: {
      Button,
      Card,
      CardAction,
      CardContent,
      CardDescription,
      CardFooter,
      CardHeader,
      CardTitle,
    },
    template: `
      <Card class="nx:w-96">
        <CardHeader>
          <CardTitle>Team plan</CardTitle>
          <CardDescription>Five seats, billed monthly.</CardDescription>
          <CardAction><Button size="sm" variant="ghost">Edit</Button></CardAction>
        </CardHeader>
        <CardContent>Your next invoice is on 1 November.</CardContent>
        <CardFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Upgrade</Button>
        </CardFooter>
      </Card>
    `,
  }),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Card, CardContent, CardDescription, CardHeader, CardTitle },
    template: `
      <Card class="nx:w-96">
        <CardHeader>
          <CardTitle>Team plan</CardTitle>
          <CardDescription>Five seats, billed monthly.</CardDescription>
        </CardHeader>
        <CardContent>Your next invoice is on 1 November.</CardContent>
      </Card>
    `,
  }),
};

export const WithAction: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: '`CardAction` sits beside the title and description.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      Card,
      CardAction,
      CardDescription,
      CardHeader,
      CardTitle,
    },
    template: `
      <Card class="nx:w-96">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what we email you about.</CardDescription>
          <CardAction><Button size="sm" variant="ghost">Edit</Button></CardAction>
        </CardHeader>
      </Card>
    `,
  }),
};

export const WithFooter: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Button,
      Card,
      CardContent,
      CardDescription,
      CardFooter,
      CardHeader,
      CardTitle,
    },
    template: `
      <Card class="nx:w-96">
        <CardHeader>
          <CardTitle>Upgrade to Pro</CardTitle>
          <CardDescription>Unlimited projects and priority support.</CardDescription>
        </CardHeader>
        <CardContent>Billed yearly at $96.</CardContent>
        <CardFooter>
          <Button variant="outline">Not now</Button>
          <Button>Upgrade</Button>
        </CardFooter>
      </Card>
    `,
  }),
};

export const ContentOnly: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Without a header, give the content its own top padding.',
      },
    },
  },
  render: () => ({
    components: { Card, CardContent },
    template: `
      <Card class="nx:w-96">
        <CardContent class="nx:pt-6">Drafts are saved every few seconds.</CardContent>
      </Card>
    `,
  }),
};

export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    const slots = [
      'card',
      'card-header',
      'card-title',
      'card-description',
      'card-action',
      'card-content',
      'card-footer',
    ];

    for (const slot of slots) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }
  },
};

export const DefaultHeading: Story = {
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', {
      name: 'Team plan',
    });

    await expect(heading.tagName).toBe('H3');
  },
};

export const TitleAsChild: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle },
    template: `
      <Card class="nx:w-96">
        <CardHeader>
          <CardTitle as-child><h2>Billing</h2></CardTitle>
        </CardHeader>
      </Card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', {
      level: 2,
      name: 'Billing',
    });

    await expect(heading).toHaveAttribute('data-slot', 'card-title');
  },
};

export const WithCustomClassName: Story = {
  render: () => ({
    components: { Card, CardContent },
    template: `
      <Card class="nx:w-96 nx:rounded-none">
        <CardContent class="nx:pt-6">Square corners.</CardContent>
      </Card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-slot="card"]');
    const content = canvasElement.querySelector('[data-slot="card-content"]');

    // `cn` resolves the conflict, so the override replaces the default.
    await expect(card).toHaveClass('nx:rounded-none');
    await expect(card).not.toHaveClass('nx:rounded-xl');
    await expect(content).toHaveClass('nx:pt-6');
    await expect(content).not.toHaveClass('nx:pt-0');
  },
};

export const LongContent: Story = {
  render: () => ({
    components: { Card, CardDescription, CardHeader, CardTitle },
    template: `
      <Card class="nx:w-72">
        <CardHeader>
          <CardTitle>A very long title that wraps across more than one line in a narrow card</CardTitle>
          <CardDescription>Supporting text keeps its own column under the title.</CardDescription>
        </CardHeader>
      </Card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-slot="card"]');

    await expect(card?.scrollWidth).toBe(card?.clientWidth);
  },
};
