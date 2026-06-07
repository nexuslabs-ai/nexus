import type { Meta, StoryObj } from '@storybook/react';
import { IconFolder } from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

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
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

// A three-level trail ending on the current page.
export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbSeparator />
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
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbSeparator />
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
  },
};

// Figma supports optional item icons and trailing dropdown affordances. The
// chevron is a real menu trigger next to the link, not an interactive control
// nested inside the anchor.
export const WithIcons: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbSeparator />
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
  },
};

// Breadcrumb labels cap at 150px, then shrink below that when the available
// breadcrumb width is tighter.
export const LongContent: Story = {
  render: () => (
    <div className="nx:w-[240px]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">
              Quarterly reporting workspace with an unusually long name
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Budget assumptions and approval workflow details
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};

// BreadcrumbLink composes with a custom element via asChild (e.g. a router
// link), keeping the link styling and the data-slot hook.
export const AsChild: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="/contacts" data-testid="router-link">
              Home
            </a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Contacts</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    // Slot merges BreadcrumbLink's props onto the child anchor.
    const link = within(canvasElement).getByTestId('router-link');
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');
  },
};

// Breadcrumb links follow the native anchor focus contract; the current page is
// a non-interactive span and stays out of the tab order.
export const KeyboardInteraction: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbSeparator />
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
    const link = canvas.getByRole('link', { name: 'Home' });
    const trigger = canvas.getByRole('button', {
      name: 'Show alternate paths for Home',
    });
    const page = canvas.getByText('Contacts');

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

// Every structural part carries a data-slot hook; the current page advertises
// aria-current without pretending to be a disabled link.
export const WithDataAttributes: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
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
        <BreadcrumbSeparator />
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
