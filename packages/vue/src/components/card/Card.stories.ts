import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import { useId } from 'vue';

import { expectHeightPinned } from '../../stories/support/story-height-test-utils';
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
          <CardTitle>Data Attributes Test</CardTitle>
          <CardDescription>Testing data-slot attributes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content area.</p>
        </CardContent>
        <CardFooter>
          <Button>Action</Button>
        </CardFooter>
      </Card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check data-slot attributes
    const card = canvasElement.querySelector('[data-slot="card"]');
    const header = canvasElement.querySelector('[data-slot="card-header"]');
    const title = canvasElement.querySelector('[data-slot="card-title"]');
    const description = canvasElement.querySelector(
      '[data-slot="card-description"]'
    );
    const content = canvasElement.querySelector('[data-slot="card-content"]');
    const footer = canvasElement.querySelector('[data-slot="card-footer"]');

    await expect(card).toBeInTheDocument();
    await expect(header).toBeInTheDocument();
    await expect(title).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
    await expect(content).toBeInTheDocument();
    await expect(footer).toBeInTheDocument();

    // Verify title text
    const titleElement = canvas.getByRole('heading', {
      level: 3,
      name: 'Data Attributes Test',
    });
    await expect(titleElement).toHaveAttribute('data-slot', 'card-title');
  },
};

export const TitleAsHeading: Story = {
  render: () => ({
    components: {
      Card,
      CardContent,
      CardDescription,
      CardHeader,
      CardTitle,
    },
    template: `
      <section aria-labelledby="card-section-heading">
        <Card class="nx:w-[350px]">
          <CardHeader>
            <CardTitle as-child>
              <h2 id="card-section-heading">Campaign overview</h2>
            </CardTitle>
            <CardDescription>Use a section-level heading when the card sits directly below a page heading.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Campaign metrics belong to this section of the page outline.</p>
          </CardContent>
        </Card>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {
      level: 2,
      name: 'Campaign overview',
    });

    await expect(heading).toHaveAttribute('data-slot', 'card-title');
  },
};

export const LongTitleWithAction: Story = {
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
      <Card class="nx:w-[320px]">
        <CardHeader>
          <CardTitle>Quarterly revenue operations review with customer expansion notes</CardTitle>
          <CardDescription>The action should keep its own reserved column.</CardDescription>
          <CardAction>
            <Button size="sm" variant="outline">Edit</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>Header text wraps before it reaches the action.</p>
        </CardContent>
      </Card>
    `,
  }),
  play: async ({ canvasElement }) => {
    await document.fonts.ready;

    const title = canvasElement.querySelector<HTMLElement>(
      '[data-slot="card-title"]'
    );
    const action = canvasElement.querySelector<HTMLElement>(
      '[data-slot="card-action"]'
    );

    if (!title || !action) {
      throw new Error('Expected card title and action to render.');
    }

    const titleRect = title.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();

    await expect(titleRect.right).toBeLessThanOrEqual(actionRect.left + 0.5);
  },
};

export const ActionDataAttributes: Story = {
  render: () => ({
    components: { Button, Card, CardAction, CardHeader, CardTitle },
    template: `
      <Card class="nx:w-[350px]">
        <CardHeader>
          <CardTitle>Action Test</CardTitle>
          <CardAction>
            <Button size="sm">Edit</Button>
          </CardAction>
        </CardHeader>
      </Card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const action = canvasElement.querySelector('[data-slot="card-action"]');
    await expect(action).toBeInTheDocument();
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

export const DefaultModeHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'At default density, a card with one 40px child is exactly 66px tall.',
      },
    },
  },
  render: () => ({
    components: { Card, CardContent },
    template: `
      <div data-testid="card-default-host" class="nx:p-10 nx:bg-background">
        <Card class="nx:w-[200px]">
          <CardContent>
            <div class="nx:h-10" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'card-default-host', 66, {
      selector: '[data-slot="card"]',
    });
  },
};
