import type { Meta, StoryObj } from '@storybook/react';
import { IconFolder, IconHome, IconSettings } from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbMenuTrigger,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component:
          "Breadcrumb shows where the current page sits in your app's hierarchy. Use it on pages two or more levels deep. For top-level navigation, use NavigationMenu or Sidebar.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

// A three-level trail ending on the current page.
export const Default: Story = {
  tags: ['docs'],
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// A long trail collapsed with an ellipsis standing in for the middle.
export const WithEllipsis: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Collapse the middle of a long trail into an ellipsis menu.',
      },
    },
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/projects">Projects</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/projects/design-system">Design System</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/projects/design-system/components">Components</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show hidden breadcrumbs' })
    );

    await waitFor(async () => {
      await expect(
        within(document.body).getByRole('menuitem', {
          name: 'Design System',
        })
      ).toBeVisible();
    });

    // Close the menu before the a11y scan: an open Radix menu aria-hides the
    // still-focusable breadcrumb trail, which axe flags as aria-hidden-focus.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
};

// Items support optional icons and trailing dropdown affordances. The
// chevron is a real menu trigger next to the link, not an interactive control
// nested inside the anchor.
export const WithIcons: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add icons to segments and a menu trigger for alternate paths.',
      },
    },
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">
            <IconFolder aria-hidden />
            <span>Workspace</span>
          </BreadcrumbLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show alternate paths for Workspace" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/workspaces/personal">Personal</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/workspaces/team">Team</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/workspaces/archived">Archived</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">
            <IconFolder aria-hidden />
            <span>Projects</span>
          </BreadcrumbLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show alternate paths for Projects" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/projects/components">Components</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/projects/patterns">Patterns</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/projects/tokens">Tokens</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            <IconFolder aria-hidden />
            <span>Breadcrumb</span>
          </BreadcrumbPage>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show related pages for Breadcrumb" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/components/breadcrumb/api">Breadcrumb API</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/components/breadcrumb/stories">Breadcrumb Stories</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Show alternate paths for Workspace',
      })
    );

    await waitFor(async () => {
      await expect(
        within(document.body).getByRole('menuitem', { name: 'Team' })
      ).toBeVisible();
    });

    // Close the menu before the a11y scan: an open Radix menu aria-hides the
    // still-focusable breadcrumb trail, which axe flags as aria-hidden-focus.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
};

// Breadcrumb items can be icon-only visually. Links still need an accessible
// name, and the current page carries screen-reader text because it is not a
// named interactive control.
export const IconOnly: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/home" aria-label="Home">
            <IconHome aria-hidden />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/projects" aria-label="Projects">
            <IconFolder aria-hidden />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            <IconSettings aria-hidden />
            <span className="nx:sr-only">Settings</span>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'data-slot',
      'breadcrumb-link'
    );
    await expect(
      canvas.getByRole('link', { name: 'Projects' })
    ).toHaveAttribute('data-slot', 'breadcrumb-link');
    await expect(canvas.getByText('Settings')).toHaveClass('nx:sr-only');
  },
};

// Breadcrumb labels cap at 150px, then shrink below that when the available
// breadcrumb width is tighter.
export const LongContent: Story = {
  render: () => (
    <div className="nx:w-[240px]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">
              <span>
                Quarterly reporting workspace with an unusually long name
              </span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <span>Budget assumptions and approval workflow details</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};

// Breadcrumb links are native anchors; the current page is a non-interactive span.
export const KeyboardInteraction: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show alternate paths for Home" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/accounts">Accounts</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/companies">Companies</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Contacts</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');
    const link = canvas.getByRole('link', { name: 'Home' });
    const trigger = canvas.getByRole('button', {
      name: 'Show alternate paths for Home',
    });
    const page = canvas.getByText('Contacts');

    // The list is a keyboard-focusable scroll region, so it is the first tab
    // stop; the link and trigger follow, and the current page is never focused.
    await userEvent.tab();
    await expect(list).toHaveFocus();
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute(
      'data-slot',
      'breadcrumb-menu-trigger'
    );
    await expect(page).not.toHaveFocus();
  },
};

// Every structural part carries a data-slot hook, including a BreadcrumbLink
// composed onto a custom anchor via asChild. The current page advertises
// aria-current without pretending to be a disabled link.
export const WithDataAttributes: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="/home">Home</a>
          </BreadcrumbLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show alternate paths for Home" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/companies">Companies</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/companies">Companies</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Contacts</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    for (const slot of [
      'breadcrumb',
      'breadcrumb-list',
      'breadcrumb-item',
      'breadcrumb-link',
      'breadcrumb-menu-trigger',
      'breadcrumb-separator',
      'breadcrumb-ellipsis',
      'breadcrumb-page',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    // Slot merges BreadcrumbLink's props onto the child anchor.
    const link = within(canvasElement).getByRole('link', { name: 'Home' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');

    const page = canvasElement.querySelector('[data-slot="breadcrumb-page"]');
    await expect(page).toHaveAttribute('aria-current', 'page');
    await expect(page).not.toHaveAttribute('role');
    await expect(page).not.toHaveAttribute('aria-disabled');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// The full anatomy: links, slash separators, a collapsed ellipsis, and the
// current page. Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/projects/design-system">Design System</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
