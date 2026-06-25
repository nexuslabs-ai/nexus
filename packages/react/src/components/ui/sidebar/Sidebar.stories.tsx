import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  IconCalendar,
  IconChartBar,
  IconChevronRight,
  IconDots,
  IconFolder,
  IconHome,
  IconInbox,
  IconLayoutGrid,
  IconPlus,
  IconSearch,
  IconSettings,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useArgs } from 'storybook/preview-api';
import { expect, userEvent, within } from 'storybook/test';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
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
type SidebarControlsArgs = Pick<
  React.ComponentProps<typeof Sidebar>,
  'collapsible' | 'side' | 'variant'
> & {
  open: boolean;
};

type ControlsStory = StoryObj<SidebarControlsArgs>;

function getRequiredElement<T extends HTMLElement>(
  root: ParentNode,
  selector: string
) {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element for selector: ${selector}`);
  return element;
}

const NAV_ITEMS = [
  { title: 'Home', icon: IconHome },
  { title: 'Inbox', icon: IconInbox, badge: '4' },
  { title: 'Calendar', icon: IconCalendar },
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

export const InteractiveControls: ControlsStory = {
  name: 'Interactive Controls',
  args: {
    open: true,
    collapsible: 'offcanvas',
    variant: 'sidebar',
    side: 'left',
  },
  argTypes: {
    open: {
      control: 'boolean',
    },
    collapsible: {
      control: 'inline-radio',
      options: ['offcanvas', 'icon', 'none'],
    },
    variant: {
      control: 'inline-radio',
      options: ['sidebar', 'floating', 'inset'],
    },
    side: {
      control: 'inline-radio',
      options: ['left', 'right'],
    },
  },
  parameters: {
    controls: {
      include: ['open', 'collapsible', 'variant', 'side'],
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<SidebarControlsArgs>();

    return (
      <SidebarProvider
        open={args.open}
        onOpenChange={(open) => updateArgs({ open })}
      >
        <DemoSidebar
          collapsible={args.collapsible}
          side={args.side}
          variant={args.variant}
        />
        <DemoInset />
      </SidebarProvider>
    );
  },
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

export const Disabled: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <IconHome />
                    <span>Disabled item</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled item' });

    await expect(button).toBeDisabled();
    // A disabled menu button recolors via a semantic disabled-text token at
    // full opacity (not a fade).
    await expect(button).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(button).opacity).toBe('1');
  },
};

export const StylingContracts: Story = {
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarInput aria-label="Search" placeholder="Search" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <IconHome />
                    <span>Active</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>4</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton size="sm">
                    <IconCalendar />
                    <span>Small</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <IconSettings />
                    <span>Large</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#default-sub">
                        Default sub
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#small-sub" size="sm">
                        Small sub
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
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
  play: async ({ canvasElement }) => {
    const groupLabel = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-group-label"]'
    );
    await expect(groupLabel).toHaveClass('nx:typography-label-small');
    await expect(groupLabel).not.toHaveClass('nx:text-xs');
    await expect(groupLabel).not.toHaveClass('nx:font-medium');

    const groupContent = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-group-content"]'
    );
    await expect(groupContent).toHaveClass('nx:typography-body-default');
    await expect(groupContent).not.toHaveClass('nx:text-sm');

    const defaultButton = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-menu-button"][data-size="default"]'
    );
    const smallButton = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-menu-button"][data-size="sm"]'
    );
    const largeButton = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-menu-button"][data-size="lg"]'
    );

    await expect(defaultButton).toHaveClass('nx:typography-body-default');
    // Active is colour-only (no weight/size change): text brightens to the
    // full nav foreground; it must not re-introduce a label/weight composite.
    await expect(defaultButton).toHaveClass(
      'nx:data-[active=true]:text-nav-foreground'
    );
    await expect(defaultButton).not.toHaveClass('nx:text-sm');
    await expect(defaultButton).not.toHaveClass(
      'nx:data-[active=true]:typography-label-default'
    );
    await expect(defaultButton).not.toHaveClass(
      'nx:data-[active=true]:font-medium'
    );

    await expect(smallButton).toHaveClass('nx:typography-body-small');
    await expect(smallButton).toHaveClass(
      'nx:data-[active=true]:text-nav-foreground'
    );
    await expect(smallButton).not.toHaveClass('nx:text-xs');
    await expect(smallButton).not.toHaveClass(
      'nx:data-[active=true]:typography-label-small'
    );

    await expect(largeButton).toHaveClass('nx:typography-body-default');
    await expect(largeButton).toHaveClass(
      'nx:data-[active=true]:text-nav-foreground'
    );
    await expect(largeButton).not.toHaveClass('nx:text-sm');
    await expect(largeButton).not.toHaveClass(
      'nx:data-[active=true]:typography-label-default'
    );

    for (const button of [defaultButton, smallButton, largeButton]) {
      await expect(button).toHaveClass(
        'nx:group-data-[collapsible=icon]:size-8'
      );
      await expect(button).not.toHaveClass(
        'nx:group-data-[collapsible=icon]:size-8!'
      );
      await expect(button).not.toHaveClass(
        'nx:group-data-[collapsible=icon]:p-2!'
      );
      await expect(button).not.toHaveClass(
        'nx:group-data-[collapsible=icon]:p-0!'
      );
    }

    await expect(defaultButton).toHaveClass(
      'nx:group-data-[collapsible=icon]:p-2'
    );
    await expect(smallButton).toHaveClass(
      'nx:group-data-[collapsible=icon]:p-2'
    );
    await expect(largeButton).toHaveClass(
      'nx:group-data-[collapsible=icon]:p-0'
    );
    await expect(largeButton).not.toHaveClass(
      'nx:group-data-[collapsible=icon]:p-2'
    );

    const badge = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-menu-badge"]'
    );
    await expect(badge).toHaveClass('nx:typography-label-small');
    await expect(badge).not.toHaveClass('nx:text-xs');
    await expect(badge).not.toHaveClass('nx:font-medium');

    const defaultSubButton = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-menu-sub-button"][data-size="md"]'
    );
    const smallSubButton = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-menu-sub-button"][data-size="sm"]'
    );
    await expect(defaultSubButton).toHaveClass('nx:typography-body-default');
    await expect(defaultSubButton).not.toHaveClass('nx:text-sm');
    await expect(smallSubButton).toHaveClass('nx:typography-body-small');
    await expect(smallSubButton).not.toHaveClass('nx:text-xs');

    const trigger = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-trigger"]'
    );
    await expect(trigger).toHaveClass('nx:size-7');
    await expect(trigger).toHaveClass('nx:relative');
    await expect(trigger).toHaveClass('nx:pointer-coarse:after:absolute');
    await expect(trigger).toHaveClass('nx:pointer-coarse:after:-inset-2');
    await expect(trigger).not.toHaveClass('nx:pointer-coarse:after:-inset-0.5');

    const input = getRequiredElement(
      canvasElement,
      '[data-slot="sidebar-input"]'
    );
    await expect(input).toHaveClass('nx:h-8');
    await expect(input).toHaveClass('nx:pointer-coarse:min-h-11');
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

/**
 * The kitchen-sink view: a workspace switcher + search in the header, two
 * labelled groups with a group action, menu items carrying badges, a row
 * action, two nested sub-menus (each with an active child), a separator, and
 * an account footer — most of the sidebar's parts in one tree.
 */
export const Complex: Story = {
  name: 'Complex (kitchen sink)',
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme Inc">
                <IconLayoutGrid />
                <span>Acme Inc</span>
                <IconChevronRight className="nx:ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarInput aria-label="Search" placeholder="Search…" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Add project">
              <IconPlus />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Dashboard">
                    <IconHome />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Inbox">
                    <IconInbox />
                    <span>Inbox</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>12</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Projects">
                    <IconFolder />
                    <span>Projects</span>
                    <IconChevronRight className="nx:ml-auto" />
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#overview">
                        Overview
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#mobile" isActive>
                        Mobile App
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#marketing">
                        Marketing Site
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Tasks">
                    <IconCalendar />
                    <span>Tasks</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction aria-label="Task options">
                    <IconDots />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Members">
                    <IconUsers />
                    <span>Members</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Reports">
                    <IconChartBar />
                    <span>Reports</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>New</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <IconSettings />
                    <span>Settings</span>
                    <IconChevronRight className="nx:ml-auto" />
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#general">
                        General
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#billing">
                        Billing
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Jane Doe">
                <IconUser />
                <span>Jane Doe</span>
                <IconChevronRight className="nx:ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <DemoInset />
    </SidebarProvider>
  ),
};

/**
 * Every row at `size="sm"` — the compact option, rendering text at
 * `body-small` (12px) for information-dense sidebars. Sub-items use the small
 * size too.
 */
export const Compact: Story = {
  name: 'Compact (small size)',
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarInput aria-label="Search" placeholder="Search…" />
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
                        size="sm"
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
                <SidebarMenuItem>
                  <SidebarMenuButton size="sm" tooltip="Projects">
                    <IconFolder />
                    <span>Projects</span>
                    <IconChevronRight className="nx:ml-auto" />
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#overview" size="sm">
                        Overview
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#mobile" size="sm" isActive>
                        Mobile App
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" tooltip="Account">
                <IconUser />
                <span>Account</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <DemoInset>
        Compact rows use the small size (12px body-small) for denser,
        information-heavy sidebars.
      </DemoInset>
    </SidebarProvider>
  ),
};
