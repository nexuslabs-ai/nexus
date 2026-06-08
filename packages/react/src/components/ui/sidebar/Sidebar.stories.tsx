import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  IconCalendar,
  IconChevronRight,
  IconFolder,
  IconHome,
  IconInbox,
  IconLayoutGrid,
  IconSearch,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { expect, userEvent, within } from 'storybook/test';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from './sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const NAV_ITEMS = [
  { title: 'Home', icon: IconHome },
  { title: 'Inbox', icon: IconInbox, badge: '4' },
  { title: 'Date Picker', icon: IconCalendar },
  { title: 'Search', icon: IconSearch },
  { title: 'Settings', icon: IconSettings },
];

/**
 * The shared nav body used by most stories: a brand row, a "Platform" group of
 * menu items, and an account footer. `props` flow straight through to `Sidebar`
 * so each story can pick its `variant` / `collapsible` / `side`.
 */
function DemoSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Acme Inc">
              <IconLayoutGrid />
              <span>Acme Inc</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={item.title === 'Home'}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Account">
              <IconUser />
              <span>Account</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/**
 * The content region beside the sidebar — a top bar with the toggle plus some
 * body copy. Kept tall so the docked, full-height sidebar reads naturally.
 */
function DemoInset({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarInset>
      <header className="nx:flex nx:h-16 nx:items-center nx:gap-2 nx:border-b nx:border-border-default nx:px-4">
        <SidebarTrigger />
        <span className="nx:text-sm nx:font-medium">Dashboard</span>
      </header>
      <div className="nx:min-h-[20rem] nx:p-4 nx:text-sm nx:text-muted-foreground">
        {children ?? 'Main content area.'}
      </div>
    </SidebarInset>
  );
}

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar />
      <DemoInset />
    </SidebarProvider>
  ),
};

export const Expanded: Story = {
  render: () => (
    <SidebarProvider defaultOpen>
      <DemoSidebar />
      <DemoInset />
    </SidebarProvider>
  ),
};

export const Collapsed: Story = {
  name: 'Collapsed (icon)',
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <DemoSidebar collapsible="icon" />
      <DemoInset>
        Collapsed to an icon rail — hover a button to see its tooltip.
      </DemoInset>
    </SidebarProvider>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <IconFolder />
                    <span>Design System</span>
                    <IconChevronRight className="nx:ml-auto" />
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#tokens" isActive>
                        Tokens
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#components">
                        Components
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#documentation">
                        Documentation
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <IconInbox />
                    <span>Inbox</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <DemoInset />
    </SidebarProvider>
  ),
};

export const LoadingSkeleton: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarInput aria-label="Search" placeholder="Search…" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Loading</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <DemoInset />
    </SidebarProvider>
  ),
};

export const MobileDrawer: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <SidebarProvider>
      <DemoSidebar />
      <DemoInset>
        Below the Standard floor (1024px) the sidebar becomes a drawer — tap the
        toggle to open it.
      </DemoInset>
    </SidebarProvider>
  ),
};

export const WithDataAttributes: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar variant="floating" side="right" />
      <DemoInset />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    // data-state / data-variant / data-side live on the desktop docked panel,
    // which renders because the test viewport is above the `lg` floor.
    const sidebar = canvasElement.querySelector(
      '[data-slot="sidebar"][data-state]'
    );
    await expect(sidebar).toBeInTheDocument();
    await expect(sidebar).toHaveAttribute('data-variant', 'floating');
    await expect(sidebar).toHaveAttribute('data-side', 'right');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    const trigger = canvasElement.querySelector(
      '[data-slot="sidebar-trigger"]'
    );
    await expect(trigger).toBeInTheDocument();

    const activeButton = canvasElement.querySelector(
      '[data-slot="sidebar-menu-button"][data-active="true"]'
    );
    await expect(activeButton).toBeInTheDocument();

    // The content region is a labelled navigation landmark (issue #418).
    await expect(
      within(canvasElement).getByRole('navigation', { name: 'Sidebar' })
    ).toBeInTheDocument();
  },
};

export const ClickInteraction: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar />
      <DemoInset />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    // data-state lives on the desktop docked panel (test viewport ≥ `lg`).
    const sidebar = canvasElement.querySelector(
      '[data-slot="sidebar"][data-state]'
    );
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-slot="sidebar-trigger"]'
    );
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    await userEvent.click(trigger!);
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    await userEvent.click(trigger!);
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  },
};

export const KeyboardInteraction: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar />
      <DemoInset />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    // data-state lives on the desktop docked panel (test viewport ≥ `lg`).
    const sidebar = canvasElement.querySelector(
      '[data-slot="sidebar"][data-state]'
    );
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    // Ctrl/Cmd+B toggles the sidebar from anywhere in the document.
    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  },
};

/**
 * Visual grid reference for every `SidebarMenuButton` variant, size, and the
 * `asChild` composition. Uses `collapsible="none"` and a bounded height so the
 * panel sits inline (not viewport-fixed) — this is the export the base-variants
 * generator reuses to render the sidebar across all 5 bases × 2 themes.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="nx:h-96 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border nx:border-border-default">
      <SidebarProvider style={{ minHeight: 'unset', height: '100%' }}>
        <Sidebar collapsible="none">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <IconLayoutGrid />
                  <span>Acme Inc</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Variants</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <IconHome />
                      <span>Active</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton variant="outline">
                      <IconInbox />
                      <span>Outline</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="sm">
                      <IconCalendar />
                      <span>Small</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="https://example.com">
                        <IconSettings />
                        <span>As link</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <DemoInset />
      </SidebarProvider>
    </div>
  ),
};
