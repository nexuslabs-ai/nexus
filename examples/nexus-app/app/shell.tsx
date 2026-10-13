'use client';

import { IconComponents, IconForms, IconLayoutDashboard, IconPalette, IconTable } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { NexusThemeQuickControl } from '@/components/appearance/theme-quick-control/theme-quick-control';
import { Separator } from '@/components/separator/separator';
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/sidebar/sidebar';
import { Toaster } from '@/components/sonner/sonner';

const NAV = [
  { href: '/', label: 'Dashboard', icon: IconLayoutDashboard },
  { href: '/components', label: 'Components', icon: IconComponents },
  { href: '/data', label: 'Data table', icon: IconTable },
  { href: '/forms', label: 'Forms', icon: IconForms },
  { href: '/appearance', label: 'Appearance', icon: IconPalette },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = NAV.find((item) => item.href === pathname)?.label ?? 'Acme';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="nx:flex nx:size-8 nx:items-center nx:justify-center nx:rounded-md nx:bg-primary-background nx:text-primary-foreground nx:typography-label-default">
                    A
                  </div>
                  <span className="nx:typography-label-default">Acme</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Product</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <p className="nx:px-2 nx:typography-body-small nx:text-muted-foreground">
            Built entirely on Nexus components copied into this app.
          </p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="nx:flex nx:h-14 nx:shrink-0 nx:items-center nx:gap-3 nx:border-b nx:border-border-default nx:px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="nx:h-5" />
          <h1 className="nx:typography-label-default">{title}</h1>
          <div className="nx:ml-auto">
            <NexusThemeQuickControl />
          </div>
        </header>
        <main className="nx:mx-auto nx:w-full nx:max-w-5xl nx:p-6">{children}</main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
