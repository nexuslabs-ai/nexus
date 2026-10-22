import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import { useId } from 'vue';

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
      <Card class="nx:w-[350px]">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Submit</Button>
        </CardFooter>
      </Card>
    `,
  }),
};

export const WithAction: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Put a header action beside the title with CardAction.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      Card,
      CardAction,
      CardContent,
      CardDescription,
      CardHeader,
      CardTitle,
    },
    template: `
      <Card class="nx:w-[350px]">
        <CardHeader>
          <CardTitle>Card with Action</CardTitle>
          <CardDescription>This card has an action button.</CardDescription>
          <CardAction>
            <Button size="sm" variant="outline">Edit</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>Content with an action button in the header.</p>
        </CardContent>
      </Card>
    `,
  }),
};

export const WithFooter: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place action buttons at the bottom with CardFooter.',
      },
    },
  },
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
      <Card class="nx:w-[350px]">
        <CardHeader>
          <CardTitle>Card with Footer</CardTitle>
          <CardDescription>This card demonstrates footer usage.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The footer is useful for action buttons.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
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
        story: 'Use a card with content only, without a header or footer.',
      },
    },
  },
  render: () => ({
    components: { Card, CardContent },
    template: `
      <Card class="nx:w-[350px]">
        <CardContent class="nx:pt-6">
          <p>A card with only content, no header or footer.</p>
        </CardContent>
      </Card>
    `,
  }),
};

export const LoginCard: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Wrap a sign-in form in a card with a header and footer.',
      },
    },
  },
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
    setup: () => ({ emailId: useId(), passwordId: useId() }),
    template: `
      <form class="nx:w-full nx:max-w-sm" @submit.prevent>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your email and password to continue.</CardDescription>
          </CardHeader>
          <CardContent class="nx:grid nx:gap-4">
            <div class="nx:grid nx:gap-1.5">
              <label :for="emailId">Email</label>
              <input :id="emailId" type="email" autocomplete="email" placeholder="you@example.com" required />
            </div>
            <div class="nx:grid nx:gap-1.5">
              <label :for="passwordId">Password</label>
              <input :id="passwordId" type="password" autocomplete="current-password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" class="nx:w-full">Sign in</Button>
          </CardFooter>
        </Card>
      </form>
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
