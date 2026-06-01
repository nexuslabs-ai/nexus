import { SidebarInset, SidebarProvider, Toaster } from '@nexus/react';
import { Outlet } from '@tanstack/react-router';

import { AppSidebar } from '../shell/app-sidebar';
import { Topbar } from '../shell/topbar';

/**
 * The app shell rendered by the root route: collapsible sidebar + top bar with
 * the active module's content in the inset. Mounted once, so the sidebar and
 * top bar persist across navigations.
 */
export function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        {/* nx:text-foreground re-establishes the adaptive base text color for
            module content — without it, reused content that relies on inherited
            foreground (e.g. the typography showcase) renders black in dark mode. */}
        <main className="nx:text-foreground nx:min-w-0 nx:flex-1">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
