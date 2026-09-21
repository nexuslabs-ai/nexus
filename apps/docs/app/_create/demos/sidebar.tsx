'use client';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@nexus_ds/react';
import {
  IconCalendar,
  IconHome,
  IconInbox,
  IconLayoutGrid,
  IconSearch,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
function DemoSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} className="nx:absolute">
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
function DemoInset({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarInset>
      <header className="nx:flex nx:h-16 nx:items-center nx:gap-2 nx:border-b-default nx:border-border-default nx:px-4">
        <SidebarTrigger />
        <span className="nx:typography-label-default">Dashboard</span>
      </header>
      <div className="nx:min-h-80 nx:p-4 nx:typography-label-default nx:text-muted-foreground">
        {children ?? 'Main content area.'}
      </div>
    </SidebarInset>
  );
}
const NAV_ITEMS = [
  { title: 'Home', icon: IconHome },
  { title: 'Inbox', icon: IconInbox, badge: '4' },
  { title: 'Calendar', icon: IconCalendar },
  { title: 'Search', icon: IconSearch },
  { title: 'Settings', icon: IconSettings },
];
function Example0() {
  return (
    <SidebarProvider defaultOpen={false} className="nx:relative nx:min-h-96">
      <DemoSidebar collapsible="icon" />
      <DemoInset>
        Collapsed to an icon rail — hover a button to see its tooltip.
      </DemoInset>
    </SidebarProvider>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Collapsed">
        <h2 className="nx:typography-heading-small">Collapsed</h2>
        <Example0 />
      </section>
    </div>
  );
}
