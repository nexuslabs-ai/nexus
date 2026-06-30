import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { expectHeightPinned } from '../../../stories/story-height-test-utils';
import { Button } from '../button';
import { Input } from '../input';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
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
  ),
};

export const Simple: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>A simple card with just a title and content.</p>
      </CardContent>
    </Card>
  ),
};

export const WithDescription: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <CardHeader>
        <CardTitle>Card with Description</CardTitle>
        <CardDescription>
          This is a longer description that provides more context about the card
          content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Main content area of the card.</p>
      </CardContent>
    </Card>
  ),
};

export const TitleAsHeading: Story = {
  render: (_args) => (
    <section aria-labelledby="card-section-heading">
      <Card className="nx:w-[350px]">
        <CardHeader>
          <CardTitle asChild>
            <h2 id="card-section-heading">Campaign overview</h2>
          </CardTitle>
          <CardDescription>
            Use a section-level heading when the card sits directly below a page
            heading.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Campaign metrics belong to this section of the page outline.</p>
        </CardContent>
      </Card>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {
      level: 2,
      name: 'Campaign overview',
    });

    await expect(heading).toHaveAttribute('data-slot', 'card-title');
  },
};

export const WithAction: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <CardHeader>
        <CardTitle>Card with Action</CardTitle>
        <CardDescription>This card has an action button.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Content with an action button in the header.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
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
  ),
};

// ============================================
// CONTENT VARIATIONS
// ============================================

export const ContentOnly: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <CardContent className="nx:pt-6">
        <p>A card with only content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
};

export const HeaderOnly: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <CardHeader>
        <CardTitle>Header Only Card</CardTitle>
        <CardDescription>
          This card only has a header section with title and description.
        </CardDescription>
      </CardHeader>
    </Card>
  ),
};

export const LongContent: Story = {
  render: (_args) => (
    <Card className="nx:w-[400px]">
      <CardHeader>
        <CardTitle>Article Title</CardTitle>
        <CardDescription>Published on January 23, 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="nx:mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="link">Read more</Button>
      </CardFooter>
    </Card>
  ),
};

export const MediaCard: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <div aria-hidden="true" className="nx:aspect-video nx:bg-muted nx:p-6">
        <div className="nx:size-full nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container" />
      </div>
      <CardHeader>
        <CardTitle>Campaign Snapshot</CardTitle>
        <CardDescription>Updated 12 minutes ago</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Performance improved across three regions after the latest rollout.
        </p>
      </CardContent>
    </Card>
  ),
};

// ============================================
// USE CASE EXAMPLES
// ============================================

export const LoginCard: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:flex-col nx:gap-2">
            <label
              htmlFor="email"
              className="nx:typography-label-default nx:text-foreground"
            >
              Email
            </label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div className="nx:flex nx:flex-col nx:gap-2">
            <label
              htmlFor="password"
              className="nx:typography-label-default nx:text-foreground"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="nx:w-full">Sign In</Button>
      </CardFooter>
    </Card>
  ),
};

export const BorderedFooter: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <CardHeader>
        <CardTitle>Plan Usage</CardTitle>
        <CardDescription>
          Seats and billing are managed together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="nx:flex nx:items-baseline nx:gap-2">
          <span className="nx:typography-heading-medium nx:text-foreground">
            $49
          </span>
          <span className="nx:typography-body-default nx:text-muted-foreground">
            per seat
          </span>
        </div>
      </CardContent>
      <CardFooter className="nx:border-t-default nx:border-border-default nx:bg-muted nx:pt-6">
        <Button variant="outline">Compare</Button>
        <Button>Upgrade</Button>
      </CardFooter>
    </Card>
  ),
};

export const NotificationCard: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-start nx:gap-3 nx:rounded-lg nx:bg-muted nx:p-3">
            <div className="nx:size-2 nx:mt-2 nx:rounded-full nx:bg-primary-background" />
            <div>
              <p className="nx:typography-body-default">New message</p>
              <p className="nx:typography-body-default nx:text-foreground/70">
                John sent you a message
              </p>
            </div>
          </div>
          <div className="nx:flex nx:items-start nx:gap-3 nx:rounded-lg nx:bg-muted nx:p-3">
            <div className="nx:size-2 nx:mt-2 nx:rounded-full nx:bg-primary-background" />
            <div>
              <p className="nx:typography-body-default">Update available</p>
              <p className="nx:typography-body-default nx:text-foreground/70">
                Version 2.0 is now available
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="nx:w-full">
          View all
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: (_args) => (
    <Card className="nx:w-[200px]">
      <CardHeader className="nx:pb-2">
        <CardDescription>Total Revenue</CardDescription>
        <p className="nx:col-start-1 nx:min-w-0 nx:typography-heading-large nx:text-foreground">
          $45,231
        </p>
      </CardHeader>
      <CardContent>
        <p className="nx:typography-label-small nx:text-muted-foreground">
          +20.1% from last month
        </p>
      </CardContent>
    </Card>
  ),
};

export const LongTitleWithAction: Story = {
  render: (_args) => (
    <Card className="nx:w-[320px]">
      <CardHeader>
        <CardTitle>
          Quarterly revenue operations review with customer expansion notes
        </CardTitle>
        <CardDescription>
          The action should keep its own reserved column.
        </CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Header text wraps before it reaches the action.</p>
      </CardContent>
    </Card>
  ),
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

// ============================================
// DATA ATTRIBUTES TESTS
// ============================================

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
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
  ),
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

export const ActionDataAttributes: Story = {
  render: (_args) => (
    <Card className="nx:w-[350px]">
      <CardHeader>
        <CardTitle>Action Test</CardTitle>
        <CardAction>
          <Button size="sm">Edit</Button>
        </CardAction>
      </CardHeader>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const action = canvasElement.querySelector('[data-slot="card-action"]');
    await expect(action).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Basic Card
        </h3>
        <Card className="nx:w-[350px]">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here.</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Card with Footer
        </h3>
        <Card className="nx:w-[350px]">
          <CardHeader>
            <CardTitle>Card with Footer</CardTitle>
            <CardDescription>Includes action buttons.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Confirm</Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Card with Action
        </h3>
        <Card className="nx:w-[350px]">
          <CardHeader>
            <CardTitle>Card with Action</CardTitle>
            <CardDescription>Has an action in the header.</CardDescription>
            <CardAction>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Content with header action.</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Stats Card
        </h3>
        <div className="nx:flex nx:gap-4">
          <Card className="nx:w-[180px]">
            <CardHeader className="nx:pb-2">
              <CardDescription>Revenue</CardDescription>
              <p className="nx:col-start-1 nx:min-w-0 nx:typography-heading-medium nx:text-foreground">
                $12,345
              </p>
            </CardHeader>
            <CardContent>
              <p className="nx:typography-label-small nx:text-muted-foreground">
                +12% growth
              </p>
            </CardContent>
          </Card>
          <Card className="nx:w-[180px]">
            <CardHeader className="nx:pb-2">
              <CardDescription>Users</CardDescription>
              <p className="nx:col-start-1 nx:min-w-0 nx:typography-heading-medium nx:text-foreground">
                1,234
              </p>
            </CardHeader>
            <CardContent>
              <p className="nx:typography-label-small nx:text-muted-foreground">
                +5% growth
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const DefaultModeHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Regression sentinel: pins the Card height in default mode.',
      },
    },
  },
  render: () => (
    <div data-testid="card-default-host" className="nx:p-10 nx:bg-background">
      <Card className="nx:w-[200px]">
        <CardContent>
          <div className="nx:h-10" aria-hidden="true" />
        </CardContent>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'card-default-host', 66, {
      selector: '[data-slot="card"]',
    });
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
