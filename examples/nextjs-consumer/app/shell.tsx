'use client';

import {
  Separator,
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
  NexusThemeQuickControl,
  Toaster,
} from '@acme/react';
import {
  IconComponents,
  IconForms,
  IconLayoutDashboard,
  IconPalette,
  IconTable,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const NAV = [
  { href: '/', label: 'Dashboard', icon: IconLayoutDashboard },
  { href: '/components', label: 'Components', icon: IconComponents },
  { href: '/data', label: 'Data table', icon: IconTable },
  { href: '/forms', label: 'Forms', icon: IconForms },
  { href: '/appearance', label: 'Appearance', icon: IconPalette },
] as const;

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/components': 'Components',
  '/data': 'Data table',
  '/forms': 'Forms',
  '/appearance': 'Appearance',
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-violet-600 font-semibold text-white">
                    A
                  </div>
                  <span className="font-medium">acme/react</span>
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
          <p className="px-2 text-xs text-slate-500">
            Consuming <code>@acme/react</code> from a stock Next.js + Tailwind 4 app.
          </p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* App chrome — the app's OWN (unprefixed) Tailwind, not the design system. */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-sm font-medium text-slate-900">
            {TITLES[pathname] ?? 'acme/react'}
          </h1>
          <div className="ml-auto">
            <NexusThemeQuickControl />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl p-6">{children}</main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
