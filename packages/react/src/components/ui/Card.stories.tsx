import type { Meta, StoryObj } from '@storybook/react';
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

import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Input } from './input';

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
              className="nx:text-sm nx:font-medium nx:text-foreground"
            >
              Email
            </label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div className="nx:flex nx:flex-col nx:gap-2">
            <label
              htmlFor="password"
              className="nx:text-sm nx:font-medium nx:text-foreground"
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
              <p className="nx:text-sm nx:font-medium">New message</p>
              <p className="nx:text-sm nx:text-foreground/70">
                John sent you a message
              </p>
            </div>
          </div>
          <div className="nx:flex nx:items-start nx:gap-3 nx:rounded-lg nx:bg-muted nx:p-3">
            <div className="nx:size-2 nx:mt-2 nx:rounded-full nx:bg-primary-background" />
            <div>
              <p className="nx:text-sm nx:font-medium">Update available</p>
              <p className="nx:text-sm nx:text-foreground/70">
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
        <CardTitle className="nx:text-3xl">$45,231</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="nx:text-xs nx:text-muted-foreground">
          +20.1% from last month
        </p>
      </CardContent>
    </Card>
  ),
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
    const titleElement = canvas.getByText('Data Attributes Test');
    await expect(titleElement).toBeInTheDocument();
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Stats Card
        </h3>
        <div className="nx:flex nx:gap-4">
          <Card className="nx:w-[180px]">
            <CardHeader className="nx:pb-2">
              <CardDescription>Revenue</CardDescription>
              <CardTitle className="nx:text-2xl">$12,345</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="nx:text-xs nx:text-muted-foreground">+12% growth</p>
            </CardContent>
          </Card>
          <Card className="nx:w-[180px]">
            <CardHeader className="nx:pb-2">
              <CardDescription>Users</CardDescription>
              <CardTitle className="nx:text-2xl">1,234</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="nx:text-xs nx:text-muted-foreground">+5% growth</p>
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

// ============================================
// MODE BEHAVIOUR (per-mode spacing variance)
// ============================================

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Each row scopes `data-style` locally so the 7 spacing modes render side-by-side. `CardHeader`, `CardContent`, and `CardFooter` migrate `p-6` → `p-container` (24px matches vega byte-identically). Positional offsets (`right-6`, `top-6` on `CardAction`) and sub-element offsets (`gap-1.5` between title/description, `gap-2` between footer buttons, `pt-0` to collapse content into header) stay numeric per the coupling-table Card row. Container-p values across modes: nova 20 / vega-tier 24 / maia & luma 28 / sera 40 — the card visibly grows in breathy modes.',
      },
    },
  },
  render: () => (
    <AllModesGrid>
      {SPACING_MODES.map((mode) => (
        <AllModesRow key={mode} mode={mode}>
          <Card className="nx:w-[240px]">
            <CardHeader>
              <CardTitle>Title</CardTitle>
              <CardDescription>Description in {mode}</CardDescription>
            </CardHeader>
          </Card>
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
          'Cascade sentinel for `CardContent` `p-container`. Uses the `nova` + `luma` pair to cover the container-p axis at two distinct values (nova 20, luma 28) — luma had not appeared in any sentinel before; the suite now hits at least one mode beyond the vega-cluster across each major role-token family. Card has no portaled content; dimensional measurement on the wrapper works directly. The Card contains a 40px fixed-height child so the height equation is `border 2 + (pt-0 + child-40 + pb-container)` — vega 66px, nova 62px, luma 70px.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-start nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="nova" data-testid="card-mode-host-nova">
        <Card className="nx:w-[160px]">
          <CardContent>
            <div className="nx:h-10" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>
      <div data-style="luma" data-testid="card-mode-host-luma">
        <Card className="nx:w-[160px]">
          <CardContent>
            <div className="nx:h-10" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectModeCascadeWorks(
      within(canvasElement),
      'card-mode-host-nova',
      'card-mode-host-luma',
      { selector: '[data-slot="card"]' }
    );
  },
};

export const VegaDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the migration outcome: in vega mode, a Card containing a single `CardContent` with a 40px fixed-height child renders at exactly 66px (= border 1px × 2 + `CardContent` pt-0 + child-40 + p-container bottom 24). If a designer retunes `--container-p` or the border-width token, this test fails.',
      },
    },
  },
  render: () => (
    <div
      data-style="vega"
      data-testid="card-vega-host"
      className="nx:p-10 nx:bg-background"
    >
      <Card className="nx:w-[200px]">
        <CardContent>
          <div className="nx:h-10" aria-hidden="true" />
        </CardContent>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'card-vega-host', 66, {
      selector: '[data-slot="card"]',
    });
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
